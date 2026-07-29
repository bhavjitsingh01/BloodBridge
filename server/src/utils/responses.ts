import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Operation successful',
  statusCode: number = HTTP_STATUS.OK
): Response {
  const response: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
}

/**
 * Send created response (201)
 */
export function sendCreated<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
}

/**
 * Send paginated response
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Data retrieved successfully'
): Response {
  const pages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    statusCode: HTTP_STATUS.OK,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(HTTP_STATUS.OK).json(response);
}

/**
 * Send error response
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errors?: Array<{ field: string; message: string }>
): Response {
  const response: ApiResponse = {
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
}

/**
 * Send validation error response
 */
export function sendValidationError(
  res: Response,
  errors: Array<{ field: string; message: string }>,
  message: string = 'Validation failed'
): Response {
  const response: ApiResponse = {
    success: false,
    statusCode: HTTP_STATUS.BAD_REQUEST,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };

  return res.status(HTTP_STATUS.BAD_REQUEST).json(response);
}

/**
 * Send not found response
 */
export function sendNotFound(
  res: Response,
  message: string = 'Resource not found'
): Response {
  return sendError(res, message, HTTP_STATUS.NOT_FOUND);
}

/**
 * Send unauthorized response
 */
export function sendUnauthorized(
  res: Response,
  message: string = 'Unauthorized access'
): Response {
  return sendError(res, message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Send forbidden response
 */
export function sendForbidden(
  res: Response,
  message: string = 'Access forbidden'
): Response {
  return sendError(res, message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Send internal server error response
 */
export function sendInternalError(
  res: Response,
  message: string = 'Internal server error'
): Response {
  return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
}
