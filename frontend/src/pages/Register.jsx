import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Registration failed");
        return;
      }

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("username", data.user.username);

      navigate("/home");


    } catch (err) {
      console.error("Register error:", err);
      setError(err.message || "Server unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">USER REGISTER</h2>
        <p className="auth-subtitle">
          Secure Registration for TrustVault Users
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister}>
          <label>Username</label>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <label>Role</label>
          <div className="input-group">
            <span className="input-icon">🔐</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem"
              }}
            >
              <option value="USER">User (Regular)</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <label>Password</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label>Confirm Password</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "REGISTER"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>

        <p className="legal-note">
          Registration data is encrypted and legally auditable
        </p>
      </div>
    </div>
  );
};

export default Register;
