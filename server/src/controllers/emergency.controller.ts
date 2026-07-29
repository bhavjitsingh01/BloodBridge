import { Request, Response } from 'express';
import EmergencyRequest from '../models/EmergencyRequest';
import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import matchingService from '../services/matching.service';
import notificationService from '../services/notification.service';
import { getSocketService } from '../services/socket.service';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Create emergency request
export const createEmergencyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Hospital and BloodBank roles can create emergency requests
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { requesterId, requesterType, bloodGroup, unitsRequired, priority, requiredBefore } = req.body;

    // Validate required fields
    if (!requesterId || !requesterType || !bloodGroup || !unitsRequired || !requiredBefore) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
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

    // Validate priority
    if (!['Normal', 'High', 'Critical'].includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Priority must be Normal, High, or Critical',
      });
      return;
    }

    // Validate requester type
    if (!['Hospital', 'BloodBank'].includes(requesterType)) {
      res.status(400).json({
        success: false,
        message: 'Requester type must be Hospital or BloodBank',
      });
      return;
    }

    // Validate units
    if (unitsRequired < 1) {
      res.status(400).json({
        success: false,
        message: 'Units required must be at least 1',
      });
      return;
    }

    // Validate requiredBefore date
    const requiredDate = new Date(requiredBefore);
    if (requiredDate <= new Date()) {
      res.status(400).json({
        success: false,
        message: 'Required before date must be in the future',
      });
      return;
    }

    // Verify requester exists
    let requester;
    if (requesterType === 'Hospital') {
      requester = await Hospital.findById(requesterId);
      if (!requester) {
        res.status(404).json({
          success: false,
          message: 'Hospital not found',
        });
        return;
      }
    } else {
      requester = await BloodBank.findById(requesterId);
      if (!requester) {
        res.status(404).json({
          success: false,
          message: 'Blood bank not found',
        });
        return;
      }
    }

    // Create emergency request
    const emergencyRequest = new EmergencyRequest({
      requesterId,
      requesterType,
      bloodGroup,
      unitsRequired,
      priority,
      requiredBefore: requiredDate,
      status: 'Pending',
    });

    await emergencyRequest.save();
    logger.info(`Emergency request created: ${bloodGroup} - ${unitsRequired} units - Priority: ${priority}`);

    // Emit socket event for emergency request created
    try {
      const socketService = getSocketService();
      socketService.emitEmergencyRequestCreated(
        bloodGroup,
        unitsRequired,
        priority,
        requester.city,
        requester.state,
        requester.name,
        emergencyRequest._id.toString()
      );

      // Notify eligible donors
      await notificationService.notifyDonorsForEmergency(
        emergencyRequest._id.toString(),
        bloodGroup,
        unitsRequired,
        requester.location.coordinates,
        priority
      );
    } catch (socketError) {
      logger.error('Error emitting socket event:', socketError);
    }

    res.status(201).json({
      success: true,
      message: 'Emergency request created successfully',
      data: emergencyRequest,
    });
  } catch (error) {
    logger.error('Create emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency request',
    });
  }
};

// Get all emergency requests
export const getEmergencyRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, priority, bloodGroup } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;

    const filter: any = {};
    if (status) filter.status = status as string;
    if (priority) filter.priority = priority as string;
    if (bloodGroup) filter.bloodGroup = bloodGroup as string;

    const total = await EmergencyRequest.countDocuments(filter);
    const requests = await EmergencyRequest.find(filter)
      .populate('requesterId', 'name email phone city')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Emergency requests retrieved successfully',
      data: requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Get emergency requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emergency requests',
    });
  }
};

// Get emergency request by ID
export const getEmergencyRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const emergencyRequest = await EmergencyRequest.findById(id).populate(
      'requesterId',
      'name email phone city'
    );

    if (!emergencyRequest) {
      res.status(404).json({
        success: false,
        message: 'Emergency request not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Emergency request retrieved successfully',
      data: emergencyRequest,
    });
  } catch (error) {
    logger.error('Get emergency request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve emergency request',
    });
  }
};

// Update emergency request status
export const updateEmergencyStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required',
      });
      return;
    }

    if (!['Pending', 'Accepted', 'Completed', 'Cancelled'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const emergencyRequest = await EmergencyRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate('requesterId', 'name email city state');

    if (!emergencyRequest) {
      res.status(404).json({
        success: false,
        message: 'Emergency request not found',
      });
      return;
    }

    logger.info(`Emergency request status updated: ${id} - Status: ${status}`);

    // Emit socket events based on status change
    try {
      const socketService = getSocketService();
      if (status === 'Accepted') {
        const requester: any = emergencyRequest.requesterId;
        socketService.emitEmergencyRequestAccepted(
          emergencyRequest._id.toString(),
          requester.name
        );
      } else if (status === 'Completed') {
        socketService.emitEmergencyRequestCompleted(
          emergencyRequest._id.toString(),
          {
            bloodGroup: emergencyRequest.bloodGroup,
            unitsRequired: emergencyRequest.unitsRequired,
            completedAt: new Date(),
          }
        );
      }
    } catch (socketError) {
      logger.error('Error emitting socket event:', socketError);
    }

    res.status(200).json({
      success: true,
      message: 'Emergency request status updated successfully',
      data: emergencyRequest,
    });
  } catch (error) {
    logger.error('Update emergency status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update emergency request status',
    });
  }
};

// Delete emergency request
export const deleteEmergencyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Only admins can delete
    if (req.user?.role !== 'Admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete emergency requests',
      });
      return;
    }

    const emergencyRequest = await EmergencyRequest.findByIdAndDelete(id);

    if (!emergencyRequest) {
      res.status(404).json({
        success: false,
        message: 'Emergency request not found',
      });
      return;
    }

    logger.info(`Emergency request deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Emergency request deleted successfully',
      data: emergencyRequest,
    });
  } catch (error) {
    logger.error('Delete emergency request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency request',
    });
  }
};

// Execute emergency matching
export const executeEmergencyMatching = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { requestId } = req.params;

    // Get emergency request
    const emergencyRequest = await EmergencyRequest.findById(requestId);
    if (!emergencyRequest) {
      res.status(404).json({
        success: false,
        message: 'Emergency request not found',
      });
      return;
    }

    // Get requester location
    let requester;
    if (emergencyRequest.requesterType === 'Hospital') {
      requester = await Hospital.findById(emergencyRequest.requesterId);
    } else {
      requester = await BloodBank.findById(emergencyRequest.requesterId);
    }

    if (!requester) {
      res.status(404).json({
        success: false,
        message: 'Requester not found',
      });
      return;
    }

    // Execute matching engine
    const matches = await matchingService.findMatches(
      emergencyRequest.requesterId.toString(),
      emergencyRequest.bloodGroup,
      emergencyRequest.unitsRequired,
      emergencyRequest.priority,
      requester.location
    );

    logger.info(`Emergency matching executed for request ${requestId}`);

    res.status(200).json({
      success: true,
      message: 'Emergency matching completed successfully',
      data: {
        emergencyRequest,
        matches,
      },
    });
  } catch (error) {
    logger.error('Execute emergency matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute emergency matching',
    });
  }
};
