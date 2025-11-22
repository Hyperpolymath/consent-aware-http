/**
 * Example Express server demonstrating AIBDP + HTTP 430 middleware
 *
 * This example shows how to integrate consent-aware HTTP infrastructure
 * into a standard Express.js application.
 *
 * Usage:
 *   npm install
 *   node example-server.js
 *
 * Test with:
 *   curl http://localhost:3000/
 *   curl http://localhost:3000/article.html -H "User-Agent: GPTBot/1.0"
 *   curl http://localhost:3000/.well-known/aibdp.json
 */

import express from 'express';
import { aibdpMiddleware, serveManifest } from './index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve AIBDP manifest at /.well-known/aibdp.json
app.use(serveManifest('./example-aibdp.json'));

// Apply AIBDP enforcement middleware
app.use(aibdpMiddleware({
  manifestPath: './example-aibdp.json',
  enforceForAll: false, // Only enforce for detected AI systems
  onViolation: (req, policy, purpose) => {
    console.log(`[AIBDP] Blocked: ${req.method} ${req.path}`);
    console.log(`  User-Agent: ${req.headers['user-agent']}`);
    console.log(`  Purpose: ${purpose}`);
    console.log(`  Policy: ${policy.status}`);
  }
}));

// Example routes
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Consent-Aware HTTP Example</title>
      </head>
      <body>
        <h1>Welcome to Consent-Aware HTTP</h1>
        <p>This server implements HTTP 430 + AIBDP.</p>
        <h2>Try these requests:</h2>
        <ul>
          <li><code>curl http://localhost:3000/</code> - Normal access (allowed)</li>
          <li><code>curl http://localhost:3000/article.html -H "User-Agent: GPTBot/1.0"</code> - AI bot (may be blocked)</li>
          <li><code>curl http://localhost:3000/.well-known/aibdp.json</code> - View AIBDP manifest</li>
        </ul>
        <h2>Resources:</h2>
        <ul>
          <li><a href="/article.html">Article</a> - Protected content</li>
          <li><a href="/public.html">Public content</a> - Allowed for all</li>
          <li><a href="/.well-known/aibdp.json">AIBDP Manifest</a></li>
        </ul>
      </body>
    </html>
  `);
});

app.get('/article.html', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Protected Article</title>
      </head>
      <body>
        <h1>Protected Article</h1>
        <p>This content has AI usage boundaries declared via AIBDP.</p>
        <p>Training: Conditional (requires attribution)</p>
        <p>Generation: Refused</p>
        <p>Indexing: Allowed</p>
      </body>
    </html>
  `);
});

app.get('/public.html', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Public Content</title>
      </head>
      <body>
        <h1>Public Content</h1>
        <p>This content is available for all purposes, including AI training.</p>
      </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    aibdp_enabled: true,
    http_430_enabled: true
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Consent-Aware HTTP server running on http://localhost:${PORT}`);
  console.log(`📄 AIBDP manifest: http://localhost:${PORT}/.well-known/aibdp.json`);
  console.log(`🛡️  HTTP 430 enforcement: ENABLED`);
  console.log(``);
  console.log(`Try these commands:`);
  console.log(`  curl http://localhost:${PORT}/`);
  console.log(`  curl http://localhost:${PORT}/article.html -H "User-Agent: GPTBot/1.0"`);
  console.log(`  curl http://localhost:${PORT}/.well-known/aibdp.json`);
});
