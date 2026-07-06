const { Inngest } = require("inngest");

// In local development, the presence of signing/event keys in environment variables
// forces Inngest SDK into production Cloud Mode. We temporarily remove them in-memory
// when running locally to force local Dev Server mode.
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
  delete process.env.INNGEST_EVENT_KEY;
  delete process.env.INNGEST_SIGNING_KEY;
  process.env.INNGEST_DEV = 'true';
}

// Initialize Inngest client
const inngest = new Inngest({ 
  id: "lecturemind-app",
  baseUrl: process.env.INNGEST_BASE_URL
});

module.exports = { inngest };
