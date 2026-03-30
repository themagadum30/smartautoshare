import { Ride } from '../lib/supabase';

export type MatchResult = {
  ride: Ride;
  matchScore: number;
  sharedDistance: number;
  estimatedSavings: number;
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const pointToLineDistance = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return calculateDistance(px, py, xx, yy);
};

export const findMatches = (currentRide: Ride, availableRides: Ride[]): MatchResult[] => {
  const PICKUP_THRESHOLD_KM = 2;
  const DESTINATION_THRESHOLD_KM = 2;
  const ROUTE_OVERLAP_THRESHOLD = 0.3;

  const matches: MatchResult[] = [];

  for (const ride of availableRides) {
    if (ride.id === currentRide.id || ride.user_id === currentRide.user_id) {
      continue;
    }

    const pickupDistance = calculateDistance(
      currentRide.pickup_lat,
      currentRide.pickup_lng,
      ride.pickup_lat,
      ride.pickup_lng
    );

    const destinationDistance = calculateDistance(
      currentRide.destination_lat,
      currentRide.destination_lng,
      ride.destination_lat,
      ride.destination_lng
    );

    if (pickupDistance > PICKUP_THRESHOLD_KM || destinationDistance > DESTINATION_THRESHOLD_KM) {
      continue;
    }

    const currentRideDistance = calculateDistance(
      currentRide.pickup_lat,
      currentRide.pickup_lng,
      currentRide.destination_lat,
      currentRide.destination_lng
    );

    const otherRideDistance = calculateDistance(
      ride.pickup_lat,
      ride.pickup_lng,
      ride.destination_lat,
      ride.destination_lng
    );

    const pickupToOtherPickup = pointToLineDistance(
      ride.pickup_lat,
      ride.pickup_lng,
      currentRide.pickup_lat,
      currentRide.pickup_lng,
      currentRide.destination_lat,
      currentRide.destination_lng
    );

    const destinationToOtherDestination = pointToLineDistance(
      ride.destination_lat,
      ride.destination_lng,
      currentRide.pickup_lat,
      currentRide.pickup_lng,
      currentRide.destination_lat,
      currentRide.destination_lng
    );

    const routeOverlap =
      1 - (pickupToOtherPickup + destinationToOtherDestination) / (currentRideDistance + otherRideDistance);

    if (routeOverlap < ROUTE_OVERLAP_THRESHOLD) {
      continue;
    }

    const sharedDistance = Math.min(currentRideDistance, otherRideDistance) * routeOverlap;

    const pickupProximityScore = Math.max(0, 1 - pickupDistance / PICKUP_THRESHOLD_KM);
    const destinationProximityScore = Math.max(0, 1 - destinationDistance / DESTINATION_THRESHOLD_KM);
    const routeOverlapScore = routeOverlap;

    const matchScore =
      pickupProximityScore * 0.3 + destinationProximityScore * 0.3 + routeOverlapScore * 0.4;

    const estimatedSavings = Math.round((sharedDistance * 15) / 2);

    matches.push({
      ride,
      matchScore: Math.round(matchScore * 100),
      sharedDistance,
      estimatedSavings,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};
