// WebSocket API Route for Real-time Collaboration
// This route handles WebSocket connections for Yjs-based collaboration
// GET /api/collaboration/[projectId]/ws

import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import prisma from '@/lib/prisma';

// Store active WebSocket servers by project ID
const wssMap = new Map<string, WebSocketServer>();

// Yjs sync message types
const YJS_MESSAGE_SYNC = 0;
const YJS_MESSAGE_AWARENESS = 1;

interface CollaborationClient {
  ws: any;
  userId: string;
  projectId: string;
  cursor?: { x: number; y: number; line?: number };
  presence?: Record<string, any>;
}

const clients = new Map<string, CollaborationClient[]>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  
  // WebSocket upgrade handling
  const socket = (request as any).socket;
  
  if (!socket) {
    return new Response('WebSocket upgrade required', { status: 400 });
  }

  // Verify user access (simplified - in production use proper auth)
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId') || 'demo-user';
  const token = searchParams.get('token');

  // Verify project access
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborations: true }
  });

  if (!project) {
    return new Response('Project not found', { status: 404 });
  }

  const isOwner = project.ownerId === userId;
  const isCollaborator = project.collaborations.some(
    c => c.userId === userId && c.acceptedAt !== null
  );

  if (!isOwner && !isCollaborator) {
    return new Response('Access denied', { status: 403 });
  }

  // Get or create WebSocket server for this project
  let wss = wssMap.get(projectId);
  
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    wssMap.set(projectId, wss);

    wss.on('connection', (ws, req) => {
      const clientId = `${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get user info from connection
      const url = new URL(req.url || '', 'http://localhost');
      const connUserId = url.searchParams.get('userId') || 'demo-user';

      const client: CollaborationClient = {
        ws,
        userId: connUserId,
        projectId,
        cursor: undefined,
        presence: undefined
      };

      // Add client to project room
      const projectClients = clients.get(projectId) || [];
      projectClients.push(client);
      clients.set(projectId, projectClients);

      // Send welcome message with current state
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        projectId,
        timestamp: Date.now()
      }));

      // Broadcast user joined
      broadcastToProject(projectId, {
        type: 'user-joined',
        userId: connUserId,
        clientId,
        timestamp: Date.now()
      }, clientId);

      // Handle messages
      ws.on('message', async (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          switch (message.type) {
            case 'yjs-sync':
              // Broadcast Yjs sync to other clients
              broadcastToProject(projectId, {
                type: 'yjs-sync',
                userId: connUserId,
                update: message.update,
                timestamp: Date.now()
              }, clientId);
              
              // Persist Yjs state to database (debounced in production)
              await persistYjsState(projectId, message.update);
              break;

            case 'cursor-update':
              client.cursor = message.cursor;
              // Broadcast cursor position
              broadcastToProject(projectId, {
                type: 'cursor-update',
                userId: connUserId,
                cursor: message.cursor,
                timestamp: Date.now()
              }, clientId);
              break;

            case 'presence-update':
              client.presence = message.presence;
              // Broadcast presence
              broadcastToProject(projectId, {
                type: 'presence-update',
                userId: connUserId,
                presence: message.presence,
                timestamp: Date.now()
              }, clientId);
              break;

            case 'awareness':
              // Yjs awareness updates
              broadcastToProject(projectId, {
                type: 'awareness',
                userId: connUserId,
                awareness: message.awareness,
                timestamp: Date.now()
              }, clientId);
              break;

            case 'ping':
              ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      // Handle disconnect
      ws.on('close', () => {
        removeClient(projectId, clientId);
        broadcastToProject(projectId, {
          type: 'user-left',
          userId: connUserId,
          clientId,
          timestamp: Date.now()
        });
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        removeClient(projectId, clientId);
      });

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        } else {
          clearInterval(heartbeat);
        }
      }, 30000);

      ws.on('close', () => clearInterval(heartbeat));
    });
  }

  // Handle the WebSocket upgrade
  socket.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
    wss!.handleUpgrade(req, socket, head, (ws) => {
      wss!.emit('connection', ws, req);
    });
  });

  // Return empty response - WebSocket handles the connection
  return new Response(null, { status: 101 });
}

// Broadcast message to all clients in a project room
function broadcastToProject(
  projectId: string,
  message: any,
  excludeClientId?: string
) {
  const projectClients = clients.get(projectId) || [];
  const messageStr = JSON.stringify(message);

  for (const client of projectClients) {
    if (client.ws.readyState === 1 && client.ws.id !== excludeClientId) {
      client.ws.send(messageStr);
    }
  }
}

// Remove client from project room
function removeClient(projectId: string, clientId: string) {
  const projectClients = clients.get(projectId) || [];
  const filtered = projectClients.filter(c => c.ws.id !== clientId);
  clients.set(projectId, filtered);

  // Clean up empty rooms
  if (filtered.length === 0) {
    clients.delete(projectId);
    const wss = wssMap.get(projectId);
    if (wss) {
      wss.close();
      wssMap.delete(projectId);
    }
  }
}

// Persist Yjs state to database (debounced in production)
async function persistYjsState(projectId: string, update: Uint8Array) {
  try {
    // In production, debounce this and merge updates properly
    await prisma.collaborationSession.upsert({
      where: { projectId },
      create: {
        projectId,
        yjsState: Buffer.from(update)
      },
      update: {
        yjsState: Buffer.from(update),
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Failed to persist Yjs state:', error);
  }
}

// Get active collaborators for a project
export async function getActiveCollaborators(projectId: string): Promise<any[]> {
  const projectClients = clients.get(projectId) || [];
  
  return projectClients.map(client => ({
    userId: client.userId,
    cursor: client.cursor,
    presence: client.presence,
    connectedAt: Date.now()
  }));
}

// Clean up function for graceful shutdown
export function cleanupWebSocketServers() {
  for (const [projectId, wss] of wssMap.entries()) {
    wss.close();
    clients.delete(projectId);
  }
  wssMap.clear();
}
