import { Request, Response } from 'express';
import { z } from 'zod';
import { DonorService } from '../services/donor.service';
import { sendSuccess, sendCreated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { BLOOD_GROUPS, BloodGroup } from '../config/constants';

const createDonorSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  medicalHistory: z.object({
    hasChronicDisease: z.boolean(),
    diseaseDetails: z.string().optional(),
    hemoglobin: z.number().min(0),
    bloodPressure: z.string().optional(),
  }),
});

const updateDonorSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]).optional(),
  medicalHistory: z.any().optional(),
  availabilityStatus: z.enum(['available', 'busy', 'not-available']).optional(),
});

export const donorController = {
  /**
   * Register donor
   */
  registerDonor: asyncHandler(async (req: Request, res: Response) => {
    const validated = await createDonorSchema.parseAsync(req.body);
    const donor = await DonorService.registerDonor({
      userId: req.user!.id,
      bloodGroup: validated.bloodGroup as BloodGroup,
      medicalHistory: validated.medicalHistory,
    });
    sendCreated(res, donor, 'Donor registered successfully');
  }),

  /**
   * Get donor profile
   */
  getDonorProfile: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const donor = await DonorService.getDonorProfile(id);
    sendSuccess(res, donor, 'Donor profile retrieved successfully');
  }),

  /**
   * Get current donor profile
   */
  getCurrentDonorProfile: asyncHandler(async (req: Request, res: Response) => {
    const donor = await DonorService.getDonorByUserId(req.user!.id);
    sendSuccess(res, donor, 'Donor profile retrieved successfully');
  }),

  /**
   * Update donor profile
   */
  updateDonorProfile: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = await updateDonorSchema.parseAsync(req.body);
    const donor = await DonorService.updateDonorProfile(id, {
      ...validated,
      bloodGroup: validated.bloodGroup ? (validated.bloodGroup as BloodGroup) : undefined,
    });
    sendSuccess(res, donor, 'Donor profile updated successfully');
  }),

  /**
   * Check donor eligibility
   */
  checkEligibility: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const eligibility = await DonorService.checkEligibility(id);
    sendSuccess(res, eligibility, 'Eligibility check completed');
  }),

  /**
   * Update availability status
   */
  updateAvailabilityStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const donor = await DonorService.updateAvailabilityStatus(
      id,
      status as 'available' | 'busy' | 'not-available'
    );
    sendSuccess(res, donor, 'Availability status updated successfully');
  }),

  /**
   * Get donation history
   */
  getDonationHistory: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const history = await DonorService.getDonationHistory(id, skip, parseInt(limit as string));

    sendSuccess(res, history, 'Donation history retrieved successfully');
  }),

  /**
   * Get eligible donors for blood group
   */
  getEligibleDonorsForBloodGroup: asyncHandler(async (req: Request, res: Response) => {
    const { bloodGroup } = req.params;
    const donors = await DonorService.getEligibleDonorsForBloodGroup(bloodGroup as any);
    sendSuccess(res, donors, 'Eligible donors retrieved successfully');
  }),
};
