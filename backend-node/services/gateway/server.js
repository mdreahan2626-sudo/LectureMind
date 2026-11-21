const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Proxy Helper supporting JSON bodies and multipart streaming
const proxyTo = (targetBaseUrl) => (req, res) => {
  const targetUrl = new URL(`${targetBaseUrl}${req.originalUrl}`);
  const isMultipart = (req.headers['content-type'] || '').includes('multipart');
  const hasJsonBody = !isMultipart && req.body && Object.keys(req.body).length > 0;
  const body = hasJsonBody ? JSON.stringify(req.body) : null;

  const headers = { ...req.headers };
  delete headers.host;
  if (hasJsonBody) {
    headers['content-type'] = 'application/json';
    headers['content-length'] = Buffer.byteLength(body);
  }

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode);
    Object.entries(proxyRes.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (error) => {
    console.error(`[Gateway Proxy] Error forwarding ${req.method} ${req.originalUrl} -> ${targetBaseUrl}${req.originalUrl}:`, error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: `Bad Gateway. Failed to reach service: ${targetBaseUrl}. ${error.message}` });
    }
  });

  if (hasJsonBody) {
    proxyReq.write(body);
    proxyReq.end();
  } else {
    req.pipe(proxyReq);
  }
};

// Target Microservices URLs (Use 127.0.0.1 to avoid macOS IPv6 localhost resolution mismatch)
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://127.0.0.1:5011',
  USER: process.env.USER_SERVICE_URL || 'http://127.0.0.1:5012',
  SUBJECTS: process.env.SUBJECTS_SERVICE_URL || 'http://127.0.0.1:5013',
  FLASHCARDS: process.env.FLASHCARDS_SERVICE_URL || 'http://127.0.0.1:5014',
  AI: process.env.AI_SERVICE_URL || 'http://127.0.0.1:5015'
};

// Gateway Health Check
app.get('/api/health', async (req, res) => {
  res.json({
    status: 'healthy',
    gateway: 'online',
    microservices: {
      auth: SERVICES.AUTH,
      user: SERVICES.USER,
      subjects: SERVICES.SUBJECTS,
      flashcards: SERVICES.FLASHCARDS,
      ai: SERVICES.AI
    }
  });
});

// Route Rules
app.use('/api/auth', proxyTo(SERVICES.AUTH));
app.use('/api/user', proxyTo(SERVICES.USER));
app.use('/api/subjects', proxyTo(SERVICES.SUBJECTS));
app.use('/api/flashcards/generate', proxyTo(SERVICES.AI));
app.use('/api/flashcards', proxyTo(SERVICES.FLASHCARDS));
app.use('/api/ai', proxyTo(SERVICES.AI));
app.use('/api/nemotron', proxyTo(SERVICES.AI));
app.use('/api/lectures', proxyTo(SERVICES.AI));
app.use('/api/chat', proxyTo(SERVICES.AI));
app.use('/api/rag', proxyTo(SERVICES.AI));
app.use('/api/summarize-text', proxyTo(SERVICES.AI));

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
});
