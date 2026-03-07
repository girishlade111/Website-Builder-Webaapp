'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collaborationApi } from '@/lib/apiClient';
import { Users, UserPlus, UserX, Wifi, WifiOff, Loader2 } from 'lucide-react';

interface Collaborator {
  user: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
  };
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  cursor?: {
    x: number;
    y: number;
    selection?: any;
    updatedAt: string;
  } | null;
}

interface CollaborationPanelProps {
  projectId: string;
  userId: string;
  onClose: () => void;
}

interface CursorIndicator {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  projectId,
  userId,
  onClose
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER' | 'ADMIN'>('EDITOR');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [cursors, setCursors] = useState<CursorIndicator[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadCollaborators();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  const loadCollaborators = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await collaborationApi.getState(projectId);
      if (result.success && result.data) {
        setCollaborators(result.data.collaborators || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collaborators');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${projectId}`;

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'cursor' && data.userId !== userId) {
            // Update cursor for other user
            setCursors(prev => {
              const existing = prev.find(c => c.id === data.userId);
              if (existing) {
                return prev.map(c =>
                  c.id === data.userId
                    ? { ...c, x: data.cursor.x, y: data.cursor.y }
                    : c
                );
              } else {
                const color = USER_COLORS[prev.length % USER_COLORS.length];
                return [...prev, {
                  id: data.userId,
                  name: data.userName || 'Anonymous',
                  color,
                  x: data.cursor.x,
                  y: data.cursor.y
                }];
              }
            });
          }
        } catch (e) {
          console.error('Error processing WebSocket message:', e);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        // Attempt reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (e) {
      console.error('Failed to connect WebSocket:', e);
    }
  };

  const updateCursor = (x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor',
        userId,
        cursor: { x, y }
      }));
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setError(null);

    try {
      // Note: This would need an API endpoint for inviting collaborators
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      setInviteEmail('');
      loadCollaborators();
    } catch (err: any) {
      setError(err.message || 'Failed to invite collaborator');
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-700';
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'EDITOR': return 'bg-blue-100 text-blue-700';
      case 'VIEWER': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUserInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Collaborators</h2>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="w-4 h-4" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <WifiOff className="w-4 h-4" />
                Disconnected
              </span>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Invite Form */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Invite Collaborator</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EDITOR">Editor</option>
                <option value="VIEWER">Viewer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button
              onClick={handleInvite}
              disabled={isInviting || !inviteEmail.trim()}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Send Invite
                </>
              )}
            </button>
          </div>

          {/* Collaborators List */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Team Members ({collaborators.length})
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : collaborators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>No collaborators yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.user.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                  >
                    {/* Avatar */}
                    {collab.user.image ? (
                      <img
                        src={collab.user.image}
                        alt={collab.user.name || ''}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                        {getUserInitials(collab.user.name, collab.user.email)}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {collab.user.name || collab.user.email}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{collab.user.email}</p>
                    </div>

                    {/* Role Badge */}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(collab.role)}`}>
                      {collab.role}
                    </span>

                    {/* Remove Button (only for non-owner) */}
                    {collab.role !== 'OWNER' && userId !== collab.user.id && (
                      <button
                        onClick={() => {
                          // Would need API endpoint to remove collaborator
                          console.log('Remove collaborator:', collab.user.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Real-time collaboration powered by Yjs CRDT
          </p>
        </div>
      </div>

      {/* Cursor Indicators Overlay */}
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="fixed pointer-events-none z-[100] transition-all duration-100"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(10px, 10px)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z" fill={cursor.color} />
          </svg>
          <div
            className="absolute left-4 top-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for tracking cursor position
export function useCursorTracking(projectId: string, userId: string) {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!projectId || !userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/${projectId}`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Cursor tracking connected');
    };

    wsRef.current.onerror = (error) => {
      console.error('Cursor tracking error:', error);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId, userId]);

  const updateCursor = (x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor',
        userId,
        cursor: { x, y }
      }));
    }
  };

  return { updateCursor };
}

export default CollaborationPanel;
