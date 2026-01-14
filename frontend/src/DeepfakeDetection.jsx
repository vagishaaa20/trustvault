import { useState, useEffect } from "react";
import "./DeepfakeDetection.css";

const DeepfakeDetection = () => {
  const [streamlitUrl, setStreamlitUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Streamlit app typically runs on port 8501 by default
    // Make sure the deepfake streamlit app is running
    const url = "http://localhost:8501";
    setStreamlitUrl(url);

    // Optional: Check if Streamlit is running
    fetch(url, { mode: "no-cors" })
      .catch(() => {
        setError(
          "Deepfake detection service is not running. Please start it using: streamlit run streamlit_app.py"
        );
      });
  }, []);

  if (error) {
    return (
      <div className="deepfake-container">
        <div className="error-message">
          <h2> Service Not Available</h2>
          <p>{error}</p>
          <p style={{ marginTop: "20px", fontSize: "14px" }}>
            To start the service, run the following command from the deepfake directory:
          </p>
          <code style={{ display: "block", marginTop: "10px", padding: "10px", backgroundColor: "#f5f5f5", borderRadius: "5px" }}>
            streamlit run streamlit_app.py
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="deepfake-container">
      

      {streamlitUrl ? (
        <div className="streamlit-wrapper">
          <iframe
            src={streamlitUrl}
            title="Deepfake Detection Streamlit App"
            className="streamlit-iframe"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="loading">
          <p>Loading deepfake detection service...</p>
        </div>
      )}
    </div>
  );
};

export default DeepfakeDetection;
