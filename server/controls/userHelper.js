const prisma = require("../config/conn.js");
const UAParser = require("ua-parser-js");

module.exports = {
  createSession: async (req, user, token) => {
    const ua = req.headers["user-agent"];
    const parser = new UAParser(ua);

    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    const deviceInfo = `${browser} on ${os}`;
    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "unknown";

    // Avoid duplicates (same user + device)
    const sessionKey = `${user.id}-${deviceInfo}-${ipAddress}`;

    const session = await prisma.session.upsert({
      where: { compositeKey: sessionKey },
      update: {
        sessionId: token,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        sessionId: token,
        deviceInfo,
        ipAddress,
        compositeKey: sessionKey,
      },
    });

    return session;
  },

  logoutOtherDevicesHelper: async (user, currentSessionId) => {
    return await prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: { sessionId: currentSessionId },
      },
    });
  },
};
