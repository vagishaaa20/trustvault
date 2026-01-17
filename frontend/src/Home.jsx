import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  ShieldCheck,
  ScanFace,
  Lock,
  Activity
} from "lucide-react";

/* Cards data */
const cards = [
  {
    title: "Dashboard",
    desc: "Overview & analytics",
    icon: LayoutDashboard,
    path: "/dashboard",
    accent: "blue"
  },
  {
    title: "View Records",
    desc: "Evidence details",
    icon: FileText,
    path: "/approach",
    accent: "green"
  },
  {
    title: "Add Evidence",
    desc: "Upload new evidence",
    icon: UploadCloud,
    path: "/add-evidence",
    accent: "purple"
  },
  {
    title: "Verify Evidence",
    desc: "Check authenticity",
    icon: ShieldCheck,
    path: "/verify-evidence",
    accent: "orange"
  },
  {
    title: "Deepfake Detection",
    desc: "Analyze video authenticity",
    icon: ScanFace,
    path: "/deepfake-detection",
    accent: "red"
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-root">
      <div className="ambient ambient-blue" />
      <div className="ambient ambient-purple" />

      <motion.div
        className="home-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <motion.div
          className="home-header"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="status-pill">System Operational</span>
          <h1 className="hero-title">
           Chain of Custody System
          </h1>
          <p className="hero-subtitle">
          Secure evidence management powered by blockchain integrity and AI forensics.
         </p>
        </motion.div>

        {/* Layout */}
        <div className="card-layout">

          {/* Dashboard (primary) */}
          <motion.button
            className="feature-card dashboard-card accent-blue"
            onClick={() => navigate("/dashboard")}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="dashboard-content">
              <div className="icon-box large">
                <LayoutDashboard size={32} />
              </div>
              <div>
                <h3>Dashboard</h3>
                <p>Overview, analytics & system health</p>
              </div>
            </div>
          </motion.button>

          {/* Other cards */}
          <div className="secondary-grid">
            {cards
              .filter(card => card.title !== "Dashboard")
              .map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.title}
                    className={`feature-card accent-${item.accent}`}
                    onClick={() => navigate(item.path)}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.08 }}
                    whileHover={{ y: -6 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div className="icon-box">
                      <Icon size={26} />
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </motion.button>
                );
              })}
          </div>

        </div>
      {/* Security Notice */}
<div className="security-notice">
  <div className="security-icon">🔒</div>
  <div className="security-text">
    <h4>Security Notice</h4>
    <p>
      All evidence records are encrypted and protected with government-grade
      security. Access is logged for audit purposes. Unauthorized access is
      prohibited by law. This system maintains complete chain of custody
      integrity for legal admissibility.
    </p>
  </div>
</div>

        {/* Footer */}
        <motion.div
          className="home-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>
            <Lock size={14} /> Secure storage
          </span>
          <span>
            <Activity size={14} /> Real-time logging
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
