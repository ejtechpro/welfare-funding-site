const express = require("express");
const prisma = require("../config/conn.js");
const upload = require("../controls/uploadHelper.js");

const router = express.Router();

router.post("/new", upload.any(), async (req, res) => {
  try {
    const memberInfo = JSON.parse(req.body.memberInfo);
    const spouseInfo = JSON.parse(req.body.spouseInfo || "{}");
    const children = JSON.parse(req.body.children || "[]");
    const parentsInfo = JSON.parse(req.body.parentsInfo);
    const transactionId = req.body.transactionId;

    const files = req.files || [];
    const memberPhoto = files.find((f) => f.fieldname === "memberPhoto");
    const spousePhoto = files.find((f) => f.fieldname === "spousePhoto");
    const childBirthCerts = files.filter((f) =>
      f.fieldname.startsWith("childBirthCert_"),
    );

    // ✅ Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: memberInfo.email },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "A user with this email already exists.",
      });
    }

    // ✅ Check existing phone
    if (memberInfo?.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: memberInfo.phone },
      });

      if (existingPhone) {
        return res.status(400).json({
          error: "A user with this phone number already exists.",
        });
      }
    }

    const existingIdNumber = await prisma.member.findUnique({
      where: { idNumber: memberInfo.idNumber },
    });

    if (existingIdNumber) {
      return res.status(400).json({
        error: "A user with this id number already exists.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName: memberInfo.firstName,
          lastName: memberInfo.lastName,
          email: memberInfo.email,
          phone: memberInfo.phone,
          photo: memberPhoto?.filename || null,
          userRole: "member",
        },
      });

      const probationDays = 92;
      const probationEndDate = new Date();
      probationEndDate.setDate(probationEndDate.getDate() + probationDays);

      const member = await tx.member.create({
        data: {
          userId: user.id,
          sex: memberInfo.sex,
          maritalStatus: memberInfo.maritalStatus,
          alternativePhone: memberInfo.altPhone,
          idNumber: memberInfo.idNumber,
          country: memberInfo.country,
          areaOfResidence: memberInfo.areaOfResidence,
          membershipType:
            memberInfo?.maritalStatus == "married" ? "family" : "individual",
          paymentStatus: "pending",
          mpesaPaymentReference: transactionId,
          probationEndDate: probationEndDate,
          maturityStatus: "probation",
          balance: 0,
        },
      });

      // ✅ Spouse (optional)
      if (spouseInfo?.name) {
        await tx.spouse.create({
          data: {
            name: spouseInfo.name,
            memberId: member.id,
            idNumber: spouseInfo.idNumber,
            phone: spouseInfo.phone,
            altPhone: spouseInfo.altPhone,
            sex: spouseInfo.sex,
            areaOfResidence: spouseInfo.areaOfResidence,
            photo: spousePhoto?.filename || null,
          },
        });
      }

      // ✅ Parents
      await tx.parent.create({
        data: {
          name: parentsInfo.parent1.name,
          idNumber: parentsInfo.parent1.idNumber,
          phone: parentsInfo.parent1.phone,
          altPhone: parentsInfo.parent1.altPhone,
          areaOfResidence: parentsInfo.parent1.areaOfResidence,
          memberId: member.id,
        },
      });

      if (parentsInfo.parent2?.name) {
        await tx.parent.create({
          data: {
            name: parentsInfo.parent2.name,
            idNumber: parentsInfo.parent2.idNumber,
            phone: parentsInfo.parent2.phone,
            altPhone: parentsInfo.parent2.altPhone,
            areaOfResidence: parentsInfo.parent2.areaOfResidence,
            memberId: member.id,
          },
        });
      }

      // ✅ Children loop FIXED
      for (let i = 0; i < children.length; i++) {
        await tx.child.create({
          data: {
            name: children[i].name,
            dob: children[i].dob,
            age: children[i].age,
            birthCertificate: childBirthCerts[i]?.filename || null,
            // memberId: member.id,
            member: {
              connect: { id: member.id },
            },
          },
        });
      }

      return { userId: user.id };
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

module.exports = router;
