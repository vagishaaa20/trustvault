import { useState, useEffect } from "react";
import "./CheckEvidence.css";

const CheckEvidence = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchEvidence();
  }, []);

  const fetchEvidence = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:5001/evidence");
      const data = await res.json();

      if (data.success && data.records) {
        setRecords(data.records);
      } else {
        setRecords([]);
      }
    } catch (err) {
      setError("Failed to fetch evidence. Make sure backend is running.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (filter === "") return true;
    
    const filterLower = filter.toLowerCase();
    const caseIdMatch = record.case_id?.toLowerCase().includes(filterLower) || false;
    const evidenceIdMatch = record.evidence_id?.toLowerCase().includes(filterLower) || false;
    const hashMatch = record.hash?.toLowerCase().includes(filterLower) || false;
    
    return caseIdMatch || evidenceIdMatch || hashMatch;
  });

  return (
    <div className="check-evidence-container">
      <div className="check-evidence-card">
        <h1>Evidence Database</h1>
        <p className="subtitle">View all stored evidence on blockchain</p>

        <div className="controls">
          <input
            type="text"
            placeholder="Search by Case ID, Evidence ID, or Hash..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="search-input"
          />
          <button onClick={fetchEvidence} className="btn-refresh">
            Refresh
          </button>
        </div>

        {loading && <p className="status-loading">Loading evidence...</p>}

        {error && <p className="status-error">Error: {error}</p>}

        {!loading && !error && filteredRecords.length === 0 && (
          <p className="status-empty">No evidence records found</p>
        )}

        {!loading && filteredRecords.length > 0 && (
          <div className="records-container">
            <p className="record-count">
              Total: {filteredRecords.length} record(s)
            </p>

            {filteredRecords.map((record, index) => (
              <div key={index} className="evidence-record">
                <div className="record-header">
                  <span className="record-number">#{record.number}</span>
                  <span className="record-block">Block {record.block_number}</span>
                </div>

                <div className="record-grid">
                  <div className="record-item">
                    <span className="label">Case ID</span>
                    <span className="value">{record.case_id}</span>
                  </div>

                  <div className="record-item">
                    <span className="label">Evidence ID</span>
                    <span className="value">{record.evidence_id}</span>
                  </div>
                </div>

                <div className="record-hash">
                  <span className="label">Hash (SHA-256)</span>
                  <div className="hash-display">
                    <code>{record.hash}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(record.hash);
                        alert("Hash copied!");
                      }}
                      className="btn-copy-small"
                      title="Copy hash"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="record-grid">
                  <div className="record-item">
                    <span className="label">Timestamp</span>
                    <span className="value text-small">
                      {new Date(record.datetime).toLocaleString()}
                    </span>
                  </div>

                  <div className="record-item">
                    <span className="label">Transaction</span>
                    <span className="value text-small mono">
                      {record.transaction.substring(0, 10)}...
                    </span>
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

export default CheckEvidence;
