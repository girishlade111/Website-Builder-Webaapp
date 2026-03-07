// Custom Next.js server with WebSocket support for real-time collaboration

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { createWebSocketServer, startPersistence } from './src/lib/ws-server';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  // Initialize WebSocket server
  createWebSocketServer(server);

  // Start periodic persistence
  startPersistence(30000);

  server.listen(port, () => {
    console.log(`
    ✓ Ready on http://localhost:${port}
    ✓ WebSocket server running on ws://localhost:${port}/ws
    ✓ Persistence interval: 30s
    `);
  });
});
