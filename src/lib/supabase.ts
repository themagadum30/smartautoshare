import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  rating: number;
  total_rides: number;
  created_at: string;
  updated_at: string;
};

export type Ride = {
  id: string;
  user_id: string;
  pickup_lat: number;
  pickup_lng: number;
  pickup_address: string;
  destination_lat: number;
  destination_lng: number;
  destination_address: string;
  status: 'searching' | 'matched' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  max_passengers: number;
  estimated_distance: number | null;
  estimated_fare: number | null;
  route_polyline: string | null;
  scheduled_time: string;
  created_at: string;
  updated_at: string;
};

export type RideMatch = {
  id: string;
  ride_id: string;
  matched_ride_id: string;
  user_id: string;
  matched_user_id: string;
  match_score: number;
  shared_distance: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
};

export type Message = {
  id: string;
  ride_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

export type Booking = {
  id: string;
  ride_id: string;
  participants: string[];
  total_fare: number;
  fare_splits: Record<string, number>;
  auto_number: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type Rating = {
  id: string;
  booking_id: string;
  rated_user_id: string;
  rater_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
