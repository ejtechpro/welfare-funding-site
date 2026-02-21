const prisma = require("../config/conn.js");

/**
 * Deduct monthly contribution from prepaid balance
 * @param {string} memberId
 * @param {number} monthlyContribution
 */
async function deductMonthlyContribution(memberId, monthlyContribution) {
  const balance = await prisma.balance.findUnique({
    where: { memberId },
  });

  if (!balance) throw new Error("Balance not found for member");

  let { prepaid, due } = balance;

  if (prepaid >= monthlyContribution) {
    // Fully cover the contribution from prepaid
    prepaid -= monthlyContribution;
  } else {
    // Use whatever prepaid is left, rest goes to due
    const remaining = monthlyContribution - prepaid;
    prepaid = 0;
    due += remaining;
  }

  // Update balance
  await prisma.balance.update({
    where: { memberId },
    data: { prepaid, due },
  });

  console.log(
    `Updated balance for member ${memberId}: prepaid=${prepaid}, due=${due}`,
  );
}

/**
 * Record a payment and apply to due first, then prepaid
 * @param {string} memberId
 * @param {number} paymentAmount
 */
async function recordPayment(memberId, paymentAmount) {
  const balance = await prisma.balance.findUnique({
    where: { memberId },
  });

  if (!balance) throw new Error("Balance not found for member");

  let { prepaid, due } = balance;

  if (paymentAmount >= due) {
    // Cover all dues
    paymentAmount -= due;
    due = 0;
    prepaid += paymentAmount; // remaining goes to prepaid
  } else {
    // Partial payment toward due
    due -= paymentAmount;
  }

  await prisma.balance.update({
    where: { memberId },
    data: { prepaid, due },
  });

  console.log(
    `Payment applied. Updated balance: prepaid=${prepaid}, due=${due}`,
  );
}

