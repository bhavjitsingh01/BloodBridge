import { Request, Response } from 'express';
import { z } from 'zod';
import { BloodRequestService } from '../services/blood-request.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { BLOOD_GROUPS, PRIORITY_LEVELS, DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../config/constants';

const createRequestSchema = z.object({
  requestingFacilityId: z.string(),
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  unitsRequired: z.number().min(1),
  priority: z.enum(PRIORITY_LEVELS as unknown as [string, ...string[]]),
  requestReason: z.string(),
  patientInfo: z.object({
    age: z.number(),
    bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
    condition: z.string(),
  }),
  requiredBy: z.string().transform((val) => new Date(val)),
});

const updateRequestSchema = z.object({
  status: z.string().optional(),
  unitsReceived: z.number().optional(),
  sourceHospital: z.string().optional(),
});

const paginationSchema = z.object({
  page: z.string().optional().transform((val) => Math.max(parseInt(val || DEFAULT_PAGE.toString()), 1)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || DEFAULT_LIMIT.toString()), MAX_LIMIT)),
});

export const bloodRequestController = {
  /**
   * Create blood request
   */
  createRequest: asyncHandler(async (req: Request, res: Response) => {
    const validated = await createRequestSchema.parseAsync(req.body);
    const request = await BloodRequestService.createRequest(validated);
    sendCreated(res, request, 'Blood request created successfully');
  }),

  /**
   * Get request by ID
   */
  getRequestById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await BloodRequestService.getRequestById(id);
    sendSuccess(res, request, 'Blood request retrieved successfully');
  }),

  /**
   * Get facility requests
   */
  getFacilityRequests: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId } = req.params;
    const { page, limit } = await paginationSchema.parseAsync(req.query);
    const skip = (page - 1) * limit;

    const { requests, total } = await BloodRequestService.getFacilityRequests(
      facilityId,
      skip,
      limit
    );
    sendPaginated(res, requests, total, page, limit, 'Facility requests retrieved successfully');
  }),

  /**
   * Get pending requests
   */
  getPendingRequests: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = await paginationSchema.parseAsync(req.query);
    const skip = (page - 1) * limit;

    const { requests, total } = await BloodRequestService.getPendingRequests(skip, limit);
    sendPaginated(res, requests, total, page, limit, 'Pending requests retrieved successfully');
  }),

  /**
   * Update request
   */
  updateRequest: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = await updateRequestSchema.parseAsync(req.body);
    const request = await BloodRequestService.updateRequest(id, validated);
    sendSuccess(res, request, 'Blood request updated successfully');
  }),

  /**
   * Fulfill request
   */
  fulfillRequest: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { sourceHospitalId, unitsReceived } = req.body;

    const request = await BloodRequestService.fulfillRequest(
      id,
      sourceHospitalId,
      unitsReceived
    );
    sendSuccess(res, request, 'Blood request fulfilled successfully');
  }),

  /**
   * Reject request
   */
  rejectRequest: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await BloodRequestService.rejectRequest(id);
    sendSuccess(res, request, 'Blood request rejected successfully');
  }),

  /**
   * Find requests for available blood
   */
  findRequestsForBlood: asyncHandler(async (req: Request, res: Response) => {
    const { bloodGroup } = req.params;
    const requests = await BloodRequestService.findRequestsForBlood(bloodGroup);
    sendSuccess(res, requests, 'Compatible requests found successfully');
  }),
};
