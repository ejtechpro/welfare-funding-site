// routes/members.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../config/conn.js");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/signIn", upload.any(), async (req, res) => {
  try {
    // Parse JSON fields
    const memberInfo = JSON.parse(req.body.memberInfo);
    const spouseInfo = JSON.parse(req.body.spouseInfo);
    const children = JSON.parse(req.body.children);
    const parentsInfo = JSON.parse(req.body.parentsInfo);
    const transactionId = req.body.transactionId;

    // Files
    const files = req.files;

    const memberPhoto = files.find((f) => f.fieldname === "memberPhoto");
    const spousePhoto = files.find((f) => f.fieldname === "spousePhoto");

    const childBirthCerts = files.filter((f) =>
      f.fieldname.startsWith("childBirthCert_"),
    );

    console.log(memberInfo);
    console.log(memberPhoto);
    console.log(childBirthCerts);
    console.log(spousePhoto);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error!" });
  }
});

module.exports = router;
