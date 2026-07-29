import { Request, Response } from 'express';
import Donor from '../models/Donor';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Create donor
export const createDonor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Donor and Admin roles can create
    if (!['Admin', 'Donor'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { fullName, email, phone, bloodGroup, age, gender, city, state, latitude, longitude } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone || !bloodGroup || !age || !gender || !city || !state || latitude === undefined || longitude === undefined) {
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

    // Validate age
    if (age < 18 || age > 65) {
      res.status(400).json({
        success: false,
        message: 'Age must be between 18 and 65',
      });
      return;
    }

    // Validate blood group
    const validBloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      res.status(400).json({
        success: false,
        message: 'Invalid blood group',
      });
      return;
    }

    // Validate gender
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      res.status(400).json({
        success: false,
        message: 'Gender must be Male, Female, or Other',
      });
      return;
    }

    // Check if donor already exists
    const existingDonor = await Donor.findOne({ email: email.toLowerCase() });
    if (existingDonor) {
      res.status(409).json({
        success: false,
        message: 'Donor with this email already exists',
      });
      return;
    }

    const donor = new Donor({
      fullName,
      email: email.toLowerCase(),
      phone,
      bloodGroup,
      age,
      gender,
      city,
      state,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    await donor.save();
    logger.info(`Donor created: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Donor created successfully',
      data: donor,
    });
  } catch (error) {
    logger.error('Create donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donor',
    });
  }
};

// Get all donors with pagination and search
export const getDonors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, bloodGroup, city, state, availabilityStatus } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (bloodGroup) filter.bloodGroup = bloodGroup as string;
    if (city) filter.city = { $regex: city as string, $options: 'i' };
    if (state) filter.state = { $regex: state as string, $options: 'i' };
    if (availabilityStatus) filter.availabilityStatus = availabilityStatus as string;

    const total = await Donor.countDocuments(filter);
    const donors = await Donor.find(filter)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Donors retrieved successfully',
      data: donors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve donors',
    });
  }
};

// Get donor by ID
export const getDonorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const donor = await Donor.findById(id);
    if (!donor) {
      res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Donor retrieved successfully',
      data: donor,
    });
  } catch (error) {
    logger.error('Get donor by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve donor',
    });
  }
};

// Update donor
export const updateDonor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, bloodGroup, age, gender, city, state, latitude, longitude } = req.body;

    // Check authorization
    if (req.user?.role !== 'Admin' && req.user?.role !== 'Donor') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const donor = await Donor.findById(id);
    if (!donor) {
      res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
      return;
    }

    // Update fields
    if (fullName) donor.fullName = fullName;
    if (email) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
        return;
      }
      donor.email = email.toLowerCase();
    }
    if (phone) donor.phone = phone;
    if (bloodGroup) {
      const validBloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
      if (!validBloodGroups.includes(bloodGroup)) {
        res.status(400).json({
          success: false,
          message: 'Invalid blood group',
        });
        return;
      }
      donor.bloodGroup = bloodGroup;
    }
    if (age) {
      if (age < 18 || age > 65) {
        res.status(400).json({
          success: false,
          message: 'Age must be between 18 and 65',
        });
        return;
      }
      donor.age = age;
    }
    if (gender) {
      if (!['Male', 'Female', 'Other'].includes(gender)) {
        res.status(400).json({
          success: false,
          message: 'Gender must be Male, Female, or Other',
        });
        return;
      }
      donor.gender = gender;
    }
    if (city) donor.city = city;
    if (state) donor.state = state;
    if (latitude !== undefined && longitude !== undefined) {
      donor.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }

    await donor.save();
    logger.info(`Donor updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Donor updated successfully',
      data: donor,
    });
  } catch (error) {
    logger.error('Update donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donor',
    });
  }
};

// Update donor availability
export const updateDonorAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { availabilityStatus } = req.body;

    // Check authorization
    if (req.user?.role !== 'Admin' && req.user?.role !== 'Donor') {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    // Validate availability status
    if (!['Available', 'Unavailable'].includes(availabilityStatus)) {
      res.status(400).json({
        success: false,
        message: 'Availability status must be Available or Unavailable',
      });
      return;
    }

    const donor = await Donor.findById(id);
    if (!donor) {
      res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
      return;
    }

    donor.availabilityStatus = availabilityStatus;
    await donor.save();
    logger.info(`Donor availability updated: ${id} - ${availabilityStatus}`);

    res.status(200).json({
      success: true,
      message: 'Donor availability updated successfully',
      data: donor,
    });
  } catch (error) {
    logger.error('Update donor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update donor availability',
    });
  }
};

// Delete donor
export const deleteDonor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check authorization
    if (req.user?.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete donors',
      });
      return;
    }

    const donor = await Donor.findByIdAndDelete(id);
    if (!donor) {
      res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
      return;
    }

    logger.info(`Donor deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully',
      data: donor,
    });
  } catch (error) {
    logger.error('Delete donor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete donor',
    });
  }
};
