import { Request, Response } from 'express';
import { z } from 'zod';
import { DonationAppointmentService } from '../services/donation-appointment.service';
import { sendSuccess, sendCreated } from '../utils/responses';
import { asyncHandler } from '../middleware/errorHandler';
import { BLOOD_GROUPS, DEFAULT_PAGE, DEFAULT_LIMIT } from '../config/constants';

const createAppointmentSchema = z.object({
  donorId: z.string(),
  facilityId: z.string(),
  appointmentDate: z.string().transform((val) => new Date(val)),
  appointmentTime: z.string(),
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]),
  unitsToCollect: z.number().optional(),
});

const updateAppointmentSchema = z.object({
  appointmentDate: z.string().transform((val) => new Date(val)).optional(),
  appointmentTime: z.string().optional(),
  status: z.string().optional(),
  healthCheckCompleted: z.boolean().optional(),
  donationCompleted: z.boolean().optional(),
});

export const appointmentController = {
  /**
   * Book appointment
   */
  bookAppointment: asyncHandler(async (req: Request, res: Response) => {
    const validated = await createAppointmentSchema.parseAsync(req.body);
    const appointment = await DonationAppointmentService.bookAppointment(validated);
    sendCreated(res, appointment, 'Appointment booked successfully');
  }),

  /**
   * Get appointment
   */
  getAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const appointment = await DonationAppointmentService.getAppointment(id);
    sendSuccess(res, appointment, 'Appointment retrieved successfully');
  }),

  /**
   * Get donor appointments
   */
  getDonorAppointments: asyncHandler(async (req: Request, res: Response) => {
    const { donorId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const result = await DonationAppointmentService.getDonorAppointments(
      donorId,
      skip,
      parseInt(limit as string)
    );

    sendSuccess(res, result, 'Donor appointments retrieved successfully');
  }),

  /**
   * Get facility schedule
   */
  getFacilitySchedule: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId } = req.params;
    const { date, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const result = await DonationAppointmentService.getFacilitySchedule(
      facilityId,
      new Date(date as string),
      skip,
      parseInt(limit as string)
    );

    sendSuccess(res, result, 'Facility schedule retrieved successfully');
  }),

  /**
   * Update appointment
   */
  updateAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const validated = await updateAppointmentSchema.parseAsync(req.body);
    const appointment = await DonationAppointmentService.updateAppointment(id, validated);
    sendSuccess(res, appointment, 'Appointment updated successfully');
  }),

  /**
   * Confirm appointment
   */
  confirmAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const appointment = await DonationAppointmentService.confirmAppointment(id);
    sendSuccess(res, appointment, 'Appointment confirmed successfully');
  }),

  /**
   * Complete appointment
   */
  completeAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const appointment = await DonationAppointmentService.completeAppointment(id);
    sendSuccess(res, appointment, 'Appointment completed successfully');
  }),

  /**
   * Cancel appointment
   */
  cancelAppointment: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const appointment = await DonationAppointmentService.cancelAppointment(id);
    sendSuccess(res, appointment, 'Appointment cancelled successfully');
  }),

  /**
   * Get available time slots
   */
  getAvailableTimeSlots: asyncHandler(async (req: Request, res: Response) => {
    const { facilityId, date } = req.query;
    const slots = await DonationAppointmentService.getAvailableTimeSlots(
      facilityId as string,
      new Date(date as string)
    );
    sendSuccess(res, slots, 'Available time slots retrieved successfully');
  }),
};
