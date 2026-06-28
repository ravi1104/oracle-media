import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './errorHandler';

export type Role = 'admin' | 'moderator' | 'user' | 'guest';

interface JwtPayload {
  sub?: string;
  role?: Role;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const apiKey = req.header('x-api-key');
  const authHeader = req.header('authorization');

  if (apiKey && apiKey === config.apiKey) {
    (req as Request & { userRole?: Role }).userRole = 'user';
    next();
    return;
  }

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
      (req as Request & { userRole?: Role }).userRole = payload.role || 'user';
      next();
      return;
    } catch {
      next(new AppError(401, 'Invalid or expired token'));
      return;
    }
  }

  next(new AppError(401, 'Authentication required'));
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = (req as Request & { userRole?: Role }).userRole || 'guest';
    if (!roles.includes(role)) {
      next(new AppError(403, 'Forbidden'));
      return;
    }
    next();
  };
}
