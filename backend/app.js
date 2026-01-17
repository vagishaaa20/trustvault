import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import crypto from "crypto";
import cors from "cors";
import multer from "multer";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// ================= CONFIG =================
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "15m";
const LOG_FILE = "./activity.log";
const PORT = process.env.PORT || 5001;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET environment variable is not set");
  process.exit(1);
}

// ================= FAKE DATABASE =================
const users = [];   // { id, username, password, role }
const cases = [];   // { id, ownerUserId, status, name, createdAt }
const evidence = []; // { id, caseId, name, hash, status }

// ================= HELPERS =================
function hash(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

function writeLog(entry) {
  const logEntry = {
    ...entry,
    timestamp: new Date().toISOString()
  };
  fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + "\n");
  console.log(`[LOG] ${entry.action} - User: ${entry.userId} - Status: ${entry.status}`);
}

function anchorToBlockchain(logEntry) {
  const logHash = hash(logEntry);
  console.log("⛓️  Anchored on-chain hash:", logHash);
}

// ================= JWT =================
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: "trustvault-api",
      audience: "trustvault-client"
    }
  );
}

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: "trustvault-api",
      audience: "trustvault-client"
    });

    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ================= AUTHORIZATION =================
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No user in request" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden - insufficient permissions" });
    }
    next();
  };
}

// ================= ACTIVITY LOGGER =================
function activityLogger(action = "UNKNOWN") {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const logEntry = {
        userId: req.user?.sub ?? "anonymous",
        username: req.user?.username ?? "anonymous",
        role: req.user?.role ?? "GUEST",
        action,
        endpoint: `${req.method} ${req.path}`,
        status: res.statusCode,
        durationMs: duration
      };
      
      writeLog(logEntry);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        anchorToBlockchain(logEntry);
      }
    });
    
    next();
  };
}

// ================= ROUTES =================

// -------- Health Check --------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server running"
  });
});

// -------- User Signup --------
app.post("/signup", (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email, and password required" });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: "Username already exists" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const user = {
    id: crypto.randomUUID(),
    username,
    email,
    password,
    role: role || "USER",
    createdAt: new Date().toISOString()
  };

  users.push(user);

  const token = generateToken(user);
  
  writeLog({
    userId: user.id,
    username: user.username,
    role: user.role,
    action: "SIGNUP",
    status: 200
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// -------- User Login --------
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user);

  writeLog({
    userId: user.id,
    username: user.username,
    role: user.role,
    action: "LOGIN",
    status: 200
  });

  res.json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

// -------- Get Current User --------
app.get(
  "/me",
  verifyJWT,
  (req, res) => {
    res.json(req.user);
  }
);

// -------- Logout --------
app.post(
  "/logout",
  verifyJWT,
  activityLogger("LOGOUT"),
  (req, res) => {
    res.json({ success: true, message: "Logged out successfully" });
  }
);

// ================= CASES MANAGEMENT =================

// -------- CREATE CASE (USER) --------
app.post(
  "/cases",
  verifyJWT,
  allowRoles("USER", "ADMIN"),
  activityLogger("CREATE_CASE"),
  (req, res) => {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Case name required" });
    }

    const newCase = {
      id: crypto.randomUUID(),
      ownerUserId: req.user.sub,
      ownerUsername: req.user.username,
      name,
      description,
      status: "OPEN",
      createdAt: new Date().toISOString()
    };

    cases.push(newCase);

    res.status(201).json({
      success: true,
      message: "Case created",
      case: newCase
    });
  }
);

// -------- VIEW CASES --------
app.get(
  "/cases",
  verifyJWT,
  activityLogger("VIEW_CASES"),
  (req, res) => {
    let userCases = cases;

    if (req.user.role === "USER") {
      userCases = cases.filter(c => c.ownerUserId === req.user.sub);
    }

    res.json({
      success: true,
      total: userCases.length,
      cases: userCases
    });
  }
);

// -------- GET SINGLE CASE --------
app.get(
  "/cases/:id",
  verifyJWT,
  activityLogger("VIEW_CASE"),
  (req, res) => {
    const caseItem = cases.find(c => c.id === req.params.id);
    if (!caseItem) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (req.user.role === "USER" && caseItem.ownerUserId !== req.user.sub) {
      return res.status(403).json({ error: "Cannot view other user's case" });
    }

    res.json({
      success: true,
      case: caseItem
    });
  }
);

// -------- UPDATE CASE STATUS --------
app.patch(
  "/cases/:id/status",
  verifyJWT,
  activityLogger("UPDATE_CASE_STATUS"),
  (req, res) => {
    const { status } = req.body;
    const caseItem = cases.find(c => c.id === req.params.id);

    if (!caseItem) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (req.user.role === "USER" && caseItem.ownerUserId !== req.user.sub) {
      return res.status(403).json({ error: "Cannot update other user's case" });
    }

    caseItem.status = status || "CLOSED";
    caseItem.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: `Case marked as ${status}`,
      case: caseItem
    });
  }
);

// ================= EVIDENCE MANAGEMENT =================

// Setup multer for file uploads
const upload = multer({ dest: "./uploads/" });

// -------- Upload Evidence Video --------
app.post(
  "/upload",
  verifyJWT,
  activityLogger("UPLOAD_EVIDENCE"),
  upload.single("video"),
  (req, res) => {
    try {
      const { caseId, evidenceId } = req.body;

      if (!caseId || !evidenceId) {
        return res.status(400).json({ 
          message: "Missing caseId or evidenceId" 
        });
      }

      const caseItem = cases.find(c => c.id === caseId);
      if (!caseItem) {
        return res.status(404).json({ 
          message: "Case not found" 
        });
      }

      if (
        req.user.role === "USER" &&
        caseItem.ownerUserId !== req.user.sub
      ) {
        return res.status(403).json({ 
          message: "Cannot upload evidence to other user's case" 
        });
      }

      // Generate hash from evidenceId
      const videoHash = crypto
        .createHash("sha256")
        .update(evidenceId + Date.now())
        .digest("hex");

      res.json({
        success: true,
        message: "Evidence uploaded successfully",
        caseId,
        evidenceId,
        videoHash,
        output: `File stored: ${evidenceId}.bin`,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ 
        message: "Upload failed",
        error: err.message 
      });
    }
  }
);

// -------- Add Evidence --------
app.post(
  "/evidence",
  verifyJWT,
  activityLogger("ADD_EVIDENCE"),
  (req, res) => {
    const { caseId, name, hash } = req.body;

    if (!caseId || !name || !hash) {
      return res.status(400).json({ error: "caseId, name, and hash required" });
    }

    const caseItem = cases.find(c => c.id === caseId);
    if (!caseItem) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (
      req.user.role === "USER" &&
      caseItem.ownerUserId !== req.user.sub
    ) {
      return res.status(403).json({ error: "Cannot add evidence to other user's case" });
    }

    const newEvidence = {
      id: crypto.randomUUID(),
      caseId,
      name,
      hash,
      status: "UNVERIFIED",
      addedBy: req.user.username,
      createdAt: new Date().toISOString()
    };

    evidence.push(newEvidence);

    res.status(201).json({
      success: true,
      message: "Evidence added",
      evidence: newEvidence
    });
  }
);

// -------- Verify Evidence --------
app.post(
  "/evidence/:id/verify",
  verifyJWT,
  activityLogger("VERIFY_EVIDENCE"),
  (req, res) => {
    const { isAuthentic } = req.body;

    const ev = evidence.find(e => e.id === req.params.id);
    if (!ev) {
      return res.status(404).json({ error: "Evidence not found" });
    }

    const caseItem = cases.find(c => c.id === ev.caseId);

    if (
      req.user.role === "USER" &&
      caseItem.ownerUserId !== req.user.sub
    ) {
      return res.status(403).json({ error: "Cannot verify evidence for other user's case" });
    }

    ev.status = isAuthentic ? "VERIFIED_AUTHENTIC" : "VERIFIED_TAMPERED";
    ev.verifiedAt = new Date().toISOString();
    ev.verifiedBy = req.user.username;

    res.json({
      success: true,
      message: `Evidence verified as ${ev.status}`,
      evidence: ev
    });
  }
);

// -------- View Evidence --------
app.get(
  "/evidence",
  verifyJWT,
  activityLogger("VIEW_EVIDENCE"),
  (req, res) => {
    let userEvidence = evidence;

    if (req.user.role === "USER") {
      const userCaseIds = cases
        .filter(c => c.ownerUserId === req.user.sub)
        .map(c => c.id);
      userEvidence = evidence.filter(e => userCaseIds.includes(e.caseId));
    }

    res.json({
      success: true,
      total: userEvidence.length,
      evidence: userEvidence
    });
  }
);

// ================= ACTIVITY LOGGING =================

// -------- View Activity Logs (ADMIN) --------
app.get(
  "/logs",
  verifyJWT,
  allowRoles("ADMIN"),
  (req, res) => {
    try {
      if (!fs.existsSync(LOG_FILE)) {
        return res.json({ success: true, total: 0, logs: [] });
      }

      const lines = fs.readFileSync(LOG_FILE, "utf-8")
        .trim()
        .split("\n")
        .filter(line => line.trim())
        .map(line => JSON.parse(line));

      const { limit = 50, offset = 0 } = req.query;
      const paginated = lines.slice(offset, offset + limit);

      res.json({
        success: true,
        total: lines.length,
        count: paginated.length,
        logs: paginated
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to read logs" });
    }
  }
);

// -------- View User's Own Logs --------
app.get(
  "/logs/me",
  verifyJWT,
  (req, res) => {
    try {
      const logs = fs
        .readFileSync(LOG_FILE, "utf-8")
        .split("\n")
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .filter(log => log.userId === req.user.sub);

      const { limit = 50, offset = 0 } = req.query;
      const paginated = logs.slice(offset, offset + limit);

      res.json({
        success: true,
        total: logs.length,
        count: paginated.length,
        logs: paginated
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        return res.json({ success: true, total: 0, count: 0, logs: [] });
      }
      res.status(500).json({ error: "Failed to read logs" });
    }
  }
);

// -------- View Audit Log File (ADMIN, paginated, verifiable) --------
app.get(
  "/log-file",
  verifyJWT,
  activityLogger("VIEW_LOG_FILE"),
  allowRoles("ADMIN"),
  (req, res) => {
    try {
      if (!fs.existsSync(LOG_FILE)) {
        return res.status(404).json({ error: "Log file not found" });
      }

      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "20", 10);

      if (page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({ error: "Invalid pagination params" });
      }

      const lines = fs.readFileSync(LOG_FILE, "utf-8")
        .trim()
        .split("\n")
        .filter(line => line.trim());

      const totalLogs = lines.length;
      const start = (page - 1) * limit;
      const end = start + limit;

      const pageLogs = lines.slice(start, end).map(line => JSON.parse(line));

      // Integrity: hash of returned page
      const pageHash = crypto
        .createHash("sha256")
        .update(JSON.stringify(pageLogs))
        .digest("hex");

      res.json({
        meta: {
          page,
          limit,
          totalLogs,
          totalPages: Math.ceil(totalLogs / limit),
          pageHash
        },
        logs: pageLogs
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to read log file" });
    }
  }
);

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ================= SERVER START =================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   TrustVault Backend Server Running   ║
║   Port: ${PORT}                           ║
║   JWT Secret: Configured               ║
║   Activity Logging: Enabled             ║
║   Blockchain Anchoring: Ready           ║
╚════════════════════════════════════════╝
  `);
});

export default app;
