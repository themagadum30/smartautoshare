/*
  # Smart Auto Share Database Schema

  ## Overview
  This migration creates the complete database schema for the Smart Auto Share ride-sharing application.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `phone` (text, unique)
  - `avatar_url` (text)
  - `rating` (numeric, default 5.0)
  - `total_rides` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. rides
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `pickup_lat` (numeric)
  - `pickup_lng` (numeric)
  - `pickup_address` (text)
  - `destination_lat` (numeric)
  - `destination_lng` (numeric)
  - `destination_address` (text)
  - `status` (text: searching, matched, confirmed, in_progress, completed, cancelled)
  - `max_passengers` (integer, default 2)
  - `estimated_distance` (numeric)
  - `estimated_fare` (numeric)
  - `route_polyline` (text)
  - `scheduled_time` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. ride_matches
  - `id` (uuid, primary key)
  - `ride_id` (uuid, references rides)
  - `matched_ride_id` (uuid, references rides)
  - `user_id` (uuid, references profiles)
  - `matched_user_id` (uuid, references profiles)
  - `match_score` (numeric)
  - `shared_distance` (numeric)
  - `status` (text: pending, accepted, rejected)
  - `created_at` (timestamptz)

  ### 4. bookings
  - `id` (uuid, primary key)
  - `ride_id` (uuid, references rides)
  - `participants` (jsonb, array of user_ids)
  - `total_fare` (numeric)
  - `fare_splits` (jsonb)
  - `auto_number` (text)
  - `driver_name` (text)
  - `driver_phone` (text)
  - `status` (text: confirmed, in_progress, completed, cancelled)
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 5. messages
  - `id` (uuid, primary key)
  - `ride_id` (uuid, references rides)
  - `sender_id` (uuid, references profiles)
  - `receiver_id` (uuid, references profiles)
  - `content` (text)
  - `read` (boolean, default false)
  - `created_at` (timestamptz)

  ### 6. ratings
  - `id` (uuid, primary key)
  - `booking_id` (uuid, references bookings)
  - `rated_user_id` (uuid, references profiles)
  - `rater_user_id` (uuid, references profiles)
  - `rating` (integer, 1-5)
  - `comment` (text)
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can read their own profile data
  - Users can create and read their own rides
  - Users can view matches for their rides
  - Users can send and receive messages
  - Users can rate other users they've ridden with
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text UNIQUE,
  avatar_url text,
  rating numeric DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  total_rides integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pickup_lat numeric NOT NULL,
  pickup_lng numeric NOT NULL,
  pickup_address text NOT NULL,
  destination_lat numeric NOT NULL,
  destination_lng numeric NOT NULL,
  destination_address text NOT NULL,
  status text DEFAULT 'searching' CHECK (status IN ('searching', 'matched', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  max_passengers integer DEFAULT 2 CHECK (max_passengers > 0),
  estimated_distance numeric,
  estimated_fare numeric,
  route_polyline text,
  scheduled_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ride_matches table
CREATE TABLE IF NOT EXISTS ride_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  matched_ride_id uuid REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  matched_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  match_score numeric DEFAULT 0,
  shared_distance numeric DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(ride_id, matched_ride_id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  participants jsonb NOT NULL DEFAULT '[]',
  total_fare numeric NOT NULL DEFAULT 0,
  fare_splits jsonb NOT NULL DEFAULT '{}',
  auto_number text,
  driver_name text,
  driver_phone text,
  status text DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id uuid REFERENCES rides(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  rated_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rater_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(booking_id, rated_user_id, rater_user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rides_user_id ON rides(user_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_scheduled_time ON rides(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_ride_matches_ride_id ON ride_matches(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_matches_matched_ride_id ON ride_matches(matched_ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_matches_status ON ride_matches(status);
CREATE INDEX IF NOT EXISTS idx_messages_ride_id ON messages(ride_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_ride_id ON bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ratings_booking_id ON ratings(booking_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Rides policies
CREATE POLICY "Users can view all active rides"
  ON rides FOR SELECT
  TO authenticated
  USING (status IN ('searching', 'matched') OR user_id = auth.uid());

CREATE POLICY "Users can create own rides"
  ON rides FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rides"
  ON rides FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own rides"
  ON rides FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ride matches policies
CREATE POLICY "Users can view their ride matches"
  ON ride_matches FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = matched_user_id
  );

CREATE POLICY "Users can create ride matches"
  ON ride_matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their ride matches"
  ON ride_matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = matched_user_id);

-- Bookings policies
CREATE POLICY "Users can view bookings they're part of"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE rides.id = bookings.ride_id 
      AND rides.user_id = auth.uid()
    ) OR
    participants @> to_jsonb(auth.uid()::text)
  );

CREATE POLICY "Ride owners can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE rides.id = ride_id 
      AND rides.user_id = auth.uid()
    )
  );

CREATE POLICY "Ride owners can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE rides.id = bookings.ride_id 
      AND rides.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rides 
      WHERE rides.id = bookings.ride_id 
      AND rides.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Ratings policies
CREATE POLICY "Users can view ratings for users"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = rater_user_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND (
        participants @> to_jsonb(auth.uid()::text) OR
        EXISTS (
          SELECT 1 FROM rides
          WHERE rides.id = bookings.ride_id
          AND rides.user_id = auth.uid()
        )
      )
    )
  );

-- Function to update profile rating
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM ratings
    WHERE rated_user_id = NEW.rated_user_id
  )
  WHERE id = NEW.rated_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating when new rating is added
DROP TRIGGER IF EXISTS trigger_update_user_rating ON ratings;
CREATE TRIGGER trigger_update_user_rating
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_rides_updated_at ON rides;
CREATE TRIGGER trigger_rides_updated_at
  BEFORE UPDATE ON rides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();