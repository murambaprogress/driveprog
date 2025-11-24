const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all /api calls to Django backend
  // Frontend: /api/loans/applications/ -> Backend: /api/loans/applications/
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onProxyReq: (proxyReq, req, res) => {
        console.log('[Proxy] Proxying request:', req.method, req.url, '->', proxyReq.path);
      },
    })
  );
};
