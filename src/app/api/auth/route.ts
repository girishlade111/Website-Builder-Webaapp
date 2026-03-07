// API: Authentication
// POST /api/auth/login - Login
// POST /api/auth/register - Register
// POST /api/auth/logout - Logout
// GET /api/auth/me - Get current user

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Simple session-based auth for demo purposes
// In production, use NextAuth.js or similar

export async function POST(
  request: NextRequest
) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'login') {
    return handleLogin(request);
  } else if (action === 'register') {
    return handleRegister(request);
  } else if (action === 'logout') {
    return handleLogout(request);
  }

  return NextResponse.json(
    { success: false, error: 'Invalid action' },
    { status: 400 }
  );
}

async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // For demo, create user if doesn't exist
    let user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: body.name || email.split('@')[0]
        }
      });
    }

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: nanoid(32),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        },
        sessionToken: session.sessionToken
      }
    });

    // Set session cookie
    response.cookies.set('session', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}

async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { email }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create user (in production, hash password)
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash: password // In production, hash this!
      }
    });

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: nanoid(32),
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        },
        sessionToken: session.sessionToken
      }
    });

    response.cookies.set('session', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Registration failed' },
      { status: 500 }
    );
  }
}

async function handleLogout(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;

    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken }
      });
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

async function getCurrentUser() {
  // In production, get session from cookie and validate
  let user = await prisma.user.findFirst({
    where: { email: 'demo@example.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'Demo User'
      }
    });
  }

  return user;
}
