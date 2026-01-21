import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import wordsRouter from './routes/words';
import { wordStore } from './store';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/words', wordsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from frontend dist directory
// When running from backend/, go up one level to project root, then to frontend/dist
const frontendDistPath = path.resolve(process.cwd(), '..', 'frontend', 'dist');
app.use(express.static(frontendDistPath));

// Handle SPA routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');
  
  // Add client to store
  wordStore.addClient(ws);
  
  // Send initial words to new client
  const words = wordStore.getWords();
  ws.send(JSON.stringify({ type: 'words-update', words }));
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);
});
