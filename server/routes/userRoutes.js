const express = require("express");
const prisma = require("../config/conn.js");

const router = express.Router();

router.get("/me", async (req, res) => {
  try {
    const user = req.user;
    const sessionId = req?.cookies?.sessionid;

    if (!user || !sessionId) {
      return res.status(401).json({ error: "Access denied!" });
    }

    // Fetch user + sessions in one query
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        // profile: true,
        sessions: true,
      },
    });

    if (!foundUser) {
      return res.status(404).json({ error: "Account not found." });
    }

    // ✅ Check if this sessionId exists among user’s active sessions
    const hasActiveSession = foundUser.sessions.some(
      (s) => s.sessionId === sessionId,
    );

    if (!hasActiveSession) {
      return res.status(401).json({ error: "Session expired or invalid!" });
    }

    res.status(200).json(foundUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const userId = req?.user?.id;
    const sessionId = req?.cookies?.sessionid;

    if (sessionId && userId) {
      await prisma.session.deleteMany({
        where: { userId, sessionId },
      });
    }

    // req.session.destroy();

    res.clearCookie("sessionid");
    // res.clearCookie("csrftoken");
    req.user = null;
    res.status(204).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Inter server error while loggin out." });
  }
});

router.post("/logout-other-devices", async (req, res) => {
  try {
    const user = req?.user;
    const currentSessionId = req?.cookies?.sessionid;

    if (!user || !currentSessionId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete all sessions for this user except the current one
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: {
          sessionId: currentSessionId,
        },
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
