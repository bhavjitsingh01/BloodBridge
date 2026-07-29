import BloodBank, { IBloodBank } from '../models/BloodBank';
import User from '../models/User';
import { NotFoundError, ConflictError } from '../utils/errors';
import { calculateDistance } from '../utils/geolocation';
import { MAX_NEARBY_DISTANCE_KM, EXPIRY_ALERT_DAYS } from '../config/constants';
import { addDays } from '../utils/dateUtils';

interface CreateBloodBankInput {
  name: string;
  licenseNumber: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  registrationNumber: string;
  adminUserId: string;
  operatingHours?: {
    open: string;
    close: string;
    daysOpen: number[];
  };
}

interface UpdateBloodBankInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: CreateBloodBankInput['address'];
  operatingHours?: CreateBloodBankInput['operatingHours'];
}

export class BloodBankService {
  /**
   * Create a new blood bank
   */
  static async createBloodBank(input: CreateBloodBankInput): Promise<IBloodBank> {
    const existing = await BloodBank.findOne({
      $or: [{ email: input.email }, { licenseNumber: input.licenseNumber }],
    });

    if (existing) {
      throw new ConflictError('Blood bank with this email or license already exists');
    }

    const user = await User.findById(input.adminUserId);
    if (!user) {
      throw new NotFoundError('User');
    }

    const bloodBank = await BloodBank.create({
      ...input,
      adminUser: input.adminUserId,
    });

    return bloodBank;
  }

  /**
   * Get blood bank by ID
   */
  static async getBloodBankById(bankId: string): Promise<IBloodBank> {
    const bank = await BloodBank.findById(bankId)
      .populate('adminUser', 'email firstName lastName phone')
      .populate('bloodInventory');

    if (!bank) {
      throw new NotFoundError('Blood Bank');
    }

    return bank;
  }

  /**
   * Get all blood banks
   */
  static async getAllBloodBanks(skip: number = 0, limit: number = 20): Promise<{ banks: IBloodBank[]; total: number }> {
    const [banks, total] = await Promise.all([
      BloodBank.find()
        .skip(skip)
        .limit(limit)
        .populate('adminUser', 'email firstName lastName'),
      BloodBank.countDocuments(),
    ]);

    return { banks, total };
  }

  /**
   * Update blood bank
   */
  static async updateBloodBank(bankId: string, input: UpdateBloodBankInput): Promise<IBloodBank> {
    const bank = await BloodBank.findByIdAndUpdate(bankId, input, { new: true });

    if (!bank) {
      throw new NotFoundError('Blood Bank');
    }

    return bank;
  }

  /**
   * Verify blood bank (Admin only)
   */
  static async verifyBloodBank(bankId: string): Promise<IBloodBank> {
    const bank = await BloodBank.findByIdAndUpdate(
      bankId,
      { verified: true, verifiedAt: new Date() },
      { new: true }
    );

    if (!bank) {
      throw new NotFoundError('Blood Bank');
    }

    return bank;
  }

  /**
   * Find nearby blood banks
   */
  static async findNearbyBloodBanks(
    latitude: number,
    longitude: number,
    maxDistance: number = MAX_NEARBY_DISTANCE_KM
  ): Promise<any[]> {
    const banks = await BloodBank.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance * 1000,
        },
      },
    }).limit(10);

    return banks.map((bank) => ({
      id: bank._id.toString(),
      name: bank.name,
      distance: calculateDistance(
        { latitude, longitude },
        {
          latitude: bank.address.coordinates.latitude,
          longitude: bank.address.coordinates.longitude,
        }
      ),
      latitude: bank.address.coordinates.latitude,
      longitude: bank.address.coordinates.longitude,
      type: 'blood-bank',
    }));
  }

  /**
   * Get expiring blood units
   */
  static async getExpiringBlood(bankId: string): Promise<any[]> {
    const bank = await BloodBank.findById(bankId).populate('bloodInventory');

    if (!bank) {
      throw new NotFoundError('Blood Bank');
    }

    const expiryDate = addDays(new Date(), EXPIRY_ALERT_DAYS);

    return (bank.bloodInventory as any[])?.filter((inv) =>
      inv.units?.some((unit: any) => unit.expiryDate <= expiryDate && unit.status === 'available')
    ) || [];
  }

  /**
   * Delete blood bank (Admin only)
   */
  static async deleteBloodBank(bankId: string): Promise<void> {
    const bank = await BloodBank.findByIdAndDelete(bankId);
    if (!bank) {
      throw new NotFoundError('Blood Bank');
    }
  }
}
