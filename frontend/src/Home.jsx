import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <h1 style={{fontFamily:"helvetica"}}>Chain of Custody System</h1>

        <div className="nav-grid">
          <button
            onClick={() => navigate("/dashboard")}
            className="nav-btn primary"
          >
            <span className="label">Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/approach")}
            className="nav-btn"
          >
            <span className="label">Approach</span>
            <span className="desc">our methodology </span>
          </button>

          <button
            onClick={() => navigate("/add-evidence")}
            className="nav-btn"
          >
            <span className="label">Add Evidence</span>
            <span className="desc">upload new evidence</span>
          </button>

          <button
            onClick={() => navigate("/verify-evidence")}
            className="nav-btn"
          >
            <span className="label">Verify Evidence</span>
            <span className="desc">check authenticity</span>
          </button>

          <button
            onClick={() => navigate("/deepfake-detection")}
            className="nav-btn"
          >
            <span className="label">Deepfake Detection</span>
            <span className="desc">analyze video authenticity</span>
          </button>

          <button
            onClick={() => navigate("/activity-log")}
            className="nav-btn"
          >
            <span className="label">Activity Logs</span>
            <span className="desc">view user activity history</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
