/**
 * Frontend Activity Tracker
 * Captures user actions and sends them to backend for logging
 */

class ActivityTracker {
  constructor(authToken = null) {
    this.authToken = authToken;
    this.userEmail = localStorage.getItem("userEmail") || "anonymous";
    this.baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5001";
    this.isReady = false;
  }

  /**
   * Set authentication token and user email
   */
  setAuthToken(token) {
    this.authToken = token;
    this.userEmail = localStorage.getItem("userEmail") || "anonymous";
    this.isReady = !!token;
  }

  /**
   * Log generic activity
   */
  async logActivity(action, details = {}) {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Add auth token if available
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const response = await fetch(`${this.baseUrl}/api/user/log-activity`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action,
          username: this.userEmail,
          details: {
            timestamp: new Date().toISOString(),
            ...details,
          },
        }),
      });

      if (!response.ok) {
        console.warn(`Activity logging warning (${response.status}):`, action);
        return false;
      }

      const data = await response.json();
      console.log(`📝 Activity logged: ${action}`);
      return data;
    } catch (error) {
      console.warn("Error logging activity:", error.message);
      return false;
    }
  }

  /**
   * Log page visit
   */
  async logPageVisit(pagePath, pageTitle) {
    return this.logActivity("PAGE_VISIT", {
      pagePath,
      pageTitle,
      referrer: document.referrer,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
    });
  }

  /**
   * Log evidence action
   */
  async logEvidenceAction(action, evidenceId, details = {}) {
    return this.logActivity(`EVIDENCE_${action}`, {
      evidenceId,
      ...details,
    });
  }

  /**
   * Log blockchain action
   */
  async logBlockchainAction(action, details = {}) {
    return this.logActivity(`BLOCKCHAIN_${action}`, {
      ...details,
    });
  }

  /**
   * Log click event
   */
  async logClick(elementId, elementClass, buttonText) {
    return this.logActivity("CLICK", {
      elementId,
      elementClass,
      buttonText,
    });
  }

  /**
   * Log file upload
   */
  async logFileUpload(fileName, fileSize, fileType) {
    return this.logActivity("FILE_UPLOAD", {
      fileName,
      fileSize,
      fileType,
    });
  }

  /**
   * Log form submission
   */
  async logFormSubmit(formName, fieldCount) {
    return this.logActivity("FORM_SUBMIT", {
      formName,
      fieldCount,
    });
  }

  /**
   * Log search action
   */
  async logSearch(searchQuery, resultCount) {
    return this.logActivity("SEARCH", {
      searchQuery,
      resultCount,
    });
  }

  /**
   * Log error
   */
  async logError(errorMessage, errorStack) {
    return this.logActivity("ERROR", {
      errorMessage,
      errorStack,
      url: window.location.href,
    });
  }

  /**
   * Get activity history
   */
  async getActivityHistory(days = 30) {
    if (!this.isReady || !this.authToken) {
      console.warn("ActivityTracker: Not authenticated");
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/user/activity-history?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch activity history:", response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching activity history:", error);
      return null;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(days = 30) {
    if (!this.isReady || !this.authToken) {
      console.warn("ActivityTracker: Not authenticated");
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/user/activity-stats?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch activity stats:", response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      return null;
    }
  }

  /**
   * Export activity to CSV
   */
  async exportActivityToCSV(days = 30) {
    if (!this.isReady || !this.authToken) {
      console.warn("ActivityTracker: Not authenticated");
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/api/user/activity-export?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to export activity:", response.status);
        return false;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error) {
      console.error("Error exporting activity:", error);
      return false;
    }
  }

  /**
   * Setup automatic page tracking
   */
  setupAutoTracking() {
    // Track page visits
    this.logPageVisit(window.location.pathname, document.title);

    // Track navigation
    window.addEventListener("hashchange", () => {
      this.logPageVisit(window.location.pathname, document.title);
    });

    // Track clicks on buttons and links
    document.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "A") {
        this.logClick(
          e.target.id || "unknown",
          e.target.className || "unknown",
          e.target.textContent || "unknown"
        );
      }
    });

    // Track errors
    window.addEventListener("error", (e) => {
      this.logError(e.message, e.stack);
    });

    console.log("✅ Activity tracking enabled");
  }
}

// Export as singleton
const tracker = new ActivityTracker();
export default tracker;