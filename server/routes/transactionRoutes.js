const express = require("express");
const { Decimal } = require("@prisma/client");
const prisma = require("../config/conn.js");
const cron = require("node-cron");

const router = express.Router();

// Fixed MONTHLY_AMOUNT
const MONTHLY_AMOUNT = new Decimal(100);
router.post("/manual-payment", async (req, res) => {
  try {
    const data = req.body;
    const { id: uid } = req.user;

    // ✅ Basic validation
    if (!data.amount || !data.memberId || !data.contributionType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (data.projectId && data.caseId) {
      return res
        .status(400)
        .json({ error: "Only one of projectId or caseId is allowed" });
    }

    const paymentAmount = new Decimal(data.amount);
    if (paymentAmount.lte(0)) {
      return res
        .status(400)
        .json({ error: "Payment amount must be greater than 0" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create contribution
      const contribution = await tx.contribution.create({
        data: {
          amount: paymentAmount,
          memberId: data.memberId,
          contributionType: data.contributionType,
          projectId: data.projectId ?? null,
          caseId: data.caseId ?? null,
        },
        select: { id: true, member: { select: { id: true } } },
      });

      // 2️⃣ Record transaction
      const txn = await tx.transaction.create({
        data: {
          amount: paymentAmount,
          transactionMethod: data.transactionMethod,
          contributionId: contribution.id,
          memberId: data.memberId,
          transactedById: uid,
          transactionStatus: "completed",
          transactionType: "contribution",
        },
        select: { id: true },
      });

      if (data.referenceNumber !== "") {
        await tx.mpesaTransaction.create({
          data: {
            transactionId: txn.id,
            mpesaReceiptNumber: data.referenceNumber,
            paymentDate: new Date(data.paymentDate).toISOString(),
          },
        });
      }

      // 3️⃣ Only adjust balance for monthly contribution
      if (data.contributionType === "monthly_contribution") {
        //TODO: Update balance account directly.
        // await tx.member.update({
        //   where: { id: data.memberId },
        //   data: {
        //     balance: (contribution?.member?.balance ?? 0) + paymentAmount,
        //   },
        // });

        const now = new Date();
        const thisMonth = now.getMonth() + 1;
        const thisYear = now.getFullYear();

        const balance = await tx.balance.upsert({
          where: { memberId: data.memberId },
          update: {},
          create: {
            memberId: data.memberId,
            prepaid: new Decimal(0),
            due: new Decimal(0),
            currentMonth: thisMonth,
            currentYear: thisYear,
            status: "open",
          },
        });

        let prepaid = new Decimal(balance.prepaid);
        let due = new Decimal(balance.due);
        let status = balance.status;
        let remaining = new Decimal(paymentAmount);

        // ✅ STEP 1: If month/year changed → roll forward first
        const isSameMonth =
          balance.currentMonth === thisMonth &&
          balance.currentYear === thisYear;

        if (!isSameMonth) {
          // apply monthly charge
          if (prepaid.greaterThanOrEqualTo(MONTHLY_AMOUNT)) {
            prepaid = prepaid.minus(MONTHLY_AMOUNT);
            status = "paid";
          } else {
            const shortfall = MONTHLY_AMOUNT.minus(prepaid);
            prepaid = new Decimal(0);
            due = due.plus(shortfall);
            status = "open";
          }

          await tx.balance.update({
            where: { memberId: data.memberId },
            data: {
              prepaid,
              due,
              currentMonth: thisMonth,
              currentYear: thisYear,
              status,
            },
          });
        }

        console.log("Before payment", {
          prepaid: prepaid.toString(),
          due: due.toString(),
          status,
        });

        // ✅ STEP 2: Pay existing due first
        if (due.greaterThan(0)) {
          if (remaining.greaterThanOrEqualTo(due)) {
            remaining = remaining.minus(due);
            due = new Decimal(0);
            status = "paid";
          } else {
            due = due.minus(remaining);
            remaining = new Decimal(0);
          }
        }

        // ✅ STEP 2.5: Close current month if payment can fully cover it
        if (
          status === "open" &&
          remaining.greaterThanOrEqualTo(MONTHLY_AMOUNT)
        ) {
          remaining = remaining.minus(MONTHLY_AMOUNT);
          status = "paid";
        }

        // ✅ STEP 3: If month still open and payment < monthly → create due
        if (
          status === "open" &&
          remaining.greaterThan(0) &&
          remaining.lessThan(MONTHLY_AMOUNT)
        ) {
          const shortfall = MONTHLY_AMOUNT.minus(remaining);
          due = due.plus(shortfall);
          remaining = new Decimal(0);
        }

        // ✅ STEP 4: Anything extra goes to prepaid
        if (remaining.greaterThan(0)) {
          prepaid = prepaid.plus(remaining);
        }

        // ✅ STEP 5: Save
        const updatedBalance = await tx.balance.update({
          where: { memberId: data.memberId },
          data: {
            prepaid,
            due,
            status,
          },
        });

        console.log("After payment", {
          prepaid: prepaid.toString(),
          due: due.toString(),
          status,
        });

        return {
          contributionId: contribution.id,
          balance: updatedBalance,
        };
      }
    });

    return res.status(200).json({
      success: true,
      contributionId: result.contributionId,
      balance: result.balance
        ? {
            prepaid: result.balance.prepaid.toString(),
            due: result.balance.due.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Manual payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/balance-health-check", async (req, res) => {
  try {
    const balances = await prisma.balance.findMany({
      include: {
        member: {
          select: {
            tnsNumber: true,
          },
        },
      },
    });

    const anomalies = balances.filter(
      (b) => b.prepaid.greaterThan(0) && b.due.greaterThan(0),
    );

    return res.json({
      totalBalances: balances.length,
      balances: balances.map((b) => ({
        memberId: b.memberId,
        tnsNumber: b.member.tnsNumber,
        currentMonth: b.currentMonth,
        currentYear: b.currentYear,
        prepaid: b.prepaid.toString(),
        due: b.due.toString(),
        status: b.status,
      })),
      anomalyCount: anomalies.length,
    });
  } catch (err) {
    console.error("Balance health check failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

cron.schedule("0 0 1 * *", async () => {
  console.log("📆 Running monthly rollover job...");

  const now = new Date();
  const newMonth = now.getMonth() + 1;
  const newYear = now.getFullYear();

  try {
    const balances = await prisma.balance.findMany();

    for (const b of balances) {
      // ❗ Skip if already rolled to this month
      if (b.currentMonth === newMonth && b.currentYear === newYear) {
        continue;
      }

      let prepaid = new Decimal(b.prepaid);
      let due = new Decimal(b.due);
      let status = "open";

      // ✅ Apply monthly charge
      if (prepaid.greaterThanOrEqualTo(MONTHLY_AMOUNT)) {
        prepaid = prepaid.minus(MONTHLY_AMOUNT);
        status = "paid";
      } else {
        const shortfall = MONTHLY_AMOUNT.minus(prepaid);
        prepaid = new Decimal(0);
        due = due.plus(shortfall);
        status = "open";
      }

      await prisma.balance.update({
        where: { id: b.id },
        data: {
          prepaid,
          due,
          currentMonth: newMonth,
          currentYear: newYear,
          status,
        },
      });

      console.log(`✔ Rolled over member ${b.memberId}`, {
        prepaid: prepaid.toString(),
        due: due.toString(),
        status,
      });
    }

    console.log("✅ Monthly rollover completed.");
  } catch (err) {
    console.error("❌ Monthly rollover failed:", err);
  }
});

module.exports = router;
