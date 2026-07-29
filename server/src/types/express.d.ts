import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'donor' | 'hospital' | 'blood-bank' | 'admin';
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
      userRole?: string;
    }
  }
}
