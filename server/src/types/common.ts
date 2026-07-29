import { Types } from 'mongoose';
import { BloodGroup, UserRole, RequestStatus, PriorityLevel } from '../config/constants';

// Pagination
export interface PaginationQuery {
  page: number;
  limit: number;
  sort?: string;
  search?: string;
}

// Geolocation
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: Coordinates;
}

// Distance calculation result
export interface DistanceResult {
  distance: number; // in km
  eta: number; // estimated time in minutes
}

// Nearby facility
export interface NearbyFacility {
  facilityId: Types.ObjectId;
  facilityName: string;
  facilityType: 'hospital' | 'blood-bank';
  distance: number; // km
  eta: number; // minutes
  coordinates: Coordinates;
}

// Blood unit
export interface BloodUnit {
  batchNumber: string;
  collectionDate: Date;
  expiryDate: Date;
  quantity: number;
  status: 'available' | 'reserved' | 'transferred' | 'expired';
}

// Operating hours
export interface OperatingHours {
  open: string; // "HH:mm"
  close: string; // "HH:mm"
  daysOpen: number[]; // 0-6 for Sun-Sat
}

// Medical history
export interface MedicalHistory {
  hasChronicDisease: boolean;
  diseaseDetails?: string;
  lastMedicalCheckup?: Date;
  bloodPressure?: string;
  hemoglobin?: number;
}

// Patient info
export interface PatientInfo {
  age: number;
  bloodGroup: BloodGroup;
  condition: string;
  reason?: string;
}

// Donation record
export interface DonationRecord {
  date: Date;
  location: Types.ObjectId;
  unitsCollected: number;
  healthStatus: string;
}

// Transfer recommendation
export interface TransferRecommendation {
  fromFacility: Types.ObjectId;
  toFacility: Types.ObjectId;
  bloodGroup: BloodGroup;
  units: number;
  distance: number;
  eta: number;
  reason: string;
  confidence: number; // 0-100%
}

// Emergency matching result
export interface EmergencyMatch {
  sourceType: 'hospital' | 'blood-bank' | 'donor';
  sourceId: Types.ObjectId;
  sourceName: string;
  distance: number;
  eta: number;
  availableUnits: number;
  compatibility: number; // 0-100%
}

// Prediction forecast
export interface PredictionForecast {
  timeframe: string;
  estimatedDemand: number;
  estimatedSupply: number;
  shortage: number;
}

// Dashboard statistics
export interface DashboardStats {
  totalDonors: number;
  totalHospitals: number;
  totalBloodBanks: number;
  totalInventory: number;
  lowStockAlerts: number;
  criticalAlerts: number;
  pendingRequests: number;
  activeEmergencies: number;
  bloodGroupDistribution: Record<BloodGroup, number>;
}

// API Filter options
export interface FilterOptions {
  bloodGroup?: BloodGroup;
  status?: string;
  priority?: PriorityLevel;
  startDate?: Date;
  endDate?: Date;
  city?: string;
  state?: string;
}

// Query builder result
export interface QueryBuilderResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
