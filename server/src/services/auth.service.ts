import User, { IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { hashPassword, comparePassword } from '../utils/passwordHash';
import { AuthenticationError, ConflictError } from '../utils/errors';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface RegisterInput {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  role: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: input.email }, { phone: input.phone }],
    });

    if (existingUser) {
      throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Hash password
    const hashedPassword = await hashPassword(input.password);

    // Create new user
    const user = await User.create({
      ...input,
      password: hashedPassword,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as any,
    });

    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Login user with email and password
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role as any,
    });

    const refreshToken = generateRefreshToken(user._id.toString());

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new AuthenticationError(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const accessToken = generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role as any,
      });

      return { accessToken };
    } catch (error) {
      throw new AuthenticationError(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<IUser | null> {
    const user = await User.findById(userId).select('-password');
    return user;
  }

  /**
   * Logout user (in stateless JWT, we just invalidate on client)
   */
  static async logout(userId: string): Promise<void> {
    // In a stateless JWT system, logout is handled on the client side
    // You might store token blacklist in Redis for additional security
  }
}
