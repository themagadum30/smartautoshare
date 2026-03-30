import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Ride, RideMatch, Profile, Booking } from '../../lib/supabase';
import { X, MapPin, Navigation, Users, Clock, DollarSign, CheckCircle } from 'lucide-react';
import SimpleMap from '../Map/SimpleMap';

type RideDetailsViewProps = {
  ride: Ride;
  onClose: () => void;
  onConfirmBooking?: () => void;
};

export default function RideDetailsView({ ride, onClose, onConfirmBooking }: RideDetailsViewProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<(RideMatch & { profile?: Profile })[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  const isOwner = ride.user_id === user?.id;

  useEffect(() => {
    loadMatches();
    loadBooking();
  }, [ride.id]);

  const loadMatches = async () => {
    const { data } = await supabase
      .from('ride_matches')
      .select('*')
      .or(`ride_id.eq.${ride.id},matched_ride_id.eq.${ride.id}`)
      .eq('status', 'accepted');

    if (data) {
      const matchesWithProfiles = await Promise.all(
        data.map(async (match) => {
          const userId = match.ride_id === ride.id ? match.matched_user_id : match.user_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          return { ...match, profile: profile || undefined };
        })
      );

      setMatches(matchesWithProfiles);
    }
  };

  const loadBooking = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('ride_id', ride.id)
      .maybeSingle();

    setBooking(data);
  };

  const calculateFareSplit = () => {
    if (!ride.estimated_fare) return {};

    const totalParticipants = matches.length + 1;
    const farePerPerson = ride.estimated_fare / totalParticipants;

    const splits: Record<string, number> = {
      [ride.user_id]: farePerPerson,
    };

    matches.forEach((match) => {
      const userId = match.ride_id === ride.id ? match.matched_user_id : match.user_id;
      splits[userId] = farePerPerson;
    });

    return splits;
  };

  const handleConfirmBooking = async () => {
    if (!user || !isOwner) return;

    setLoading(true);

    const fareSplits = calculateFareSplit();
    const participants = [ride.user_id, ...matches.map((m) =>
      m.ride_id === ride.id ? m.matched_user_id : m.user_id
    )];

    const { error } = await supabase.from('bookings').insert({
      ride_id: ride.id,
      participants: participants,
      total_fare: ride.estimated_fare || 0,
      fare_splits: fareSplits,
      auto_number: `KA-${Math.floor(Math.random() * 100)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
      driver_name: `Driver ${Math.floor(Math.random() * 100)}`,
      driver_phone: `+91 ${Math.floor(70000 + Math.random() * 30000)} ${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'confirmed',
    });

    if (!error) {
      await supabase.from('rides').update({ status: 'confirmed' }).eq('id', ride.id);
      await loadBooking();
      onConfirmBooking?.();
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ride Details</h2>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
              ride.status === 'searching' ? 'bg-yellow-100 text-yellow-800' :
              ride.status === 'matched' ? 'bg-blue-100 text-blue-800' :
              ride.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              ride.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ride.status.charAt(0).toUpperCase() + ride.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <SimpleMap
            pickupLat={ride.pickup_lat}
            pickupLng={ride.pickup_lng}
            pickupAddress={ride.pickup_address}
            destinationLat={ride.destination_lat}
            destinationLng={ride.destination_lng}
            destinationAddress={ride.destination_address}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <div className="text-xs text-green-700 font-semibold">Pickup Location</div>
                  <div className="text-sm text-gray-800 mt-1">{ride.pickup_address}</div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-2">
                <Navigation className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <div className="text-xs text-red-700 font-semibold">Destination</div>
                  <div className="text-sm text-gray-800 mt-1">{ride.destination_address}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Time</div>
              <div className="text-sm font-semibold text-gray-800">
                {new Date(ride.scheduled_time).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Seats</div>
              <div className="text-sm font-semibold text-gray-800">{ride.max_passengers}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <Navigation className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Distance</div>
              <div className="text-sm font-semibold text-gray-800">
                {ride.estimated_distance?.toFixed(1)} km
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <DollarSign className="w-5 h-5 text-gray-600 mx-auto mb-1" />
              <div className="text-xs text-gray-500">Fare</div>
              <div className="text-sm font-semibold text-green-600">
                ₹{ride.estimated_fare?.toFixed(0)}
              </div>
            </div>
          </div>

          {matches.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Co-Passengers ({matches.length})</h3>
              <div className="space-y-2">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {match.profile?.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{match.profile?.full_name}</div>
                      <div className="text-sm text-gray-600">
                        {match.profile?.rating.toFixed(1)} ⭐ • {match.profile?.total_rides} rides
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ride.estimated_fare && matches.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Fare Split</h3>
              <div className="space-y-2">
                {Object.entries(calculateFareSplit()).map(([userId, amount]) => (
                  <div key={userId} className="flex justify-between text-sm">
                    <span className="text-blue-800">
                      {userId === user?.id ? 'You' : 'Co-passenger'}
                    </span>
                    <span className="font-semibold text-blue-900">₹{amount.toFixed(0)}</span>
                  </div>
                ))}
                <div className="border-t border-blue-300 pt-2 flex justify-between font-semibold text-blue-900">
                  <span>Total</span>
                  <span>₹{ride.estimated_fare.toFixed(0)}</span>
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  💰 You save ₹{((ride.estimated_fare - (ride.estimated_fare / (matches.length + 1)))).toFixed(0)} by sharing!
                </div>
              </div>
            </div>
          )}

          {booking && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Booking Confirmed
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-800">Auto Number:</span>
                  <span className="font-semibold text-green-900">{booking.auto_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">Driver:</span>
                  <span className="font-semibold text-green-900">{booking.driver_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-800">Driver Phone:</span>
                  <span className="font-semibold text-green-900">{booking.driver_phone}</span>
                </div>
              </div>
            </div>
          )}

          {isOwner && ride.status === 'matched' && !booking && matches.length > 0 && (
            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
