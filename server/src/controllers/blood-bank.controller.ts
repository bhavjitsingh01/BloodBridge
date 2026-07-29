import { Request, Response } from 'express';
import { z } from 'zod';
import { BloodBankService } from '../services/blood-bank.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';

const createBloodBankSchema = z.object({
  name: z.string().min(2),
  licenseNumber: z.string(),
  email: z.string().email(),
  phone: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
  }),
  registrationNumber: z.string(),
});

const updateBloodBankSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: createBloodBankSchema.shape.address.optional(),
});

const paginationSchema = z.object({
  page: z.string().optional().transform((val) => Math.max(parseInt(val || DEFAULT_PAGE.toString()), 1)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || DEFAULT_LIMIT.toString()), MAX_LIMIT)),
});

export const bloodBankController = {
  /**
   * Create blood bank
   */
  createBloodBank: asyncHandler(async (req: Request, res: Response) => {
    const validated = await createBloodBankSchema.parseAsync(req.body);
    const bank = await BloodBankService.createBloodBank({
      ...validated,
      adminUserId: req.user!.id,
    });
    sendCreated(res, bank, 'Blood bank created successfully');
  }),

  /**
   * Get all blood banks
   */
  getAllBloodBanks: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = await paginationSchema.parseAsync(req.query);
    const skip = (page - 1) * limit;

    const { banks, total } = await BloodBankService.getAllBloodBanks(skip, limit);
    sendPaginated(res, banks, total, page, limit, 'Blood banks retrieved successfully');
  }),

  /**
   * Get blood bank by ID
   */
  getBloodBankById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const bank = await BloodBankService.getBloodBankById(id);
    sendSuccess(res, bank, 'Blood bank retrieved successfully');
  }),

  /**
   * Update blood bank
   */
  updateBloodBank: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = await updateBloodBankSchema.parseAsync(req.body);
    const bank = await BloodBankService.updateBloodBank(id, validated);
    sendSuccess(res, bank, 'Blood bank updated successfully');
  }),

  /**
   * Verify blood bank
   */
  verifyBloodBank: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const bank = await BloodBankService.verifyBloodBank(id);
    sendSuccess(res, bank, 'Blood bank verified successfully');
  }),

  /**
   * Find nearby blood banks
   */
  findNearbyBloodBanks: asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, maxDistance } = req.query;

    const banks = await BloodBankService.findNearbyBloodBanks(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      maxDistance ? parseInt(maxDistance as string) : undefined
    );

    sendSuccess(res, banks, 'Nearby blood banks retrieved successfully');
  }),

  /**
   * Get expiring blood
   */
  getExpiringBlood: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const expiring = await BloodBankService.getExpiringBlood(id);
    sendSuccess(res, expiring, 'Expiring blood retrieved successfully');
  }),

  /**
   * Delete blood bank
   */
  deleteBloodBank: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await BloodBankService.deleteBloodBank(id);
    sendSuccess(res, null, 'Blood bank deleted successfully');
  }),
};
