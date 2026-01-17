/**
 * Express middleware and routes for blockchain event logging with Google OAuth
 */

const blockchainEvents = require("./blockchainEvents");
const { OAuth2Client } = require("google-auth-library");

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Initialize blockchain connection with private key
 * Must be called before using blockchain routes
 */
const initBlockchain = (privateKey) => {
  blockchainEvents.initBlockchain(privateKey);
};

/**
 * Middleware to verify Google OAuth token and extract user info
 */
const verifyGoogleToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ error: "No authorization token" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    // Attach user info to request
    req.user = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      blockchainAddress: blockchainEvents.googleIdToAddress(payload.sub),
    };

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid token", details: error.message });
  }
};

/**
 * Route: POST /api/auth/verify
 * Verify Google OAuth token and return blockchain address
 */
const verifyTokenRoute = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        googleId: req.user.googleId,
        email: req.user.email,
        name: req.user.name,
        blockchainAddress: req.user.blockchainAddress,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Route: POST /api/blockchain/log-upload
 * Log upload event to blockchain
 */
const logUploadRoute = async (req, res) => {
  try {
    const { evidenceId, hash } = req.body;

    if (!evidenceId || !hash) {
      return res.status(400).json({ error: "Missing evidenceId or hash" });
    }

    const eventLog = await blockchainEvents.logUploadEvent(
      req.user.googleId,
      evidenceId,
      hash
    );

    res.json({
      success: true,
      message: "Upload event logged to blockchain",
      event: eventLog,
    });
  } catch (error) {
    console.error("Upload logging error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Route: POST /api/blockchain/log-view
 * Log view event to blockchain
 */
const logViewRoute = async (req, res) => {
  try {
    const { evidenceId } = req.body;

    if (!evidenceId) {
      return res.status(400).json({ error: "Missing evidenceId" });
    }

    const eventLog = await blockchainEvents.logViewEvent(
      req.user.googleId,
      evidenceId
    );

    res.json({
      success: true,
      message: "View event logged to blockchain",
      event: eventLog,
    });
  } catch (error) {
    console.error("View logging error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Route: POST /api/blockchain/log-transfer
 * Log transfer event to blockchain
 */
const logTransferRoute = async (req, res) => {
  try {
    const { evidenceId, toGoogleId } = req.body;

    if (!evidenceId || !toGoogleId) {
      return res.status(400).json({ error: "Missing evidenceId or toGoogleId" });
    }

    const eventLog = await blockchainEvents.logTransferEvent(
      req.user.googleId,
      toGoogleId,
      evidenceId
    );

    res.json({
      success: true,
      message: "Transfer event logged to blockchain",
      event: eventLog,
    });
  } catch (error) {
    console.error("Transfer logging error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Route: POST /api/blockchain/log-export
 * Log export event to blockchain
 */
const logExportRoute = async (req, res) => {
  try {
    const { evidenceId, exportFormat = "json" } = req.body;

    if (!evidenceId) {
      return res.status(400).json({ error: "Missing evidenceId" });
    }

    const eventLog = await blockchainEvents.logExportEvent(
      req.user.googleId,
      evidenceId,
      exportFormat
    );

    res.json({
      success: true,
      message: "Export event logged to blockchain",
      event: eventLog,
    });
  } catch (error) {
    console.error("Export logging error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Route: GET /api/blockchain/user-events
 * Get all events for logged-in user
 */
const getUserEventsRoute = async (req, res) => {
  try {
    const events = await blockchainEvents.getUserEventHistory(req.user.googleId);

    res.json({
      success: true,
      user: {
        googleId: req.user.googleId,
        blockchainAddress: req.user.blockchainAddress,
      },
      events,
    });
  } catch (error) {
    console.error("User events query error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Route: GET /api/blockchain/evidence-events/:evidenceId
 * Get all events for specific evidence
 */
const getEvidenceEventsRoute = async (req, res) => {
  try {
    const { evidenceId } = req.params;

    if (!evidenceId) {
      return res.status(400).json({ error: "Missing evidenceId" });
    }

    const events = await blockchainEvents.getEvidenceEventHistory(evidenceId);

    res.json({
      success: true,
      evidenceId,
      events,
    });
  } catch (error) {
    console.error("Evidence events query error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get user blockchain address from Google ID
 */
const getUserBlockchainAddress = (googleId) => {
  return blockchainEvents.googleIdToAddress(googleId);
};

module.exports = {
  initBlockchain,
  verifyGoogleToken,
  verifyTokenRoute,
  logUploadRoute,
  logViewRoute,
  logTransferRoute,
  logExportRoute,
  getUserEventsRoute,
  getEvidenceEventsRoute,
  getUserBlockchainAddress,
};
