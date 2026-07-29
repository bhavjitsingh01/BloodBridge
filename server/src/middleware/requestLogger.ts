import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Request/response logging middleware
 * Logs all incoming requests and outgoing responses
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random()}`;

  // Log incoming request
  logger.info(`[${requestId}] ${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture original send method
  const originalSend = res.send;

  // Override send method to log response
  res.send = function (data) {
    const duration = Date.now() - startTime;

    logger.info(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      size: Buffer.byteLength(data),
    });

    return originalSend.call(this, data);
  };

  next();
};
