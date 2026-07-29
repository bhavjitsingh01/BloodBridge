import { Request, Response } from 'express';
import Hospital, { IHospital } from '../models/Hospital';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Create hospital
export const createHospital = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin and Hospital roles can create
    if (!['Admin', 'Hospital'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { name, email, phone, address, city, state, location } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !city || !state || !location) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
      return;
    }

    // Check if hospital already exists
    const existingHospital = await Hospital.findOne({ email: email.toLowerCase() });
    if (existingHospital) {
      res.status(409).json({
        success: false,
        message: 'Hospital with this email already exists',
      });
      return;
    }

    // Validate GeoJSON location
    if (!location.coordinates || location.coordinates.length !== 2) {
      res.status(400).json({
        success: false,
        message: 'Invalid location format. Must be [longitude, latitude]',
      });
      return;
    }

    const hospital = new Hospital({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      city,
      state,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      role: 'hospital',
    });

    await hospital.save();
    logger.info(`Hospital created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Hospital created successfully',
      data: hospital,
    });
  } catch (error) {
    logger.error('Create hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hospital',
    });
  }
};

// Get all hospitals with pagination and search
export const getHospitals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, city, state, name } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (city) filter.city = { $regex: city as string, $options: 'i' };
    if (state) filter.state = { $regex: state as string, $options: 'i' };
    if (name) filter.name = { $regex: name as string, $options: 'i' };

    const total = await Hospital.countDocuments(filter);
    const hospitals = await Hospital.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Hospitals retrieved successfully',
      data: hospitals,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospitals',
    });
  }
};

// Get hospital by ID
export const getHospitalById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Hospital retrieved successfully',
      data: hospital,
    });
  } catch (error) {
    logger.error('Get hospital by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hospital',
    });
  }
};

// Update hospital
export const updateHospital = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, city, state, location } = req.body;

    // Check authorization
    if (req.user?.role !== 'Admin' && req.user?.role !== 'Hospital') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const hospital = await Hospital.findById(id);
    if (!hospital) {
      res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
      return;
    }

    // Update fields
    if (name) hospital.name = name;
    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }
      hospital.email = email.toLowerCase();
    }
    if (phone) hospital.phone = phone;
    if (address) hospital.address = address;
    if (city) hospital.city = city;
    if (state) hospital.state = state;
    if (location && location.coordinates) {
      hospital.location = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }

    await hospital.save();
    logger.info(`Hospital updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Hospital updated successfully',
      data: hospital,
    });
  } catch (error) {
    logger.error('Update hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hospital',
    });
  }
};

// Delete hospital
export const deleteHospital = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check authorization
    if (req.user?.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete hospitals',
      });
      return;
    }

    const hospital = await Hospital.findByIdAndDelete(id);
    if (!hospital) {
      res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
      return;
    }

    logger.info(`Hospital deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully',
      data: hospital,
    });
  } catch (error) {
    logger.error('Delete hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hospital',
    });
  }
};
