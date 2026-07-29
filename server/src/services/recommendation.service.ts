import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import BloodInventory from '../models/BloodInventory';
import Donor from '../models/Donor';
import EmergencyRequest from '../models/EmergencyRequest';
import logger from '../utils/logger';
import notificationService from './notification.service';

const EARTH_RADIUS_KM = 6371;
const TRANSFER_SEARCH_RADIUS_KM = 100;

interface TransferRecommendation {
  id: string;
  name: string;
  type: 'Hospital' | 'BloodBank';
  city: string;
  state: string;
  bloodGroup: string;
  availableUnits: number;
  distance: number;
  expiryDate: Date;
  daysUntilExpiry: number;
  matchScore: number;
  estimatedTransferTime: string;
  reason: string;
}

interface DonorRecommendation {
  id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  city: string;
  state: string;
  distance: number;
  matchScore: number;
  reason: string;
}

interface TransferRecommendationsResult {
  recommendations: TransferRecommendation[];
  generatedAt: Date;
  analysisType: string;
}

interface DonorRecommendationsResult {
  recommendations: DonorRecommendation[];
  generatedAt: Date;
  totalEligible: number;
}

export class RecommendationService {
  async recommendTransfers(hospitalId?: string): Promise<TransferRecommendationsResult> {
    try {
      logger.info('Starting transfer recommendation analysis');

      const now = new Date();
      const recommendations: TransferRecommendation[] = [];

      // Get all hospitals and blood banks
      const [hospitals, bloodBanks] = await Promise.all([Hospital.find({}), BloodBank.find({})]);

      const locations = [
        ...hospitals.map((h) => ({ ...h.toObject(), type: 'Hospital' as const })),
        ...bloodBanks.map((b) => ({ ...b.toObject(), type: 'BloodBank' as const })),
      ];

      // If specific hospital provided, focus on its needs
      const targetLocation = hospitalId
        ? locations.find((l) => l._id.toString() === hospitalId)
        : null;

      const targetLocations = targetLocation ? [targetLocation] : locations;

      for (const target of targetLocations) {
        // Get inventory for target location
        const inventory = await BloodInventory.find({
          hospitalId: target._id,
          status: { $ne: 'Expired' },
          expiryDate: { $gt: now },
        });

        // For each blood group, check if shortage
        const bloodGroupsInNeed = new Map<string, number>();

        for (const inv of inventory) {
          // Get historical demand
          const historicalRequests = await EmergencyRequest.find({
            bloodGroup: inv.bloodGroup,
            requesterId: target._id,
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
          });

          const avgDemand = historicalRequests.length > 0
            ? historicalRequests.reduce((sum, req) => sum + req.unitsRequired, 0) / historicalRequests.length
            : 0;

          const projectedDemand = Math.round(avgDemand * 7);

          // If shortage predicted
          if (inv.units < projectedDemand * 0.7) {
            bloodGroupsInNeed.set(inv.bloodGroup, projectedDemand - inv.units);
          }
        }

        // Find surplus sources for needed blood groups
        for (const [bloodGroup, unitsNeeded] of bloodGroupsInNeed) {
          const surpluses = await this.findSurplusSources(
            target.location.coordinates,
            bloodGroup,
            unitsNeeded
          );

          for (const surplus of surpluses) {
            const daysUntilExpiry = Math.ceil(
              (new Date(surplus.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Calculate match score
            const matchScore = this.calculateTransferMatchScore(
              surplus.distance,
              surplus.availableUnits,
              unitsNeeded,
              daysUntilExpiry
            );

            recommendations.push({
              id: surplus.id,
              name: surplus.name,
              type: surplus.type,
              city: surplus.city,
              state: surplus.state,
              bloodGroup,
              availableUnits: surplus.availableUnits,
              distance: Math.round(surplus.distance),
              expiryDate: surplus.expiryDate,
              daysUntilExpiry,
              matchScore,
              estimatedTransferTime: this.estimateTransferTime(
                surplus.distance,
                surplus.type
              ),
              reason: `${surplus.name} has ${surplus.availableUnits} units of ${bloodGroup} available. Units expire in ${daysUntilExpiry} days.`,
            });
          }
        }
      }

      // Sort by match score
      recommendations.sort((a, b) => b.matchScore - a.matchScore);

      return {
        recommendations: recommendations.slice(0, 10),
        generatedAt: new Date(),
        analysisType: targetLocation ? 'Hospital-Specific Analysis' : 'System-Wide Analysis',
      };
    } catch (error) {
      logger.error('Recommendation service error:', error);
      throw error;
    }
  }

  async recommendDonorsForEmergency(
    emergencyRequestId: string,
    bloodGroup: string,
    unitsRequired: number,
    requesterLocation: [number, number]
  ): Promise<DonorRecommendationsResult> {
    try {
      logger.info(`Recommending donors for emergency: ${bloodGroup}, ${unitsRequired} units`);

      const now = new Date();

      // Find eligible donors
      const donors = await Donor.find({
        bloodGroup,
        availabilityStatus: 'Available',
        nextEligibleDate: { $lte: now },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: requesterLocation,
            },
            $maxDistance: TRANSFER_SEARCH_RADIUS_KM * 1000,
          },
        },
      });

      const recommendations: DonorRecommendation[] = donors.map((donor) => {
        const distance = this.calculateDistance(
          requesterLocation[1],
          requesterLocation[0],
          donor.location.coordinates[1],
          donor.location.coordinates[0]
        );

        const matchScore = Math.round(100 - (distance / TRANSFER_SEARCH_RADIUS_KM) * 100);

        return {
          id: donor._id.toString(),
          name: donor.fullName,
          bloodGroup: donor.bloodGroup,
          phone: donor.phone,
          city: donor.city,
          state: donor.state,
          distance: Math.round(distance),
          matchScore: Math.max(0, matchScore),
          reason: `Eligible donor ${Math.round(distance)}km away from emergency location.`,
        };
      });

      // Sort by distance
      recommendations.sort((a, b) => a.distance - b.distance);

      return {
        recommendations: recommendations.slice(0, 10),
        generatedAt: new Date(),
        totalEligible: donors.length,
      };
    } catch (error) {
      logger.error('Recommend donors error:', error);
      throw error;
    }
  }

  private async findSurplusSources(
    targetCoords: [number, number],
    bloodGroup: string,
    unitsNeeded: number
  ): Promise<
    Array<{
      id: string;
      name: string;
      type: 'Hospital' | 'BloodBank';
      city: string;
      state: string;
      distance: number;
      availableUnits: number;
      expiryDate: Date;
    }>
  > {
    const now = new Date();
    const sources: Array<{
      id: string;
      name: string;
      type: 'Hospital' | 'BloodBank';
      city: string;
      state: string;
      distance: number;
      availableUnits: number;
      expiryDate: Date;
    }> = [];

    // Search hospitals
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: targetCoords,
          },
          $maxDistance: TRANSFER_SEARCH_RADIUS_KM * 1000,
        },
      },
    });

    for (const hospital of hospitals) {
      const inventory = await BloodInventory.findOne({
        hospitalId: hospital._id,
        bloodGroup,
        status: { $ne: 'Expired' },
        expiryDate: { $gt: now },
        units: { $gt: 0 },
      }).sort({ expiryDate: 1 });

      if (inventory && inventory.units > 0) {
        const distance = this.calculateDistance(
          targetCoords[1],
          targetCoords[0],
          hospital.location.coordinates[1],
          hospital.location.coordinates[0]
        );

        sources.push({
          id: hospital._id.toString(),
          name: hospital.name,
          type: 'Hospital',
          city: hospital.city,
          state: hospital.state,
          distance,
          availableUnits: inventory.units,
          expiryDate: inventory.expiryDate,
        });
      }
    }

    // Search blood banks
    const bloodBanks = await BloodBank.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: targetCoords,
          },
          $maxDistance: TRANSFER_SEARCH_RADIUS_KM * 1000,
        },
      },
    });

    for (const bloodBank of bloodBanks) {
      const inventory = await BloodInventory.findOne({
        hospitalId: bloodBank._id,
        bloodGroup,
        status: { $ne: 'Expired' },
        expiryDate: { $gt: now },
        units: { $gt: 0 },
      }).sort({ expiryDate: 1 });

      if (inventory && inventory.units > 0) {
        const distance = this.calculateDistance(
          targetCoords[1],
          targetCoords[0],
          bloodBank.location.coordinates[1],
          bloodBank.location.coordinates[0]
        );

        sources.push({
          id: bloodBank._id.toString(),
          name: bloodBank.name,
          type: 'BloodBank',
          city: bloodBank.city,
          state: bloodBank.state,
          distance,
          availableUnits: inventory.units,
          expiryDate: inventory.expiryDate,
        });
      }
    }

    return sources.sort((a, b) => a.distance - b.distance);
  }

  private calculateTransferMatchScore(
    distance: number,
    availableUnits: number,
    requiredUnits: number,
    daysUntilExpiry: number
  ): number {
    let score = 100;

    // Distance score (closer is better, max -40)
    const distanceScore = Math.max(0, 40 - (distance / TRANSFER_SEARCH_RADIUS_KM) * 40);
    score -= 40 - distanceScore;

    // Units score (sufficient units is better, max +30)
    const unitRatio = Math.min(availableUnits / requiredUnits, 1);
    const unitsScore = unitRatio * 30;
    score += unitsScore;

    // Expiry score (prefer units expiring sooner, max +30)
    const expiryScore = Math.max(0, 30 - (daysUntilExpiry / 14) * 30);
    score += expiryScore;

    return Math.round(score);
  }

  private estimateTransferTime(distance: number, locationType: 'Hospital' | 'BloodBank'): string {
    // Assume 60 km/h for ground transport
    const travelTimeMinutes = Math.ceil((distance / 60) * 60);
    const processingTime = locationType === 'Hospital' ? 15 : 20; // Processing time varies
    const totalMinutes = travelTimeMinutes + processingTime;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    }
    return `${hours}h ${minutes}m`;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }
}

export default new RecommendationService();
