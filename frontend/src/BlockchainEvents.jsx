import React, { useState, useEffect } from "react";
import "./BlockchainEvents.css";

const BlockchainEvents = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [evidenceId, setEvidenceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch blockchain events
  const fetchEvents = async (type = "all", id = "") => {
    setLoading(true);
    setError("");
    try {
      let url = "http://localhost:5001/api/blockchain/";

      if (type === "evidence" && id) {
        url += `evidence-events/${id}`;
      } else if (type === "user") {
        url += "user-events";
      } else {
        // Default: try to get evidence events
        url += `evidence-events/all`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.events || data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(`Failed to fetch events: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchEvents("all");
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "evidence" && evidenceId) {
      fetchEvents("evidence", evidenceId);
    } else if (newFilter === "user") {
      fetchEvents("user");
    } else {
      fetchEvents("all");
    }
  };

  const handleSearch = () => {
    if (evidenceId) {
      fetchEvents("evidence", evidenceId);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const formatAddress = (address) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getEventColor = (eventType) => {
    const colors = {
      UPLOAD: "#4CAF50",
      VIEW: "#2196F3",
      TRANSFER: "#FF9800",
      EXPORT: "#9C27B0",
      UploadEvent: "#4CAF50",
      ViewEvent: "#2196F3",
      TransferEvent: "#FF9800",
      ExportEvent: "#9C27B0",
    };
    return colors[eventType] || "#757575";
  };

  return (
    <div className="blockchain-events-container">
      <div className="blockchain-header">
        <h1>🔗 Blockchain Event Log</h1>
        <p>Track all evidence chain of custody events</p>
      </div>

      {/* Controls */}
      <div className="blockchain-controls">
        <div className="filter-section">
          <label>Filter by:</label>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="evidence">Evidence ID</option>
            <option value="user">My Events</option>
          </select>
        </div>

        {filter === "evidence" && (
          <div className="search-section">
            <input
              type="text"
              placeholder="Enter Evidence ID (e.g., EV-001)"
              value={evidenceId}
              onChange={(e) => setEvidenceId(e.target.value)}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
              Search
            </button>
          </div>
        )}

        <button
          onClick={() => fetchEvents(filter)}
          className="refresh-button"
          disabled={loading}
        >
          {loading ? "Loading..." : "🔄 Refresh"}
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Events List */}
      <div className="events-list">
        {loading ? (
          <div className="loading">Loading blockchain events...</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <p>No events found</p>
            <small>Events will appear here as you use the system</small>
          </div>
        ) : (
          <div className="timeline">
            {events.map((event, index) => {
              const eventType =
                event.event || event.eventType || event.name || "UNKNOWN";
              const timestamp =
                event.timestamp || event.blockNumber || Date.now();
              const sender = event.sender || event.user || event.userAddress;
              const hash =
                event.hash ||
                event.evidenceHash ||
                event.ipfsHash ||
                event.transactionHash;

              return (
                <div
                  key={index}
                  className="event-item"
                  style={{
                    borderLeftColor: getEventColor(eventType),
                  }}
                >
                  <div className="event-header">
                    <span
                      className="event-badge"
                      style={{ backgroundColor: getEventColor(eventType) }}
                    >
                      {eventType}
                    </span>
                    <span className="event-time">
                      {formatTimestamp(timestamp)}
                    </span>
                  </div>

                  <div className="event-body">
                    <div className="event-row">
                      <span className="label">From:</span>
                      <span className="value">{formatAddress(sender)}</span>
                      <span className="full-address">{sender}</span>
                    </div>

                    {event.evidenceId && (
                      <div className="event-row">
                        <span className="label">Evidence ID:</span>
                        <span className="value">{event.evidenceId}</span>
                      </div>
                    )}

                    {hash && (
                      <div className="event-row">
                        <span className="label">Hash:</span>
                        <span className="value hash-value">
                          {formatAddress(hash)}
                        </span>
                        <span className="full-hash">{hash}</span>
                      </div>
                    )}

                    {event.to && (
                      <div className="event-row">
                        <span className="label">Transferred to:</span>
                        <span className="value">{formatAddress(event.to)}</span>
                      </div>
                    )}

                    {event.details && (
                      <div className="event-row">
                        <span className="label">Details:</span>
                        <span className="value">{event.details}</span>
                      </div>
                    )}

                    {event.transactionHash && (
                      <div className="event-row">
                        <span className="label">Transaction:</span>
                        <span className="value tx-hash">
                          {formatAddress(event.transactionHash)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats */}
      {events.length > 0 && (
        <div className="events-stats">
          <div className="stat">
            <span className="stat-label">Total Events:</span>
            <span className="stat-value">{events.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Event Types:</span>
            <span className="stat-value">
              {[...new Set(events.map((e) => e.event || e.eventType || "UNKNOWN"))]
                .length}
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Time Range:</span>
            <span className="stat-value">
              {events.length > 1
                ? `${(
                    (Number(
                      events[events.length - 1].timestamp ||
                        events[events.length - 1].blockNumber
                    ) -
                      Number(
                        events[0].timestamp || events[0].blockNumber
                      )) /
                    60
                  ).toFixed(0)} minutes`
                : "N/A"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainEvents;
