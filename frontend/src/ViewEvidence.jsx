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
    return <p style={{ textAlign: "center" }}>Loading records...</p>;
  }

  if (error) {
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;
  }

  if (records.length === 0) {
    return <p style={{ textAlign: "center" }}>No evidence records found.</p>;
  }

  return (
    <div style={styles.container}>
      <h1>📁 Evidence Records</h1>

      {records.map((record, index) => {
        const videoUrl = `http://localhost:5001/${record.file_path}`;

        return (
          <div key={index} style={styles.card}>
            <p>
              <strong>Case ID:</strong> {record.case_id}
            </p>
            <p>
              <strong>Evidence ID:</strong> {record.evidence_id}
            </p>
            <p>
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
    background: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "16px",
    marginBottom: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  video: {
    width: "100%",
    maxWidth: "400px",
    marginTop: "10px",
    borderRadius: "6px",
  },
};

export default ViewRecords;
