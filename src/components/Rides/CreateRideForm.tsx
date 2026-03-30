import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { MapPin, Navigation, Users, Clock, X, Search } from 'lucide-react';

type Location = {
  lat: number;
  lng: number;
  address: string;
};

type CreateRideFormProps = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function CreateRideForm({ onClose, onSuccess }: CreateRideFormProps) {
  const { user } = useAuth();
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [maxPassengers, setMaxPassengers] = useState(2);
  const [scheduledTime, setScheduledTime] = useState(
    new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const geocodeAddress = async (address: string): Promise<Location | null> => {
    const mockLocations: Record<string, Location> = {
      'koramangala': { lat: 12.9352, lng: 77.6245, address: 'Koramangala, Bangalore' },
      'indiranagar': { lat: 12.9716, lng: 77.6412, address: 'Indiranagar, Bangalore' },
      'whitefield': { lat: 12.9698, lng: 77.7499, address: 'Whitefield, Bangalore' },
      'mg road': { lat: 12.9750, lng: 77.6061, address: 'MG Road, Bangalore' },
      'electronic city': { lat: 12.8456, lng: 77.6603, address: 'Electronic City, Bangalore' },
      'jp nagar': { lat: 12.9083, lng: 77.5850, address: 'JP Nagar, Bangalore' },
      'jayanagar': { lat: 12.9250, lng: 77.5937, address: 'Jayanagar, Bangalore' },
      'hsr layout': { lat: 12.9121, lng: 77.6446, address: 'HSR Layout, Bangalore' },
      'marathahalli': { lat: 12.9591, lng: 77.6974, address: 'Marathahalli, Bangalore' },
      'btm layout': { lat: 12.9165, lng: 77.6101, address: 'BTM Layout, Bangalore' },
    };

    const searchLower = address.toLowerCase();
    for (const [key, location] of Object.entries(mockLocations)) {
      if (searchLower.includes(key)) {
        return location;
      }
    }

    const randomLat = 12.9 + Math.random() * 0.2;
    const randomLng = 77.5 + Math.random() * 0.3;
    return { lat: randomLat, lng: randomLng, address };
  };

  const handlePickupSearch = async () => {
    if (!pickupSearch) return;
    const location = await geocodeAddress(pickupSearch);
    setPickup(location);
  };

  const handleDestinationSearch = async () => {
    if (!destinationSearch) return;
    const location = await geocodeAddress(destinationSearch);
    setDestination(location);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pickup || !destination) {
      setError('Please select both pickup and destination locations');
      return;
    }

    setLoading(true);
    setError('');

    const distance = calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng);
    const estimatedFare = Math.round(distance * 15);

    const { error: insertError } = await supabase.from('rides').insert({
      user_id: user.id,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      pickup_address: pickup.address,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      destination_address: destination.address,
      max_passengers: maxPassengers,
      estimated_distance: distance,
      estimated_fare: estimatedFare,
      scheduled_time: scheduledTime,
      status: 'searching',
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Create New Ride</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1 text-green-600" />
              Pickup Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pickupSearch}
                onChange={(e) => setPickupSearch(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter pickup location (e.g., Koramangala, Bangalore)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handlePickupSearch())}
              />
              <button
                type="button"
                onClick={handlePickupSearch}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {pickup && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Selected: {pickup.address}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Navigation className="w-4 h-4 inline mr-1 text-red-600" />
              Destination
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={destinationSearch}
                onChange={(e) => setDestinationSearch(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter destination (e.g., MG Road, Bangalore)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleDestinationSearch())}
              />
              <button
                type="button"
                onClick={handleDestinationSearch}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            {destination && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                Selected: {destination.address}
              </div>
            )}
          </div>

          {pickup && destination && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800 font-semibold mb-1">Estimated Details</div>
              <div className="text-sm text-blue-700">
                Distance: {calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng).toFixed(1)} km
              </div>
              <div className="text-sm text-blue-700">
                Estimated Fare: ₹{Math.round(calculateDistance(pickup.lat, pickup.lng, destination.lat, destination.lng) * 15)}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1 text-purple-600" />
              Maximum Passengers
            </label>
            <select
              value={maxPassengers}
              onChange={(e) => setMaxPassengers(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 passenger</option>
              <option value={2}>2 passengers</option>
              <option value={3}>3 passengers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1 text-orange-600" />
              Scheduled Time
            </label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !pickup || !destination}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Ride'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
