const axios = require("axios");
const { getAccessToken } = require("./auths");
require("dotenv").config()
   
const shortCode = process.env.MPESA_SHORTCODE; // Replace with your ShortCode
const passkey = process.env.MPESA_PASSKEY; // Replace with your Passkey
  
const generatePassword = () => {
   const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14); // YYYYMMDDHHMMSS

  const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

  return { password, timestamp };
};

const initiateSTK = async (req,res) => {
  const url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const { password, timestamp } = generatePassword();
  const {phone, amount} = req.body
  const requestData = {
    BusinessShortCode:shortCode,
    Password: password, // Dynamically generated password
    Timestamp: timestamp, // Dynamically generated timestamp
    TransactionType: "CustomerPayBillOnline",
    Amount: amount,
    PartyA: phone,
    PartyB: shortCode,
    PhoneNumber: phone,
    CallBackURL: "https://teamnostruggle.org/callback",
    AccountReference: "paymentDetails.accountReference",
    TransactionDesc: "paymentDetails.transactionDesc",
  };

  try {
    const accessToken = await getAccessToken(); // Get the valid token
    const response = await axios.post(url, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("STK Push Response:", response.data);
    res.send(response.data)
  } catch (error) {
    console.error("Error in STK Push:", error.response?.data || error.message);
    throw new Error("Failed to initiate STK Push");
  }
};

const initiateSTKPush = async (paymentDetails) => {
  const url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

  const { password, timestamp } = generatePassword();

  const requestData = {
    BusinessShortCode:shortCode,
    Password: password, // Dynamically generated password
    Timestamp: timestamp, // Dynamically generated timestamp
    TransactionType: "CustomerPayBillOnline",
    Amount: paymentDetails.amount,
    PartyA: paymentDetails.phoneNumber,
    PartyB: shortCode,
    PhoneNumber: paymentDetails.phoneNumber,
    CallBackURL: "https://teamnostruggle.org/callback",
    AccountReference: paymentDetails.accountReference,
    TransactionDesc: paymentDetails.transactionDesc,
  };

  try {
    const accessToken = await getAccessToken(); // Get the valid token
    const response = await axios.post(url, requestData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("STK Push Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in STK Push:", error.response?.data || error.message);
    throw new Error("Failed to initiate STK Push");
  }
};

module.exports = { initiateSTKPush,initiateSTK };