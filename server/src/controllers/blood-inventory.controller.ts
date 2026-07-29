import { Request, Response } from 'express';
import { z } from 'zod';
import { BloodInventoryService } from '../services/blood-inventory.service';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { BLOOD_GROUPS, DEFAULT_PAGE, DEFAULT_LIMIT } from '../config/constants';

const addBloodSchema = z.object({
  facilityId: z.string(),
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  quantity: z.number().min(1),
  batchNumber: z.string(),
  collectionDate: z.string().transform((val) => new Date(val)),
});

const updateInventorySchema = z.object({
  availableUnits: z.number().optional(),
  reservedUnits: z.number().optional(),
});

export const bloodInventoryController = {
  /**
   * Add blood to inventory
   */
  addBlood: asyncHandler(async (req: Request, res: Response) => {
    const validated = await addBloodSchema.parseAsync(req.body);
    const inventory = await BloodInventoryService.addBlood(validated);
    sendCreated(res, inventory, 'Blood added to inventory successfully');
  }),

  /**
   * Get facility inventory
   */
  getFacilityInventory: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId } = req.params;
    const inventory = await BloodInventoryService.getFacilityInventory(facilityId);
    sendSuccess(res, inventory, 'Facility inventory retrieved successfully');
  }),

  /**
   * Update inventory
   */
  updateInventory: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = await updateInventorySchema.parseAsync(req.body);
    const inventory = await BloodInventoryService.updateInventory(id, validated);
    sendSuccess(res, inventory, 'Inventory updated successfully');
  }),

  /**
   * Reserve blood
   */
  reserveBlood: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId, bloodGroup, units } = req.body;
    const inventory = await BloodInventoryService.reserveBlood(
      facilityId,
      bloodGroup,
      units
    );
    sendSuccess(res, inventory, 'Blood reserved successfully');
  }),

  /**
   * Release reserved blood
   */
  releaseBlood: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId, bloodGroup, units } = req.body;
    const inventory = await BloodInventoryService.releaseBlood(
      facilityId,
      bloodGroup,
      units
    );
    sendSuccess(res, inventory, 'Blood released successfully');
  }),

  /**
   * Get expiring blood
   */
  getExpiringBlood: asyncHandler(async (req: Request, res: Response) => {
    const { days = 5 } = req.query;
    const inventory = await BloodInventoryService.getExpiringBlood(parseInt(days as string));
    sendSuccess(res, inventory, 'Expiring blood retrieved successfully');
  }),

  /**
   * Get low stock inventory
   */
  getLowStockInventory: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await BloodInventoryService.getLowStockInventory();
    sendSuccess(res, inventory, 'Low stock inventory retrieved successfully');
  }),

  /**
   * Transfer blood between facilities
   */
  transferBlood: asyncHandler(async (req: Request, res: Response) => {
    const { fromFacilityId, toFacilityId, bloodGroup, units } = req.body;
    const result = await BloodInventoryService.transferBlood(
      fromFacilityId,
      toFacilityId,
      bloodGroup,
      units
    );
    sendSuccess(res, result, 'Blood transferred successfully');
  }),

  /**
   * Remove expired blood
   */
  removeExpiredBlood: asyncHandler(async (req: Request, res: Response) => {
    const count = await BloodInventoryService.removeExpiredBlood();
    sendSuccess(res, { expiredUnitsRemoved: count }, 'Expired blood removed successfully');
  }),
};
