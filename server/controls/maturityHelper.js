const prisma = require("../config/conn.js");

/**
 * Bulk + transaction-safe maturity update
 * Only updates maturityStatus based on probationEndDate
 */
async function updateMemberMaturityStatusBulk() {
  console.log("Running bulk maturity check...");

  const today = new Date();

  await prisma.$transaction(async (tx) => {
    // 1. Set matured members
    await tx.member.updateMany({
      where: {
        probationEndDate: { lte: today },
      },
      data: {
        maturityStatus: "matured",
      },
    });

    // 2. Set probation members
    await tx.member.updateMany({
      where: {
        probationEndDate: { gt: today },
      },
      data: {
        maturityStatus: "probation",
      },
    });
  });

  console.log("Bulk maturity update complete.");
}

function calculateDaysToMaturity(probationEndDate) {
  const today = new Date();
  const end = new Date(probationEndDate);

  const diff = end - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

module.exports = { updateMemberMaturityStatusBulk, calculateDaysToMaturity };
