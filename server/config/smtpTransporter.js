const nodemailer = require("nodemailer");

// create transporter using your SMTP details
const transporter = nodemailer.createTransport({
  host: "mail.teamnostruggle.com",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: "noreply@teamnostruggle.com",
    pass: "@tns.com",
  },
});

async function sendVerificationEmail(toEmail, code) {
  const mailOptions = {
    from: '"TeamnoStruggle" <noreply@teamnostruggle.com>',
    to: toEmail,
    subject: "Your Verification Code",
    text: `Your verification code is: ${code}`, // plain text
    html: `<p>Your verification code is: <b>${code}</b></p>`, // HTML
    // headers: { "X-Priority": "1" },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit code
}

async function SendCode() {
  const code = generateVerificationCode();
  const success = await sendVerificationEmail("ej92423991@gmail.com", code);

  if (success) {
    console.log("Verification email sent to");
    // store code in DB or cache for verification later
  } else {
    console.log("Failed to send verification email");
  }
}


module.exports = transporter;
