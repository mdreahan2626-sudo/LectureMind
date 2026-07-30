const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Proxy Helper using native fetch
const proxyTo = (targetBaseUrl) => async (req, res) => {
  const url = `${targetBaseUrl}${req.originalUrl}`;
  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length']; // let fetch compute content-length for stringified body

    const options = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(url, options);
    
    // Set headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.status(response.status);

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      res.json(data);
    } else {
      const text = await response.text();
      res.send(text);
    }
  } catch (error) {
    console.error(`[Gateway Proxy] Error forwarding ${req.method} ${req.originalUrl} -> ${url}:`, error.message);
    res.status(502).json({ error: `Bad Gateway. Failed to reach service: ${targetBaseUrl}` });
  }
};

// Target Microservices URLs (configured via env in Docker, fallbacks to localhost)
const SERVICES = {
  AUTH: process.env.AUTH_SERVICE_URL || 'http://localhost:5011',
  USER: process.env.USER_SERVICE_URL || 'http://localhost:5012',
  SUBJECTS: process.env.SUBJECTS_SERVICE_URL || 'http://localhost:5013',
  FLASHCARDS: process.env.FLASHCARDS_SERVICE_URL || 'http://localhost:5014',
  AI: process.env.AI_SERVICE_URL || 'http://localhost:5015'
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
app.use('/api/lectures', proxyTo(SERVICES.AI));
app.use('/api/chat', proxyTo(SERVICES.AI));
app.use('/api/rag', proxyTo(SERVICES.AI));
app.use('/api/summarize-text', proxyTo(SERVICES.AI));

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
});
