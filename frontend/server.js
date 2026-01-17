// Simple Node server to serve React production build
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const buildPath = path.join(__dirname, 'build');

// Serve static files from the React build folder
app.use(express.static(buildPath));

// Handle React routing - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`✓ Frontend server running on http://localhost:${PORT}`);
  console.log(`✓ Ready on port ${PORT}`);
});
