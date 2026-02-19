const axios = require("axios");
const prisma = require("../config/conn.js");
const express = require("express");
const router = express.Router();
require("dotenv").config();

// helper functions
const getTimestamp = () => {
  return new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
};

const getPassword = (timestamp) => {
  return Buffer.from(
    process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp,
  ).toString("base64");
};

const getAccessToken = async () => {
  const auth = Buffer.from(
    process.env.MPESA_CONSUMER_KEY + ":" + process.env.MPESA_CONSUMER_SECRET,
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );

  return res.data.access_token;
};

// 👉 STK PUSH ROUTE
router.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "phone and amount required" });
    }

    const token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "TNS",
        TransactionDesc: "Payment For TNS Registration",

      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "STK push failed" });
  }
});

// CALLBACK
router.post("/callback", (req, res) => {
  console.log("MPESA CALLBACK:", JSON.stringify(req.body, null, 2));
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

module.exports = router;
