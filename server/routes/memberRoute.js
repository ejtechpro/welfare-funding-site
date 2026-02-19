const express = require("express");
const prisma = require("../config/conn.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userHelper = require("../controls/userHelper.js");
const { signOptions } = require("../config/token.js");
require("dotenv").config();

const router = express.Router();

router.post("/signIn", async (req, res) => {
  try {
    const data = req.body;
  } catch (error) {
    console.log(error);
    read.status(500).json({ error: "Internal server error!" });
  }
});

module.exports = router;
