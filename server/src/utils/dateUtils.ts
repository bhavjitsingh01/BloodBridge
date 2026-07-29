import { BLOOD_VALIDITY_DAYS, EXPIRY_ALERT_DAYS } from '../config/constants';

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Calculate expiry date from collection date
 */
export function calculateExpiryDate(collectionDate: Date = new Date()): Date {
  return addDays(collectionDate, BLOOD_VALIDITY_DAYS);
}

/**
 * Check if blood is expiring soon
 */
export function isExpiringWithinDays(expiryDate: Date, days: number = EXPIRY_ALERT_DAYS): boolean {
  const today = new Date();
  const alertDate = addDays(today, days);
  return expiryDate <= alertDate && expiryDate >= today;
}

/**
 * Check if blood is expired
 */
export function isExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}

/**
 * Get days remaining until expiry
 */
export function daysUntilExpiry(expiryDate: Date): number {
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get age of blood in days
 */
export function getBloodAgeInDays(collectionDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - collectionDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get days since last donation
 */
export function daysSinceLastDonation(lastDonationDate: Date): number {
  const today = new Date();
  const diffTime = today.getTime() - lastDonationDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date, locale: string = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date, locale: string = 'en-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
}

/**
 * Get date range for query
 */
export function getDateRange(
  rangeType: 'today' | 'week' | 'month' | 'quarter' | 'year'
): { startDate: Date; endDate: Date } {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  switch (rangeType) {
    case 'today':
      return {
        startDate: startOfToday,
        endDate: endOfToday,
      };

    case 'week': {
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

      return {
        startDate: startOfWeek,
        endDate: endOfToday,
      };
    }

    case 'month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      return {
        startDate: startOfMonth,
        endDate: endOfMonth,
      };
    }

    case 'quarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
      const endOfQuarter = new Date(today.getFullYear(), (quarter + 1) * 3, 1);

      return {
        startDate: startOfQuarter,
        endDate: endOfQuarter,
      };
    }

    case 'year': {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const endOfYear = new Date(today.getFullYear() + 1, 0, 1);

      return {
        startDate: startOfYear,
        endDate: endOfYear,
      };
    }

    default:
      return {
        startDate: startOfToday,
        endDate: endOfToday,
      };
  }
}

/**
 * Check if date is within range
 */
export function isWithinDateRange(
  date: Date,
  startDate: Date,
  endDate: Date
): boolean {
  return date >= startDate && date <= endDate;
}

/**
 * Get ISO week number
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get fiscal year based on a date
 */
export function getFiscalYear(date: Date, fiscalYearStart: number = 4): number {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return month >= fiscalYearStart ? year : year - 1;
}

/**
 * Check if it's a business day
 */
export function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // Not Sunday or Saturday
}

/**
 * Get next business day
 */
export function getNextBusinessDay(date: Date = new Date()): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}
