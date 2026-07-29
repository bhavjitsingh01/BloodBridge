import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../utils/errors';
import { UserRole } from '../config/constants';

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new AuthorizationError('Insufficient permissions for this action');
    }

    next();
  };
};

/**
 * Admin-only authorization middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthorizationError('User not authenticated');
  }

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Admin access required');
  }

  next();
};

/**
 * Hospital-only authorization middleware
 */
export const requireHospital = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthorizationError('User not authenticated');
  }

  if (req.user.role !== 'hospital') {
    throw new AuthorizationError('Hospital access required');
  }

  next();
};

/**
 * Blood bank-only authorization middleware
 */
export const requireBloodBank = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthorizationError('User not authenticated');
  }

  if (req.user.role !== 'blood-bank') {
    throw new AuthorizationError('Blood bank access required');
  }

  next();
};

/**
 * Donor-only authorization middleware
 */
export const requireDonor = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new AuthorizationError('User not authenticated');
  }

  if (req.user.role !== 'donor') {
    throw new AuthorizationError('Donor access required');
  }

  next();
};
