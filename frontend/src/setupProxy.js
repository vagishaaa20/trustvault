// This file is used to configure proxying for development
// It ensures that client-side routes are properly handled

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      }
    })
  );

  // Proxy blockchain events
  app.use(
    '/blockchain',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
      pathRewrite: {
        '^/blockchain': '/api/blockchain'
      }
    })
  );
};
