CREATE TABLE evidence_metadata (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(100) NOT NULL,
    evidence_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
