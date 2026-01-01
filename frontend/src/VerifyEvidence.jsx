import { useState } from "react";
import "./VerifyEvidence.css";

const VerifyEvidence = () => {
  const [evidenceId, setEvidenceId] = useState("");
  const [video, setVideo] = useState(null);
  const [videoHash, setVideoHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const verifyEvidence = async () => {
    if (!evidenceId || !video) {
      setMessage("Please provide both Evidence ID and video file");
      return;
    }

    setLoading(true);
    setMessage("");
    setVerificationResult(null);
    setVideoHash("");

    const formData = new FormData();
    formData.append("evidenceId", evidenceId);
    formData.append("video", video);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const res = await fetch("http://localhost:5001/verify", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok && res.status !== 400) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      // Display the generated hash
      if (data.videoHash) {
        setVideoHash(data.videoHash);
      }

      // Show verification result
      if (data.tampered === false) {
        setVerificationResult({
          status: "authentic",
          message: "✅ VERIFICATION PASSED - Evidence is AUTHENTIC",
          details: data.output,
        });
      } else {
        setVerificationResult({
          status: "tampered",
          message: "❌ VERIFICATION FAILED - Evidence is TAMPERED",
          details: data.output,
        });
      }
    } catch (error) {
      console.error("Verify error:", error);
      let errorMessage = error.message;

      if (error.name === "AbortError") {
        errorMessage = "Request timeout - the verification took too long";
      } else if (!navigator.onLine) {
        errorMessage = "Network is offline";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Failed to connect to backend server. Make sure http://localhost:5001 is accessible";
      }

      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    setMessage("");
    setVideoHash("");
    setVerificationResult(null);
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1 style={{  fontFamily: "Helvetica"}}> Verify Evidence</h1>
        <p className="subtitle">uipload a video to verify its authenticity against the ID stored on thew blockchain</p>
        <p className="subtitle">Upload a video to verify its authenticity against the ID stored on the blockchain</p>

        <div className="form-group">
          <label htmlFor="evidence-id">Evidence ID:</label>
          <input
            id="evidence-id"
            type="text"
            placeholder="Enter Evidence ID"
            value={evidenceId}
            onChange={(e) => setEvidenceId(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label htmlFor="video-upload">Upload Video:</label>
          <input
            id="video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="input-field"
            disabled={loading}
          />
          {video && <p className="file-info">📁 {video.name}</p>}
        </div>

        <button
          onClick={verifyEvidence}
          disabled={loading || !evidenceId || !video}
          className="btn-verify"
        >
          {loading ? "Verifying..." : "Verify Evidence"}
        </button>

        {message && <div className="error-message">{message}</div>}

        {videoHash && (
          <div className="hash-display">
            <h3>📌 Generated Hash (SHA-256):</h3>
            <div className="hash-value">{videoHash}</div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(videoHash);
                alert("Hash copied to clipboard!");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="btn-copy"
            >
              Copy Hash
              {copied ? "Copied!" : "Copy Hash"}
            </button>
          </div>
        )}

        {verificationResult && (
          <div className={`result-box ${verificationResult.status}`}>
            <h2>{verificationResult.message}</h2>
            <div className="result-details">
              <pre>{verificationResult.details}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEvidence;
