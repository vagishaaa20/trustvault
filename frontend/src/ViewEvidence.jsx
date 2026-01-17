import { useEffect, useState } from "react";

const ViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not authenticated. Please login first.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:5001/evidence", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => res.json())
      .then((data) => {
        // Handle different response formats
        const evidenceArray = Array.isArray(data) ? data : (data.evidence || data.logs || []);
        setRecords(evidenceArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load records");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <p style={styles.centerText}>Loading records...</p>
    );
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  if (!records || records.length === 0) {
    return (
      <p style={styles.centerText}>No evidence records found.</p>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#ffffff" }}>Evidence Records</h1>

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
          <div key={index} style={styles.card}>
            <p><strong>Case ID:</strong> {record.caseId || record.case_id}</p>
            <p><strong>Evidence ID:</strong> {record.id || record.evidence_id}</p>
            <p><strong>Name:</strong> {record.name || record.file_path}</p>

            {/* 🔍 Deepfake Info */}
            <div style={styles.analysisBox}>
              <p>
                <strong>Deepfake Result:</strong>{" "}
                <span
                  style={{
                    color:
                      prediction === "FAKE"
                        ? "#ff6b6b"
                        : prediction === "REAL"
                        ? "#34d399"
                        : "#fbbf24",
                  }}
                >
                  {prediction}
                </span>
              </p>

              <p>
                <strong>Average Probability:</strong> {probability}
              </p>

              <p>
                <strong>Analyzed At:</strong> {analyzedAt}
              </p>
            </div>

            <video controls style={styles.video}>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    color: "#ffffff",
  },
  centerText: {
    textAlign: "center",
    color: "#ffffff",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    background: "#1a1a1a",
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ffffff",
    boxShadow: "0 2px 6px rgba(255,255,255,0.1)",
  },
  analysisBox: {
    marginTop: "10px",
    marginBottom: "10px",
    padding: "10px",
    borderRadius: "6px",
    background: "#0f172a",
    border: "1px solid #334155",
  },
  video: {
    width: "100%",
    maxWidth: "400px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "1px solid #ffffff",
  },
};

export default ViewRecords;
