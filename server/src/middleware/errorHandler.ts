import { Request, Response, NextFunction } from 'express';
import { AppError, isAppError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';
import { sendError } from '../utils/responses';
import { HTTP_STATUS } from '../config/constants';

/**
 * Global error handler middleware
 * Catches all errors and returns standardized response
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (isAppError(error)) {
    // Operational error
    logger.warn(`[${error.statusCode}] ${error.message}`);

    if (error instanceof ValidationError && error.errors) {
      sendError(res, error.message, error.statusCode, error.errors);
    } else {
      sendError(res, error.message, error.statusCode);
    }
  } else {
    // Unknown error
    logger.error('Unhandled error:', error);
    sendError(res, 'Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch thrown errors
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
