import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/appError';
import { compareToken, createAccessToken, createRefreshToken, hashToken, verifyRefreshToken } from '../services/tokenService';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function register(req: Request, res: Response) {
  const { name, email, password } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash }
  });

  const payload = { userId: user.id, email: user.email };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);
  const refreshTokenHash = await hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash }
  });

  return res.status(StatusCodes.CREATED).json({
    message: 'User registered successfully',
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email }
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: await hashToken(refreshToken) }
  });

  return res.json({
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email }
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const validToken = await compareToken(refreshToken, user.refreshTokenHash);
  if (!validToken) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token has been revoked');
  }

  const nextPayload = { userId: user.id, email: user.email };
  const accessToken = createAccessToken(nextPayload);
  const nextRefreshToken = createRefreshToken(nextPayload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: await hashToken(nextRefreshToken) }
  });

  return res.json({ accessToken, refreshToken: nextRefreshToken });
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = refreshSchema.parse(req.body);

  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { refreshTokenHash: null }
    });
  } catch {
    // Keep logout idempotent.
  }

  return res.json({ message: 'Logout successful' });
}
