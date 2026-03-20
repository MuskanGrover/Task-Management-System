import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { env } from '../config/env';
import type { AuthenticatedRequest } from '../types/express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Missing access token' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as { userId: string; email: string };
    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid or expired access token' });
  }
}
