const express = require("express");
const { Decimal } = require("@prisma/client");
const prisma = require("../config/conn.js");

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
          contributionType: data.contributionType,
          projectId: data.projectId ?? null,
          caseId: data.caseId ?? null,
        },
        select: { id: true },
      });

      // 2️⃣ Record transaction
      await tx.transaction.create({
        data: {
          amount: paymentAmount,
          transactionMethod: "cash",
          contributionId: contribution.id,
          memberId: data.memberId,
          transactedById: uid,
          transactionStatus: "completed",
          transactionType: "contribution",
        },
      });

      // 3️⃣ Only adjust balance for monthly contribution
      if (data.contributionType !== "monthly_contribution") {
        return contribution;
      }

      // 4️⃣ Get or create balance
      const balance = await tx.balance.upsert({
        where: { memberId: data.memberId },
        update: {},
        create: {
          memberId: data.memberId,
          prepaid: new Decimal(0),
          due: new Decimal(0),
        },
      });

      let prepaid = balance.prepaid;
      let due = balance.due;
      let remaining = paymentAmount;

      console.log(`Processing payment for member ${data.memberId}`, {
        payment: remaining.toString(),
        currentPrepaid: prepaid.toString(),
        currentDue: due.toString(),
      });

      // ✅ RULE 1: Pay off due first
      if (due.greaterThan(0)) {
        if (remaining.greaterThanOrEqualTo(due)) {
          remaining = remaining.minus(due);
          due = new Decimal(0);
        } else {
          due = due.minus(remaining);
          remaining = new Decimal(0);
        }
      }

      // ✅ RULE 2: Remainder becomes prepaid
      if (remaining.greaterThan(0)) {
        prepaid = prepaid.plus(remaining);
      }

      // 5️⃣ Update balance
      const updatedBalance = await tx.balance.update({
        where: { memberId: data.memberId },
        data: {
          prepaid,
          due,
        },
      });

      console.log(`Balance updated for member ${data.memberId}`, {
        oldPrepaid: balance.prepaid.toString(),
        oldDue: balance.due.toString(),
        payment: paymentAmount.toString(),
        newPrepaid: prepaid.toString(),
        newDue: due.toString(),
      });

      return {
        contributionId: contribution.id,
        balance: updatedBalance,
      };
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


// Endpoint to check current balance
router.get("/balance/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;
    const { id: uid } = req.user;

    // Ensure user can only view their own balance
    if (memberId !== uid) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const balance = await prisma.balance.findUnique({
      where: { memberId },
    });

    if (!balance) {
      return res.json({
        memberId,
        prepaid: "0",
        due: "0",
        message: "No balance record found",
      });
    }

    res.json({
      memberId,
      prepaid: balance.prepaid.toString(),
      due: balance.due.toString(),
      lastUpdated: balance.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

// Monthly cron job to apply the 100/month charge
// Run this on the 1st of every month
async function applyMonthlyCharge() {
  const members = await prisma.member.findMany({
    include: { balance: true },
  });

  for (const member of members) {
    await prisma.$transaction(async (tx) => {
      const balance =
        member.balance ??
        (await tx.balance.create({
          data: { memberId: member.id, prepaid: 0, due: 0 },
        }));

      let prepaid = balance.prepaid;
      let due = balance.due;

      console.log(`Processing ${member.id}: prepaid=${prepaid}, due=${due}`);

      if (prepaid.greaterThanOrEqualTo(MONTHLY_AMOUNT)) {
        prepaid = prepaid.minus(MONTHLY_AMOUNT);
      } else {
        const remainder = MONTHLY_AMOUNT.minus(prepaid);
        prepaid = new Decimal(0);
        due = due.plus(remainder);
      }

      await tx.balance.update({
        where: { memberId: member.id },
        data: { prepaid, due },
      });

      console.log(`Result: prepaid=${prepaid}, due=${due}`);
    });
  }
}

// Test function to simulate the scenario
async function testScenario() {
  console.log("=== Testing the scenario ===");
  console.log("Month 1 - First payment of 70");

  // Simulate first payment of 70
  await simulatePayment("member123", 70);

  console.log("\nMonth 1 - Second payment of 40");

  // Simulate second payment of 40
  await simulatePayment("member123", 40);

  console.log("\nMonth 2 starts - applying monthly charge");

  // Simulate new month
  await applyMonthlyCharge();

  // Check final balance
  const finalBalance = await prisma.balance.findUnique({
    where: { memberId: "member123" },
  });

  console.log("\n=== Final balance after month 2 ===");
  console.log(`Prepaid: ${finalBalance?.prepaid.toString() || "0"}`);
  console.log(`Due: ${finalBalance?.due.toString() || "0"}`);
}

// Helper function for testing
async function simulatePayment(memberId, amount) {
  const balance = await prisma.balance.upsert({
    where: { memberId },
    update: {},
    create: { memberId, prepaid: 0, due: 0 },
  });

  let prepaid = balance.prepaid;
  let due = balance.due;
  let remaining = new Decimal(amount);

  console.log(`Current balance - Prepaid: ${prepaid}, Due: ${due}`);

  // 1. Pay off due first
  if (due.greaterThan(0)) {
    if (remaining.greaterThanOrEqualTo(due)) {
      remaining = remaining.minus(due);
      due = new Decimal(0);
    } else {
      due = due.minus(remaining);
      remaining = new Decimal(0);
    }
  }

  // 2. Rest goes to prepaid
  if (remaining.greaterThan(0)) {
    prepaid = prepaid.plus(remaining);
  }

  await prisma.balance.update({
    where: { memberId },
    data: { prepaid, due },
  });

  console.log(`New balance - Prepaid: ${prepaid}, Due: ${due}`);
}

//  usage in a cron job (setup with node-cron)
// const cron = require('node-cron');
// cron.schedule('0 0 1 * *', applyMonthlyCharge);

module.exports = router;
