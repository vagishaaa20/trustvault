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
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    // ✅ DECLARE res ONCE
    const res = await fetch("http://localhost:5001/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // ✅ DECLARE data ONCE
    const data = await res.json();

    // ✅ USE BACKEND MESSAGE
    if (!res.ok) {
      throw new Error(data.message || "Exists in Blockchain");
    }

    // ✅ SUCCESS
    setVideoHash(data.videoHash || "");
    setUploadResult({
      type: "success",
      message: "Evidence uploaded successfully",
      output: data.output || "",
    });

    setCaseId("");
    setEvidenceId("");
    setVideo(null);

  } catch (error) {
    console.error("Upload error:", error);

    setUploadResult({
      type: "error",
      message: "Exists in Blockchain",
      output: error.message,
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="add-evidence-container">
      <div className="add-evidence-card">
        <h1 >Add Evidence</h1>

        <div className="form-group"  >
          <label htmlFor="case-id">Case ID (UUID):</label>
          <input
            id="case-id"
            value={caseId}
            onChange={(e) => setCaseId(e.target.value)}
            className="input-field"
            disabled={loading}
          />
        </div>

        <div className="form-group" >
          <label htmlFor="evidence-id">Evidence ID:</label>
          <input
            id="evidence-id"
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            className="input-field"
            disabled={loading}
          />
        </div>

        <div className="form-group" >
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
      {/* Security Notice */}
<div className="security-notice">
  <div className="security-icon">🔒</div>
  <div className="security-text">
    <h4>Security Notice</h4>
    <p>
      All evidence records are encrypted and protected with government-grade security. Access is logged for audit purposes. Unauthorized access is prohibited by law. This system maintains complete chain of custody integrity for legal admissibility.
    </p>
  </div>
</div>

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
