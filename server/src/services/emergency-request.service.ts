import EmergencyRequest, { IEmergencyRequest } from '../models/EmergencyRequest';
import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import Donor, { IDonor } from '../models/Donor';
import BloodInventory from '../models/BloodInventory';
import { NotFoundError, ValidationError } from '../utils/errors';
import { calculateDistance } from '../utils/geolocation';
import { EMERGENCY_SEARCH_RADIUS_KM, EMERGENCY_RESPONSE_TIME_MINUTES } from '../config/constants';

interface CreateEmergencyRequestInput {
  hospitalId: string;
  bloodGroup: string;
  unitsNeeded: number;
  priority: 'critical' | 'high' | 'medium';
  patientInfo: {
    age: number;
    bloodGroup: string;
    condition: string;
    reason: string;
  };
}

export class EmergencyRequestService {
  /**
   * Create an emergency request
   */
  static async createEmergencyRequest(input: CreateEmergencyRequestInput): Promise<IEmergencyRequest> {
    const hospital = await Hospital.findById(input.hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital');
    }

    // Find nearby hospitals and blood banks with required blood group
    const nearbyHospitals = await this.findNearbyHospitalsWithBlood(
      hospital.address.coordinates.latitude,
      hospital.address.coordinates.longitude,
      input.bloodGroup
    );

    const nearbyBanks = await this.findNearbyBloodBanksWithBlood(
      hospital.address.coordinates.latitude,
      hospital.address.coordinates.longitude,
      input.bloodGroup
    );

    // Find eligible donors
    const eligibleDonors = await Donor.find({
      bloodGroup: input.bloodGroup,
      eligibilityStatus: 'eligible',
      availabilityStatus: 'available',
    });

    // Determine fastest source
    let fastestSource = null;
    if (nearbyHospitals.length > 0) {
      fastestSource = nearbyHospitals[0];
    } else if (nearbyBanks.length > 0) {
      fastestSource = nearbyBanks[0];
    }

    const emergencyRequest = await EmergencyRequest.create({
      hospital: input.hospitalId,
      bloodGroup: input.bloodGroup,
      unitsNeeded: input.unitsNeeded,
      priority: input.priority,
      patientInfo: input.patientInfo,
      status: 'active',
      sources: {
        hospitals: nearbyHospitals.map((h) => h.id),
        bloodBanks: nearbyBanks.map((b) => b.id),
        eligibleDonors: eligibleDonors.map((d) => d._id),
      },
      estimates: {
        fastestSource: fastestSource,
        recommendedRoute: {
          from: nearbyHospitals[0]?.id || nearbyBanks[0]?.id,
          to: input.hospitalId,
          distance: nearbyHospitals[0]?.distance || nearbyBanks[0]?.distance || 0,
          eta: Math.ceil(
            ((nearbyHospitals[0]?.distance || nearbyBanks[0]?.distance || 0) / 30) * 60
          ),
        },
      },
    });

    // Add to hospital's emergency requests
    hospital.emergencyRequests.push(emergencyRequest._id);
    await hospital.save();

    return emergencyRequest;
  }

  /**
   * Get emergency request
   */
  static async getEmergencyRequest(emergencyId: string): Promise<IEmergencyRequest> {
    const emergency = await EmergencyRequest.findById(emergencyId)
      .populate('hospital', 'name email phone')
      .populate('sources.hospitals', 'name email')
      .populate('sources.bloodBanks', 'name email')
      .populate('sources.eligibleDonors', 'user bloodGroup');

    if (!emergency) {
      throw new NotFoundError('Emergency Request');
    }

    return emergency;
  }

  /**
   * Get active emergencies
   */
  static async getActiveEmergencies(): Promise<IEmergencyRequest[]> {
    return EmergencyRequest.find({ status: 'active' })
      .sort({ priority: -1, createdAt: -1 })
      .populate('hospital', 'name email phone');
  }

  /**
   * Resolve emergency request
   */
  static async resolveEmergency(emergencyId: string): Promise<IEmergencyRequest> {
    const emergency = await EmergencyRequest.findByIdAndUpdate(
      emergencyId,
      { status: 'fulfilled', resolvedAt: new Date() },
      { new: true }
    );

    if (!emergency) {
      throw new NotFoundError('Emergency Request');
    }

    return emergency;
  }

  /**
   * Find nearby hospitals with required blood
   */
  private static async findNearbyHospitalsWithBlood(
    latitude: number,
    longitude: number,
    bloodGroup: string
  ): Promise<any[]> {
    const hospitals = await Hospital.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: EMERGENCY_SEARCH_RADIUS_KM * 1000,
        },
      },
    }).limit(5);

    const result = [];
    for (const hospital of hospitals) {
      const inventory = await BloodInventory.findOne({
        facility: hospital._id,
        bloodGroup,
      });

      if (inventory && inventory.availableUnits > 0) {
        const dist = calculateDistance(
          { latitude, longitude },
          {
            latitude: hospital.address.coordinates.latitude,
            longitude: hospital.address.coordinates.longitude,
          }
        );
        result.push({
          id: hospital._id,
          name: hospital.name,
          distance: dist,
          availableUnits: inventory.availableUnits,
          eta: Math.ceil((dist / 30) * 60),
        });
      }
    }

    return result.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Find nearby blood banks with required blood
   */
  private static async findNearbyBloodBanksWithBlood(
    latitude: number,
    longitude: number,
    bloodGroup: string
  ): Promise<any[]> {
    const banks = await BloodBank.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: EMERGENCY_SEARCH_RADIUS_KM * 1000,
        },
      },
    }).limit(5);

    const result = [];
    for (const bank of banks) {
      const inventory = await BloodInventory.findOne({
        facility: bank._id,
        bloodGroup,
      });

      if (inventory && inventory.availableUnits > 0) {
        const dist = calculateDistance(
          { latitude, longitude },
          {
            latitude: bank.address.coordinates.latitude,
            longitude: bank.address.coordinates.longitude,
          }
        );
        result.push({
          id: bank._id,
          name: bank.name,
          distance: dist,
          availableUnits: inventory.availableUnits,
          eta: Math.ceil((dist / 30) * 60),
        });
      }
    }

    return result.sort((a, b) => a.distance - b.distance);
  }
}
