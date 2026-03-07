// API: Authentication - Login
// POST /api/auth/login - Login user

import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Login user
    const user = await loginUser({ email, password });

    return NextResponse.json({
      success: true,
      data: { user },
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message === 'Invalid email or password') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Login failed' },
      { status: 500 }
    );
  }
}
