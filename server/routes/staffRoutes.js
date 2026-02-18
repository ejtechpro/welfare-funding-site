const express = require("express");
const prisma = require("../conn.js");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      staff_role,
      assigned_area,
      pending,
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !staff_role) {
      return res.status(400).json({
        error:
          "Missing required fields. Please provide first name, last name, email",
      });
    }

    // Check if staff member already exists with this email
    const existingStaff = await prisma.staff.findUnique({
      where: { email: email },
    });

    if (existingStaff) {
      return res.status(409).json({
        error: "A staff member with this email already exists.",
      });
    }
    if (phone) {
      // Check if phone number already exists with this email
      const existingPhone = await prisma.staff.findUnique({
        where: { phoneNumber: phone },
      });

      if (existingPhone) {
        return res.status(409).json({
          error: "A staff member with this Phone number already exists.",
        });
      }
    }

    // Create new staff registration
    const newStaff = await prisma.staff.create({
      data: {
        firstName: first_name,
        lastName: last_name,
        surname: null,
        email,
        phoneNumber: phone,
        role: staff_role,
        assignedArea: assigned_area || null,
        approval: pending || "pending",
        title: null,
        otherNames: null,
        gender: null,
        dateOfBirth: null,
        address: null,
        employmentDate: new Date(),
        department: null,
        qualifications: null,
        isActive: true,
      },
    });

    // Remove sensitive data if needed before sending response
    const { qualifications, ...staffData } = newStaff;

    res.status(201).json({
      message: "Staff registration submitted successfully",
      user: staffData,
    });
  } catch (error) {
    console.error("Error creating staff registration:", error);

    // Handle Prisma-specific errors
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "A staff member with this email already exists.",
      });
    }

    res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = req.body;
  } catch (error) {
    res.status(500).json({
      error: "Internal server error. Please try again later.",
    });
  }
});

module.exports = router;
