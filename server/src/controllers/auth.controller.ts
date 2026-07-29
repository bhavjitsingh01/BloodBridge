import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendCreated, sendError } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().transform((val: string) => new Date(val)),
  role: z.enum(['donor' as const, 'hospital' as const, 'blood-bank' as const]),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const authController = {
  /**
   * Register new user
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const validated = await registerSchema.parseAsync(req.body);
    const result = await AuthService.register(validated);
    sendCreated(res, result, SUCCESS_MESSAGES.REGISTRATION_SUCCESS);
  }),

  /**
   * Login user
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = await loginSchema.parseAsync(req.body);
    const result = await AuthService.login(email, password);
    sendSuccess(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
  }),

  /**
   * Refresh access token
   */
  refreshToken: asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = await refreshTokenSchema.parseAsync(req.body);
    const result = await AuthService.refreshToken(refreshToken);
    sendSuccess(res, result, 'Token refreshed successfully');
  }),

  /**
   * Get current user profile
   */
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    const user = await AuthService.getCurrentUser(req.user.id);
    sendSuccess(res, user, 'User profile retrieved successfully');
  }),

  /**
   * Logout user
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
      return;
    }

    await AuthService.logout(req.user.id);
    sendSuccess(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  }),
};
