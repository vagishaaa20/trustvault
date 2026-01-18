CREATE TABLE evidence_metadata (
    id SERIAL PRIMARY KEY,
    case_id VARCHAR(100) NOT NULL,
    evidence_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    avg_probability FLOAT,
    prediction VARCHAR(50),
    deepfake_analyzed_at TIMESTAMP,
    total_frames INTEGER,
    fps FLOAT,
    video_width INTEGER,
    video_height INTEGER,
    duration_seconds FLOAT,
    latitude FLOAT,
    longitude FLOAT,
    location_name VARCHAR(255)
);
