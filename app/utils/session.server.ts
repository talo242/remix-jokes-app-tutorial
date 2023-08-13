import { db } from './db.server';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { createCookieSessionStorage, redirect } from '@remix-run/node';

type LoginParams = {
  username: string;
  password: string;
};

type LoginReturn = Promise<Pick<User, 'id' | 'username'> | null>;

export const login = async ({
  username,
  password,
}: LoginParams): LoginReturn => {
  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    return null;
  }

  const passwordMatches = bcrypt.compareSync(password, user.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return { id: user.id, username };
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
}

const storage = createCookieSessionStorage({
  cookie: {
    name: '_rjs',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export const createUserSession = async (
  userId: string,
  redirectUrl: string
) => {
  const session = await storage.getSession();
  session.set('userId', userId);
  return redirect(redirectUrl, {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  });
};