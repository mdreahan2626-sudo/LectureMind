const { fork } = require('child_process');
const path = require('path');
require('dotenv').config();

const services = [
  { name: 'Gateway', path: path.join(__dirname, 'services/gateway/server.js') },
  { name: 'Auth Service', path: path.join(__dirname, 'services/auth-service/server.js') },
  { name: 'User Service', path: path.join(__dirname, 'services/user-service/server.js') },
  { name: 'Subjects Service', path: path.join(__dirname, 'services/subjects-service/server.js') },
  { name: 'Flashcards Service', path: path.join(__dirname, 'services/flashcards-service/server.js') },
  { name: 'AI Service', path: path.join(__dirname, 'services/ai-service/server.js') }
];

console.log('[Microservices Controller] Initializing LectureMind microservices mesh...');

services.forEach(service => {
  console.log(`[Microservices Controller] Spawning ${service.name}...`);
  const child = fork(service.path, [], {
    stdio: 'inherit',
    env: { ...process.env }
  });

  child.on('error', (err) => {
    console.error(`[Microservices Controller] Failed to spawn ${service.name}:`, err.message);
  });

  child.on('exit', (code) => {
    console.warn(`[Microservices Controller] Service ${service.name} exited with code ${code}`);
  });
});

