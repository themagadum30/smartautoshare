import { Ride } from '../lib/supabase';

export type MatchResult = {
  ride: Ride;
  matchScore: number;
  sharedDistance: number;
  estimatedSavings: number;
};

// 🌍 Haversine formula
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 📏 Distance from point to route line
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

// 🚗 MAIN MATCH FUNCTION
export const findMatches = (
  currentRide: Ride,
  availableRides: Ride[]
): MatchResult[] => {

  // 🔥 UPDATED THRESHOLDS (more realistic)
  const PICKUP_THRESHOLD_KM = 5;
  const DESTINATION_THRESHOLD_KM = 5;
  const ROUTE_OVERLAP_THRESHOLD = 0.1;

  const matches: MatchResult[] = [];

  for (const ride of availableRides) {

    // ❌ Skip same ride or same user
    if (ride.id === currentRide.id || ride.user_id === currentRide.user_id) {
      continue;
    }

    // 📍 Distances
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

    // 🧠 FIX: allow partial match instead of strict rejection
    if (
      pickupDistance > PICKUP_THRESHOLD_KM &&
      destinationDistance > DESTINATION_THRESHOLD_KM
    ) {
      continue;
    }

    // 🚗 Route distances
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

    // 📏 Distance from route
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

    // 🔥 FIX: safe route overlap
    const routeOverlapRaw =
      1 -
      (pickupToOtherPickup + destinationToOtherDestination) /
        (currentRideDistance + otherRideDistance);

    const routeOverlap = Math.max(0, routeOverlapRaw);

    if (routeOverlap < ROUTE_OVERLAP_THRESHOLD) {
      continue;
    }

    // 📊 Shared distance
    const sharedDistance =
      Math.min(currentRideDistance, otherRideDistance) * routeOverlap;

    // 🎯 Scoring
    const pickupScore = Math.max(0, 1 - pickupDistance / PICKUP_THRESHOLD_KM);
    const destinationScore = Math.max(
      0,
      1 - destinationDistance / DESTINATION_THRESHOLD_KM
    );
    const routeScore = routeOverlap;

    const matchScore =
      pickupScore * 0.3 +
      destinationScore * 0.3 +
      routeScore * 0.4;

    // 💰 Savings
    const estimatedSavings = Math.round((sharedDistance * 15) / 2);

    // 🧪 DEBUG (optional)
    console.log("Checking Ride:", ride.id);
    console.log("Pickup Distance:", pickupDistance);
    console.log("Destination Distance:", destinationDistance);
    console.log("Route Overlap:", routeOverlap);
    console.log("Match Score:", matchScore);

    matches.push({
      ride,
      matchScore: Math.round(matchScore * 100),
      sharedDistance,
      estimatedSavings,
    });
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
};