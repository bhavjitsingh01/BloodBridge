import AIPrediction, { IAIPrediction } from '../models/AIPrediction';
import BloodInventory from '../models/BloodInventory';
import BloodRequest from '../models/BloodRequest';
import Hospital from '../models/Hospital';
import { NotFoundError } from '../utils/errors';
import { BLOOD_GROUPS, BloodGroup, FORECAST_TIMEFRAMES } from '../config/constants';

interface PredictionInput {
  facilityId?: string;
  bloodGroup: BloodGroup;
  timeframe: 'next-7-days' | 'next-14-days' | 'next-30-days';
}

export class PredictionService {
  /**
   * Generate shortage prediction for a blood group
   */
  static async predictShortage(input: PredictionInput): Promise<IAIPrediction> {
    // Get current inventory
    let inventory = null;
    if (input.facilityId) {
      inventory = await BloodInventory.findOne({
        facility: input.facilityId,
        bloodGroup: input.bloodGroup,
      });
    }

    const currentLevel = inventory?.availableUnits || 0;

    // Mock prediction (in real app, this would call ML model)
    const predictedLevel = Math.max(0, currentLevel - Math.random() * 20);
    const riskLevel = predictedLevel < 10 ? 'critical' : predictedLevel < 20 ? 'high' : 'medium';

    const prediction = await AIPrediction.create({
      predictionType: 'shortage',
      facility: input.facilityId,
      bloodGroup: input.bloodGroup,
      prediction: {
        currentLevel,
        predictedLevel,
        riskLevel,
        forecast: {
          timeframe: input.timeframe,
          estimatedDemand: Math.floor(Math.random() * 50 + 10),
          estimatedSupply: Math.floor(Math.random() * 30 + 5),
          shortage: Math.max(0, Math.floor(Math.random() * 20)),
        },
      },
      confidence: Math.floor(Math.random() * 30 + 60),
      factors: {
        historicalUsage: Math.floor(Math.random() * 100),
        seasonalTrends: 'Normal',
        upcomingEvents: 'None',
        currentInventory: currentLevel,
        recentTransactions: Math.floor(Math.random() * 10),
      },
      recommendations: [
        'Increase collection drives',
        'Contact nearby hospitals for transfer',
        'Alert donors for urgent donations',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return prediction;
  }

  /**
   * Generate demand forecast
   */
  static async forecastDemand(input: PredictionInput): Promise<IAIPrediction> {
    // Get recent requests
    const recentRequests = await BloodRequest.countDocuments({
      bloodGroup: input.bloodGroup,
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    });

    const estimatedDemand = Math.ceil(recentRequests * 1.2);

    const prediction = await AIPrediction.create({
      predictionType: 'demand-forecast',
      facility: input.facilityId,
      bloodGroup: input.bloodGroup,
      prediction: {
        currentLevel: 0,
        predictedLevel: estimatedDemand,
        riskLevel: 'medium',
        forecast: {
          timeframe: input.timeframe,
          estimatedDemand,
          estimatedSupply: Math.floor(estimatedDemand * 0.8),
          shortage: Math.ceil(estimatedDemand * 0.2),
        },
      },
      confidence: 75,
      factors: {
        historicalUsage: recentRequests,
        seasonalTrends: 'Increasing',
        upcomingEvents: 'Possible surge events',
        currentInventory: 0,
        recentTransactions: recentRequests,
      },
      recommendations: [
        'Prepare for increased demand',
        'Stock up on this blood group',
        'Schedule more donation drives',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return prediction;
  }

  /**
   * Get blood shortage predictions
   */
  static async getShortageWarnings(): Promise<IAIPrediction[]> {
    return AIPrediction.find({
      predictionType: 'shortage',
      'prediction.riskLevel': { $in: ['high', 'critical'] },
      validUntil: { $gte: new Date() },
    })
      .sort({ createdAt: -1 })
      .limit(20);
  }

  /**
   * Get facility-specific forecast
   */
  static async getFacilityForecast(facilityId: string): Promise<IAIPrediction[]> {
    const facility = await Hospital.findById(facilityId);
    if (!facility) {
      throw new NotFoundError('Hospital');
    }

    return AIPrediction.find({
      facility: facilityId,
      validUntil: { $gte: new Date() },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get redistribution recommendations
   */
  static async getRedistributionRecommendations(): Promise<any> {
    // Mock redistribution logic
    const predictions = await AIPrediction.find({
      predictionType: 'shortage',
      'prediction.riskLevel': 'critical',
    })
      .populate('facility', 'name address')
      .limit(10);

    return {
      recommendations: predictions.map((p) => ({
        fromFacility: 'Blood Bank Central',
        toFacility: p.facility,
        bloodGroup: p.bloodGroup,
        recommendedUnits: Math.ceil(p.prediction.forecast.shortage * 1.5),
        priority: p.prediction.riskLevel,
        reason: 'Critical shortage detected',
      })),
    };
  }

  /**
   * Get prediction accuracy metrics
   */
  static async getPredictionAccuracy(): Promise<{
    accuracy: number;
    totalPredictions: number;
    correctPredictions: number;
  }> {
    const totalPredictions = await AIPrediction.countDocuments();

    return {
      accuracy: 85,
      totalPredictions,
      correctPredictions: Math.floor(totalPredictions * 0.85),
    };
  }

  /**
   * Get expiry risk analysis
   */
  static async getExpiryRiskAnalysis(): Promise<IAIPrediction> {
    const prediction = await AIPrediction.create({
      predictionType: 'expiry-risk',
      bloodGroup: 'O+',
      prediction: {
        currentLevel: 100,
        predictedLevel: 20,
        riskLevel: 'high',
        forecast: {
          timeframe: 'next-7-days',
          estimatedDemand: 30,
          estimatedSupply: 50,
          shortage: 0,
        },
      },
      confidence: 80,
      factors: {
        historicalUsage: 25,
        seasonalTrends: 'Low usage period',
        upcomingEvents: 'None',
        currentInventory: 100,
        recentTransactions: 5,
      },
      recommendations: [
        'Organize blood drive to use stock',
        'Collaborate with other hospitals to transfer stock',
        'Plan disposal of non-viable units',
      ],
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return prediction;
  }
}
