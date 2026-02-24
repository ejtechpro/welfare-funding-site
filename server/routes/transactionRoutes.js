const express = require("express");
const { Decimal } = require("@prisma/client");
const prisma = require("../config/conn.js");
const cron = require("node-cron");
const { monthlyAmout } = require("../controls/monthlyAmoutHelper.js");

const router = express.Router();

router.post("/manual-payment", async (req, res) => {
  try {
    const data = req.body;
    const { id: uid } = req.user;

    // Fixed MONTHLY_AMOUNT
    const MONTHLY_AMOUNT = await monthlyAmout();

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

      if (data.referenceNumber.trim() && data.transactionMethod == "mpesa") {
        await tx.mpesaTransaction.create({
          data: {
            transactionId: txn.id,
            mpesaReceiptNumber: data.referenceNumber,
            paymentDate: new Date(data.paymentDate)?.toISOString(),
          },
        });
      }

      // 3️⃣ Only adjust balance for monthly contribution
      if (data.contributionType === "monthly") {
        const now = new Date();

        // Fetch member and balance
        const member = await tx.member.findUnique({
          where: { id: data.memberId },
          select: { id: true, balance: true, billingDate: true },
        });

        if (!member) throw new Error("Member not found");

        let balance = new Decimal(member.balance ?? 0);

        // STEP 1: Add payment to balance
        balance = balance.plus(paymentAmount);

        // STEP 2: Save updated balance
        const updatedMember = await tx.member.update({
          where: { id: member.id },
          data: { balance },
          select: {
            id: true,
            balance: true,
          },
        });

        console.log(`Member ${member.id} new balance: ${balance?.toString()}`);

        return {
          contributionId: contribution.id,
          balance: updatedMember?.balance,
        };
      }
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Manual payment error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/balance-health-check", async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      select: {
        id: true,
        tnsNumber: true,
        balance: true,
        billingDate: true,
        registrationStatus: true,
        user: { select: { status: true } },
      },
    });

    // anomaly: balance positive AND negative? or for future use
    const now = new Date();

    // Build anomaly list WITH reasons
    const anomalyMap = new Map();

    members.forEach((m) => {
      if (m.user.status === "active" && !m.billingDate) {
        anomalyMap.set(m.id, "Active member has no billing date");
      } else if (m.balance === null) {
        anomalyMap.set(m.id, "Balance is null (should never happen)");
      } else if (
        m.user.status === "active" &&
        m.billingDate &&
        new Date(m.billingDate) < now
      ) {
        anomalyMap.set(m.id, "Billing date passed but member was not charged");
      } else if (
        m.billingDate &&
        new Date(m.billingDate).getTime() >
          new Date(now).setMonth(now.getMonth() + 1)
      ) {
        anomalyMap.set(m.id, "Billing date is more than 1 month in the future");
      }
    });

    const anomalies = Array.from(anomalyMap.keys());

    return res.json({
      totalMembers: members.length,
      members: members.map((m) => ({
        memberId: m.id,
        tnsNumber: m.tnsNumber,
        balance: new Decimal(m.balance ?? 0).toString(),
        billingDate: m.billingDate,
        registrationStatus: m.registrationStatus,
        userStatus: m.user.status,

        // 👇 only present if anomaly exists
        reason: anomalyMap.get(m.id) ?? null,
      })),
      anomalyCount: anomalies.length,
    });
  } catch (err) {
    console.error("Balance health check failed:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
