import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deviceId = navigator.userAgent; 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          deviceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Authentication failed");
        setLoading(false);
        return;
      }

      // OTP required (secure flow)
      if (data.otpRequired) {
        localStorage.setItem("tempToken", data.tempToken);
        //navigate("/verify-otp");
      }
    } catch (err) {
      setError("Server unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">LOGIN</h2>
        <p className="auth-subtitle">
          Tamper-Proof Digital Evidence Access
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <div className="input-group">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-links">
            <span
              className="forgot-link"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "LOGIN"}
          </button>
        </form>

        <div className="auth-divider">OR</div>

        <button className="google-btn" disabled>
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
          />
        </button>

        <p className="auth-footer">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>

        <p className="legal-note">
          🔐 All access attempts are logged and legally auditable
        </p>
      </div>
    </div>
  );
};

export default Login;
