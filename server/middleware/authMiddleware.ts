import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
    role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'SALES_AGENT' | 'VIEWER';
  };
}

export function protectRoute(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as {
      id: string;
      email: string;
      organizationId: string;
      role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'SALES_AGENT' | 'VIEWER';
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
