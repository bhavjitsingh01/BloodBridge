import { Request, Response } from 'express';
import { PredictionService } from '../services/prediction.service';
import { sendSuccess } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';

export const predictionController = {
  /**
   * Get blood shortage predictions
   */
  getShortageWarnings: asyncHandler(async (req: Request, res: Response) => {
    const warnings = await PredictionService.getShortageWarnings();
    sendSuccess(res, warnings, 'Blood shortage predictions retrieved successfully');
  }),

  /**
   * Forecast demand
   */
  forecastDemand: asyncHandler(async (req: Request, res: Response) => {
    const { bloodGroup = 'O+', timeframe = 'next-7-days' } = req.query;
    const forecast = await PredictionService.forecastDemand({
      bloodGroup: bloodGroup as any,
      timeframe: timeframe as any,
    });
    sendSuccess(res, forecast, 'Demand forecast retrieved successfully');
  }),

  /**
   * Predict shortage
   */
  predictShortage: asyncHandler(async (req: Request, res: Response) => {
    const { bloodGroup = 'O+', facilityId, timeframe = 'next-7-days' } = req.query;
    const prediction = await PredictionService.predictShortage({
      bloodGroup: bloodGroup as any,
      facilityId: facilityId as string,
      timeframe: timeframe as any,
    });
    sendSuccess(res, prediction, 'Shortage prediction retrieved successfully');
  }),

  /**
   * Get facility forecast
   */
  getFacilityForecast: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId } = req.params;
    const forecast = await PredictionService.getFacilityForecast(facilityId);
    sendSuccess(res, forecast, 'Facility forecast retrieved successfully');
  }),

  /**
   * Get redistribution recommendations
   */
  getRedistributionRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const recommendations = await PredictionService.getRedistributionRecommendations();
    sendSuccess(res, recommendations, 'Redistribution recommendations retrieved successfully');
  }),

  /**
   * Get expiry risk analysis
   */
  getExpiryRiskAnalysis: asyncHandler(async (req: Request, res: Response) => {
    const analysis = await PredictionService.getExpiryRiskAnalysis();
    sendSuccess(res, analysis, 'Expiry risk analysis retrieved successfully');
  }),

  /**
   * Get prediction accuracy
   */
  getPredictionAccuracy: asyncHandler(async (req: Request, res: Response) => {
    const accuracy = await PredictionService.getPredictionAccuracy();
    sendSuccess(res, accuracy, 'Prediction accuracy metrics retrieved successfully');
  }),
};
