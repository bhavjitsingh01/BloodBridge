import { Request, Response } from 'express';
import predictionService from '../services/prediction.service';
import shortageService from '../services/shortage.service';
import expiryService from '../services/expiry.service';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Predict blood demand
export const predictDemand = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin and Hospital/BloodBank roles can access predictions
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { timeframe = '30days' } = req.body;

    // Validate timeframe
    if (!['7days', '30days', '90days'].includes(timeframe)) {
      res.status(400).json({
        success: false,
        message: 'Timeframe must be 7days, 30days, or 90days',
      });
      return;
    }

    const predictions = await predictionService.predictDemand(timeframe);

    logger.info(`Demand prediction generated for timeframe: ${timeframe}`);

    res.status(200).json({
      success: true,
      message: 'Demand prediction generated successfully',
      data: predictions,
    });
  } catch (error) {
    logger.error('Predict demand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate demand prediction',
    });
  }
};

// Get all predictions
export const getPredictions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin and Hospital/BloodBank roles can access predictions
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { timeframe = '30days' } = req.query;

    // Validate timeframe
    if (!['7days', '30days', '90days'].includes(timeframe as string)) {
      res.status(400).json({
        success: false,
        message: 'Timeframe must be 7days, 30days, or 90days',
      });
      return;
    }

    const predictions = await predictionService.predictDemand(timeframe as '7days' | '30days' | '90days');

    // Filter by risk level if provided
    const { riskLevel } = req.query;
    let filteredPredictions = predictions.predictions;

    if (riskLevel) {
      filteredPredictions = filteredPredictions.filter((p) => p.riskLevel === riskLevel);
    }

    res.status(200).json({
      success: true,
      message: 'Predictions retrieved successfully',
      data: {
        ...predictions,
        predictions: filteredPredictions,
      },
    });
  } catch (error) {
    logger.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve predictions',
    });
  }
};

// Detect shortages
export const detectShortages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin and Hospital/BloodBank roles can access shortage data
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const shortages = await shortageService.detectShortages();

    logger.info(`Shortage detection completed: ${shortages.shortageLocations.length} locations with shortages`);

    res.status(200).json({
      success: true,
      message: 'Shortage detection completed successfully',
      data: shortages,
    });
  } catch (error) {
    logger.error('Detect shortages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect shortages',
    });
  }
};

// Get expiry risks
export const getExpiryRisks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin and Hospital/BloodBank roles can access expiry data
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const { window } = req.query;

    const expiryRisks = await expiryService.detectExpiryRisks();

    let response = expiryRisks;

    // Filter by specific window if provided
    if (window === '3days') {
      response = {
        ...expiryRisks,
        expiryWindows: {
          threeDays: expiryRisks.expiryWindows.threeDays,
          sevenDays: { window: '7days', count: 0, totalUnits: 0, items: [], estimatedWaste: 0, recommendedActions: [] },
          fourteenDays: { window: '14days', count: 0, totalUnits: 0, items: [], estimatedWaste: 0, recommendedActions: [] },
        },
      };
    } else if (window === '7days') {
      response = {
        ...expiryRisks,
        expiryWindows: {
          threeDays: { window: '3days', count: 0, totalUnits: 0, items: [], estimatedWaste: 0, recommendedActions: [] },
          sevenDays: expiryRisks.expiryWindows.sevenDays,
          fourteenDays: { window: '14days', count: 0, totalUnits: 0, items: [], estimatedWaste: 0, recommendedActions: [] },
        },
      };
    } else if (window === '14days') {
      response = {
        ...expiryRisks,
        expiryWindows: {
          threeDays: { window: '3days', count: 0, totalUnits: 0, items: [], estimatedWaste: 0, recommendedActions: [] },
          sevenDays: { window: '7days', count: 0, totalUnits: 0, items: [], estimatedWaste: 0, recommendedActions: [] },
          fourteenDays: expiryRisks.expiryWindows.fourteenDays,
        },
      };
    }

    logger.info(`Expiry risk detection completed: ${expiryRisks.summary.totalAtRisk} items at risk`);

    res.status(200).json({
      success: true,
      message: 'Expiry risk detection completed successfully',
      data: response,
    });
  } catch (error) {
    logger.error('Get expiry risks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect expiry risks',
    });
  }
};

// Get comprehensive AI dashboard
export const getAIDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only Admin and Hospital/BloodBank roles can access AI dashboard
    if (!['Admin', 'Hospital', 'BloodBank'].includes(req.user?.role || '')) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    const [predictions, shortages, expiryRisks] = await Promise.all([
      predictionService.predictDemand('30days'),
      shortageService.detectShortages(),
      expiryService.detectExpiryRisks(),
    ]);

    // Calculate critical metrics
    const criticalPredictions = predictions.predictions.filter((p) => p.riskLevel === 'Critical').length;
    const criticalShortages = shortages.shortageLocations.filter((s) =>
      s.shortages.some((sh) => sh.riskLevel === 'Critical')
    ).length;

    res.status(200).json({
      success: true,
      message: 'AI Dashboard retrieved successfully',
      data: {
        predictions: {
          ...predictions,
          criticalCount: criticalPredictions,
        },
        shortages: {
          ...shortages,
          criticalCount: criticalShortages,
        },
        expiryRisks: {
          ...expiryRisks,
          criticalCount: expiryRisks.summary.criticalItems,
        },
        overallRiskLevel: calculateOverallRiskLevel(
          criticalPredictions,
          criticalShortages,
          expiryRisks.summary.criticalItems
        ),
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    logger.error('Get AI dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI dashboard',
    });
  }
};

function calculateOverallRiskLevel(criticalPredictions: number, criticalShortages: number, criticalExpiry: number): string {
  const totalCritical = criticalPredictions + criticalShortages + criticalExpiry;

  if (totalCritical >= 5) return 'Critical';
  if (totalCritical >= 3) return 'High';
  if (totalCritical >= 1) return 'Medium';
  return 'Low';
}
