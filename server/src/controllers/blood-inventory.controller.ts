import { Request, Response } from 'express';
import BloodInventory from '../models/BloodInventory';
import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import { getSocketService } from '../services/socket.service';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Create blood inventory
export const createInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Hospital, BloodBank, and Admin roles can create
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { hospitalId, bloodGroup, units, collectionDate, expiryDate } = req.body;

    // Validate required fields
    if (!hospitalId || !bloodGroup || units === undefined || !expiryDate) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Validate units
    if (units < 0) {
      res.status(400).json({
        success: false,
        message: 'Units cannot be negative',
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

    // Validate hospital exists
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      res.status(404).json({
        success: false,
        message: 'Hospital not found',
      });
      return;
    }

    // Validate dates
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future',
      });
      return;
    }

    const inventory = new BloodInventory({
      hospitalId,
      bloodGroup,
      units,
      collectionDate: collectionDate || new Date(),
      expiryDate: expiry,
      status: 'Available',
    });

    await inventory.save();
    logger.info(`Blood inventory created: ${bloodGroup} - ${units} units`);

    // Emit socket event for inventory update
    try {
      const socketService = getSocketService();
      socketService.emitBloodInventoryUpdated(
        hospitalId,
        'Hospital',
        bloodGroup,
        units,
        hospital.city,
        hospital.state
      );
    } catch (socketError) {
      logger.error('Error emitting socket event:', socketError);
    }

    res.status(201).json({
      success: true,
      message: 'Blood inventory created successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Create inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blood inventory',
    });
  }
};

// Get all inventory with pagination and filters
export const getInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, bloodGroup, status, hospitalId, search } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    // Build filter
    const filter: any = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup as string;
    if (status) filter.status = status as string;
    if (hospitalId) filter.hospitalId = hospitalId as string;

    // Check expiry status and update if needed
    const now = new Date();
    await BloodInventory.updateMany(
      { expiryDate: { $lt: now }, status: { $ne: 'Expired' } },
      { status: 'Expired', lastUpdated: now }
    );

    const total = await BloodInventory.countDocuments(filter);
    const inventory = await BloodInventory.find(filter)
      .populate('hospitalId', 'name city state')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Blood inventory retrieved successfully',
      data: inventory,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve blood inventory',
    });
  }
};

// Get inventory by ID
export const getInventoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const inventory = await BloodInventory.findById(id).populate('hospitalId', 'name city state');
    if (!inventory) {
      res.status(404).json({
        success: false,
        message: 'Inventory record not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Inventory retrieved successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Get inventory by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory',
    });
  }
};

// Update inventory
export const updateInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { units, status, expiryDate } = req.body;

    // Check authorization
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const inventory = await BloodInventory.findById(id);
    if (!inventory) {
      res.status(404).json({
        success: false,
        message: 'Inventory record not found',
      });
      return;
    }

    // Update fields
    if (units !== undefined) {
      if (units < 0) {
        res.status(400).json({
          success: false,
          message: 'Units cannot be negative',
        });
        return;
      }
      inventory.units = units;
    }

    if (status) {
      if (!['Available', 'Reserved', 'Expired'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status must be Available, Reserved, or Expired',
        });
        return;
      }
      inventory.status = status;
    }

    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future',
        });
        return;
      }
      inventory.expiryDate = expiry;
    }

    inventory.lastUpdated = new Date();
    await inventory.save();
    logger.info(`Inventory updated: ${id}`);

    // Emit socket events for inventory update
    try {
      const socketService = getSocketService();
      const location = await Hospital.findById(inventory.hospitalId);

      if (location) {
        socketService.emitBloodInventoryUpdated(
          inventory.hospitalId.toString(),
          'Hospital',
          inventory.bloodGroup,
          inventory.units,
          location.city,
          location.state
        );

        // Check if inventory is running low
        const minimumRequired = 20; // Configurable threshold
        if (inventory.units < minimumRequired && inventory.units > 0) {
          socketService.emitBloodInventoryLow(
            inventory.hospitalId.toString(),
            'Hospital',
            inventory.bloodGroup,
            inventory.units,
            minimumRequired,
            location.city,
            location.state
          );
        }
      }
    } catch (socketError) {
      logger.error('Error emitting socket event:', socketError);
    }

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update inventory',
    });
  }
};

// Get expiring blood units (within 7 days)
export const getExpiringInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const filter = {
      expiryDate: { $gte: now, $lte: sevenDaysLater },
      status: { $ne: 'Expired' },
    };

    const total = await BloodInventory.countDocuments(filter);
    const expiringInventory = await BloodInventory.find(filter)
      .populate('hospitalId', 'name city state')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ expiryDate: 1 });

    res.status(200).json({
      success: true,
      message: 'Expiring blood units retrieved successfully',
      data: expiringInventory,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get expiring inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expiring inventory',
    });
  }
};

// Get inventory summary grouped by blood group
export const getInventorySummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const summary = await BloodInventory.aggregate([
      {
        $match: { status: 'Available' },
      },
      {
        $group: {
          _id: '$bloodGroup',
          totalUnits: { $sum: '$units' },
          recordCount: { $sum: 1 },
          lastUpdated: { $max: '$lastUpdated' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const totalUnits = summary.reduce((sum, item) => sum + item.totalUnits, 0);

    res.status(200).json({
      success: true,
      message: 'Inventory summary retrieved successfully',
      data: {
        summary,
        totalUnits,
        bloodGroupCount: summary.length,
      },
    });
  } catch (error) {
    logger.error('Get inventory summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inventory summary',
    });
  }
};

// Delete inventory
export const deleteInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check authorization
    if (req.user?.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete inventory records',
      });
      return;
    }

    const inventory = await BloodInventory.findByIdAndDelete(id);
    if (!inventory) {
      res.status(404).json({
        success: false,
        message: 'Inventory record not found',
      });
      return;
    }

    logger.info(`Inventory deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Inventory deleted successfully',
      data: inventory,
    });
  } catch (error) {
    logger.error('Delete inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete inventory',
    });
  }
};
