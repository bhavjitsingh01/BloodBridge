import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateAccessToken } from '../utils/jwt';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Register endpoint
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, email, password, ...roleSpecificData } = req.body;

    // Validate required fields
    if (!role || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Role, email, and password are required',
      });
      return;
    }

    // Validate role
    if (!['Donor', 'Hospital', 'BloodBank', 'Admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: Donor, Hospital, BloodBank, Admin',
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });
      return;
    }

    // Validate password strength (at least 8 characters, uppercase, lowercase, number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
      return;
    }

    // Validate role-specific required fields
    if (role === 'Donor' && (!roleSpecificData.fullName || !roleSpecificData.bloodGroup || !roleSpecificData.city || !roleSpecificData.state)) {
      res.status(400).json({
        success: false,
        message: 'Donor requires: fullName, bloodGroup, city, state',
      });
      return;
    }

    if (role === 'Hospital' && (!roleSpecificData.hospitalName || !roleSpecificData.address || !roleSpecificData.city || !roleSpecificData.state)) {
      res.status(400).json({
        success: false,
        message: 'Hospital requires: hospitalName, address, city, state',
      });
      return;
    }

    if (role === 'BloodBank' && (!roleSpecificData.bloodBankName || !roleSpecificData.address || !roleSpecificData.city || !roleSpecificData.state)) {
      res.status(400).json({
        success: false,
        message: 'BloodBank requires: bloodBankName, address, city, state',
      });
      return;
    }

    if (role === 'Admin' && !roleSpecificData.name) {
      res.status(400).json({
        success: false,
        message: 'Admin requires: name',
      });
      return;
    }

    // Create user
    const user = new User({
      role,
      email: email.toLowerCase(),
      password,
      ...roleSpecificData,
    });

    await user.save();

    // Generate token
    const token = generateAccessToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role as any,
    });

    logger.info(`User registered successfully: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name || user.fullName || user.hospitalName || user.bloodBankName || 'User',
        },
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
    });
  }
};

// Login endpoint
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate token
    const token = generateAccessToken({
      userId: (user._id as any).toString(),
      email: user.email,
      role: user.role as any,
    });

    logger.info(`User logged in successfully: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name || user.fullName || user.hospitalName || user.bloodBankName || 'User',
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
    });
  }
};

// Logout endpoint
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    logger.info(`User logged out: ${req.user?.email}`);

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
    });
  }
};

// Get profile endpoint
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        userId: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        hospitalName: user.hospitalName,
        bloodBankName: user.bloodBankName,
        name: user.name,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        city: user.city,
        state: user.state,
        address: user.address,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
    });
  }
};
