// Authentication Utilities - Session management and user authentication

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
  user: User;
}

// Cookie configuration
const SESSION_COOKIE_NAME = 'session-token';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

// Hash password using bcrypt-like approach
export async function hashPassword(password: string): Promise<string> {
  const salt = nanoid(16);
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return `${salt}:${hash}`;
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const [salt, storedHash] = hash.split(':');
    const hashToVerify = crypto.createHmac('sha256', salt).update(password).digest('hex');
    return hashToVerify === storedHash;
  } catch {
    return false;
  }
}

// Generate session token
function generateSessionToken(): string {
  return nanoid(32);
}

// Create a new session
export async function createSession(userId: string): Promise<Session> {
  const sessionToken = generateSessionToken();
  const expires = new Date(Date.now() + SESSION_COOKIE_MAX_AGE * 1000);

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, session.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/',
  });

  return session;
}

// Get session from cookie
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!session || session.expires < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    // Extend session expiry
    const newExpires = new Date(Date.now() + SESSION_COOKIE_MAX_AGE * 1000);
    await prisma.session.update({
      where: { id: session.id },
      data: { expires: newExpires },
    });

    return session;
  } catch {
    return null;
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

// Delete session (logout)
export async function deleteSession(sessionToken?: string): Promise<void> {
  const cookieStore = await cookies();
  const token = sessionToken || cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.delete({
      where: { sessionToken: token },
    }).catch(() => {});
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// Register a new user
export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<User> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      emailVerified: true,
    },
  });

  // Create session
  await createSession(user.id);

  return user;
}

// Login user
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user || !user.passwordHash) {
    throw new Error('Invalid email or password');
  }

  const isValid = await verifyPassword(data.password, user.passwordHash);

  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Create session
  await createSession(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    emailVerified: user.emailVerified,
  };
}

// OAuth callback handler
export async function handleOAuthCallback(data: {
  provider: string;
  providerAccountId: string;
  email: string;
  name?: string;
  image?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}): Promise<User> {
  // Find or create user
  let user = await prisma.user.findFirst({
    where: {
      accounts: {
        some: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
    },
  });

  if (!user) {
    // Check if user exists with this email
    user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (user) {
      // Link OAuth account to existing user
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
          expires_at: data.expiresAt,
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          image: data.image,
          emailVerified: new Date(),
          accounts: {
            create: {
              type: 'oauth',
              provider: data.provider,
              providerAccountId: data.providerAccountId,
              access_token: data.accessToken,
              refresh_token: data.refreshToken,
              expires_at: data.expiresAt,
            },
          },
        },
      });
    }
  }

  // Create session
  await createSession(user.id);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    emailVerified: user.emailVerified,
  };
}

// Middleware helper - verify authentication
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}

// Middleware helper - verify project access
export async function verifyProjectAccess(
  projectId: string,
  requiredRole?: ('OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER')[]
): Promise<{ user: User; role: string }> {
  const user = await requireAuth();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborations: true },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const isOwner = project.ownerId === user.id;
  const collaboration = project.collaborations.find((c) => c.userId === user.id);

  if (!isOwner && !collaboration) {
    throw new Error('Access denied');
  }

  const role = isOwner ? 'OWNER' : collaboration?.role || 'VIEWER';

  // Check if role meets minimum requirement
  if (requiredRole) {
    const roleHierarchy = {
      VIEWER: 1,
      EDITOR: 2,
      ADMIN: 3,
      OWNER: 4,
    };

    const userRoleLevel = roleHierarchy[role as keyof typeof roleHierarchy];
    const minRoleLevel = Math.min(
      ...requiredRole.map((r) => roleHierarchy[r])
    );

    if (userRoleLevel < minRoleLevel) {
      throw new Error('Insufficient permissions');
    }
  }

  return { user, role };
}

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count, resetTime: record.resetTime };
}
