const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
// Note: Do not place a blanket body-parser before file upload routes so Multer can stream cleanly
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: 'unified-microservices-in-process',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

console.log('[EduAssist Engine] Mounting in-process service mesh...');

// Mount all microservice routes directly
const authApp = require('./services/auth-service/server');
const userApp = require('./services/user-service/server');
const subjectsApp = require('./services/subjects-service/server');
const flashcardsApp = require('./services/flashcards-service/server');
const aiApp = require('./services/ai-service/server');

app.use(authApp);
app.use(userApp);
app.use(subjectsApp);
app.use(flashcardsApp);
app.use(aiApp);

const server = app.listen(PORT, () => {
  console.log(`[EduAssist API Gateway] Unified Engine active on http://127.0.0.1:${PORT}`);
});

module.exports = { app, server };
