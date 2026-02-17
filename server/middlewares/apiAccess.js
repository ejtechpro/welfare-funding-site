const { allowedOrigins } = require("../config/cors");

// Protect APIs from CSRF or external POSTs
function apiAccess(req, res, next) {
  const origin = req.get("origin") || req.get("referer") || "";
  const allowed = allowedOrigins.some((o) => origin.startsWith(o));

  if (!origin || !allowed) {
    return res.status(403).json({ error: "Forbidden request" });
  }

  next();
}

// Reject non-JSON POST/PUT requests (blocks HTML forms)
function requireJson(req, res, next) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const ct = req.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return res.status(415).json({ error: "JSON only" });
    }
  }
  next();
}

module.exports = { apiAccess, requireJson };
