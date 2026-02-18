module.exports = {
  signOptions: (expiry) => ({
    algorithm: "HS256", // HMAC SHA256
    expiresIn: expiry,
    issuer: "alpha.com",
    audience: "alpha-users",
  }),
  verifyOptions: () => ({
    algorithms: ["HS256"],
    issuer: "alpha.com",
    audience: "alpha-users",
  }),
};