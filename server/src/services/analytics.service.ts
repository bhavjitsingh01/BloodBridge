import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import BloodInventory from '../models/BloodInventory';
import BloodRequest from '../models/BloodRequest';
import DonationAppointment from '../models/DonationAppointment';
import Donor from '../models/Donor';
import Transaction from '../models/Transaction';
import { NotFoundError } from '../utils/errors';
import { BLOOD_GROUPS } from '../config/constants';

interface SupplyMapItem {
  totalUnits: number;
  byBloodGroup: Record<string, number>;
}

interface DemandMapItem {
  totalUnits: number;
  byBloodGroup: Record<string, number>;
}

interface TrendMap {
  [date: string]: number;
}

export class AnalyticsService {
  /**
   * Get system-wide dashboard statistics
   */
  static async getDashboardStats(): Promise<any> {
    const [
      totalHospitals,
      totalBloodBanks,
      totalDonors,
      pendingRequests,
      completedDonations,
      totalInventoryUnits,
    ] = await Promise.all([
      Hospital.countDocuments(),
      BloodBank.countDocuments(),
      Donor.countDocuments(),
      BloodRequest.countDocuments({ status: 'pending' }),
      DonationAppointment.countDocuments({ status: 'completed' }),
      BloodInventory.aggregate([{ $group: { _id: null, total: { $sum: '$totalUnits' } } }]),
    ]);

    return {
      totalFacilities: totalHospitals + totalBloodBanks,
      totalHospitals,
      totalBloodBanks,
      totalDonors,
      pendingBloodRequests: pendingRequests,
      successfulDonations: completedDonations,
      totalBloodUnits: totalInventoryUnits[0]?.total || 0,
      systemHealthScore: this.calculateHealthScore(
        totalHospitals,
        totalBloodBanks,
        totalDonors,
        pendingRequests
      ),
    };
  }

  /**
   * Get blood supply map (availability by location)
   */
  static async getBloodSupplyMap(): Promise<any> {
    const hospitals = await Hospital.find().select('name address');
    const inventory = await BloodInventory.find().select('facility totalUnits bloodGroup');

    // Group by facility
    const supplyMap: Record<string, SupplyMapItem> = {};
    for (const inv of inventory) {
      const facilityId = inv.facility.toString();
      if (!supplyMap[facilityId]) {
        supplyMap[facilityId] = { totalUnits: 0, byBloodGroup: {} };
      }
      supplyMap[facilityId].totalUnits += inv.totalUnits;
      supplyMap[facilityId].byBloodGroup[inv.bloodGroup] = inv.totalUnits;
    }

    return { supply: supplyMap, hospitals };
  }

  /**
   * Get blood demand map (requests by location)
   */
  static async getBloodDemandMap(): Promise<any> {
    const requests = await BloodRequest.find({ status: 'pending' }).select(
      'requestingFacility bloodGroup unitsRequired'
    );

    // Group by facility
    const demandMap: Record<string, DemandMapItem> = {};
    for (const req of requests) {
      const facilityId = req.requestingFacility.toString();
      if (!demandMap[facilityId]) {
        demandMap[facilityId] = { totalUnits: 0, byBloodGroup: {} };
      }
      demandMap[facilityId].totalUnits += req.unitsRequired;
      if (!demandMap[facilityId].byBloodGroup[req.bloodGroup]) {
        demandMap[facilityId].byBloodGroup[req.bloodGroup] = 0;
      }
      demandMap[facilityId].byBloodGroup[req.bloodGroup] += req.unitsRequired;
    }

    return demandMap;
  }

  /**
   * Get hospital-specific analytics
   */
  static async getHospitalAnalytics(hospitalId: string): Promise<any> {
    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      throw new NotFoundError('Hospital');
    }

    const [inventory, requests, donationAppointments] = await Promise.all([
      BloodInventory.find({ facility: hospitalId }),
      BloodRequest.find({ requestingFacility: hospitalId }),
      DonationAppointment.find({ facility: hospitalId }),
    ]);

    const totalInventoryUnits = inventory.reduce((sum, inv) => sum + inv.totalUnits, 0);
    const fulfilledRequests = requests.filter((r) => r.status === 'fulfilled').length;
    const completedDonations = donationAppointments.filter(
      (a) => a.status === 'completed'
    ).length;

    return {
      hospitalName: hospital.name,
      totalBloodUnits: totalInventoryUnits,
      inventory: inventory.map((inv) => ({
        bloodGroup: inv.bloodGroup,
        available: inv.availableUnits,
        total: inv.totalUnits,
      })),
      requestStats: {
        total: requests.length,
        fulfilled: fulfilledRequests,
        pending: requests.filter((r) => r.status === 'pending').length,
        fulfillmentRate: requests.length > 0 ? (fulfilledRequests / requests.length) * 100 : 0,
      },
      donationStats: {
        totalAppointments: donationAppointments.length,
        completed: completedDonations,
        completionRate:
          donationAppointments.length > 0
            ? (completedDonations / donationAppointments.length) * 100
            : 0,
      },
    };
  }

  /**
   * Get blood bank analytics
   */
  static async getBloodBankAnalytics(bankId: string): Promise<any> {
    const bank = await BloodBank.findById(bankId);
    if (!bank) {
      throw new NotFoundError('Blood Bank');
    }

    const inventory = await BloodInventory.find({ facility: bankId });
    const totalUnits = inventory.reduce((sum, inv) => sum + inv.totalUnits, 0);

    return {
      bankName: bank.name,
      totalBloodUnits: totalUnits,
      inventory: inventory.map((inv) => ({
        bloodGroup: inv.bloodGroup,
        available: inv.availableUnits,
        total: inv.totalUnits,
      })),
      collectionCount: bank.collectionCount,
      distributionCount: bank.distributionCount,
    };
  }

  /**
   * Get donation trends
   */
  static async getDonationTrends(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const donations = await DonationAppointment.find({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'completed',
    });

    // Group by date
    const trends: TrendMap = {};
    for (const donation of donations) {
      const date = donation.createdAt.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    }

    return {
      totalDonationsLast30Days: donations.length,
      averagePerDay: Math.ceil(donations.length / 30),
      trends,
    };
  }

  /**
   * Get blood expiry statistics
   */
  static async getExpiryStatistics(): Promise<any> {
    const inventory = await BloodInventory.find();

    let expiringCount = 0;
    let expiredCount = 0;
    const now = new Date();

    for (const inv of inventory) {
      for (const unit of inv.units) {
        if (unit.expiryDate < now) {
          expiredCount += unit.quantity;
        } else if (unit.expiryDate < new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)) {
          expiringCount += unit.quantity;
        }
      }
    }

    return {
      expiredUnits: expiredCount,
      expiringWithin5Days: expiringCount,
      totalInventoryUnits: inventory.reduce((sum, inv) => sum + inv.totalUnits, 0),
      expiryRisk: inventory.length > 0 ? (expiringCount / (inventory.length * 100)) * 100 : 0,
    };
  }

  /**
   * Get blood transfer history trends
   */
  static async getTransferHistoryTrends(): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transfers = await Transaction.find({
      type: 'transfer',
      createdAt: { $gte: thirtyDaysAgo },
    });

    const totalUnitsTransferred = transfers.reduce((sum, t) => sum + t.units, 0);

    return {
      totalTransfers: transfers.length,
      totalUnitsTransferred,
      averageUnitsPerTransfer: transfers.length > 0 ? totalUnitsTransferred / transfers.length : 0,
      completedTransfers: transfers.filter((t) => t.status === 'completed').length,
    };
  }

  /**
   * Calculate system health score
   */
  private static calculateHealthScore(
    hospitals: number,
    bloodBanks: number,
    donors: number,
    pendingRequests: number
  ): number {
    let score = 100;

    // Penalize if not enough facilities
    if (hospitals + bloodBanks < 5) score -= 20;
    if (donors < 100) score -= 20;

    // Penalize if too many pending requests
    if (pendingRequests > 50) score -= 30;
    if (pendingRequests > 100) score -= 50;

    return Math.max(0, score);
  }
}
