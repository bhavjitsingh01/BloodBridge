import { Schema, model, Document, Types } from 'mongoose';
import { BLOOD_GROUPS, BloodGroup, PREDICTION_TYPES, PredictionType, RISK_LEVELS, RiskLevel, FORECAST_TIMEFRAMES, ForecastTimeframe } from '../config/constants';

export interface IAIPrediction extends Document {
  predictionType: PredictionType;
  facility?: Types.ObjectId;
  bloodGroup: BloodGroup;
  prediction: {
    currentLevel: number;
    predictedLevel: number;
    riskLevel: RiskLevel;
    forecast: {
      timeframe: ForecastTimeframe;
      estimatedDemand: number;
      estimatedSupply: number;
      shortage: number;
    };
  };
  confidence: number;
  factors: {
    historicalUsage: number;
    seasonalTrends: string;
    upcomingEvents: string;
    currentInventory: number;
    recentTransactions: number;
  };
  recommendations: string[];
  generatedAt: Date;
  validUntil: Date;
  updatedAt: Date;
}

const aiPredictionSchema = new Schema<IAIPrediction>(
  {
    predictionType: {
      type: String,
      enum: PREDICTION_TYPES,
      required: true,
    },
    facility: {
      type: Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    prediction: {
      currentLevel: { type: Number, required: true },
      predictedLevel: { type: Number, required: true },
      riskLevel: { type: String, enum: RISK_LEVELS, required: true },
      forecast: {
        timeframe: {
          type: String,
          enum: FORECAST_TIMEFRAMES,
          required: true,
        },
        estimatedDemand: { type: Number, required: true },
        estimatedSupply: { type: Number, required: true },
        shortage: { type: Number, required: true },
      },
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    factors: {
      historicalUsage: { type: Number, default: 0 },
      seasonalTrends: { type: String, default: '' },
      upcomingEvents: { type: String, default: '' },
      currentInventory: { type: Number, default: 0 },
      recentTransactions: { type: Number, default: 0 },
    },
    recommendations: [String],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    validUntil: Date,
  },
  { timestamps: true }
);

// Indexes
aiPredictionSchema.index({ predictionType: 1 });
aiPredictionSchema.index({ facility: 1 });
aiPredictionSchema.index({ bloodGroup: 1 });

export default model<IAIPrediction>('AIPrediction', aiPredictionSchema);
