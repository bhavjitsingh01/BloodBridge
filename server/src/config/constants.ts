// Blood Groups
export const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

// User Roles
export const USER_ROLES = ['donor', 'hospital', 'blood-bank', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Request Status
export const REQUEST_STATUSES = ['pending', 'fulfilled', 'rejected', 'partial'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

// Emergency Request Status
export const EMERGENCY_STATUSES = ['active', 'fulfilled', 'cancelled'] as const;
export type EmergencyStatus = (typeof EMERGENCY_STATUSES)[number];

// Request Priority
export const PRIORITY_LEVELS = ['normal', 'medium', 'high', 'critical'] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

// Emergency Priority
export const EMERGENCY_PRIORITY = ['medium', 'high', 'critical'] as const;
export type EmergencyPriority = (typeof EMERGENCY_PRIORITY)[number];

// Risk Levels
export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// Appointment Status
export const APPOINTMENT_STATUSES = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

// Eligibility Status
export const ELIGIBILITY_STATUSES = ['eligible', 'ineligible', 'pending'] as const;
export type EligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];

// Availability Status
export const AVAILABILITY_STATUSES = ['available', 'busy', 'not-available'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

// Notification Types
export const NOTIFICATION_TYPES = [
  'blood-needed',
  'emergency',
  'low-stock',
  'expiry-alert',
  'transfer-request',
  'appointment-reminder',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

// Notification Priority
export const NOTIFICATION_PRIORITY = ['low', 'normal', 'high', 'critical'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITY)[number];

// Transaction Types
export const TRANSACTION_TYPES = ['transfer', 'collection', 'usage', 'expiry', 'wastage'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

// Transaction Status
export const TRANSACTION_STATUSES = ['requested', 'approved', 'in-transit', 'completed', 'cancelled'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

// Prediction Types
export const PREDICTION_TYPES = ['shortage', 'demand-forecast', 'supply-forecast', 'expiry-risk'] as const;
export type PredictionType = (typeof PREDICTION_TYPES)[number];

// Time Constants (in days)
export const BLOOD_VALIDITY_DAYS = 42; // Standard blood validity period
export const EXPIRY_ALERT_DAYS = 5; // Alert when blood expires in 5 days
export const CRITICAL_STOCK_THRESHOLD = 10; // Critical when below 10 units
export const LOW_STOCK_THRESHOLD = 20; // Low when below 20 units

// Prediction Forecast Timeframes
export const FORECAST_TIMEFRAMES = ['next-7-days', 'next-14-days', 'next-30-days'] as const;
export type ForecastTimeframe = (typeof FORECAST_TIMEFRAMES)[number];

// Pagination Defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

// Days of Week
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// Geolocation Constants
export const EARTH_RADIUS_KM = 6371; // Earth radius in kilometers
export const MAX_NEARBY_DISTANCE_KM = 50; // Search for nearby facilities within 50km
export const AVG_TRAVEL_SPEED_KMH = 30; // Average travel speed for blood transport

// JWT Constants
export const JWT_ALGORITHM = 'HS256';

// API Response Constants
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// Blood Unit Constants
export const UNIT_SIZE_ML = 450; // Standard blood unit size in milliliters

// Donation Constants
export const MIN_AGE_FOR_DONATION = 18;
export const MAX_AGE_FOR_DONATION = 65;
export const MIN_WEIGHT_KG = 50;
export const MIN_HEMOGLOBIN_GM_DL = 12.5;
export const DONATION_INTERVAL_DAYS = 56; // Minimum days between donations

// Hospital Operating Hours
export const DEFAULT_OPENING_HOUR = 8; // 08:00
export const DEFAULT_CLOSING_HOUR = 22; // 22:00

// Emergency Response Constants
export const EMERGENCY_SEARCH_RADIUS_KM = 100;
export const EMERGENCY_RESPONSE_TIME_MINUTES = 60;

// Email Templates (keys)
export const EMAIL_TEMPLATES = {
  REGISTRATION: 'registration',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  BLOOD_NEEDED: 'blood-needed',
  APPOINTMENT_REMINDER: 'appointment-reminder',
  ELIGIBILITY_REMINDER: 'eligibility-reminder',
  TRANSFER_REQUEST: 'transfer-request',
} as const;

// API Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_BLOOD_GROUP: 'Invalid blood group',

  // Inventory
  INSUFFICIENT_STOCK: 'Insufficient blood stock',
  BLOOD_EXPIRED: 'Blood has expired',
  INVENTORY_NOT_FOUND: 'Inventory record not found',

  // Requests
  REQUEST_NOT_FOUND: 'Blood request not found',
  FACILITY_NOT_FOUND: 'Facility not found',
  CANNOT_FULFILL_REQUEST: 'Cannot fulfill request with current stock',

  // Donations
  DONOR_INELIGIBLE: 'Donor is not eligible for donation',
  TOO_SOON_TO_DONATE: 'Donation interval not met',
  APPOINTMENT_CONFLICT: 'Appointment time slot unavailable',

  // General
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  NOT_FOUND: 'Resource not found',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  REQUEST_CREATED: 'Request created successfully',
  REQUEST_FULFILLED: 'Request fulfilled successfully',
  APPOINTMENT_BOOKED: 'Appointment booked successfully',
  INVENTORY_UPDATED: 'Inventory updated successfully',
  TRANSFER_INITIATED: 'Transfer initiated successfully',
} as const;
