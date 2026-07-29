import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';

export const analyticsController = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: asyncHandler(async (req: Request, res: Response) => {
    const stats = await AnalyticsService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
  }),

  /**
   * Get blood supply map
   */
  getBloodSupplyMap: asyncHandler(async (req: Request, res: Response) => {
    const supplyMap = await AnalyticsService.getBloodSupplyMap();
    sendSuccess(res, supplyMap, 'Blood supply map retrieved successfully');
  }),

  /**
   * Get blood demand map
   */
  getBloodDemandMap: asyncHandler(async (req: Request, res: Response) => {
    const demandMap = await AnalyticsService.getBloodDemandMap();
    sendSuccess(res, demandMap, 'Blood demand map retrieved successfully');
  }),

  /**
   * Get hospital analytics
   */
  getHospitalAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const { hospitalId } = req.params;
    const analytics = await AnalyticsService.getHospitalAnalytics(hospitalId);
    sendSuccess(res, analytics, 'Hospital analytics retrieved successfully');
  }),

  /**
   * Get blood bank analytics
   */
  getBloodBankAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const { bankId } = req.params;
    const analytics = await AnalyticsService.getBloodBankAnalytics(bankId);
    sendSuccess(res, analytics, 'Blood bank analytics retrieved successfully');
  }),

  /**
   * Get donation trends
   */
  getDonationTrends: asyncHandler(async (req: Request, res: Response) => {
    const trends = await AnalyticsService.getDonationTrends();
    sendSuccess(res, trends, 'Donation trends retrieved successfully');
  }),

  /**
   * Get expiry statistics
   */
  getExpiryStatistics: asyncHandler(async (req: Request, res: Response) => {
    const stats = await AnalyticsService.getExpiryStatistics();
    sendSuccess(res, stats, 'Expiry statistics retrieved successfully');
  }),

  /**
   * Get transfer history trends
   */
  getTransferHistoryTrends: asyncHandler(async (req: Request, res: Response) => {
    const trends = await AnalyticsService.getTransferHistoryTrends();
    sendSuccess(res, trends, 'Transfer history trends retrieved successfully');
  }),
};
