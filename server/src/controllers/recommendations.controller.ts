import { Request, Response } from 'express';
import recommendationService from '../services/recommendation.service';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Get transfer recommendations
export const getTransferRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin, Hospital, and BloodBank roles can access recommendations
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { hospitalId } = req.query;

    const recommendations = await recommendationService.recommendTransfers(hospitalId as string);

    logger.info(`Transfer recommendations generated: ${recommendations.recommendations.length} recommendations`);

    res.status(200).json({
      success: true,
      message: 'Transfer recommendations retrieved successfully',
      data: recommendations,
    });
  } catch (error) {
    logger.error('Get transfer recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transfer recommendations',
    });
  }
};

// Get donor recommendations for emergency
export const getDonorRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin, Hospital, and BloodBank roles can access recommendations
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { emergencyRequestId, bloodGroup, unitsRequired, latitude, longitude } = req.query;

    // Validate required fields
    if (!emergencyRequestId || !bloodGroup || !latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Emergency request ID, blood group, latitude, and longitude are required',
      });
      return;
    }

    const coordinates: [number, number] = [parseFloat(longitude as string), parseFloat(latitude as string)];

    const recommendations = await recommendationService.recommendDonorsForEmergency(
      emergencyRequestId as string,
      bloodGroup as string,
      parseInt(unitsRequired as string) || 1,
      coordinates
    );

    logger.info(`Donor recommendations generated: ${recommendations.recommendations.length} donors found`);

    res.status(200).json({
      success: true,
      message: 'Donor recommendations retrieved successfully',
      data: recommendations,
    });
  } catch (error) {
    logger.error('Get donor recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve donor recommendations',
    });
  }
};
