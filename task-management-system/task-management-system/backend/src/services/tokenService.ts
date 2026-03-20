import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export type TokenPayload = {
  userId: string;
  email: string;
};

export function createAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.accessTokenExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function createRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshTokenExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}

export async function hashToken(token: string) {
  return bcrypt.hash(token, 10);
}

export async function compareToken(rawToken: string, hashedToken: string | null | undefined) {
  if (!hashedToken) return false;
  return bcrypt.compare(rawToken, hashedToken);
}
