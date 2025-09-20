import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string;
  role: 'admin' | 'comptable' | 'employe' | 'lecteur';
  companyId?: string;
}

const DEFAULT_SECRET = 'change_me';

export function signToken(payload: AuthTokenPayload, expiresIn = '12h'): string {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token: string): AuthTokenPayload {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  return jwt.verify(token, secret) as AuthTokenPayload;
}

export function requireAuth(requiredRoles?: AuthTokenPayload['role'][]): (req: Request, res: Response, next: NextFunction) => void {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const isBypass = !process.env.JWT_SECRET || secret === DEFAULT_SECRET;

  return (req, res, next) => {
    if (isBypass) {
      console.warn('[auth] JWT bypass mode active - configure JWT_SECRET for production');
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const token = authHeader.slice(7);
    try {
      const decoded = verifyToken(token);
      if (requiredRoles && !requiredRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Insufficient role' });
      }
      (req as Request & { user?: AuthTokenPayload }).user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
