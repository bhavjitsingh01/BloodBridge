import { Request, Response } from 'express';
import { z } from 'zod';
import { HospitalService } from '../services/hospital.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';

const createHospitalSchema = z.object({
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
  operatingHours: z
    .object({
      open: z.string(),
      close: z.string(),
      daysOpen: z.array(z.number()),
    })
    .optional(),
});

const updateHospitalSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: createHospitalSchema.shape.address.optional(),
  operatingHours: createHospitalSchema.shape.operatingHours.optional(),
});

const paginationSchema = z.object({
  page: z.string().optional().transform((val) => Math.max(parseInt(val || DEFAULT_PAGE.toString()), 1)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || DEFAULT_LIMIT.toString()), MAX_LIMIT)),
});

export const hospitalController = {
  /**
   * Create hospital
   */
  createHospital: asyncHandler(async (req: Request, res: Response) => {
    const validated = await createHospitalSchema.parseAsync(req.body);
    const hospital = await HospitalService.createHospital({
      ...validated,
      adminUserId: req.user!.id,
    });
    sendCreated(res, hospital, 'Hospital created successfully');
  }),

  /**
   * Get all hospitals
   */
  getAllHospitals: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = await paginationSchema.parseAsync(req.query);
    const skip = (page - 1) * limit;

    const { hospitals, total } = await HospitalService.getAllHospitals(skip, limit);
    sendPaginated(res, hospitals, total, page, limit, 'Hospitals retrieved successfully');
  }),

  /**
   * Get hospital by ID
   */
  getHospitalById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const hospital = await HospitalService.getHospitalById(id);
    sendSuccess(res, hospital, 'Hospital retrieved successfully');
  }),

  /**
   * Update hospital
   */
  updateHospital: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = await updateHospitalSchema.parseAsync(req.body);
    const hospital = await HospitalService.updateHospital(id, validated);
    sendSuccess(res, hospital, 'Hospital updated successfully');
  }),

  /**
   * Verify hospital (Admin only)
   */
  verifyHospital: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const hospital = await HospitalService.verifyHospital(id);
    sendSuccess(res, hospital, 'Hospital verified successfully');
  }),

  /**
   * Find nearby hospitals
   */
  findNearbyHospitals: asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, maxDistance } = req.query;

    const facilities = await HospitalService.findNearbyFacilities(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      maxDistance ? parseInt(maxDistance as string) : undefined
    );

    sendSuccess(res, facilities, 'Nearby hospitals retrieved successfully');
  }),

  /**
   * Get hospital inventory
   */
  getHospitalInventory: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const inventory = await HospitalService.getHospitalInventory(id);
    sendSuccess(res, inventory, 'Hospital inventory retrieved successfully');
  }),

  /**
   * Delete hospital
   */
  deleteHospital: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await HospitalService.deleteHospital(id);
    sendSuccess(res, null, 'Hospital deleted successfully');
  }),
};
