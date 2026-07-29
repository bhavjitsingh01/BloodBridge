import { Request, Response } from 'express';
import { z } from 'zod';
import { EmergencyRequestService } from '../services/emergency-request.service';
import { sendSuccess, sendCreated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { BLOOD_GROUPS, EMERGENCY_PRIORITY, BloodGroup, EmergencyPriority } from '../config/constants';

const createEmergencySchema = z.object({
  hospitalId: z.string(),
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  unitsNeeded: z.number().min(1),
  priority: z.enum(EMERGENCY_PRIORITY as unknown as [string, ...string[]]),
  patientInfo: z.object({
    age: z.number(),
    bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
    condition: z.string(),
    reason: z.string(),
  }),
});

export const emergencyController = {
  /**
   * Create emergency request
   */
  createEmergencyRequest: asyncHandler(async (req: Request, res: Response) => {
    const validated = await createEmergencySchema.parseAsync(req.body);
    const emergency = await EmergencyRequestService.createEmergencyRequest({
      hospitalId: validated.hospitalId,
      bloodGroup: validated.bloodGroup as BloodGroup,
      unitsNeeded: validated.unitsNeeded,
      priority: validated.priority as EmergencyPriority,
      patientInfo: {
        age: validated.patientInfo.age,
        bloodGroup: validated.patientInfo.bloodGroup as BloodGroup,
        condition: validated.patientInfo.condition,
        reason: validated.patientInfo.reason,
      },
    });
    sendCreated(res, emergency, 'Emergency request created successfully');
  }),

  /**
   * Get emergency request
   */
  getEmergencyRequest: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const emergency = await EmergencyRequestService.getEmergencyRequest(id);
    sendSuccess(res, emergency, 'Emergency request retrieved successfully');
  }),

  /**
   * Get active emergencies
   */
  getActiveEmergencies: asyncHandler(async (req: Request, res: Response) => {
    const emergencies = await EmergencyRequestService.getActiveEmergencies();
    sendSuccess(res, emergencies, 'Active emergencies retrieved successfully');
  }),

  /**
   * Resolve emergency
   */
  resolveEmergency: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const emergency = await EmergencyRequestService.resolveEmergency(id);
    sendSuccess(res, emergency, 'Emergency request resolved successfully');
  }),
};
