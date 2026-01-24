require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const pool = require("./db");


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

  try {
  await pool.query(
    `INSERT INTO evidence_metadata 
     (case_id, evidence_id, file_path, file_hash)
     VALUES ($1, $2, $3, $4)`,
    [caseId, evidenceId, videoPath, videoHash]
  );
} catch (err) {
  // 23505 = unique constraint violation
  if (err.code === "23505") {
    return res.status(400).json({
      success: false,
      message: "This evidence has already been uploaded"
    });
  }
  throw err;
}

    const pythonExe = process.env.PYTHON_PATH || "python";

    const scriptPath = path.join(__dirname, "..", "insert.py");
    const quoted = (s) => `"${s.replace(/"/g, '\\"')}"`;
    const cmd = `${quoted(pythonExe)} ${quoted(scriptPath)} ${quoted(caseId)} ${quoted(evidenceId)} ${quoted(videoPath)}`;

    console.log("Executing upload command:", cmd);

    exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
  const output = `${stdout}\n${stderr}`;

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
    });
  }

  // ✅ SUCCESS
  res.json({
    success: true,
    output: stdout,
    videoHash,
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

    const pythonExe = "python";
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
  const pythonExe = "python";
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
    const result = await pool.query(`
      SELECT
        case_id,
        evidence_id,
        file_path,
        avg_probability,
        prediction,
        deepfake_analyzed_at
      FROM evidence_metadata
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});




const PORT = 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(" Backend running on http://0.0.0.0:5001");
  console.log(` Access locally: http://localhost:${PORT}`);
  console.log(` Access from network: http://192.168.1.24:${PORT}`);
});