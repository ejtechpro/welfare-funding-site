const express = require("express");
const { Decimal } = require("@prisma/client");
const prisma = require("../config/conn.js");

const router = express.Router();

router.post("/manual-payment", async (req, res) => {
  try {
    const data = req.body;
    const { id: uid } = req.user;

    // Validate required fields
    if (!data.amount || !data.memberId || !data.contributionType) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (data.projectId && data.caseId) {
      return res
        .status(400)
        .json({ error: "Only one of projectId or caseId is allowed" });
    }
    // if (!data.projectId && !data.caseId) {
    //   return res
    //     .status(400)
    //     .json({ error: "Either projectId or caseId is required" });
    // }

    const paymentAmount = new Decimal(data.amount);
    if (paymentAmount.lte(0)) {
      return res
        .status(400)
        .json({ error: "Payment amount must be greater than 0" });
    }

    const contribution = await prisma.$transaction(async (tx) => {
      // 1️⃣ Create Contribution
      const contribution = await tx.contribution.create({
        data: {
          amount: paymentAmount,
          contributionType: data.contributionType,
          memberId: data.memberId,
          projectId: data.projectId ?? null,
          caseId: data.caseId ?? null,
        },
        select: { id: true },
      });

      // 2️⃣ Record Transaction
      await tx.transaction.create({
        data: {
          amount: paymentAmount,
          transactionMethod: "cash",
          contributionId: contribution.id,
          memberId: data.memberId,
          transactedById: uid,
          transactionStatus: "completed",
        },
      });

      // 3️⃣ Update balance if monthly contribution
      if (data.contributionType === "monthly_contribution") {
        await prisma.$executeRaw`CALL record_payment(${memberId}, ${amount});`;
      }

      return contribution;
    });

    res.status(200).json({ success: true, contributionId: contribution.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

module.exports = router;
