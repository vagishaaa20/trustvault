-- Create database
CREATE DATABASE IF NOT EXISTS trustvault;
USE trustvault;

-- Create evidence_metadata table
CREATE TABLE IF NOT EXISTS evidence_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id VARCHAR(255) NOT NULL,
  evidence_id VARCHAR(255) NOT NULL UNIQUE,
  file_path VARCHAR(500),
  file_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_evidence (case_id, evidence_id)
);

CREATE INDEX idx_case_id ON evidence_metadata(case_id);
CREATE INDEX idx_evidence_id ON evidence_metadata(evidence_id);
