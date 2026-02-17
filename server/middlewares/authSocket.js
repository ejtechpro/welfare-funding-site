const jwt = require("jsonwebtoken");
const { verifyOptions } = require("../config/token");

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    if (!token) return reject(new Error("No token provided"));

    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, verifyOptions(), (err, user) => {
      if (err) return reject(new Error("Invalid token"));

      if (user.status !== "ACTIVE") return reject(new Error(`Account is ${user.status}`));
      if (!user.isVerified) return reject(new Error("Please verify your email address."));

      resolve(user);
    });
  });
}

module.exports = { verifyToken };
