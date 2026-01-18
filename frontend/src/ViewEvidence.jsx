import { useEffect, useState } from "react";

const ViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/records")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load records");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="loading-text">Loading records...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  if (records.length === 0) {
    return <p className="empty-text">No evidence records found.</p>;
  }

  return (
    <div className="view-records-container">
      <h1 className="view-records-title">Evidence Records</h1>

      <div className="records-grid">
        {records.map((record, index) => {
          const videoUrl = `http://localhost:5001/${record.file_path}`;
          const prediction = record.prediction || "PENDING";
          const probability =
            record.avg_probability !== null
              ? (record.avg_probability * 100).toFixed(2) + "%"
              : "—";
          const analyzedAt = record.deepfake_analyzed_at
            ? new Date(record.deepfake_analyzed_at).toLocaleString()
            : "Not analyzed yet";

          return (
            <div key={index} className="record-card">
              <div className="record-info">
                <p><strong>Case ID:</strong> {record.case_id}</p>
                <p><strong>Evidence ID:</strong> {record.evidence_id}</p>
                <p><strong>File Path:</strong> {record.file_path}</p>
              </div>

              <div className="analysis-box">
                <p>
                  <strong>Deepfake Result:</strong>{" "}
                  <span
                    className={
                      prediction === "FAKE"
                        ? "prediction-fake"
                        : prediction === "REAL"
                        ? "prediction-real"
                        : "prediction-pending"
                    }
                  >
                    {prediction}
                  </span>
                </p>
                <p><strong>Average Probability:</strong> {probability}</p>
                <p><strong>Analyzed At:</strong> {analyzedAt}</p>
              </div>

              <video controls className="record-video">
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ViewRecords;