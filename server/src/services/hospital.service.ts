import Hospital, { IHospital } from '../models/Hospital';
import User from '../models/User';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { calculateDistance } from '../utils/geolocation';
import { MAX_NEARBY_DISTANCE_KM } from '../config/constants';

interface CreateHospitalInput {
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

interface UpdateHospitalInput {
  name?: string;
  email?: string;
  phone?: string;
  address?: CreateHospitalInput['address'];
  operatingHours?: CreateHospitalInput['operatingHours'];
}

interface NearbyFacility {
  id: string;
  name: string;
  distance: number;
  latitude: number;
  longitude: number;
  type: 'hospital' | 'blood-bank';
}

export class HospitalService {
  /**
   * Create a new hospital
   */
  static async createHospital(input: CreateHospitalInput): Promise<IHospital> {
    // Check if hospital already exists
    const existing = await Hospital.findOne({
      $or: [{ email: input.email }, { licenseNumber: input.licenseNumber }],
    });

    if (existing) {
      throw new ConflictError('Hospital with this email or license already exists');
    }

    // Verify user exists
    const user = await User.findById(input.adminUserId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Create hospital
    const hospital = await Hospital.create({
      ...input,
      adminUser: input.adminUserId,
    });

    return hospital;
  }

  /**
   * Get hospital by ID
   */
  static async getHospitalById(hospitalId: string): Promise<IHospital> {
    const hospital = await Hospital.findById(hospitalId)
      .populate('adminUser', 'email firstName lastName phone')
      .populate('bloodInventory')
      .populate('bloodRequests');

    if (!hospital) {
      throw new NotFoundError('Hospital');
    }

    return hospital;
  }

  /**
   * Get all hospitals
   */
  static async getAllHospitals(skip: number = 0, limit: number = 20): Promise<{ hospitals: IHospital[]; total: number }> {
    const [hospitals, total] = await Promise.all([
      Hospital.find()
        .skip(skip)
        .limit(limit)
        .populate('adminUser', 'email firstName lastName'),
      Hospital.countDocuments(),
    ]);

    return { hospitals, total };
  }

  /**
   * Update hospital
   */
  static async updateHospital(hospitalId: string, input: UpdateHospitalInput): Promise<IHospital> {
    const hospital = await Hospital.findByIdAndUpdate(hospitalId, input, { new: true });

    if (!hospital) {
      throw new NotFoundError('Hospital');
    }

    return hospital;
  }

  /**
   * Verify hospital (Admin only)
   */
  static async verifyHospital(hospitalId: string): Promise<IHospital> {
    const hospital = await Hospital.findByIdAndUpdate(
      hospitalId,
      { verified: true, verifiedAt: new Date() },
      { new: true }
    );

    if (!hospital) {
      throw new NotFoundError('Hospital');
    }

    return hospital;
  }

  /**
   * Find nearby hospitals and blood banks
   */
  static async findNearbyFacilities(
    latitude: number,
    longitude: number,
    maxDistance: number = MAX_NEARBY_DISTANCE_KM
  ): Promise<NearbyFacility[]> {
    // Find nearby hospitals
    const hospitals = await Hospital.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance * 1000, // Convert km to meters
        },
      },
    }).limit(10);

    // Calculate actual distances
    const facilities: NearbyFacility[] = hospitals.map((hospital) => ({
      id: hospital._id.toString(),
      name: hospital.name,
      distance: calculateDistance(
        { latitude, longitude },
        {
          latitude: hospital.address.coordinates.latitude,
          longitude: hospital.address.coordinates.longitude,
        }
      ),
      latitude: hospital.address.coordinates.latitude,
      longitude: hospital.address.coordinates.longitude,
      type: 'hospital',
    }));

    return facilities.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Get hospital blood inventory
   */
  static async getHospitalInventory(hospitalId: string): Promise<any[]> {
    const hospital = await Hospital.findById(hospitalId).populate('bloodInventory');
    return hospital?.bloodInventory || [];
  }

  /**
   * Delete hospital (Admin only)
   */
  static async deleteHospital(hospitalId: string): Promise<void> {
    const hospital = await Hospital.findByIdAndDelete(hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital');
    }
  }
}
