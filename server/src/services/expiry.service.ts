import BloodInventory from '../models/BloodInventory';
import Hospital from '../models/Hospital';
import BloodBank from '../models/BloodBank';
import logger from '../utils/logger';

interface ExpiryRiskItem {
  id: string;
  bloodGroup: string;
  units: number;
  expiryDate: Date;
  daysUntilExpiry: number;
  location: {
    id: string;
    name: string;
    type: 'Hospital' | 'BloodBank';
    city: string;
    state: string;
  };
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  collectionDate: Date;
  ageInDays: number;
}

interface ExpiryWindow {
  window: '3days' | '7days' | '14days';
  count: number;
  totalUnits: number;
  items: ExpiryRiskItem[];
  estimatedWaste: number;
  recommendedActions: string[];
}

interface ExpiryRiskResult {
  expiryWindows: {
    threeDays: ExpiryWindow;
    sevenDays: ExpiryWindow;
    fourteenDays: ExpiryWindow;
  };
  summary: {
    totalAtRisk: number;
    totalAtRiskUnits: number;
    criticalItems: number;
    estimatedTotalWaste: number;
  };
  generatedAt: Date;
}

export class ExpiryService {
  async detectExpiryRisks(): Promise<ExpiryRiskResult> {
    try {
      logger.info('Starting expiry risk detection');

      const now = new Date();

      // Define time windows
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Get inventory items in each window
      const [threeDayItems, sevenDayItems, fourteenDayItems] = await Promise.all([
        this.getExpiryItems(now, threeDaysLater),
        this.getExpiryItems(now, sevenDaysLater),
        this.getExpiryItems(now, fourteenDaysLater),
      ]);

      // Get unique items for each window (exclude items already in smaller windows)
      const threeDayUnique = threeDayItems;
      const sevenDayUnique = sevenDayItems.filter(
        (item) => !threeDayItems.some((t) => t.id === item.id)
      );
      const fourteenDayUnique = fourteenDayItems.filter(
        (item) => !sevenDayItems.some((s) => s.id === item.id)
      );

      const result: ExpiryRiskResult = {
        expiryWindows: {
          threeDays: this.createExpiryWindow('3days', threeDayUnique, now),
          sevenDays: this.createExpiryWindow('7days', sevenDayUnique, now),
          fourteenDays: this.createExpiryWindow('14days', fourteenDayUnique, now),
        },
        summary: {
          totalAtRisk: threeDayItems.length + sevenDayItems.length + fourteenDayItems.length,
          totalAtRiskUnits: this.sumUnits([...threeDayItems, ...sevenDayItems, ...fourteenDayItems]),
          criticalItems: threeDayItems.filter((i) => i.riskLevel === 'Critical').length,
          estimatedTotalWaste: this.sumUnits(
            [...threeDayItems, ...sevenDayItems, ...fourteenDayItems].filter(
              (i) => i.riskLevel === 'Critical'
            )
          ),
        },
        generatedAt: new Date(),
      };

      logger.info(`Expiry detection complete: ${result.summary.totalAtRisk} items at risk`);
      return result;
    } catch (error) {
      logger.error('Expiry risk detection error:', error);
      throw error;
    }
  }

  private async getExpiryItems(startDate: Date, endDate: Date): Promise<ExpiryRiskItem[]> {
    const items: ExpiryRiskItem[] = [];

    // Get all blood inventory expiring within the window
    const inventory = await BloodInventory.find({
      expiryDate: { $gte: startDate, $lte: endDate },
      status: { $ne: 'Expired' },
    }).populate('hospitalId');

    for (const inv of inventory) {
      const daysUntilExpiry = Math.ceil(
        (new Date(inv.expiryDate).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const ageInDays = Math.ceil(
        (startDate.getTime() - new Date(inv.collectionDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Get location details
      let location: any = null;
      let locationType: 'Hospital' | 'BloodBank' = 'Hospital';

      const hospital = await Hospital.findById(inv.hospitalId);
      if (hospital) {
        location = hospital;
      } else {
        const bloodBank = await BloodBank.findById(inv.hospitalId);
        if (bloodBank) {
          location = bloodBank;
          locationType = 'BloodBank';
        }
      }

      if (location) {
        items.push({
          id: inv._id.toString(),
          bloodGroup: inv.bloodGroup,
          units: inv.units,
          expiryDate: inv.expiryDate,
          daysUntilExpiry,
          location: {
            id: location._id.toString(),
            name: location.name,
            type: locationType,
            city: location.city,
            state: location.state,
          },
          riskLevel: this.calculateExpiryRiskLevel(daysUntilExpiry),
          collectionDate: inv.collectionDate,
          ageInDays,
        });
      }
    }

    return items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  private createExpiryWindow(
    window: '3days' | '7days' | '14days',
    items: ExpiryRiskItem[],
    now: Date
  ): ExpiryWindow {
    const criticalItems = items.filter((i) => i.riskLevel === 'Critical' || i.riskLevel === 'High');
    const recommendedActions = this.generateRecommendedActions(window, items, now);

    return {
      window,
      count: items.length,
      totalUnits: this.sumUnits(items),
      items: items.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry),
      estimatedWaste: this.sumUnits(criticalItems),
      recommendedActions,
    };
  }

  private calculateExpiryRiskLevel(daysUntilExpiry: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (daysUntilExpiry <= 1) return 'Critical';
    if (daysUntilExpiry <= 3) return 'High';
    if (daysUntilExpiry <= 7) return 'Medium';
    return 'Low';
  }

  private generateRecommendedActions(
    window: string,
    items: ExpiryRiskItem[],
    now: Date
  ): string[] {
    const actions: string[] = [];
    const totalUnits = this.sumUnits(items);
    const criticalCount = items.filter((i) => i.riskLevel === 'Critical').length;

    if (window === '3days') {
      if (criticalCount > 0) {
        actions.push('URGENT: Issue emergency transfusion requests for critically expiring units');
      }
      actions.push('Prioritize usage of expiring blood units in scheduled surgeries');
      actions.push('Contact nearby hospitals for emergency transfer of critical units');
    } else if (window === '7days') {
      actions.push('Identify hospitals with high demand for these blood groups');
      actions.push('Schedule transfers to hospitals with lower inventory');
      actions.push('Communicate with emergency department about blood availability');
    } else if (window === '14days') {
      actions.push('Plan ahead for expected demand in the coming weeks');
      actions.push('Coordinate with donor recruitment teams if shortage expected');
      actions.push('Monitor usage patterns to adjust collection schedule');
    }

    if (totalUnits > 100) {
      actions.push(`Large quantity at risk (${totalUnits} units): Consider immediate distribution strategy`);
    }

    return actions;
  }

  private sumUnits(items: ExpiryRiskItem[]): number {
    return items.reduce((sum, item) => sum + item.units, 0);
  }
}

export default new ExpiryService();
