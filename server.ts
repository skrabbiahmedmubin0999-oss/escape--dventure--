import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { apiRouter } from './src/server/apiRouter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// Enable CORS and permissive headers for iframe embedding and PWA service worker asset fetching
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Mount Phase 1 REST API Router
app.use('/api/v1', apiRouter);

// Health check endpoint for Google Cloud Run / Container liveness probes
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing by serving index.html for all other requests
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Bind explicitly to 0.0.0.0 for Cloud Run / container ingress compatibility
app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${port}`);
});
