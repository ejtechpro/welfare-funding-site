const express = require("express");
const prisma = require("../config/conn.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userHelper = require("../controls/userHelper.js");
require("dotenv").config();

const router = express.Router();

const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 900).toString();
};

const checkSession = (req, res) => {
  const hasSession = req.cookies.sessionid ? true : false;
  return res.status(200).json({ hasSession });
};

//* MAIN LOGIN DETAILD
const issueUserSession = async (req, res, user) => {
  try {
    // Create the JWT payload
    const payload = {
      id: user.id,
      name: user.firstName,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
    };

    // Sign JWT token
    const token = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_KEY,
      signOptions("24h"),
    );

    res.cookie("sessionid", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 12 hours
    });

    // Return the token for frontend apps that use it in headers
    return token;
  } catch (error) {
    throw new Error("Failed to create session");
  }
};

router.post("/register", async (req, res) => {
  console.log(req.body);
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      role,
      requestedRole,
      assignedArea,
      password,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide first name, last name, email",
      });
    }

    // Check if staff member already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
      select: { email: true, isVerified: true },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "A staff member with this email already exists.",
      });
    }

    if (phoneNumber) {
      // Check if phoneNumber number already exists with this email
      const existingPhoneNumber = await prisma.user.findUnique({
        where: { phoneNumber: phoneNumber },
      });

      if (existingPhoneNumber) {
        return res.status(400).json({
          error:
            "A staff member with this PhoneNuphoneNumber number already exists.",
        });
      }
    }

    let hashedPassword = null;
    if (typeof password === "string" && password !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    const verificationCode = generateVerificationCode();

    // Create new staff registration
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: password ? hashedPassword : null,
        phoneNumber: phoneNumber,
        role: role,
        verificationCode,
        requestedRole: requestedRole || null,
        assignedArea: assignedArea || null,
        status: "active",
        isVerified: false,
      },
    });

    res.status(201).json({
      message: "Staff registration submitted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error creating staff registration:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return res.status(400).json({
        error: "A staff member with this email already exists.",
      });
    }

    res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
});

router.post("login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await prisma.staff.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "Invalid email or password." });
    }

    if (!user.password || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // if (!user.isVerified) {
    //   return res.status(201).json({ msg: "unverified" });
    // }

    if (user.status !== "active") {
      return res.status(400).json({
        error: `Your account is "${user.status}". Please contact support.`,
      });
    }

    // Save or track session
    const token = await issueUserSession(req, res, user);
    await userHelper.createSession(req, user, token);

    res.status(200).json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
});

module.exports = router;
