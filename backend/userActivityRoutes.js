/**
 * User Activity Logging Routes
 * Logs all user actions to files for audit trail
 * Integrates with Google OAuth for username extraction
 */

const express = require("express");
const router = express.Router();
const {
  logUserActivity,
  getUserActivityHistory,
  getUserActivityStats,
  exportUserActivityToCSV,
  getAllActiveUsers,
  cleanupOldLogs,
} = require("./userActivityLogger");
const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// ========================================
// MIDDLEWARE: Extract username from token (Optional)
// ========================================

const extractUsername = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      // No token provided - use anonymous username
      req.user = {
        username: "anonymous",
        email: "unknown@example.com",
        name: "Anonymous User",
        googleId: null,
        isAuthenticated: false,
      };
      return next();
    }

    // Verify Google token and get user info
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const username = payload.email.split("@")[0]; // Use email prefix as username

    req.user = {
      username,
      email: payload.email,
      name: payload.name,
      googleId: payload.sub,
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    console.error(" Token verification failed:", error.message);
    // For development: allow requests without token
    if (process.env.NODE_ENV === "development") {
      req.user = {
        username: "guest",
        email: "guest@dev.local",
        name: "Guest User",
      };
      next();
    } else {
      return res.status(401).json({ error: "Invalid authorization token" });
    }
  }
};

// ========================================
// Helper: Get IP address
// ========================================

const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    req.ip ||
    "unknown"
  );
};

// ========================================
// ROUTES
// ========================================

/**
 * POST /api/user/log-activity
 * Log a user activity
 * Body: { action, details }
 */
router.post("/api/user/log-activity", extractUsername, (req, res) => {
  try {
    const { action, username, details = {} } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Action is required" });
    }

    // Use username from request body if provided, otherwise use extracted username
    const finalUsername = username || req.user.username || "anonymous";

    // Enhance details with request info
    const enrichedDetails = {
      ...details,
      userAgent: req.headers["user-agent"],
      ipAddress: getClientIP(req),
      route: req.path,
      method: req.method,
      status: "success",
    };

    // Log the activity
    const logEntry = logUserActivity(
      finalUsername,
      action,
      enrichedDetails
    );

    if (!logEntry) {
      return res.status(500).json({ error: "Failed to log activity" });
    }

    res.json({
      success: true,
      message: "Activity logged",
      entry: logEntry,
    });
  } catch (error) {
    console.error("❌ Error logging activity:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/activity-history
 * Get user's activity history
 * Query: ?days=30&username=user@example.com
 */
router.get("/api/user/activity-history", extractUsername, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    // Use username from query parameter if provided, otherwise use extracted username
    const username = req.query.username || req.user.username || "anonymous";

    const history = getUserActivityHistory(username, days);

    res.json({
      success: true,
      username: username,
      days,
      totalRecords: history.length,
      activities: history,
    });
  } catch (error) {
    console.error("❌ Error retrieving activity history:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/activity-stats
 * Get user's activity statistics
 * Query: ?days=30&username=user@example.com
 */
router.get("/api/user/activity-stats", extractUsername, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    // Use username from query parameter if provided, otherwise use extracted username
    const username = req.query.username || req.user.username || "anonymous";

    const stats = getUserActivityStats(username, days);

    res.json({
      success: true,
      username: username,
      period: `${days} days`,
      stats,
    });
  } catch (error) {
    console.error("❌ Error retrieving activity stats:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/user/activity-export
 * Export user's activity as CSV
 * Query: ?days=30
 */
router.get("/api/user/activity-export", extractUsername, (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const csv = exportUserActivityToCSV(req.user.username, days);

    // Return as downloadable CSV file
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="activity_${req.user.username}_${new Date().toISOString().split("T")[0]}.csv"`
    );
    res.send(csv);
  } catch (error) {
    console.error("❌ Error exporting activity:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/user/log-page-visit
 * Log page visit (convenience endpoint)
 * Body: { pagePath, pageTitle }
 */
router.post("/api/user/log-page-visit", extractUsername, (req, res) => {
  try {
    const { pagePath, pageTitle } = req.body;

    logUserActivity(req.user.username, "PAGE_VISIT", {
      pagePath: pagePath || req.path,
      pageTitle: pageTitle || "Unknown Page",
      userAgent: req.headers["user-agent"],
      ipAddress: getClientIP(req),
    });

    res.json({ success: true, message: "Page visit logged" });
  } catch (error) {
    console.error("❌ Error logging page visit:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/user/log-evidence-action
 * Log evidence-related actions
 * Body: { action, evidenceId, details }
 */
router.post("/api/user/log-evidence-action", extractUsername, (req, res) => {
  try {
    const { action, evidenceId, details = {} } = req.body;

    logUserActivity(req.user.username, `EVIDENCE_${action}`, {
      evidenceId,
      ...details,
      userAgent: req.headers["user-agent"],
      ipAddress: getClientIP(req),
    });

    res.json({ success: true, message: "Evidence action logged" });
  } catch (error) {
    console.error("❌ Error logging evidence action:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/user/log-blockchain-action
 * Log blockchain-related actions
 * Body: { action, txHash, details }
 */
router.post("/api/user/log-blockchain-action", extractUsername, (req, res) => {
  try {
    const { action, txHash, details = {} } = req.body;

    logUserActivity(req.user.username, `BLOCKCHAIN_${action}`, {
      txHash,
      ...details,
      userAgent: req.headers["user-agent"],
      ipAddress: getClientIP(req),
    });

    res.json({ success: true, message: "Blockchain action logged" });
  } catch (error) {
    console.error("❌ Error logging blockchain action:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/active-users
 * Get all users with activity logs
 * Admin endpoint (should be protected)
 */
router.get("/api/admin/active-users", (req, res) => {
  try {
    // In production, verify admin token here
    const users = getAllActiveUsers();

    res.json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error retrieving active users:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/cleanup-old-logs
 * Clean up logs older than retention days
 * Admin endpoint (should be protected)
 */
router.post("/api/admin/cleanup-old-logs", (req, res) => {
  try {
    // In production, verify admin token here
    const retentionDays = req.body.retentionDays || 90;

    cleanupOldLogs(retentionDays);

    res.json({
      success: true,
      message: `Cleaned up logs older than ${retentionDays} days`,
    });
  } catch (error) {
    console.error("❌ Error cleaning up logs:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
