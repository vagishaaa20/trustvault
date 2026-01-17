// Frontend Integration Examples for Blockchain Event Logging

import React, { useState, useEffect } from 'react';

/**
 * Hook: useBlockchainEvents
 * Manages blockchain event logging with Google OAuth token
 */
export const useBlockchainEvents = (googleToken) => {
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

  // Verify token and get blockchain address
  useEffect(() => {
    if (!googleToken) return;

    const verifyToken = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/auth/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error('Token verification failed');
        const data = await res.json();
        setUserAddress(data.user.blockchainAddress);
      } catch (err) {
        setError(err.message);
        console.error('❌ Token verification error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [googleToken]);

  /**
   * Log upload event
   */
  const logUpload = async (evidenceId, videoHash) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/blockchain/log-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evidenceId, hash: videoHash })
      });

      if (!res.ok) throw new Error('Upload logging failed');
      const data = await res.json();
      console.log('✅ Upload event logged:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Upload logging error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log view event
   */
  const logView = async (evidenceId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/blockchain/log-view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evidenceId })
      });

      if (!res.ok) throw new Error('View logging failed');
      const data = await res.json();
      console.log('✅ View event logged:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ View logging error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log transfer event
   */
  const logTransfer = async (evidenceId, toGoogleId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/blockchain/log-transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evidenceId, toGoogleId })
      });

      if (!res.ok) throw new Error('Transfer logging failed');
      const data = await res.json();
      console.log('✅ Transfer event logged:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Transfer logging error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log export event
   */
  const logExport = async (evidenceId, exportFormat = 'pdf') => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/blockchain/log-export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ evidenceId, exportFormat })
      });

      if (!res.ok) throw new Error('Export logging failed');
      const data = await res.json();
      console.log('✅ Export event logged:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Export logging error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user's event history
   */
  const getUserEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/blockchain/user-events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to fetch user events');
      const data = await res.json();
      console.log('✅ User events fetched:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ User events error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get evidence event history
   */
  const getEvidenceEvents = async (evidenceId) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/blockchain/evidence-events/${evidenceId}`,
        { method: 'GET' }
      );

      if (!res.ok) throw new Error('Failed to fetch evidence events');
      const data = await res.json();
      console.log('✅ Evidence events fetched:', data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Evidence events error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    userAddress,
    loading,
    error,
    logUpload,
    logView,
    logTransfer,
    logExport,
    getUserEvents,
    getEvidenceEvents
  };
};

/**
 * Component: AddEvidence with Blockchain Logging
 */
export const AddEvidenceWithBlockchain = ({ googleToken }) => {
  const {
    userAddress,
    logUpload,
    loading,
    error
  } = useBlockchainEvents(googleToken);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      // Upload video to backend
      const uploadRes = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData
      });

      const { videoHash, success } = await uploadRes.json();

      if (!success) throw new Error('Upload failed');

      // Log to blockchain
      await logUpload(
        formData.get('evidenceId'),
        videoHash
      );

      alert('✅ Evidence uploaded and logged to blockchain!');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Add Evidence</h2>
      <p>Your Blockchain Address: <code>{userAddress}</code></p>

      <form onSubmit={handleUpload}>
        <input
          type="text"
          name="caseId"
          placeholder="Case ID"
          required
        />
        <input
          type="text"
          name="evidenceId"
          placeholder="Evidence ID"
          required
        />
        <input
          type="file"
          name="video"
          accept="video/*"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Upload & Log'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};

/**
 * Component: Evidence Viewer with View Logging
 */
export const EvidenceViewerWithLogging = ({ evidenceId, googleToken }) => {
  const { logView, getEvidenceEvents, loading } = useBlockchainEvents(googleToken);
  const [events, setEvents] = useState(null);

  const handleView = async () => {
    try {
      // Log view event
      await logView(evidenceId);

      // Fetch event history
      const history = await getEvidenceEvents(evidenceId);
      setEvents(history);

      alert('✅ View logged to blockchain');
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Evidence: {evidenceId}</h2>
      <button onClick={handleView} disabled={loading}>
        {loading ? 'Loading...' : 'View & Log'}
      </button>

      {events && (
        <div>
          <h3>Event History</h3>
          <pre>{JSON.stringify(events, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

/**
 * Component: Evidence Audit Trail
 */
export const EvidenceAuditTrail = ({ evidenceId }) => {
  const [events, setEvents] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:5001/api/blockchain/evidence-events/${evidenceId}`
        );
        const data = await res.json();
        setEvents(data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [evidenceId]);

  if (loading) return <p>Loading audit trail...</p>;
  if (!events) return <p>No events found</p>;

  return (
    <div>
      <h3>Immutable Audit Trail: {evidenceId}</h3>
      <table>
        <thead>
          <tr>
            <th>Event Type</th>
            <th>User Address</th>
            <th>Timestamp</th>
            <th>Block Number</th>
            <th>Transaction</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through events and display */}
          {Object.entries(events).map(([eventType, eventList]) =>
            eventList.map((event, idx) => (
              <tr key={`${eventType}-${idx}`}>
                <td>{eventType}</td>
                <td><code>{event.address?.substring(0, 10)}...</code></td>
                <td>{new Date(event.timeStamp * 1000).toLocaleString()}</td>
                <td>{event.blockNumber}</td>
                <td>
                  <a
                    href={`https://etherscan.io/tx/${event.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default useBlockchainEvents;
