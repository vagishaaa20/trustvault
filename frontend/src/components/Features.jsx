const Features = () => {
  return (
    <section className="features" id="features">
      <div className="section-header">
        <h2 className="section-title">Core Capabilities</h2>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon">⛓️</span>
          <h3 className="feature-title">Blockchain Storage</h3>
          <p className="feature-desc">
            Immutable evidence storage on distributed ledger technology. Every
            piece of evidence is cryptographically signed and timestamped,
            creating an unbreakable chain of custody that stands up in court.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🔍</span>
          <h3 className="feature-title">Evidence Verification</h3>
          <p className="feature-desc">
            Multi-layer verification system validates evidence authenticity
            through cryptographic hashing, digital signatures, and blockchain
            consensus. Instant verification of any evidence integrity with
            complete audit trails.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🤖</span>
          <h3 className="feature-title">AI Deepfake Detection</h3>
          <p className="feature-desc">
            Advanced machine learning algorithms analyze media for manipulation,
            deepfakes, and synthetic content. Real-time detection with detailed
            forensic reports and confidence scoring for every file.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">📊</span>
          <h3 className="feature-title">Chain of Custody</h3>
          <p className="feature-desc">
            Automated tracking of every interaction with evidence. Complete
            timeline with timestamps, user actions, and modifications.
            Court-admissible documentation generated automatically.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
