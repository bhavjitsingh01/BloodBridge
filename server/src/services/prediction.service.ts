import EmergencyRequest from '../models/EmergencyRequest';
import BloodInventory from '../models/BloodInventory';
import Hospital from '../models/Hospital';
import logger from '../utils/logger';

interface DemandPrediction {
  bloodGroup: string;
  predictedUnits: number;
  historicalAverage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  confidenceScore: number;
  timeframe: '7days' | '30days' | '90days';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  predictedDate: Date;
}

interface PredictionResult {
  predictions: DemandPrediction[];
  generatedAt: Date;
  analysisMethod: string;
  dataPoints: number;
}

export class PredictionService {
  private readonly BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  private readonly RISK_THRESHOLDS = {
    Low: { confidence: 0.8, trend: 1.2 },
    Medium: { confidence: 0.6, trend: 1.5 },
    High: { confidence: 0.4, trend: 2.0 },
    Critical: { confidence: 0.0, trend: 2.5 },
  };

  async predictDemand(timeframe: '7days' | '30days' | '90days' = '30days'): Promise<PredictionResult> {
    try {
      logger.info(`Starting demand prediction for ${timeframe}`);

      const predictions: DemandPrediction[] = [];
      const daysBack = this.getTimeframeInDays(timeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      for (const bloodGroup of this.BLOOD_GROUPS) {
        const prediction = await this.predictBloodGroupDemand(bloodGroup, timeframe, startDate);
        predictions.push(prediction);
      }

      const result: PredictionResult = {
        predictions: predictions.sort((a, b) => b.confidenceScore - a.confidenceScore),
        generatedAt: new Date(),
        analysisMethod: 'Statistical Analysis (Moving Average + Trend Analysis)',
        dataPoints: predictions.length,
      };

      logger.info(`Demand prediction complete: ${predictions.length} blood groups analyzed`);
      return result;
    } catch (error) {
      logger.error('Prediction service error:', error);
      throw error;
    }
  }

  private async predictBloodGroupDemand(
    bloodGroup: string,
    timeframe: '7days' | '30days' | '90days',
    startDate: Date
  ): Promise<DemandPrediction> {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + this.getTimeframeInDays(timeframe));

    // Get historical emergency requests
    const historicalRequests = await EmergencyRequest.find({
      bloodGroup,
      createdAt: { $gte: startDate, $lte: now },
    });

    // Get current inventory
    const currentInventory = await BloodInventory.find({
      bloodGroup,
      status: { $ne: 'Expired' },
      expiryDate: { $gt: now },
    });

    // Calculate metrics
    const historicalAverage = historicalRequests.length > 0
      ? Math.round(historicalRequests.reduce((sum, req) => sum + req.unitsRequired, 0) / historicalRequests.length)
      : 0;

    const totalCurrentUnits = currentInventory.reduce((sum, inv) => sum + inv.units, 0);
    const requestFrequency = historicalRequests.length;

    // Trend analysis
    const mid = Math.floor(historicalRequests.length / 2);
    const firstHalf = historicalRequests.slice(0, mid).reduce((sum, req) => sum + req.unitsRequired, 0);
    const secondHalf = historicalRequests.slice(mid).reduce((sum, req) => sum + req.unitsRequired, 0);
    const trend = this.calculateTrend(firstHalf, secondHalf);

    // Predict future demand
    const predictedUnits = this.calculatePredictedDemand(
      historicalAverage,
      trend,
      requestFrequency,
      this.getTimeframeInDays(timeframe)
    );

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      historicalRequests.length,
      requestFrequency,
      totalCurrentUnits
    );

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(
      predictedUnits,
      totalCurrentUnits,
      confidenceScore,
      trend
    );

    return {
      bloodGroup,
      predictedUnits,
      historicalAverage,
      trend,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      timeframe,
      riskLevel,
      predictedDate: endDate,
    };
  }

  private calculateTrend(firstHalf: number, secondHalf: number): 'increasing' | 'stable' | 'decreasing' {
    if (firstHalf === 0 && secondHalf === 0) return 'stable';
    if (firstHalf === 0) return 'increasing';

    const changePercent = ((secondHalf - firstHalf) / firstHalf) * 100;
    if (changePercent > 15) return 'increasing';
    if (changePercent < -15) return 'decreasing';
    return 'stable';
  }

  private calculatePredictedDemand(
    historicalAverage: number,
    trend: string,
    requestFrequency: number,
    days: number
  ): number {
    const trendMultiplier = trend === 'increasing' ? 1.2 : trend === 'decreasing' ? 0.8 : 1.0;
    const frequencyAdjustment = Math.max(1, requestFrequency / 10); // Normalize by typical request frequency
    const dailyAverage = historicalAverage * frequencyAdjustment;
    return Math.round(dailyAverage * days * trendMultiplier);
  }

  private calculateConfidenceScore(dataPoints: number, requestFrequency: number, inventoryUnits: number): number {
    let score = 0.5; // Base score

    // More data points = higher confidence
    const dataConfidence = Math.min(dataPoints / 100, 0.25);
    score += dataConfidence;

    // Regular request pattern = higher confidence
    const frequencyConfidence = Math.min(requestFrequency / 50, 0.15);
    score += frequencyConfidence;

    // Adequate inventory data = higher confidence
    const inventoryConfidence = Math.min(inventoryUnits / 1000, 0.1);
    score += inventoryConfidence;

    return Math.min(score, 0.99);
  }

  private calculateRiskLevel(
    predictedUnits: number,
    currentUnits: number,
    confidenceScore: number,
    trend: string
  ): 'Low' | 'Medium' | 'High' | 'Critical' {
    const supplyRatio = currentUnits > 0 ? predictedUnits / currentUnits : 999;

    // Determine risk based on multiple factors
    if (supplyRatio > 3 && confidenceScore > 0.8 && trend === 'increasing') return 'Critical';
    if (supplyRatio > 2 && confidenceScore > 0.6) return 'High';
    if (supplyRatio > 1.5) return 'Medium';
    return 'Low';
  }

  private getTimeframeInDays(timeframe: '7days' | '30days' | '90days'): number {
    const timeframes: Record<string, number> = {
      '7days': 7,
      '30days': 30,
      '90days': 90,
    };
    return timeframes[timeframe] || 30;
  }
}

export default new PredictionService();
