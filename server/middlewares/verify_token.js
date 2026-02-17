const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({error: "You are unauthorized"});
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(403);
    }
    req.user = user;
    next();
  });
};

module.exports = verifyToken;
