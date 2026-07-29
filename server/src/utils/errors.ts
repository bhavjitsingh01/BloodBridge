import { HTTP_STATUS } from '../config/constants';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  public errors?: Array<{ field: string; message: string }>;

  constructor(message: string, errors?: Array<{ field: string; message: string }>) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    Object.setPrototypeOf(this, ValidationError.prototype);

    this.errors = errors;
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization/Permission error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, HTTP_STATUS.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Internal server error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Service unavailable error (503)
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: unknown): error is AppError {
  return isAppError(error) && error.isOperational;
}
