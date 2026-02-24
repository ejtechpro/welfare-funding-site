const express = require("express");
const prisma = require("../config/conn.js");

const router = express.Router();

const VALID_CATEGORIES = [
  "rent",
  "utilities",
  "salaries",
  "office_supplies",
  "maintenance",
  "transportation",
  "communication",
  "professional_fees",
  "insurance",
  "marketing",
  "other",
];

const VALID_STATUS = ["paid", "pending", "cancelled", "approved"];

/**
 * CREATE: POST /expenditures/add
 */
router.post("/add", async (req, res) => {
  try {
    const { amount, expenseCategory, description, expenseDate, status } =
      req.body;

    if (!amount || !expenseCategory || !expenseDate || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }

    if (!VALID_CATEGORIES.includes(expenseCategory)) {
      return res.status(400).json({ error: "Invalid expense category" });
    }

    if (!VALID_STATUS.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const expenseDateObj = new Date(expenseDate);
    if (isNaN(expenseDateObj.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const expense = await prisma.monthlyExpense.create({
      data: {
        amount,
        expenseCategory,
        description,
        expenseDate: expenseDateObj,
        status,
      },
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * READ ALL: GET /expenditures/
 */
router.get("/", async (req, res) => {
  try {
    const expenses = await prisma.monthlyExpense.findMany({
      orderBy: { expenseDate: "desc" },
    });
    res.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * READ ONE: GET /expenditures/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await prisma.monthlyExpense.findUnique({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * UPDATE: PUT /expenditures/:id
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, expenseCategory, description, expenseDate, status } =
      req.body;

    const updates = {};

    if (amount !== undefined) {
      if (typeof amount !== "number" || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Amount must be a positive number" });
      }
      updates.amount = amount;
    }

    if (expenseCategory !== undefined) {
      if (!VALID_CATEGORIES.includes(expenseCategory)) {
        return res.status(400).json({ error: "Invalid expense category" });
      }
      updates.expenseCategory = expenseCategory;
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (expenseDate !== undefined) {
      const expenseDateObj = new Date(expenseDate);
      if (isNaN(expenseDateObj.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      updates.expenseDate = expenseDateObj;
    }

    if (status !== undefined) {
      if (!VALID_STATUS.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updates.status = status;
    }

    const updatedExpense = await prisma.monthlyExpense.update({
      where: { id },
      data: updates,
    });

    res.json({ success: true, expense: updatedExpense });
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE: DELETE /expenditures/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.monthlyExpense.delete({
      where: { id },
    });

    res.json({ success: true, message: "Expense deleted" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
