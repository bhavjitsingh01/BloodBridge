import DonationAppointment, { IDonationAppointment } from '../models/DonationAppointment';
import Donor from '../models/Donor';
import Hospital from '../models/Hospital';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

interface CreateAppointmentInput {
  donorId: string;
  facilityId: string;
  appointmentDate: Date;
  appointmentTime: string;
  bloodGroup: string;
  unitsToCollect?: number;
}

interface UpdateAppointmentInput {
  appointmentDate?: Date;
  appointmentTime?: string;
  status?: string;
  healthCheckCompleted?: boolean;
  donationCompleted?: boolean;
}

export class DonationAppointmentService {
  /**
   * Book a donation appointment
   */
  static async bookAppointment(input: CreateAppointmentInput): Promise<IDonationAppointment> {
    // Verify donor exists
    const donor = await Donor.findById(input.donorId);
    if (!donor) {
      throw new NotFoundError('Donor');
    }

    // Verify facility exists
    const facility = await Hospital.findById(input.facilityId);
    if (!facility) {
      throw new NotFoundError('Hospital');
    }

    // Check if appointment slot is available
    const existingAppointment = await DonationAppointment.findOne({
      facility: input.facilityId,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    if (existingAppointment) {
      throw new ConflictError('This appointment slot is already booked');
    }

    // Check if donor already has appointment at same time
    const donorAppointment = await DonationAppointment.findOne({
      donor: input.donorId,
      appointmentDate: input.appointmentDate,
      appointmentTime: input.appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] },
    });

    if (donorAppointment) {
      throw new ConflictError('Donor already has an appointment at this time');
    }

    const appointment = await DonationAppointment.create({
      ...input,
      unitsToCollect: input.unitsToCollect || 1,
    });

    return appointment;
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(appointmentId: string): Promise<IDonationAppointment> {
    const appointment = await DonationAppointment.findById(appointmentId)
      .populate('donor', 'bloodGroup')
      .populate('facility', 'name address phone');

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return appointment;
  }

  /**
   * Get donor appointments
   */
  static async getDonorAppointments(donorId: string, skip: number = 0, limit: number = 20): Promise<{
    appointments: IDonationAppointment[];
    total: number;
  }> {
    const [appointments, total] = await Promise.all([
      DonationAppointment.find({ donor: donorId })
        .sort({ appointmentDate: 1 })
        .skip(skip)
        .limit(limit)
        .populate('facility', 'name address phone'),
      DonationAppointment.countDocuments({ donor: donorId }),
    ]);

    return { appointments, total };
  }

  /**
   * Get facility schedule
   */
  static async getFacilitySchedule(
    facilityId: string,
    date: Date,
    skip: number = 0,
    limit: number = 20
  ): Promise<{
    appointments: IDonationAppointment[];
    total: number;
  }> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const [appointments, total] = await Promise.all([
      DonationAppointment.find({
        facility: facilityId,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
        .sort({ appointmentTime: 1 })
        .skip(skip)
        .limit(limit)
        .populate('donor', 'user bloodGroup'),
      DonationAppointment.countDocuments({
        facility: facilityId,
        appointmentDate: {
          $gte: startDate,
          $lte: endDate,
        },
      }),
    ]);

    return { appointments, total };
  }

  /**
   * Update appointment
   */
  static async updateAppointment(
    appointmentId: string,
    input: UpdateAppointmentInput
  ): Promise<IDonationAppointment> {
    const appointment = await DonationAppointment.findByIdAndUpdate(appointmentId, input, {
      new: true,
    });

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return appointment;
  }

  /**
   * Confirm appointment
   */
  static async confirmAppointment(appointmentId: string): Promise<IDonationAppointment> {
    const appointment = await DonationAppointment.findByIdAndUpdate(
      appointmentId,
      { status: 'confirmed' },
      { new: true }
    );

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return appointment;
  }

  /**
   * Complete appointment
   */
  static async completeAppointment(appointmentId: string): Promise<IDonationAppointment> {
    const appointment = await DonationAppointment.findByIdAndUpdate(
      appointmentId,
      { status: 'completed', donationCompleted: true },
      { new: true }
    );

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    // Update donor's last donation date
    await Donor.findByIdAndUpdate(
      appointment.donor,
      { lastDonationDate: new Date() },
      { new: true }
    );

    return appointment;
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(appointmentId: string): Promise<IDonationAppointment> {
    const appointment = await DonationAppointment.findByIdAndUpdate(
      appointmentId,
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      throw new NotFoundError('Appointment');
    }

    return appointment;
  }

  /**
   * Get available time slots for a facility
   */
  static async getAvailableTimeSlots(facilityId: string, date: Date): Promise<string[]> {
    // Assume slots from 9:00 to 17:00, every 30 minutes
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    // Get booked appointments for the day
    const booked = await DonationAppointment.find({
      facility: facilityId,
      appointmentDate: {
        $gte: new Date(date).setHours(0, 0, 0, 0),
        $lte: new Date(date).setHours(23, 59, 59, 999),
      },
      status: { $in: ['scheduled', 'confirmed'] },
    });

    const bookedTimes = booked.map((a) => a.appointmentTime);
    return slots.filter((slot) => !bookedTimes.includes(slot));
  }
}
