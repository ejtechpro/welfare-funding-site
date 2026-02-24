const express = require("express");
const multer = require("multer");
const path = require("path");
const prisma = require("../config/conn.js");
const { Decimal } = require("@prisma/client");
const { monthlyAmout } = require("../controls/monthlyAmoutHelper.js");

const router = express.Router();

router.get("/all", async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            photo: true,
          },
        },
      },
    });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error: "Internal server error!" });
  }
});

router.put("/approve/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;
    const { userRole, id: userId, isVerified } = req.user;

    const allowedRoles = ["super_admin", "admin"];

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "You don't have permissions to approve a member!" });
    }
    // if (!isVerified) {
    //   return res.status(403).json({
    //     error: "This account must be verified before it can be approved.",
    //   });
    // }

    //TODO: Prevent member approval if already approved.

    const txn = await prisma.$transaction(async (tx) => {
      //Atomic counter increment (NO lock needed)
      const counter = await tx.tnsCounter.upsert({
        where: { id: 1 },
        update: {
          current: { increment: 1 },
        },
        create: {
          id: 1,
          current: 1,
        },
      });

      const nextNumber = counter.current;
      const tnsNumber = `TNS${String(nextNumber).padStart(4, "0")}`;

      const MONTHLY_AMOUNT = await monthlyAmout();

      // 1️⃣ Calculate initial balance & billingDate
      const balance = new Decimal(0).minus(MONTHLY_AMOUNT); // balance = -100
      const now = new Date();

      // BillingDate is the **next scheduled monthly charge**, starting from approval
      // Next charge to be exactly 1 month later:
      const billingDate = new Date(now);
      billingDate.setMonth(billingDate.getMonth() + 1);
      billingDate.setHours(0, 0, 0, 0); // normalize to midnight

      await tx.member.update({
        where: { id: memberId },
        data: {
          registrationStatus: "approved",
          balance,
          billingDate,
          user: {
            update: {
              status: "active",
            },
          },
          // paymentStatus: "paid",
          tnsNumber: tnsNumber,
        },
      });
      await tx.memberApproval.create({
        data: {
          approvalType: "registration",
          memberId: memberId,
          approverId: userId,
        },
      });
      return { tnsNumber };
    });

    res.status(200).json({ success: true, tnsNumber: txn.tnsNumber });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});
router.put("/reject/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;
    const { userRole, userId } = req.user;
    const allowedRoles = ["super_admin", "admin"];

    if (!allowedRoles.includes(userRole)) {
      return res
        .status(403)
        .json({ error: "You don't have permissions to reject a member!" });
    }

    await prisma.member.update({
      where: { id: memberId },
      data: {
        registrationStatus: "rejected",
        user: {
          update: {
            status: "inactive",
          },
        },
      },
    });
    await prisma.memberApproval.create({
      data: {
        approvalType: "registration",
        memberId: memberId,
        approverId: userId,
      },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

router.delete("/delete-member/:memberId", async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId)
      return res.status(400).json({ error: "Member is is required" });

    await prisma.$transaction(async (tx) => {
      const member = await tx.member.delete({
        where: { id: memberId },
        include: { user: true },
      });

      await tx.user.delete({
        where: { id: member.userId },
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

router.put("/update-member", (req, res) => {
  try {
    const memberId = req.params;
  } catch (error) {
    res.status(500).json({ error: "Internal server error!" });
  }
});

module.exports = router;
