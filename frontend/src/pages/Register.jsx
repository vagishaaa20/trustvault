import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">REGISTER</h2>
        <p className="auth-subtitle">
          Secure Registration for TrustVault
        </p>

        <form>
          <label>Full Name</label>
          <input type="text" placeholder="Enter your full name" required />

          <label>Email Address</label>
          <input type="email" placeholder="Enter your email" required />

          <label>Password</label>
          <input type="password" placeholder="Create a password" required />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm password" required />

          <button className="btn-primary" type="submit">
            REGISTER
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
