import { EARTH_RADIUS_KM, AVG_TRAVEL_SPEED_KMH } from '../config/constants';
import { Coordinates, DistanceResult } from '../types/common';

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const lat1Rad = degreesToRadians(from.latitude);
  const lat2Rad = degreesToRadians(to.latitude);
  const deltaLat = degreesToRadians(to.latitude - from.latitude);
  const deltaLng = degreesToRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c; // Distance in km
}

/**
 * Convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert radians to degrees
 */
export function radiansToDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

/**
 * Estimate time of arrival based on distance and average speed
 * Returns time in minutes
 */
export function estimateETA(distanceKm: number, speedKmh: number = AVG_TRAVEL_SPEED_KMH): number {
  const timeInHours = distanceKm / speedKmh;
  return Math.round(timeInHours * 60); // Convert to minutes
}

/**
 * Calculate distance and ETA together
 */
export function calculateDistanceAndETA(
  from: Coordinates,
  to: Coordinates,
  speedKmh: number = AVG_TRAVEL_SPEED_KMH
): DistanceResult {
  const distance = calculateDistance(from, to);
  const eta = estimateETA(distance, speedKmh);

  return {
    distance: Math.round(distance * 100) / 100, // Round to 2 decimals
    eta,
  };
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  const { latitude, longitude } = coords;

  // Latitude must be between -90 and 90
  if (latitude < -90 || latitude > 90) {
    return false;
  }

  // Longitude must be between -180 and 180
  if (longitude < -180 || longitude > 180) {
    return false;
  }

  return true;
}

/**
 * Get bounding box around a point with given radius
 * Useful for database queries with $geoWithin
 */
export function getBoundingBox(
  center: Coordinates,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Approximate conversion of km to degrees
  // 1 degree latitude ≈ 111 km
  // 1 degree longitude ≈ 111 km * cos(latitude)

  const latOffset = radiusKm / 111;
  const lngOffset = radiusKm / (111 * Math.cos(degreesToRadians(center.latitude)));

  return {
    minLat: center.latitude - latOffset,
    maxLat: center.latitude + latOffset,
    minLng: center.longitude - lngOffset,
    maxLng: center.longitude + lngOffset,
  };
}

/**
 * Check if a point is within a radius from another point
 */
export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
}

/**
 * Sort facilities by distance from origin
 */
export function sortByDistance(
  facilities: Array<{ coordinates: Coordinates; [key: string]: any }>,
  origin: Coordinates
): Array<{ distance: number } & { coordinates: Coordinates; [key: string]: any }> {
  return facilities
    .map((facility) => ({
      ...facility,
      distance: calculateDistance(origin, facility.coordinates),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Filter facilities within radius
 */
export function filterByRadius(
  facilities: Array<{ coordinates: Coordinates; [key: string]: any }>,
  center: Coordinates,
  radiusKm: number
): Array<{ coordinates: Coordinates; [key: string]: any }> {
  return facilities.filter((facility) =>
    isWithinRadius(facility.coordinates, center, radiusKm)
  );
}
