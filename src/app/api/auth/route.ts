// API: Authentication (Demo implementation)
// POST /api/auth?action=login - Login
// POST /api/auth?action=register - Register
// POST /api/auth?action=logout - Logout
// GET /api/auth/me - Get current user

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Simple session management (in production, use proper auth like NextAuth.js)
const sessions = new Map<string, { userId: string; expires: Date }>();

const getSession = (request: NextRequest) => {
  const sessionToken = request.cookies.get('session-token')?.value;
  if (!sessionToken) return null;
  
  const session = sessions.get(sessionToken);
  if (!session || session.expires < new Date()) {
    sessions.delete(sessionToken);
    return null;
  }
  
  return session;
};

const createSession = async (userId: string) => {
  const sessionToken = nanoid(32);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  sessions.set(sessionToken, { userId, expires });
  
  return sessionToken;
};

const getCurrentUser = async (request: NextRequest) => {
  const session = getSession(request);
  if (!session) return null;
  
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true
    }
  });
};

export async function POST(
  request: NextRequest
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'login': {
        const { email, password } = body;

        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email is required' },
            { status: 400 }
          );
        }

        // Demo login - create user if doesn't exist
        let user = await prisma.user.findFirst({
          where: { email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split('@')[0],
              passwordHash: password || 'demo'
            }
          });
        }

        const sessionToken = await createSession(user.id);

        const response = NextResponse.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image
            }
          },
          message: 'Login successful'
        });

        response.cookies.set('session-token', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
      }

      case 'register': {
        const { email, password, name } = body;

        if (!email || !password) {
          return NextResponse.json(
            { success: false, error: 'Email and password are required' },
            { status: 400 }
          );
        }

        const existing = await prisma.user.findFirst({
          where: { email }
        });

        if (existing) {
          return NextResponse.json(
            { success: false, error: 'User already exists' },
            { status: 400 }
          );
        }

        const user = await prisma.user.create({
          data: {
            email,
            passwordHash: password,
            name: name || email.split('@')[0]
          }
        });

        const sessionToken = await createSession(user.id);

        const response = NextResponse.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image
            }
          },
          message: 'Registration successful'
        });

        response.cookies.set('session-token', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60
        });

        return response;
      }

      case 'logout': {
        const sessionToken = request.cookies.get('session-token')?.value;
        if (sessionToken) {
          sessions.delete(sessionToken);
        }

        const response = NextResponse.json({
          success: true,
          message: 'Logout successful'
        });

        response.cookies.delete('session-token');

        return response;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'me') {
      const user = await getCurrentUser(request);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Not authenticated' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        data: user
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
