import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import BloodInventory from '../models/BloodInventory';
import Donor from '../models/Donor';
import logger from '../utils/logger';

const MATCHING_RADIUS_KM = 50; // Configurable radius in kilometers
const EARTH_RADIUS_KM = 6371;

interface MatchResult {
  matchingHospitals: any[];
  matchingBloodBanks: any[];
  matchingDonors: any[];
  recommendedSource: {
    type: 'Hospital' | 'BloodBank' | 'Donor';
    id: string;
    name: string;
    distance: number;
    matchScore: number;
  } | null;
  estimatedResponseTime: string;
  summary: {
    totalHospitalMatches: number;
    totalBloodBankMatches: number;
    totalDonorMatches: number;
    inventoryFound: boolean;
    averageDistance: number;
  };
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

// Calculate match score based on multiple factors
function calculateMatchScore(
  distance: number,
  units: number,
  expiryDays: number,
  priority: string,
  requiredUnits: number
): number {
  let score = 100;

  // Distance score (closer is better, max -40 points)
  const distanceScore = Math.max(0, 40 - (distance / MATCHING_RADIUS_KM) * 40);
  score -= 40 - distanceScore;

  // Units score (sufficient units is better, max +30 points)
  const unitRatio = Math.min(units / requiredUnits, 1);
  const unitsScore = unitRatio * 30;
  score += unitsScore;

  // Expiry score (prefer units expiring sooner but still valid, max +20 points)
  const expiryScore = Math.max(0, 20 - (expiryDays / 30) * 20);
  score += expiryScore;

  // Priority multiplier
  const priorityMultiplier = {
    Critical: 1.3,
    High: 1.15,
    Normal: 1.0,
  }[priority] || 1.0;

  return Math.round(score * priorityMultiplier);
}

export class MatchingService {
  // Main matching engine
  async findMatches(requesterId: string, bloodGroup: string, unitsRequired: number, priority: string, requesterLoc: any): Promise<MatchResult> {
    try {
      logger.info(`Starting matching engine for blood group ${bloodGroup}, units: ${unitsRequired}`);

      // Get requester coordinates
      const requesterCoords = requesterLoc.coordinates; // [longitude, latitude]

      // Find matching hospitals and blood banks with inventory
      const [hospitals, bloodBanks, donors] = await Promise.all([
        this.findMatchingHospitals(bloodGroup, unitsRequired, requesterCoords, priority),
        this.findMatchingBloodBanks(bloodGroup, unitsRequired, requesterCoords, priority),
        this.findMatchingDonors(bloodGroup, requesterCoords),
      ]);

      // Determine recommended source
      const allMatches = [
        ...hospitals.map((h: any) => ({ ...h, type: 'Hospital' })),
        ...bloodBanks.map((b: any) => ({ ...b, type: 'BloodBank' })),
        ...donors.map((d: any) => ({ ...d, type: 'Donor' })),
      ];

      const topMatches = allMatches.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 5);

      const recommendedSource = topMatches.length > 0 ? topMatches[0] : null;

      // Calculate average distance
      const distances = allMatches.map((m: any) => m.distance).filter((d: number) => d !== undefined);
      const avgDistance = distances.length > 0 ? Math.round(distances.reduce((a: number, b: number) => a + b) / distances.length) : 0;

      // Estimate response time based on distance and priority
      const estimatedResponseTime = this.estimateResponseTime(recommendedSource?.distance || 0, priority);

      const result: MatchResult = {
        matchingHospitals: hospitals,
        matchingBloodBanks: bloodBanks,
        matchingDonors: donors,
        recommendedSource: recommendedSource,
        estimatedResponseTime,
        summary: {
          totalHospitalMatches: hospitals.length,
          totalBloodBankMatches: bloodBanks.length,
          totalDonorMatches: donors.length,
          inventoryFound: hospitals.length > 0 || bloodBanks.length > 0,
          averageDistance: avgDistance,
        },
      };

      logger.info(`Matching complete: ${hospitals.length} hospitals, ${bloodBanks.length} blood banks, ${donors.length} donors`);
      return result;
    } catch (error) {
      logger.error('Matching engine error:', error);
      throw error;
    }
  }

  // Find matching hospitals with inventory
  private async findMatchingHospitals(
    bloodGroup: string,
    unitsRequired: number,
    requesterCoords: number[],
    priority: string
  ): Promise<any[]> {
    try {
      const now = new Date();
      const hospitals = await Hospital.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: requesterCoords,
            },
            $maxDistance: MATCHING_RADIUS_KM * 1000, // Convert to meters
          },
        },
      });

      const results = [];

      for (const hospital of hospitals) {
        const inventory = await BloodInventory.findOne({
          hospitalId: hospital._id,
          bloodGroup,
          status: { $ne: 'Expired' },
          expiryDate: { $gt: now },
        }).sort({ expiryDate: 1 });

        if (inventory) {
          const distance = calculateDistance(
            requesterCoords[1],
            requesterCoords[0],
            hospital.location.coordinates[1],
            hospital.location.coordinates[0]
          );

          const expiryDate = new Date(inventory.expiryDate);
          const expiryDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          const matchScore = calculateMatchScore(distance, inventory.units, expiryDays, priority, unitsRequired);

          results.push({
            id: hospital._id,
            name: hospital.name,
            distance: Math.round(distance),
            availableUnits: inventory.units,
            expiryDate: inventory.expiryDate,
            matchScore,
            city: hospital.city,
            state: hospital.state,
          });
        }
      }

      return results.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 5);
    } catch (error) {
      logger.error('Error finding matching hospitals:', error);
      return [];
    }
  }

  // Find matching blood banks with inventory
  private async findMatchingBloodBanks(
    bloodGroup: string,
    unitsRequired: number,
    requesterCoords: number[],
    priority: string
  ): Promise<any[]> {
    try {
      const now = new Date();
      const bloodBanks = await BloodBank.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: requesterCoords,
            },
            $maxDistance: MATCHING_RADIUS_KM * 1000,
          },
        },
      });

      const results = [];

      for (const bloodBank of bloodBanks) {
        const inventory = await BloodInventory.findOne({
          hospitalId: bloodBank._id,
          bloodGroup,
          status: { $ne: 'Expired' },
          expiryDate: { $gt: now },
        }).sort({ expiryDate: 1 });

        if (inventory) {
          const distance = calculateDistance(
            requesterCoords[1],
            requesterCoords[0],
            bloodBank.location.coordinates[1],
            bloodBank.location.coordinates[0]
          );

          const expiryDate = new Date(inventory.expiryDate);
          const expiryDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          const matchScore = calculateMatchScore(distance, inventory.units, expiryDays, priority, unitsRequired);

          results.push({
            id: bloodBank._id,
            name: bloodBank.name,
            distance: Math.round(distance),
            availableUnits: inventory.units,
            expiryDate: inventory.expiryDate,
            matchScore,
            city: bloodBank.city,
            state: bloodBank.state,
          });
        }
      }

      return results.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 5);
    } catch (error) {
      logger.error('Error finding matching blood banks:', error);
      return [];
    }
  }

  // Find matching donors
  private async findMatchingDonors(bloodGroup: string, requesterCoords: number[]): Promise<any[]> {
    try {
      const now = new Date();
      const donors = await Donor.find({
        bloodGroup,
        availabilityStatus: 'Available',
        nextEligibleDate: { $lte: now },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: requesterCoords,
            },
            $maxDistance: MATCHING_RADIUS_KM * 1000,
          },
        },
      });

      const results = donors.map((donor: any) => {
        const distance = calculateDistance(
          requesterCoords[1],
          requesterCoords[0],
          donor.location.coordinates[1],
          donor.location.coordinates[0]
        );

        // Donor match score based on distance primarily
        const matchScore = Math.round(100 - (distance / MATCHING_RADIUS_KM) * 100);

        return {
          id: donor._id,
          name: donor.fullName,
          distance: Math.round(distance),
          bloodGroup: donor.bloodGroup,
          phone: donor.phone,
          matchScore,
          city: donor.city,
          state: donor.state,
        };
      });

      return results.sort((a: any, b: any) => a.distance - b.distance).slice(0, 10);
    } catch (error) {
      logger.error('Error finding matching donors:', error);
      return [];
    }
  }

  // Estimate response time based on distance and priority
  private estimateResponseTime(distance: number, priority: string): string {
    // Base time: 30 minutes for processing
    let baseTime = 30;

    // Add time based on distance (assume 60 km/h average speed)
    const travelTime = Math.ceil((distance / 60) * 60);

    // Reduce time based on priority
    const priorityReduction = {
      Critical: 0.5,
      High: 0.75,
      Normal: 1.0,
    }[priority] || 1.0;

    const totalMinutes = Math.round((baseTime + travelTime) * priorityReduction);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes} minutes`;
    }
    return `${hours}h ${minutes}m`;
  }
}

export default new MatchingService();
