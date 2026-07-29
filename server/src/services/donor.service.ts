import Donor, { IDonor } from '../models/Donor';
import User from '../models/User';
import { NotFoundError, ConflictError } from '../utils/errors';
import { BLOOD_GROUPS, BloodGroup, MIN_HEMOGLOBIN_GM_DL, DONATION_INTERVAL_DAYS } from '../config/constants';
import { subtractDays } from '../utils/dateUtils';

interface CreateDonorInput {
  userId: string;
  bloodGroup: BloodGroup;
  medicalHistory: {
    hasChronicDisease: boolean;
    diseaseDetails?: string;
    hemoglobin: number;
    bloodPressure?: string;
  };
}

interface UpdateDonorInput {
  bloodGroup?: BloodGroup;
  medicalHistory?: any;
  availabilityStatus?: string;
}

export class DonorService {
  /**
   * Register a new donor
   */
  static async registerDonor(input: CreateDonorInput): Promise<IDonor> {
    // Check if donor already exists
    const existing = await Donor.findOne({ user: input.userId });
    if (existing) {
      throw new ConflictError('Donor profile already exists for this user');
    }

    // Verify user exists
    const user = await User.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Create donor profile
    const donor = await Donor.create({
      user: input.userId,
      bloodGroup: input.bloodGroup,
      medicalHistory: input.medicalHistory,
      eligibilityStatus: 'pending', // Will be set after eligibility check
    });

    return donor;
  }

  /**
   * Get donor profile
   */
  static async getDonorProfile(donorId: string): Promise<IDonor> {
    const donor = await Donor.findById(donorId)
      .populate('user', 'email firstName lastName phone dateOfBirth address')
      .populate('donationHistory.location', 'name address')
      .populate('preferredDonationCenters', 'name address');

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    return donor;
  }

  /**
   * Get donor by user ID
   */
  static async getDonorByUserId(userId: string): Promise<IDonor> {
    const donor = await Donor.findOne({ user: userId })
      .populate('user', 'email firstName lastName phone')
      .populate('donationHistory.location', 'name');

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    return donor;
  }

  /**
   * Update donor profile
   */
  static async updateDonorProfile(donorId: string, input: UpdateDonorInput): Promise<IDonor> {
    const donor = await Donor.findByIdAndUpdate(donorId, input, { new: true });

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    return donor;
  }

  /**
   * Check donor eligibility
   */
  static async checkEligibility(donorId: string): Promise<{
    eligible: boolean;
    reason?: string;
    hemoglobin?: number;
    lastDonation?: Date;
  }> {
    const donor = await Donor.findById(donorId);

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    // Check hemoglobin level
    if (donor.medicalHistory.hemoglobin < MIN_HEMOGLOBIN_GM_DL) {
      return {
        eligible: false,
        reason: 'Hemoglobin level is too low',
        hemoglobin: donor.medicalHistory.hemoglobin,
      };
    }

    // Check if enough time passed since last donation
    if (donor.lastDonationDate) {
      const minDonationDate = subtractDays(new Date(), DONATION_INTERVAL_DAYS);
      if (donor.lastDonationDate > minDonationDate) {
        return {
          eligible: false,
          reason: `Must wait ${DONATION_INTERVAL_DAYS} days between donations`,
          lastDonation: donor.lastDonationDate,
        };
      }
    }

    // Check chronic diseases
    if (donor.medicalHistory.hasChronicDisease) {
      return {
        eligible: false,
        reason: 'Chronic disease restrictions apply',
      };
    }

    return { eligible: true };
  }

  /**
   * Update availability status
   */
  static async updateAvailabilityStatus(
    donorId: string,
    status: 'available' | 'busy' | 'not-available'
  ): Promise<IDonor> {
    const donor = await Donor.findByIdAndUpdate(
      donorId,
      { availabilityStatus: status },
      { new: true }
    );

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    return donor;
  }

  /**
   * Get donation history
   */
  static async getDonationHistory(donorId: string, skip: number = 0, limit: number = 20): Promise<{
    history: any[];
    total: number;
  }> {
    const donor = await Donor.findById(donorId);

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    const history = donor.donationHistory.slice(skip, skip + limit);
    return {
      history,
      total: donor.donationHistory.length,
    };
  }

  /**
   * Record a donation
   */
  static async recordDonation(
    donorId: string,
    locationId: string,
    unitsCollected: number
  ): Promise<IDonor> {
    const donor = await Donor.findByIdAndUpdate(
      donorId,
      {
        $push: {
          donationHistory: {
            date: new Date(),
            location: locationId,
            unitsCollected,
            healthStatus: 'good',
          },
        },
        lastDonationDate: new Date(),
        $inc: { totalDonations: 1 },
      },
      { new: true }
    );

    if (!donor) {
      throw new NotFoundError('Donor');
    }

    return donor;
  }

  /**
   * Get eligible donors for blood group
   */
  static async getEligibleDonorsForBloodGroup(bloodGroup: BloodGroup): Promise<IDonor[]> {
    const donors = await Donor.find({
      bloodGroup,
      eligibilityStatus: 'eligible',
      availabilityStatus: 'available',
    }).populate('user', 'email phone');

    return donors;
  }
}
