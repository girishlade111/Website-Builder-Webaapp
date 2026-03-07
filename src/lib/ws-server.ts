// WebSocket Server for Real-time Collaboration with Yjs
// This implements a Yjs-aware WebSocket server for collaborative editing

import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { applyUpdate, encodeStateAsUpdate } from 'yjs';

type DocMap = Map<string, { doc: Y.Doc; mutex: Promise<void>; conns: Set<WebSocket> }>;

const docs: DocMap = new Map();

export interface WSSharedDoc extends Y.Doc {
  conns: Set<WebSocket>;
  mutex: Promise<void>;
}

// Simple mutex implementation
function createMutex(): () => Promise<void> {
  let lock = Promise.resolve();
  return async () => {
    await lock;
    let release: () => void;
    lock = new Promise(resolve => { release = resolve; });
    release!();
  };
}

function getYDoc(docName: string, gc = true): WSSharedDoc {
  let doc = docs.get(docName);
  if (!doc) {
    const yDoc = new Y.Doc({ gc });
    const wrappedDoc = yDoc as WSSharedDoc;
    wrappedDoc.conns = new Set();
    wrappedDoc.mutex = Promise.resolve();
    
    wrappedDoc.on('update', (update: Uint8Array, origin: any) => {
      sendUpdateToOthers(update, origin, wrappedDoc);
    });

    docs.set(docName, { doc: wrappedDoc, mutex: wrappedDoc.mutex, conns: wrappedDoc.conns });
    doc = docs.get(docName)!;
  }
  return doc.doc as WSSharedDoc;
}

function sendUpdateToOthers(update: Uint8Array, origin: any, doc: WSSharedDoc) {
  const encoder = new TextEncoder();
  const message = encoder.encode(JSON.stringify({ type: 'sync', update: Array.from(update) }));
  
  doc.conns.forEach((conn) => {
    if (conn !== origin && conn.readyState === WebSocket.OPEN) {
      conn.send(message);
    }
  });
}

function handleMessage(conn: WebSocket, message: Uint8Array, doc: WSSharedDoc) {
  try {
    const data = JSON.parse(new TextDecoder().decode(message));
    
    if (data.type === 'sync' && data.update) {
      const update = new Uint8Array(data.update);
      Y.applyUpdate(doc, update, conn);
    } else if (data.type === 'cursor' && data.cursor) {
      // Broadcast cursor position to others
      const encoder = new TextEncoder();
      const cursorMessage = encoder.encode(JSON.stringify({
        type: 'cursor',
        userId: data.userId,
        cursor: data.cursor
      }));
      
      doc.conns.forEach((otherConn) => {
        if (otherConn !== conn && otherConn.readyState === WebSocket.OPEN) {
          otherConn.send(cursorMessage);
        }
      });
    } else if (data.type === 'awareness' && data.states) {
      // Broadcast awareness state (selection, etc.)
      const encoder = new TextEncoder();
      const awarenessMessage = encoder.encode(JSON.stringify({
        type: 'awareness',
        userId: data.userId,
        states: data.states
      }));
      
      doc.conns.forEach((otherConn) => {
        if (otherConn !== conn && otherConn.readyState === WebSocket.OPEN) {
          otherConn.send(awarenessMessage);
        }
      });
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
}

function handleConn(conn: WebSocket, docName: string) {
  const doc = getYDoc(docName);
  doc.conns.add(conn);
  
  // Send current state to new connection
  const state = encodeStateAsUpdate(doc);
  const encoder = new TextEncoder();
  conn.send(encoder.encode(JSON.stringify({
    type: 'sync',
    update: Array.from(state),
    isInitial: true
  })));

  conn.on('message', (data: Uint8Array) => {
    handleMessage(conn, data, doc);
  });

  conn.on('close', () => {
    doc.conns.delete(conn);
    
    // Clean up empty docs
    if (doc.conns.size === 0) {
      docs.delete(docName);
    }
  });

  conn.on('error', (err) => {
    console.error('WebSocket error:', err);
    doc.conns.delete(conn);
  });
}

// Create WebSocket server
let wss: WebSocketServer | null = null;

export function createWebSocketServer(server: any) {
  wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on('connection', (conn: WebSocket, req: any) => {
    // Extract doc name from URL: /ws/:projectId
    const url = req.url;
    const parts = url?.split('/') || [];
    const docName = parts[parts.length - 1] || 'default';
    
    handleConn(conn, docName);
  });

  console.log('WebSocket server initialized');
  
  return wss;
}

// HTTP handler for WebSocket upgrades (for Next.js API route)
export async function handleWebSocketRequest(request: Request): Promise<Response> {
  // This is a placeholder - actual WebSocket handling happens in the server
  return new Response('WebSocket endpoint', { status: 200 });
}

// Get document state (for persistence)
export function getDocumentState(docName: string): Uint8Array | null {
  const docData = docs.get(docName);
  if (!docData) return null;
  return encodeStateAsUpdate(docData.doc);
}

// Persist document state to database
export async function persistDocumentState(docName: string): Promise<void> {
  const state = getDocumentState(docName);
  if (!state) return;

  try {
    const prisma = (await import('@/lib/prisma')).default;
    await prisma.collaborationSession.upsert({
      where: { projectId: docName },
      create: {
        projectId: docName,
        yjsState: Buffer.from(state),
        cursors: {}
      },
      update: {
        yjsState: Buffer.from(state)
      }
    });
  } catch (error) {
    console.error('Failed to persist document state:', error);
  }
}

// Load document state from database
export async function loadDocumentState(docName: string): Promise<Uint8Array | null> {
  try {
    const prisma = (await import('@/lib/prisma')).default;
    const session = await prisma.collaborationSession.findUnique({
      where: { projectId: docName }
    });
    
    if (session?.yjsState) {
      return new Uint8Array(session.yjsState);
    }
  } catch (error) {
    console.error('Failed to load document state:', error);
  }
  
  return null;
}

// Periodic persistence interval
let persistenceInterval: NodeJS.Timeout | null = null;

export function startPersistence(intervalMs = 30000) {
  if (persistenceInterval) {
    clearInterval(persistenceInterval);
  }
  
  persistenceInterval = setInterval(() => {
    docs.forEach((_, docName) => {
      persistDocumentState(docName);
    });
  }, intervalMs);
  
  console.log(`Persistence started with interval ${intervalMs}ms`);
}

export function stopPersistence() {
  if (persistenceInterval) {
    clearInterval(persistenceInterval);
    persistenceInterval = null;
  }
}
