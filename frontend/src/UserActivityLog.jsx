import React, { useState, useEffect } from "react";
import tracker from "./ActivityTracker";
import "./UserActivityLog.css";

/**
 * User Activity Log Component
 * Displays user's activity history with filtering and export
 */

const UserActivityLog = ({ authToken }) => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("ALL");
  const [daysFilter, setDaysFilter] = useState(30);
  const [exportingCSV, setExportingCSV] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Get logged-in user's email from localStorage
    const email = localStorage.getItem("userEmail");
    setUserEmail(email || "");
    
    if (authToken) {
      tracker.setAuthToken(authToken);
      loadActivityData();
    } else if (email) {
      // If no auth token but have email, still load activities
      loadActivityData();
    }
  }, [authToken, daysFilter]);

  const loadActivityData = async () => {
    setLoading(true);
    try {
      const email = userEmail || localStorage.getItem("userEmail");
      
      // Fetch activity history for specific user
      const historyResponse = await fetch(
        `http://localhost:5001/api/user/activity-history?days=${daysFilter}&username=${encodeURIComponent(email || "anonymous")}`
      );
      const historyData = await historyResponse.json();
      if (historyData && historyData.activities) {
        setActivities(historyData.activities);
      }

      // Fetch activity stats for specific user
      const statsResponse = await fetch(
        `http://localhost:5001/api/user/activity-stats?days=${daysFilter}&username=${encodeURIComponent(email || "anonymous")}`
      );
      const statsData = await statsResponse.json();
      if (statsData && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Error loading activity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExportingCSV(true);
    const success = await tracker.exportActivityToCSV(daysFilter);
    if (success) {
      alert("Activity exported successfully!");
    } else {
      alert("Failed to export activity");
    }
    setExportingCSV(false);
  };

  const getFilteredActivities = () => {
    if (filterAction === "ALL") {
      return activities;
    }
    return activities.filter((a) => a.action === filterAction);
  };

  const getUniqueActions = () => {
    const actions = new Set(activities.map((a) => a.action));
    return Array.from(actions).sort();
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getActionBadgeColor = (action) => {
    const actionColors = {
      PAGE_VISIT: "#3498db",
      CLICK: "#2ecc71",
      FILE_UPLOAD: "#e74c3c",
      FORM_SUBMIT: "#f39c12",
      EVIDENCE_UPLOAD: "#e74c3c",
      EVIDENCE_VIEW: "#3498db",
      BLOCKCHAIN_UPLOAD: "#9b59b6",
      SEARCH: "#1abc9c",
      ERROR: "#e74c3c",
    };
    return actionColors[action] || "#95a5a6";
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="activity-log-container">
      <div className="activity-header">
        <h2>📊 Your Activity Log</h2>
        <p className="subtitle">
          {userEmail 
            ? `Activity history for ${userEmail}`
            : "View all your actions and interactions with the system"
          }
        </p>
      </div>

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-label">Total Actions</div>
            <div className="stat-value">{stats.totalActions}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active Days</div>
            <div className="stat-value">{stats.activeDays}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Date Range</div>
            <div className="stat-value">{stats.period}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Last Activity</div>
            <div className="stat-value">
              {stats.lastActivity
                ? new Date(stats.lastActivity).toLocaleDateString()
                : "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Action Type Statistics */}
      {stats && stats.actionCounts && (
        <div className="action-counts-section">
          <h3>Actions by Type</h3>
          <div className="action-counts-grid">
            {Object.entries(stats.actionCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([action, count]) => (
                <div
                  key={action}
                  className="action-count-item"
                  style={{
                    borderLeftColor: getActionBadgeColor(action),
                  }}
                >
                  <div className="action-name">{action}</div>
                  <div className="action-count">{count}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filters and Export */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="daysFilter">Date Range:</label>
          <select
            id="daysFilter"
            value={daysFilter}
            onChange={(e) => setDaysFilter(parseInt(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="actionFilter">Filter by Action:</label>
          <select
            id="actionFilter"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            {getUniqueActions().map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <button
          className="export-btn"
          onClick={handleExportCSV}
          disabled={exportingCSV || filteredActivities.length === 0}
        >
          {exportingCSV ? "Exporting..." : "📥 Export as CSV"}
        </button>
      </div>

      {/* Activity List */}
      <div className="activity-list-section">
        <h3>
          Activity Records ({filteredActivities.length})
        </h3>

        {loading ? (
          <div className="loading">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities found for the selected filters.</p>
          </div>
        ) : (
          <div className="activity-list">
            {filteredActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-left">
                  <div
                    className="activity-badge"
                    style={{
                      backgroundColor: getActionBadgeColor(activity.action),
                    }}
                  >
                    {activity.action.charAt(0)}
                  </div>
                </div>

                <div className="activity-middle">
                  <div className="activity-action">
                    <strong>{activity.action}</strong>
                  </div>

                  <div className="activity-details">
                    {activity.details && (
                      <>
                        {activity.details.route && (
                          <span className="detail-item">
                            📍 {activity.details.route}
                          </span>
                        )}
                        {activity.details.pagePath && (
                          <span className="detail-item">
                            📄 {activity.details.pagePath}
                          </span>
                        )}
                        {activity.details.evidenceId && (
                          <span className="detail-item">
                            🔐 {activity.details.evidenceId.substring(0, 16)}...
                          </span>
                        )}
                        {activity.details.fileName && (
                          <span className="detail-item">
                            📎 {activity.details.fileName}
                          </span>
                        )}
                        {activity.details.fileSize && (
                          <span className="detail-item">
                            📊 {formatFileSize(activity.details.fileSize)}
                          </span>
                        )}
                        {activity.details.status && (
                          <span
                            className="detail-item"
                            style={{
                              color:
                                activity.details.status === "success"
                                  ? "#2ecc71"
                                  : "#e74c3c",
                            }}
                          >
                            {activity.details.status === "success"
                              ? "✅"
                              : "❌"}{" "}
                            {activity.details.status}
                          </span>
                        )}
                        {activity.details.ipAddress &&
                          activity.details.ipAddress !== "unknown" && (
                            <span
                              className="detail-item"
                              style={{ fontSize: "0.8em", opacity: 0.7 }}
                            >
                              🌐 {activity.details.ipAddress}
                            </span>
                          )}
                      </>
                    )}
                  </div>
                </div>

                <div className="activity-right">
                  <div className="activity-timestamp">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                  <div className="activity-date">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityLog;
