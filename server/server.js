const express = require("express");
const http = require("http");
const prisma = require("./config/conn.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

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

app.use("/api/auth", require("./routes/authRoutes.js"));
// app.use("/api/users", require("./routes/userRoutes.js"));

// Start the server
server.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
