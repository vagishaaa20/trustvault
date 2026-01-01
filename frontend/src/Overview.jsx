import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Overview.css";

const Overview = () => {
  const navigate = useNavigate();
  const [systemStatus, setSystemStatus] = useState({
    backend: "checking",
    ganache: "checking",
    contract: "checking",
  });

  // Check system status on mount
  React.useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check backend
      const backendRes = await fetch("http://localhost:5001/health", {
        timeout: 5000,
      });
      setSystemStatus((prev) => ({
        ...prev,
        backend: backendRes.ok ? "online" : "offline",
      }));

      // Check Ganache
      const ganacheRes = await fetch("http://localhost:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      });
      setSystemStatus((prev) => ({
        ...prev,
        ganache: ganacheRes.ok ? "online" : "offline",
      }));

      // Check contract deployment
      const contractRes = await fetch("http://localhost:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getCode",
          params: ["0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA", "latest"],
          id: 1,
        }),
      });
      const contractData = await contractRes.json();
      setSystemStatus((prev) => ({
        ...prev,
        contract: contractData.result !== "0x" ? "deployed" : "not_deployed",
      }));
    } catch (error) {
      console.error("Status check error:", error);
      setSystemStatus({
        backend: "offline",
        ganache: "offline",
        contract: "not_deployed",
      });
    }
  };

  const getStatusColor = (status) => {
    if (status === "online" || status === "deployed") return "#4CAF50";
    if (status === "checking") return "#FF9800";
    return "#F44336";
  };

  const getStatusText = (status) => {
    if (status === "online" || status === "deployed") return "✅ Online";
    if (status === "checking") return "🔄 Checking...";
    return "❌ Offline";
  };

  return (
    <div className="overview-container">
      {/* Header */}
      <header className="overview-header">
        <div className="header-content">
          <h1>🔗 Blockchain Chain of Custody System</h1>
          <p className="subtitle">
            Secure evidence management with SHA-256 hashing and Ethereum blockchain verification
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="overview-content">
        {/* System Status */}
        <section className="status-section">
          <h2>📊 System Status</h2>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-indicator" style={{ backgroundColor: getStatusColor(systemStatus.backend) }}></div>
              <h3>Backend Server</h3>
              <p className="status-text">{getStatusText(systemStatus.backend)}</p>
              <p className="status-detail">Port: 5001</p>
              <p className="status-detail">Express.js + Node.js</p>
            </div>

            <div className="status-card">
              <div className="status-indicator" style={{ backgroundColor: getStatusColor(systemStatus.ganache) }}></div>
              <h3>Ganache Blockchain</h3>
              <p className="status-text">{getStatusText(systemStatus.ganache)}</p>
              <p className="status-detail">Port: 8545</p>
              <p className="status-detail">Local Ethereum Network</p>
            </div>

            <div className="status-card">
              <div className="status-indicator" style={{ backgroundColor: getStatusColor(systemStatus.contract) }}></div>
              <h3>Smart Contract</h3>
              <p className="status-text">{getStatusText(systemStatus.contract)}</p>
              <p className="status-detail">EvidenceChain.sol</p>
              <p className="status-detail">0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA</p>
            </div>
          </div>
        </section>

        {/* Functionality Overview */}
        <section className="functionality-section">
          <h2>🎯 Core Functionality</h2>

          <div className="features-grid">
            {/* Feature 1: Add Evidence */}
            <div className="feature-card">
              <div className="feature-icon">📹</div>
              <h3>Add Evidence</h3>
              <ul className="feature-list">
                <li>✅ Upload video files as evidence</li>
                <li>✅ Generate SHA-256 cryptographic hash</li>
                <li>✅ Store hash on Ethereum blockchain</li>
                <li>✅ Immutable chain of custody record</li>
                <li>✅ Real-time blockchain confirmation</li>
              </ul>
              <button
                className="feature-button"
                onClick={() => navigate("/add-evidence")}
              >
                Upload Evidence →
              </button>
            </div>

            {/* Feature 2: Verify Evidence */}
            <div className="feature-card">
              <div className="feature-icon">✅</div>
              <h3>Verify Evidence</h3>
              <ul className="feature-list">
                <li>✅ Verify integrity of evidence files</li>
                <li>✅ Recalculate SHA-256 hash</li>
                <li>✅ Compare with blockchain record</li>
                <li>✅ Detect tampering instantly</li>
                <li>✅ Proof of authenticity</li>
              </ul>
              <button
                className="feature-button"
                onClick={() => navigate("/verify-evidence")}
              >
                Verify Evidence →
              </button>
            </div>

            {/* Feature 3: View Records */}
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>View Records</h3>
              <ul className="feature-list">
                <li>✅ Access stored evidence records</li>
                <li>✅ View blockchain transactions</li>
                <li>✅ Track chain of custody</li>
                <li>✅ Audit trail visibility</li>
                <li>✅ Historical evidence data</li>
              </ul>
              <button
                className="feature-button"
                onClick={() => navigate("/view-evidence")}
              >
                View Records →
              </button>
            </div>
          </div>
        </section>

        {/* Technical Architecture */}
        <section className="architecture-section">
          <h2>🏗️ Technical Architecture</h2>

          <div className="architecture-grid">
            <div className="arch-card">
              <h4>Frontend Stack</h4>
              <ul>
                <li>React 18.2</li>
                <li>React Router (Navigation)</li>
                <li>Bootstrap 5 (Styling)</li>
                <li>Fetch API (HTTP Client)</li>
              </ul>
            </div>

            <div className="arch-card">
              <h4>Backend Stack</h4>
              <ul>
                <li>Express.js 5.2</li>
                <li>Multer (File Upload)</li>
                <li>Node.js crypto (SHA-256)</li>
                <li>Child Process (Python execution)</li>
              </ul>
            </div>

            <div className="arch-card">
              <h4>Blockchain Stack</h4>
              <ul>
                <li>Ganache CLI (Local Ethereum)</li>
                <li>Solidity 0.8.0 (Smart Contracts)</li>
                <li>web3.py (Blockchain Interaction)</li>
                <li>Truffle (Contract Deployment)</li>
              </ul>
            </div>

            <div className="arch-card">
              <h4>Data Flow</h4>
              <ul>
                <li>Video Upload → Node.js Server</li>
                <li>SHA-256 Hash Generation</li>
                <li>Python Script Execution</li>
                <li>Smart Contract Write → Blockchain</li>
              </ul>
            </div>
          </div>

          <div className="flow-diagram">
            <h3>Evidence Upload & Verification Flow <img src="./" alt="" /> </h3>

            <div className="flow">
              <div className="flow-step">
                <div className="flow-circle">1</div>
                <p>User uploads video</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-step">
                <div className="flow-circle">2</div>
                <p>Backend generates hash</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-step">
                <div className="flow-circle">3</div>
                <p>Python calls contract</p>
              </div>
              <span className="flow-arrow">→</span>
              <div className="flow-step">
                <div className="flow-circle">4</div>
                <p>Hash stored on chain</p>
              </div>
            </div>
          </div>
        </section>

        {/* Smart Contract Features */}
        <section className="contract-section">
          <h2>⛓️ Smart Contract (EvidenceChain.sol)</h2>
          <div className="contract-info">
            <div className="contract-detail">
              <h4>📋 Key Functions</h4>
              <ul>
                <li>
                  <strong>addEvidence(caseId, evidenceId, hash)</strong> - Store evidence on blockchain
                </li>
                <li>
                  <strong>getEvidenceHash(evidenceId)</strong> - Retrieve stored hash for verification
                </li>
                <li>
                  <strong>getEvidence(evidenceId)</strong> - Get complete evidence details with timestamp
                </li>
              </ul>
            </div>
            <div className="contract-detail">
              <h4>🔐 Security Features</h4>
              <ul>
                <li>Immutable blockchain records</li>
                <li>Duplicate prevention</li>
                <li>Event logging (EvidenceAdded)</li>
                <li>Timestamp verification</li>
                <li>Gas-optimized operations</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="usecases-section">
          <h2>💼 Use Cases</h2>
          <div className="usecases-grid">
            <div className="usecase">
              <h4>🚨 Law Enforcement</h4>
              <p>Maintain chain of custody for criminal evidence with blockchain verification</p>
            </div>
            <div className="usecase">
              <h4>⚖️ Legal Cases</h4>
              <p>Ensure evidence integrity and admissibility in court proceedings</p>
            </div>
            <div className="usecase">
              <h4>🏥 Medical Records</h4>
              <p>Secure and verify medical evidence and documentation</p>
            </div>
            <div className="usecase">
              <h4>🏢 Corporate Compliance</h4>
              <p>Audit trail for sensitive corporate documents and investigations</p>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="benefits-section">
          <h2>⭐ Key Benefits</h2>
          <div className="benefits-list">
            <div className="benefit">
              <span className="benefit-icon">🔐</span>
              <h4>Tamper-Proof</h4>
              <p>Blockchain ensures evidence cannot be altered without detection</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">✔️</span>
              <h4>Verifiable</h4>
              <p>Cryptographic hashes provide mathematical proof of authenticity</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">📜</span>
              <h4>Auditable</h4>
              <p>Complete transparent audit trail of all evidence handling</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">⏱️</span>
              <h4>Timestamped</h4>
              <p>Blockchain timestamp proves when evidence was recorded</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">🌐</span>
              <h4>Distributed</h4>
              <p>Decentralized record ensures no single point of failure</p>
            </div>
            <div className="benefit">
              <span className="benefit-icon">💡</span>
              <h4>Transparent</h4>
              <p>All transactions publicly verifiable on blockchain</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="cta-section">
          <h2>🚀 Get Started</h2>
          <p>Begin managing your evidence securely with blockchain verification</p>
          <div className="cta-buttons">
            <button
              className="cta-primary"
              onClick={() => navigate("/add-evidence")}
            >
              + Add Evidence
            </button>
            <button
              className="cta-secondary"
              onClick={() => navigate("/verify-evidence")}
            >
              ✓ Verify Evidence
            </button>
            <button
              className="cta-secondary"
              onClick={() => navigate("/view-evidence")}
            >
              📋 View Records
            </button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="overview-footer">
        <p>🔗 Blockchain Chain of Custody System v1.0</p>
        <p className="footer-info">
          Smart Contract: 0xE9d819305b0c24175d1724Bd12E3BC1BCe8983dA | Ganache
          Network | SHA-256 Hashing
        </p>
        <button
          className="refresh-btn"
          onClick={checkSystemStatus}
          title="Refresh system status"
        >
          🔄 Refresh Status
        </button>
      </footer>
    </div>
  );
};

export default Overview;
