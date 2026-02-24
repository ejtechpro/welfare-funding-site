const express = require("express");
const http = require("http");
const prisma = require("./config/conn.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const auth = require("./middlewares/auth.js");
const cron = require("node-cron");
const {
  updateMemberMaturityStatusBulk,
} = require("./controls/maturityHelper.js");
require("dotenv").config();
const { Decimal } = require("@prisma/client");
const { monthlyAmout } = require("./controls/monthlyAmoutHelper.js");
const transporter = require("./config/smtpTransporter.js");

const PORT = process.env.PORT || 3000;

const app = express();

// Middleware example (optional)
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://teamnostruggle.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "public")));

const server = http.createServer(app);

app.get("/api", async (req, res) => {
  try {
    // Query DB for current time as test
    const rows = await prisma.$queryRaw`SELECT 1`;
    console.log(rows);

    res.status(200).json({
      message: `Welcome to TNS API! DB connected. Current connection: ${rows.length}`,
    });
  } catch (err) {
    // Send error if DB fails
    res.status(500).send(`DB Connection Error: ${err.message}`);
  }
});

cron.schedule("0 0 * * *", async () => {
  await updateMemberMaturityStatusBulk();
});

cron.schedule("0 0 * * *", async () => {
  console.log("📆 Running monthly rollover job...");
  const now = new Date();
  const MONTHLY_AMOUNT = await monthlyAmout();

  const members = await prisma.member.findMany({
    where: {
      billingDate: { not: null }, // must have a billingDate
    },
    select: {
      id: true,
      billingDate: true,
      balance: true,
      user: { select: { status: true } },
    },
  });

  for (const m of members) {
    try {
      if (!m.billingDate) continue;

      // normalize billingDate to 12:00 AM
      const billingDate = new Date(m.billingDate);
      billingDate.setHours(0, 0, 0, 0);

      // only process if billingDate is today or earlier
      if (now >= billingDate) {
        const nextBillingDate = new Date(billingDate);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        nextBillingDate.setHours(0, 0, 0, 0); // ensure next cycle is at 12 AM

        const updateData = { billingDate: nextBillingDate };

        // charge balance only if user is active
        if (m.user.status === "active") {
          const newBalance = new Decimal(m.balance ?? 0).minus(MONTHLY_AMOUNT);
          updateData.balance = newBalance;

          console.log(
            `Charged ${m.id} for the month, new balance: ${newBalance.toString()}`,
          );
        } else {
          console.log(
            `Skipped charging ${m.id} (inactive), billingDate moved to ${nextBillingDate.toISOString()}`,
          );
        }

        await prisma.member.update({
          where: { id: m.id },
          data: updateData,
        });
      }
    } catch (err) {
      console.error(`❌ Failed processing member ${m.id}:`, err);
    }
  }

  console.log("✅ Monthly rollover job completed.");
});

app.use("/api/auth", require("./routes/authRoutes.js"));
app.use("/api/member-auth", require("./routes/memberAuth.js"));
app.use("/api/mpesa", require("./routes/stkpush.js"));
app.use(auth);
app.use("/api/members", require("./routes/memberRoutes.js"));
app.use("/api/users", require("./routes/userRoutes.js"));
app.use("/api/transactions", require("./routes/transactionRoutes.js"));
app.use("/api/contributions", require("./routes/contributionRoutes.js"));



// Start the server
server.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
