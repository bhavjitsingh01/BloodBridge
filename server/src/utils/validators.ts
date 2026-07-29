import { BLOOD_GROUPS, MIN_AGE_FOR_DONATION, MAX_AGE_FOR_DONATION } from '../config/constants';

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
export function isValidPhone(phone: string): boolean {
  // Remove any spaces or dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');

  // Indian phone: 10 digits or +91 followed by 10 digits
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/;

  return phoneRegex.test(cleanPhone);
}

/**
 * Validate blood group
 */
export function isValidBloodGroup(bloodGroup: string): boolean {
  return BLOOD_GROUPS.includes(bloodGroup as any);
}

/**
 * Validate age for donation eligibility
 */
export function isValidDonationAge(age: number): boolean {
  return age >= MIN_AGE_FOR_DONATION && age <= MAX_AGE_FOR_DONATION;
}

/**
 * Validate pincode format (Indian)
 */
export function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^[0-9]{6}$/;
  return pincodeRegex.test(pincode);
}

/**
 * Validate time format (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate blood unit quantity
 */
export function isValidBloodQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

/**
 * Validate coordinates (latitude and longitude)
 */
export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

export function isValidLongitude(lng: number): boolean {
  return lng >= -180 && lng <= 180;
}

/**
 * Validate date string (ISO format)
 */
export function isValidDateString(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return new Date(date) > new Date();
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Validate license number format (basic)
 */
export function isValidLicenseNumber(license: string): boolean {
  // This is a basic validation - adjust based on your requirements
  return !!(license && license.length >= 6);
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 500); // Limit length
}

/**
 * Validate unique array elements
 */
export function hasUniqueElements<T>(array: T[]): boolean {
  return new Set(array).size === array.length;
}

/**
 * Validate enum value
 */
export function isValidEnum<T extends Record<string, any>>(
  value: any,
  enumObj: T
): value is T[keyof T] {
  return Object.values(enumObj).includes(value);
}
