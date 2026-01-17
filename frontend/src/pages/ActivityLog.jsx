import React, { useState, useEffect } from 'react';
import '../ActivityLog.css';

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [userRole, setUserRole] = useState('USER');
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Get token and role from localStorage
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') || 'USER';
    setToken(storedToken);
    setUserRole(storedRole);

    if (storedToken) {
      fetchLogs(storedToken, storedRole, 1);
    }
  }, []);

  const fetchLogs = async (authToken, role, page = 1) => {
    if (!authToken) {
      setError('No authentication token found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url;
      if (role === 'ADMIN') {
        // Admin gets paginated full log file
        url = `http://localhost:5001/log-file?page=${page}&limit=${itemsPerPage}`;
      } else {
        // Regular user gets their own logs
        url = `http://localhost:5001/logs/me?limit=${itemsPerPage}&offset=${(page - 1) * itemsPerPage}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status}`);
      }

      const data = await response.json();

      if (role === 'ADMIN') {
        // Admin response has meta and logs
        setMeta(data.meta);
        setLogs(data.logs);
      } else {
        // User response has different structure
        setLogs(data.logs || []);
        setMeta({
          page,
          limit: itemsPerPage,
          totalLogs: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / itemsPerPage)
        });
      }
    } catch (err) {
      setError(err.message);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchLogs(token, userRole, newPage);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="activity-log-container">
      <div className="log-header">
        <h1>📋 Activity Log</h1>
        <p className="log-subtitle">
          {userRole === 'ADMIN' ? 'All System Activities' : 'Your Activity History'}
        </p>
      </div>

      {error && (
        <div className="error-alert">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading logs...
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <p>No activity logs found</p>
        </div>
      ) : (
        <>
          <div className="log-stats">
            <span>Total Logs: {meta?.totalLogs || 0}</span>
            {userRole === 'ADMIN' && meta?.pageHash && (
              <span title="Integrity hash of this page">
                🔐 Hash: {meta.pageHash.substring(0, 16)}...
              </span>
            )}
          </div>

          <div className="table-wrapper">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className={`status-${log.status}`}>
                    <td className="username">{log.username}</td>
                    <td className="role">
                      <span className={`role-badge ${log.role.toLowerCase()}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="action">{log.action}</td>
                    <td className="endpoint">{log.endpoint || '-'}</td>
                    <td className={`status status-${log.status}`}>
                      {log.status}
                    </td>
                    <td className="duration">
                      {log.durationMs !== undefined ? `${log.durationMs}ms` : '-'}
                    </td>
                    <td className="timestamp">
                      {formatTimestamp(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-page"
              >
                ← Previous
              </button>

              <div className="page-info">
                Page {currentPage} of {meta.totalPages}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.totalPages}
                className="btn-page"
              >
                Next →
              </button>
            </div>
          )}

          <div className="log-footer">
            <p>
              {userRole === 'ADMIN'
                ? '🔒 Admin access: viewing all system activity'
                : '👤 Viewing your activity only'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityLog;
