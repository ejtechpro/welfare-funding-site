const express = require("express");
const prisma = require("../config/conn.js");

const router = express.Router();

router.post("/add-type", async (req, res) => {
  try {
    const data = req.body;

    const typeName = data?.name?.toLowerCase().trim();

    const checkName = await prisma.contributionType.findFirst({
      where: {
        name: typeName,
      },
    });

    if (checkName?.name) {
      return res.status(400).json({
        error: "The contribution name provided  already exists!",
      });
    }

    const type = await prisma.contributionType.findFirst({
      where: {
        category: data.category,
      },
    });

    if (type?.category == "monthly") {
      return res.status(400).json({
        error: `The ${data?.category} contribution name provided  already exists!`,
      });
    }

    const types = await prisma.contributionType.create({
      data: {
        name: typeName,
        category: data.category,
        defaultAmount: data.defaultAmount,
        status: data.status,
        description: data.description,
      },
    });
    res.status(200).json({ success: true, types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/get-types", async (req, res) => {
  try {
    const types = await prisma.contributionType.findMany();
    res.status(200).json({ success: true, types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/get-active-types", async (req, res) => {
  try {
    const types = await prisma.contributionType.findMany({
      where: {
        status: "active",
      },
    });
    res.status(200).json({ success: true, types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/update-type/:typeId", async (req, res) => {
  try {
    const typeId = req.params.typeId;
    const data = req.body;

    const typeName = data?.name?.toLowerCase().trim();

    const checkName = await prisma.contributionType.findFirst({
      where: {
        name: typeName,
        id: { not: typeId },
      },
    });

    if (checkName?.name) {
      return res.status(400).json({
        error: `The ${data?.category} contribution name provided  already exists!`,
      });
    }

    const type = await prisma.contributionType.findFirst({
      where: {
        category: data.category,
        id: { not: typeId },
      },
    });

    if (type?.category == "monthly") {
      return res.status(400).json({
        error:
          "The system only support one type of monthly contribution, which already exists!",
      });
    }

    const types = await prisma.contributionType.update({
      where: { id: typeId },
      data: {
        name: data.name,
        category: data.category,
        defaultAmount: data.defaultAmount,
        status: data.status,
        description: data.description,
      },
    });
    res.status(200).json({ success: true, types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.delete("/delete-type/:typeId", async (req, res) => {
  try {
    const typeId = req.params.typeId;
    await prisma.contributionType.delete({
      where: { id: typeId },
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
