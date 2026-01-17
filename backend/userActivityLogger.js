const fs = require("fs");
const path = require("path");
const os = require("os");

// ========================================
// USER ACTIVITY LOGGER
// Logs all user actions to files for audit trail
// ========================================

const LOG_DIR = path.join(__dirname, "..", "logs");

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log user activity to file and console
 * @param {string} username - Username from Google OAuth
 * @param {string} action - Action performed (e.g., "VIEW_EVIDENCE", "UPLOAD_EVIDENCE")
 * @param {object} details - Additional details about the action
 * @returns {object} - Log entry object
 */
function logUserActivity(username, action, details = {}) {
  if (!username) {
    console.warn("⚠️  Activity logging: username is required");
    return null;
  }

  // Create log entry
  const timestamp = new Date().toISOString();
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const logEntry = {
    timestamp,
    date,
    username,
    action,
    details: {
      userAgent: details.userAgent || "unknown",
      ipAddress: details.ipAddress || "unknown",
      route: details.route || "unknown",
      method: details.method || "unknown",
      status: details.status || "success",
      ...details,
    },
  };

  // Create filename: logs/username_YYYY-MM-DD.log
  const logFileName = `${sanitizeFilename(username)}_${date}.log`;
  const logFilePath = path.join(LOG_DIR, logFileName);

  // Format log line
  const logLine = formatLogEntry(logEntry);

  // Append to file
  try {
    fs.appendFileSync(logFilePath, logLine + "\n", "utf8");
  } catch (error) {
    console.error(`❌ Failed to write to log file ${logFilePath}:`, error);
    return null;
  }

  // Also maintain a global activity log
  const globalLogPath = path.join(LOG_DIR, `all_activities_${date}.log`);
  try {
    fs.appendFileSync(
      globalLogPath,
      `[${username}] ${logLine}\n`,
      "utf8"
    );
  } catch (error) {
    console.error(`❌ Failed to write to global log:`, error);
  }

  // Console output for debugging
  console.log(
    `📝 [${username}] ${action}: ${JSON.stringify(logEntry.details)}`
  );

  return logEntry;
}

/**
 * Get user's activity history
 * @param {string} username - Username to retrieve history for
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {array} - Array of log entries
 */
function getUserActivityHistory(username, days = 30) {
  if (!username) {
    console.warn("⚠️  Username is required");
    return [];
  }

  const activities = [];
  const sanitizedUsername = sanitizeFilename(username);

  // Look back through dates
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const logFileName = `${sanitizedUsername}_${dateStr}.log`;
    const logFilePath = path.join(LOG_DIR, logFileName);

    if (fs.existsSync(logFilePath)) {
      try {
        const content = fs.readFileSync(logFilePath, "utf8");
        const lines = content.split("\n").filter((line) => line.trim());

        lines.forEach((line) => {
          try {
            // Parse log line back to object
            const entry = parseLogEntry(line);
            if (entry) {
              activities.push(entry);
            }
          } catch (e) {
            // Skip unparseable lines
          }
        });
      } catch (error) {
        console.error(
          `❌ Failed to read log file ${logFilePath}:`,
          error
        );
      }
    }
  }

  return activities.reverse(); // Newest first
}

/**
 * Get activity statistics for a user
 * @param {string} username - Username to get stats for
 * @param {number} days - Number of days to analyze (default: 30)
 * @returns {object} - Activity statistics
 */
function getUserActivityStats(username, days = 30) {
  const activities = getUserActivityHistory(username, days);

  const stats = {
    totalActions: activities.length,
    actionCounts: {},
    firstActivity: null,
    lastActivity: null,
    activeDays: new Set(),
  };

  activities.forEach((activity) => {
    stats.actionCounts[activity.action] =
      (stats.actionCounts[activity.action] || 0) + 1;

    if (!stats.firstActivity) {
      stats.firstActivity = activity.timestamp;
    }
    stats.lastActivity = activity.timestamp;

    if (activity.date) {
      stats.activeDays.add(activity.date);
    }
  });

  stats.activeDays = Array.from(stats.activeDays).length;

  return stats;
}

/**
 * Export user activity to CSV format
 * @param {string} username - Username to export
 * @param {number} days - Number of days to export
 * @returns {string} - CSV formatted data
 */
function exportUserActivityToCSV(username, days = 30) {
  const activities = getUserActivityHistory(username, days);

  // CSV Header
  let csv =
    "Timestamp,Date,Action,Status,Route,Method,IP Address,User Agent\n";

  // CSV Rows
  activities.forEach((activity) => {
    const row = [
      activity.timestamp,
      activity.date,
      activity.action,
      activity.details.status || "unknown",
      activity.details.route || "unknown",
      activity.details.method || "unknown",
      activity.details.ipAddress || "unknown",
      (activity.details.userAgent || "unknown").replace(/,/g, ";"), // Escape commas
    ];

    csv += `"${row.join('","')}"\n`;
  });

  return csv;
}

/**
 * Clear old logs (older than retention days)
 * @param {number} retentionDays - Days to keep logs (default: 90)
 */
function cleanupOldLogs(retentionDays = 90) {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    files.forEach((file) => {
      const filePath = path.join(LOG_DIR, file);
      const stats = fs.statSync(filePath);

      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted old log file: ${file}`);
      }
    });
  } catch (error) {
    console.error(`❌ Error cleaning up old logs:`, error);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Format log entry for file storage
 */
function formatLogEntry(entry) {
  return JSON.stringify({
    timestamp: entry.timestamp,
    date: entry.date,
    action: entry.action,
    details: entry.details,
  });
}

/**
 * Parse log entry from file
 */
function parseLogEntry(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

/**
 * Sanitize username for use in filename
 */
function sanitizeFilename(username) {
  return username
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^\.+/, "")
    .slice(0, 100); // Limit to 100 chars
}

/**
 * Get all users with activity logs
 */
function getAllActiveUsers() {
  try {
    const files = fs.readdirSync(LOG_DIR);
    const users = new Set();

    files.forEach((file) => {
      // Match pattern: username_YYYY-MM-DD.log
      const match = file.match(/^(.+?)_\d{4}-\d{2}-\d{2}\.log$/);
      if (match) {
        users.add(match[1]);
      }
    });

    return Array.from(users);
  } catch (error) {
    console.error(`❌ Error reading active users:`, error);
    return [];
  }
}

module.exports = {
  logUserActivity,
  getUserActivityHistory,
  getUserActivityStats,
  exportUserActivityToCSV,
  cleanupOldLogs,
  getAllActiveUsers,
  getLogDirectory: () => LOG_DIR,
};
