import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middleware/auth';
import { authorize } from '../middleware/authorization';

const router = Router();

router.post('/', authMiddleware, authorize('donor', 'hospital'), appointmentController.bookAppointment);
router.get('/available-slots', appointmentController.getAvailableTimeSlots);
router.get('/:id', appointmentController.getAppointment);
router.get('/donor/:donorId', appointmentController.getDonorAppointments);
router.get('/facility/:facilityId/schedule', appointmentController.getFacilitySchedule);
router.put('/:id', authMiddleware, authorize('donor', 'hospital'), appointmentController.updateAppointment);
router.post('/:id/confirm', authMiddleware, authorize('hospital'), appointmentController.confirmAppointment);
router.post('/:id/complete', authMiddleware, authorize('hospital'), appointmentController.completeAppointment);
router.post('/:id/cancel', authMiddleware, authorize('donor', 'hospital'), appointmentController.cancelAppointment);

export default router;
