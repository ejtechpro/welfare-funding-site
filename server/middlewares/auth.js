const jwt = require("jsonwebtoken");
const { verifyOptions } = require("../config/token.js");
const crypto = require("crypto");

const auth = async (req, res, next) => {
  try {
    // Get token from various sources (cookie and Authorization header)
    let token = null;
    const authHeader = req.headers.Authorization || req.headers.authorization;

    // const x_csrf_token = req.headers["x-csrf-token"];
    const csrftoken = req.cookies.csrftoken;

    // if (!x_csrf_token || x_csrf_token !== csrftoken) {
    //   return res.status(403).json({ error: "Forbidden!" });
    // }

    // 1. Check cookies first
    if (req.cookies?.sessionid) {
      token = req.cookies.sessionid;
    }
    // 2. Check Authorization header
    else if (authHeader && req.headers.authorization.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Access denied!!!" });
    }

    // Verify the token
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_KEY,
      verifyOptions(),
      (err, user) => {
        if (err) {
          return res.status(401).json({ error: "You are unauthorized!!!" });
        }

        if (user.status !== "active") {
          return res.status(401).json({
            error: `Account is ${user.status}. Please contact support.`,
          });
        }
        // if (!user.isVerified) {
        //   return res.status(401).json({
        //     error: "Please verify your email address.",
        //   });
        // }

        req.user = user;
        next();
      }
    );
  } catch (error) {
    res.status(500).json("Authentication error:", error.message);
  }
};

module.exports = auth;
