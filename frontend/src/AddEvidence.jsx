import { useState } from "react";
import "./AddEvidence.css";

const AddEvidence = () => {
  const [caseId, setCaseId] = useState("");
  const [evidenceId, setEvidenceId] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [videoHash, setVideoHash] = useState("");

  const uploadEvidence = async () => {
    if (!caseId || !evidenceId || !video) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    setUploadResult(null);
    setVideoHash("");

    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("evidenceId", evidenceId);
    formData.append("video", video);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const res = await fetch("http://localhost:5001/upload", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        if (data.videoHash) {
          setVideoHash(data.videoHash);
        }
        setUploadResult({
          type: "success",
          message: "evidence uploaded",
          output: data.output,
        });
        // Clear form
        setCaseId("");
        setEvidenceId("");
        setVideo(null);
      } else {
        setUploadResult({
          type: "error",
          message: "Upload failed",
          output: data.error || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = error.message;
      
      if (error.name === "AbortError") {
        errorMessage = "Request timeout - the upload took too long";
      } else if (!navigator.onLine) {
        errorMessage = "Network is offline";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Failed to connect to backend server. Make sure http://localhost:5001 is accessible";
      }

      setUploadResult({
        type: "error",
        message: "Upload error",
        output: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-evidence-container">
      <div className="add-evidence-card">
        <h1 style={{  fontFamily: "Helvetica"}}>Add Evidence</h1>

        <div className="form-group" style={{  fontFamily: "Helvetica"}} >
          <label htmlFor="case-id">Case ID (UUID):</label>
          <input
            id="case-id"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="input-field"
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{  fontFamily: "Helvetica"}}>
          <label htmlFor="evidence-id">Evidence ID:</label>
          <input
            id="evidence-id"
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            className="input-field"
            disabled={loading}
          />
        </div>

        <div className="form-group" style={{  fontFamily: "Helvetica"}}>
          <label htmlFor="video-upload">Upload Video:</label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
            className="input-field"
            disabled={loading}
          />
          {video && <p className="file-info">{video.name}</p>}
        </div>

        <button
          onClick={uploadEvidence}
          disabled={loading || !caseId || !evidenceId || !video}
          className="btn-upload"
        >
          {loading ? "Uploading..." : "Upload Evidence"}
        </button>

        {videoHash && (
          <div className="hash-display">
            <h3>Generated Hash (SHA-256):</h3>
            <div className="hash-value">{videoHash}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(videoHash);
                alert("Hash copied to clipboard!");
              }}
              className="btn-copy"
            >
              Copy Hash
            </button>
          </div>
        )}

        {uploadResult && (
          <div className={`result-box ${uploadResult.type}`}>
            <h3>{uploadResult.message}</h3>
            <pre className="result-output">{uploadResult.output}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEvidence;
