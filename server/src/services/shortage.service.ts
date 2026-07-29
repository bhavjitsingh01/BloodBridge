import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import BloodInventory from '../models/BloodInventory';
import EmergencyRequest from '../models/EmergencyRequest';
import logger from '../utils/logger';

interface ShortageLocation {
  id: string;
  name: string;
  type: 'Hospital' | 'BloodBank';
  city: string;
  state: string;
  coordinates: [number, number];
}

interface BloodGroupShortage {
  bloodGroup: string;
  predictedDemand: number;
  currentInventory: number;
  shortfallUnits: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  requiredBy: Date;
}

interface TransferRecommendation {
  from: ShortageLocation;
  to: ShortageLocation;
  bloodGroup: string;
  unitsToTransfer: number;
  distance: number;
  priority: 'Normal' | 'High' | 'Critical';
}

interface ShortageDetectionResult {
  shortageLocations: Array<{
    location: ShortageLocation;
    shortages: BloodGroupShortage[];
    totalShortfall: number;
  }>;
  surplusLocations: Array<{
    location: ShortageLocation;
    surplus: Array<{ bloodGroup: string; units: number }>;
    totalSurplus: number;
  }>;
  transferRecommendations: TransferRecommendation[];
  generatedAt: Date;
  analysisScope: string;
}

const EARTH_RADIUS_KM = 6371;

export class ShortageService {
  private readonly BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  private readonly SHORTAGE_THRESHOLD = 0.3; // 30% threshold for shortage alert
  private readonly TRANSFER_RADIUS_KM = 100;

  async detectShortages(): Promise<ShortageDetectionResult> {
    try {
      logger.info('Starting shortage detection analysis');

      const now = new Date();

      // Get all hospitals and blood banks
      const [hospitals, bloodBanks] = await Promise.all([
        Hospital.find({}),
        BloodBank.find({}),
      ]);

      const locations = [
        ...hospitals.map((h) => ({ ...h.toObject(), type: 'Hospital' as const })),
        ...bloodBanks.map((b) => ({ ...b.toObject(), type: 'BloodBank' as const })),
      ];

      const shortageLocations = [];
      const surplusLocations = [];

      // Analyze each location
      for (const location of locations) {
        const shortages = await this.analyzeLocationShortages(location._id, location.type, location.city, location.state);
        const surplus = await this.analyzeLocationSurplus(location._id);

        if (shortages.length > 0) {
          shortageLocations.push({
            location: {
              id: location._id,
              name: location.name,
              type: location.type,
              city: location.city,
              state: location.state,
              coordinates: location.location?.coordinates || [0, 0],
            },
            shortages,
            totalShortfall: shortages.reduce((sum, s) => sum + s.shortfallUnits, 0),
          });
        }

        if (surplus.length > 0) {
          surplusLocations.push({
            location: {
              id: location._id,
              name: location.name,
              type: location.type,
              city: location.city,
              state: location.state,
              coordinates: location.location?.coordinates || [0, 0],
            },
            surplus,
            totalSurplus: surplus.reduce((sum, s) => sum + s.units, 0),
          });
        }
      }

      // Generate transfer recommendations
      const transferRecommendations = this.generateTransferRecommendations(
        shortageLocations,
        surplusLocations
      );

      const result: ShortageDetectionResult = {
        shortageLocations: shortageLocations.sort((a, b) => b.totalShortfall - a.totalShortfall),
        surplusLocations: surplusLocations.sort((a, b) => b.totalSurplus - a.totalSurplus),
        transferRecommendations: transferRecommendations.sort((a, b) => {
          const priorityMap = { Critical: 0, High: 1, Normal: 2 };
          return priorityMap[a.priority] - priorityMap[b.priority];
        }),
        generatedAt: new Date(),
        analysisScope: `${locations.length} locations analyzed`,
      };

      logger.info(`Shortage detection complete: ${shortageLocations.length} locations with shortages`);
      return result;
    } catch (error) {
      logger.error('Shortage detection error:', error);
      throw error;
    }
  }

  private async analyzeLocationShortages(
    locationId: string,
    locationType: 'Hospital' | 'BloodBank',
    city: string,
    state: string
  ): Promise<BloodGroupShortage[]> {
    const now = new Date();
    const shortages: BloodGroupShortage[] = [];
    const requiredBy = new Date();
    requiredBy.setDate(requiredBy.getDate() + 7); // Default 7-day requirement window

    for (const bloodGroup of this.BLOOD_GROUPS) {
      // Get current inventory
      const inventory = await BloodInventory.findOne({
        hospitalId: locationId,
        bloodGroup,
        status: { $ne: 'Expired' },
        expiryDate: { $gt: now },
      });

      const currentInventory = inventory?.units || 0;

      // Get historical demand for this location
      const historicalRequests = await EmergencyRequest.find({
        bloodGroup,
        requesterType: locationType,
        requesterId: locationId,
        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      });

      const avgDemand = historicalRequests.length > 0
        ? historicalRequests.reduce((sum, req) => sum + req.unitsRequired, 0) / historicalRequests.length
        : 0;

      // Project 7-day demand
      const projectedDemand = Math.round(avgDemand * 7);

      // Identify shortage
      if (currentInventory < projectedDemand * (1 - this.SHORTAGE_THRESHOLD)) {
        const shortfallUnits = projectedDemand - currentInventory;

        shortages.push({
          bloodGroup,
          predictedDemand: projectedDemand,
          currentInventory,
          shortfallUnits: Math.max(0, shortfallUnits),
          riskLevel: this.calculateShortageRiskLevel(currentInventory, projectedDemand),
          requiredBy,
        });
      }
    }

    return shortages;
  }

  private async analyzeLocationSurplus(locationId: string): Promise<Array<{ bloodGroup: string; units: number }>> {
    const now = new Date();
    const surplus = [];

    for (const bloodGroup of this.BLOOD_GROUPS) {
      const inventory = await BloodInventory.findOne({
        hospitalId: locationId,
        bloodGroup,
        status: { $ne: 'Expired' },
        expiryDate: { $gt: now },
      });

      if (!inventory) continue;

      // Get demand
      const historicalRequests = await EmergencyRequest.find({
        bloodGroup,
        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
      });

      const avgDemand = historicalRequests.length > 0
        ? historicalRequests.reduce((sum, req) => sum + req.unitsRequired, 0) / historicalRequests.length
        : 0;

      const projectedDemand = Math.round(avgDemand * 7);

      if (inventory.units > projectedDemand * 1.5) {
        surplus.push({
          bloodGroup,
          units: inventory.units - projectedDemand,
        });
      }
    }

    return surplus;
  }

  private calculateShortageRiskLevel(
    currentInventory: number,
    projectedDemand: number
  ): 'Low' | 'Medium' | 'High' | 'Critical' {
    const ratio = currentInventory / projectedDemand;

    if (ratio < 0.2) return 'Critical';
    if (ratio < 0.4) return 'High';
    if (ratio < 0.6) return 'Medium';
    return 'Low';
  }

  private generateTransferRecommendations(
    shortageLocations: any[],
    surplusLocations: any[]
  ): TransferRecommendation[] {
    const recommendations: TransferRecommendation[] = [];

    for (const shortageData of shortageLocations) {
      for (const shortage of shortageData.shortages) {
        // Find nearest surplus location with this blood group
        const bestMatch = this.findBestSurplusMatch(
          shortageData.location,
          shortage.bloodGroup,
          shortage.shortfallUnits,
          surplusLocations
        );

        if (bestMatch) {
          recommendations.push({
            from: bestMatch.location,
            to: shortageData.location,
            bloodGroup: shortage.bloodGroup,
            unitsToTransfer: Math.min(bestMatch.availableUnits, shortage.shortfallUnits),
            distance: bestMatch.distance,
            priority: shortage.riskLevel as any,
          });
        }
      }
    }

    return recommendations;
  }

  private findBestSurplusMatch(
    shortageLocation: ShortageLocation,
    bloodGroup: string,
    requiredUnits: number,
    surplusLocations: any[]
  ): any {
    let bestMatch = null;
    let bestScore = -Infinity;

    for (const surplusData of surplusLocations) {
      const surplusBG = surplusData.surplus.find((s: any) => s.bloodGroup === bloodGroup);
      if (!surplusBG) continue;

      const distance = this.calculateDistance(
        shortageLocation.coordinates,
        surplusData.location.coordinates
      );

      if (distance > this.TRANSFER_RADIUS_KM) continue;

      // Score: prefer closer and larger surplus
      const score = (surplusBG.units / requiredUnits) * 100 - (distance / this.TRANSFER_RADIUS_KM) * 50;

      if (score > bestScore) {
        bestScore = score;
        bestMatch = {
          location: surplusData.location,
          availableUnits: surplusBG.units,
          distance: Math.round(distance),
        };
      }
    }

    return bestMatch;
  }

  private calculateDistance(coords1: [number, number], coords2: [number, number]): number {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
  }
}

export default new ShortageService();
