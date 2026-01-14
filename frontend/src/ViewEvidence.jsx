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
    return <p style={{ textAlign: "center", color: "#ffffff", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading records...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  if (records.length === 0) {
    return <p style={{ textAlign: "center", color: "#ffffff", background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>No evidence records found.</p>;
  }

  return (
    <div style={styles.container}>
      <h1 style={{ color: "#ffffff" }}>Evidence Records</h1>

      {records.map((record, index) => {
        const videoUrl = `http://localhost:5001/${record.file_path}`;

        return (
          <div key={index} style={styles.card}>
            <p style={{ color: "#ffffff" }}>
              <strong>Case ID:</strong> {record.case_id}
            </p>
            <p style={{ color: "#ffffff" }}>
              <strong>Evidence ID:</strong> {record.evidence_id}
            </p>
            <p style={{ color: "#ffffff" }}>
              <strong>File Path:</strong> {record.file_path}
            </p>

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
  card: {
    background: "#1a1a1a",
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ffffff",
    boxShadow: "0 2px 6px rgba(255,255,255,0.1)",
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
