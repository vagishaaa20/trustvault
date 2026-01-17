const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const pool = require("./db");

// Load environment variables from .env file
require("dotenv").config({ path: path.join(__dirname, ".env") });

// User Activity Logging Routes
const userActivityRoutes = require("./userActivityRoutes");

// Blockchain event logging (optional - will gracefully fail if not configured)
let blockchainRoutes = null;
try {
  blockchainRoutes = require("./blockchainRoutes");
  
  // Initialize blockchain if private key is available
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (PRIVATE_KEY && PRIVATE_KEY !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
    try {
      blockchainRoutes.initBlockchain(PRIVATE_KEY);
    } catch (initErr) {
      console.warn("⚠️  Blockchain initialization failed:", initErr.message);
    }
  } else {
    console.warn("⚠️  PRIVATE_KEY not set or is dummy value - blockchain features disabled");
  }
} catch (err) {
  console.warn("⚠️  Blockchain routes not available:", err.message);
}

const renameUploadedFile = (oldPath, caseId, evidenceId, originalName) => {
  const ext = path.extname(originalName) || ".mp4";
  const newFileName = `${caseId}_${evidenceId}${ext}`;
  const newPath = path.join("uploads", newFileName);

  fs.renameSync(oldPath, newPath);
  return newPath;
};

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const upload = multer({ dest: "uploads/" });


/* ---------- GENERATE VIDEO HASH ---------- */
const generateVideoHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (chunk) => {
      hash.update(chunk);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};

/* ---------- UPLOAD EVIDENCE ---------- */
app.post("/upload", upload.single("video"), async (req, res) => {
  const { caseId, evidenceId } = req.body;
  
  console.log("Upload request received:", { caseId, evidenceId, file: req.file?.originalname });
  
  if (!req.file) {
    return res.status(400).json({ error: "No video file provided", success: false });
  }

  if (!caseId || !evidenceId) {
    return res.status(400).json({ error: "Missing caseId or evidenceId", success: false });
  }

  const videoPath = renameUploadedFile(
  req.file.path,
  caseId,
  evidenceId,
  req.file.originalname
);

  try {
    // Generate hash for the uploaded video
    const videoHash = await generateVideoHash(videoPath);
    console.log("Video hash generated:", videoHash);

    // Try to save to database (optional, don't fail if it doesn't work)
    try {
      const connection = await pool.getConnection();
      await connection.query(
        `INSERT INTO evidence_metadata 
         (case_id, evidence_id, file_path, file_hash)
         VALUES (?, ?, ?, ?)`,
        [caseId, evidenceId, videoPath, videoHash]
      );
      connection.release();
      console.log("Saved to database successfully");
    } catch (dbErr) {
      console.error("Database save failed (continuing anyway):", dbErr.message);
    }

    const pythonExe = "/Users/shanawaz/Desktop/GDG FInal/trustvault/venv/bin/python3";
    const scriptPath = path.join(__dirname, "..", "insert.py");
    const quoted = (s) => `"${s.replace(/"/g, '\\"')}"`;
    const cmd = `${quoted(pythonExe)} ${quoted(scriptPath)} ${quoted(caseId)} ${quoted(evidenceId)} ${quoted(videoPath)}`;

    console.log("Executing upload command:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
  const output = `${stdout}\n${stderr}`;

  console.log("Python stdout:", stdout);
  console.log("Python stderr:", stderr);
  console.log("Python error:", error);

  // ✅ BLOCKCHAIN DUPLICATE (from insert.py)
  if (output.includes("BLOCKCHAIN_DUPLICATE")) {
    return res.status(409).json({
      success: false,
      message: "Evidence already exists in blockchain",
    });
  }

  // ❌ Real blockchain / python failure
  if (error) {
    console.error("Blockchain error:", output);
    return res.status(500).json({
      success: false,
      message: "Blockchain transaction failed: " + (stderr || error.message),
      details: output,
    });
  }

  // ✅ SUCCESS
  res.json({
    success: true,
    output: stdout,
    videoHash,
    message: "Evidence uploaded successfully",
  });
});

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message, success: false });
  }
});

/* ---------- VERIFY EVIDENCE ---------- */
app.post("/verify", upload.single("video"), async (req, res) => {
  const { evidenceId } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: "No video file provided", tampered: null });
  }

  if (!evidenceId) {
    return res.status(400).json({ error: "Missing evidenceId", tampered: null });
  }

  const videoPath = req.file.path;

  try {
    // Generate hash for the uploaded video
    const videoHash = await generateVideoHash(videoPath);

    const pythonExe = "/Users/shanawaz/Desktop/GDG FInal/trustvault/venv/bin/python3";
    const scriptPath = path.join(__dirname, "..", "verifyBlock.py");
    const quoted = (s) => `"${s.replace(/"/g, '\\"')}"`;
    const cmd = `${quoted(pythonExe)} ${quoted(scriptPath)} ${quoted(evidenceId)} ${quoted(videoPath)}`;

    console.log("Executing verify command:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      // Exit code 0 = authentic, 1 = tampered/not found, other = error
      const exitCode = error ? error.code : 0;
      const tampered = exitCode !== 0;
      
      console.log("Verify exit code:", exitCode);
      console.log("Output:", stdout);
      if (stderr) console.error("Stderr:", stderr);
      
      res.json({ tampered, output: stdout || stderr, videoHash });
    });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ error: error.message, tampered: null });
  }
});

/* ---------- QUERY ALL EVIDENCE ---------- */
app.get("/evidence", (req, res) => {
  const pythonExe = "/Users/shanawaz/Desktop/GDG FInal/trustvault/venv/bin/python3";
  const scriptPath = path.join(__dirname, "..", "queryEvidence.py");
  const quoted = (s) => `"${s.replace(/"/g, '\\"')}"`;
  const cmd = `${quoted(pythonExe)} ${quoted(scriptPath)}`;

  console.log("Executing query command:", cmd);

  exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error && error.code !== 0) {
      console.error("Query error:", stderr || error.message);
      return res.status(400).json({ success: false, records: [], error: stderr || error.message });
    }

    try {
      // Extract JSON from stdout
      const lines = stdout.split("\n");
      const jsonStart = lines.findIndex(line => line.trim().startsWith("["));
      
      if (jsonStart !== -1) {
        const jsonStr = lines.slice(jsonStart).join("\n");
        const records = JSON.parse(jsonStr);
        res.json({ success: true, records });
      } else {
        res.json({ success: false, records: [] });
      }
    } catch (parseError) {
      res.json({ success: false, records: [], error: parseError.message });
    }
  });
});

/* ---------- HEALTH CHECK ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

//show video in view records
app.get("/records", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "SELECT case_id, evidence_id, file_path FROM evidence_metadata ORDER BY created_at DESC"
    );
    connection.release();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

/* ========== BLOCKCHAIN EVENT LOGGING ROUTES ========== */
if (blockchainRoutes) {
  // Authentication & verification
  app.post("/api/auth/verify", 
    blockchainRoutes.verifyGoogleToken, 
    blockchainRoutes.verifyTokenRoute
  );

  // Event logging endpoints
  app.post("/api/blockchain/log-upload", 
    blockchainRoutes.verifyGoogleToken, 
    blockchainRoutes.logUploadRoute
  );

  app.post("/api/blockchain/log-view", 
    blockchainRoutes.verifyGoogleToken, 
    blockchainRoutes.logViewRoute
  );

  app.post("/api/blockchain/log-transfer", 
    blockchainRoutes.verifyGoogleToken, 
    blockchainRoutes.logTransferRoute
  );

  app.post("/api/blockchain/log-export", 
    blockchainRoutes.verifyGoogleToken, 
    blockchainRoutes.logExportRoute
  );

  // Event history endpoints
  app.get("/api/blockchain/user-events", 
    blockchainRoutes.verifyGoogleToken, 
    blockchainRoutes.getUserEventsRoute
  );

  app.get("/api/blockchain/evidence-events/:evidenceId", 
    blockchainRoutes.getEvidenceEventsRoute
  );

  console.log("✅ Blockchain event logging routes initialized");
} else {
  // Provide a fallback endpoint that explains blockchain is not configured
  app.get("/api/blockchain/*", (req, res) => {
    res.status(503).json({ 
      error: "Blockchain event logging not configured",
      message: "Please set up blockchainRoutes.js or configure blockchain connection"
    });
  });
}

/* ========== USER ACTIVITY LOGGING ROUTES ========== */
try {
  app.use(userActivityRoutes);
  console.log("✅ User activity logging routes initialized");
} catch (err) {
  console.warn("⚠️  User activity routes failed:", err.message);
}

/* ========== AUTHENTICATION ROUTES ========== */
// Simple login endpoint - stores email and creates user session
app.post("/auth/login", express.json(), (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Email is required" 
      });
    }

    // For demo purposes, accept any email/password combination
    // In production, verify against database
    
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
      success: true,
      message: "Login successful",
      token: token,
      email: email,
      role: role || "user"
    });
    
    console.log(`✅ User logged in: ${email} (${role || "user"})`);
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Login failed: " + error.message 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Backend is running" 
  });
});

const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(" Backend running on http://0.0.0.0:5001");
  console.log(` Access locally: http://localhost:${PORT}`);
  console.log(` Access from network: http://192.168.1.24:${PORT}`);
  console.log("");
  console.log("📝 User Activity Logging Endpoints:");
  console.log("   POST /api/user/log-activity - Log any activity");
  console.log("   GET  /api/user/activity-history - Get user's history");
  console.log("   GET  /api/user/activity-stats - Get activity statistics");
  console.log("   GET  /api/user/activity-export - Export as CSV");
});

