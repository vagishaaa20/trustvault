const Features = () => {
  return (
    <section className="features" id="features">
      <div className="section-header">
        <h2 className="section-title">How TrustVault Works</h2>
        <p className="section-subtitle">
          A complete digital evidence platform that protects authenticity,
          preserves integrity, and maintains trust from submission to verification.
        </p>
      </div>

      <div className="features-grid">
        {/* 1 */}
        <div className="feature-card">
          <span className="feature-icon">📁</span>
          <h3 className="feature-title">Evidence Submission</h3>
          <p className="feature-desc">
            Digital evidence is securely uploaded through a controlled workflow
            that captures timestamps, file details, and contextual metadata at
            the moment of submission.
          </p>
        </div>

        {/* 2 */}
        <div className="feature-card">
          <span className="feature-icon">🔐</span>
          <h3 className="feature-title">Integrity Protection</h3>
          <p className="feature-desc">
            Once submitted, evidence is permanently protected against tampering.
            Any modification attempt is detected and recorded, preserving the
            original state of the file.
          </p>
        </div>

        {/* 3 */}
        <div className="feature-card">
          <span className="feature-icon">🧠</span>
          <h3 className="feature-title">Authenticity Analysis</h3>
          <p className="feature-desc">
            Automated analysis continuously checks evidence for manipulation,
            inconsistencies, and synthetic alterations, helping establish
            confidence in authenticity.
          </p>
        </div>

        {/* 4 */}
        <div className="feature-card">
          <span className="feature-icon">🕒</span>
          <h3 className="feature-title">Chain of Custody</h3>
          <p className="feature-desc">
            Every interaction with evidence is logged in a chronological trail,
            creating a transparent history that can be reviewed, audited, and
            presented when required.
          </p>
        </div>

        {/* 5 */}
        <div className="feature-card feature-card-center">
          <span className="feature-icon">🛂</span>
          <h3 className="feature-title">Role-Based Access</h3>
          <p className="feature-desc">
            Access to evidence is governed by defined roles and permissions,
            ensuring only authorized users can view, verify, or manage sensitive
            information.
          </p>
        </div>

        {/* 6 */}
        <div className="feature-card feature-card-center">
          <span className="feature-icon">📊</span>
          <h3 className="feature-title">Audit & Verification</h3>
          <p className="feature-desc">
            Evidence status, verification results, and activity logs are clearly
            presented, enabling quick reviews and confident decision-making
            without manual inspection.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Features;
