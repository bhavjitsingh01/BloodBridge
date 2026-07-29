import { Request, Response } from 'express';
import { HospitalService } from '../services/hospital.service';
import { BloodBankService } from '../services/blood-bank.service';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';

export const adminController = {
  /**
   * Get all hospitals pending verification
   */
  getPendingHospitals: asyncHandler(async (req: Request, res: Response) => {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

    const skip = (parseInt(page as any) - 1) * parseInt(limit as any);
    const { hospitals, total } = await HospitalService.getAllHospitals(skip, Math.min(parseInt(limit as any), MAX_LIMIT));

    const pending = hospitals.filter((h) => !h.verified);
    sendSuccess(
      res,
      { hospitals: pending, total: pending.length },
      'Pending hospitals retrieved successfully'
    );
  }),

  /**
   * Get all blood banks pending verification
   */
  getPendingBloodBanks: asyncHandler(async (req: Request, res: Response) => {
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = req.query;

    const skip = (parseInt(page as any) - 1) * parseInt(limit as any);
    const { banks, total } = await BloodBankService.getAllBloodBanks(skip, Math.min(parseInt(limit as any), MAX_LIMIT));

    const pending = banks.filter((b) => !b.verified);
    sendSuccess(
      res,
      { banks: pending, total: pending.length },
      'Pending blood banks retrieved successfully'
    );
  }),

  /**
   * Verify hospital
   */
  verifyHospital: asyncHandler(async (req: Request, res: Response) => {
    const { hospitalId } = req.params;
    const hospital = await HospitalService.verifyHospital(hospitalId);
    sendSuccess(res, hospital, 'Hospital verified successfully');
  }),

  /**
   * Verify blood bank
   */
  verifyBloodBank: asyncHandler(async (req: Request, res: Response) => {
    const { bankId } = req.params;
    const bank = await BloodBankService.verifyBloodBank(bankId);
    sendSuccess(res, bank, 'Blood bank verified successfully');
  }),

  /**
   * Reject hospital verification
   */
  rejectHospital: asyncHandler(async (req: Request, res: Response) => {
    const { hospitalId } = req.params;
    await HospitalService.deleteHospital(hospitalId);
    sendSuccess(res, null, 'Hospital rejected and deleted');
  }),

  /**
   * Reject blood bank verification
   */
  rejectBloodBank: asyncHandler(async (req: Request, res: Response) => {
    const { bankId } = req.params;
    await BloodBankService.deleteBloodBank(bankId);
    sendSuccess(res, null, 'Blood bank rejected and deleted');
  }),

  /**
   * Get system analytics
   */
  getSystemAnalytics: asyncHandler(async (req: Request, res: Response) => {
    const stats = await AnalyticsService.getDashboardStats();
    sendSuccess(res, stats, 'System analytics retrieved successfully');
  }),
};
