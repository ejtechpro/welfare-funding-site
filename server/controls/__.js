// Monthly fee
const MONTHLY_AMOUNT = new Decimal(100);

// Function to simulate manual payment and monthly charge
function processBalance({
  oldPrepaid,
  oldDue,
  paymentAmount = 0,
  month,
  year,
}) {
  console.log(`\n=== Month ${month}, Year ${year} ===`);
  console.log(`Starting balance: prepaid=${oldPrepaid}, due=${oldDue}`);
  console.log(`Payment received: ${paymentAmount}`);

  let prepaid = new Decimal(oldPrepaid);
  let due = new Decimal(oldDue);
  let payment = new Decimal(paymentAmount);

  // 1️⃣ Apply payment first: pay off due
  if (due.greaterThan(0)) {
    if (payment.greaterThanOrEqualTo(due)) {
      payment = payment.minus(due);
      due = new Decimal(0);
    } else {
      due = due.minus(payment);
      payment = new Decimal(0);
    }
  }

  // 2️⃣ Remaining payment becomes prepaid
  if (payment.greaterThan(0)) {
    prepaid = prepaid.plus(payment);
  }

  console.log(`After payment: prepaid=${prepaid.toString()}, due=${due.toString()}`);

  // 3️⃣ Apply monthly recurring charge
  if (prepaid.greaterThanOrEqualTo(MONTHLY_AMOUNT)) {
    prepaid = prepaid.minus(MONTHLY_AMOUNT);
  } else {
    const remaining = MONTHLY_AMOUNT.minus(prepaid);
    prepaid = new Decimal(0);
    due = due.plus(remaining);
  }

  console.log(`After monthly charge: prepaid=${prepaid.toString()}, due=${due.toString()}`);

  return { prepaid, due };
}

// --------------------
// Example test sequence
// --------------------
function testScenario() {
  // Month 1, starting from zero
  let result = processBalance({
    oldPrepaid: 0,
    oldDue: 0,
    paymentAmount: 70,
    month: 1,
    year: 2026,
  });

  // Month 1, second payment
  result = processBalance({
    oldPrepaid: result.prepaid.toString(),
    oldDue: result.due.toString(),
    paymentAmount: 40,
    month: 1,
    year: 2026,
  });

  // Month 2, no payment, apply monthly charge
  result = processBalance({
    oldPrepaid: result.prepaid.toString(),
    oldDue: result.due.toString(),
    paymentAmount: 0,
    month: 2,
    year: 2026,
  });
  result = processBalance({
    oldPrepaid: result.prepaid.toString(),
    oldDue: result.due.toString(),
    paymentAmount: 0,
    month: 3,
    year: 2026,
  });

  console.log(`\nFinal balance after month 2: prepaid=${result.prepaid.toString()}, due=${result.due.toString()}`);
}

testScenario();

// const uploadDir = "/home/ej/guru.com/uploads";
