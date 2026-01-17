const TechStack = () => {
  return (
    <section className="tech-stack" id="technology">
      <div className="section-header">
        <h2 className="section-title">Technology Stack</h2>
      </div>

      <div className="tech-grid">
        <div className="tech-item">
          <div className="tech-icon">⛓️</div>
          <div className="tech-name">Ethereum Blockchain</div>
          <div className="tech-desc">Distributed ledger</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🔐</div>
          <div className="tech-name">IPFS Storage</div>
          <div className="tech-desc">Decentralized file system</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🧠</div>
          <div className="tech-name">TensorFlow AI</div>
          <div className="tech-desc">Deepfake detection</div>
        </div>

        <div className="tech-item">
          <div className="tech-icon">🛡️</div>
          <div className="tech-name">Zero-Knowledge Proofs</div>
          <div className="tech-desc">Privacy verification</div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
