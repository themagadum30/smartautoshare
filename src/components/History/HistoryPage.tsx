import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Ride } from '../../lib/supabase';
import { History, MapPin, Navigation, Calendar, DollarSign, Star } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    loadHistory();
  }, [user, filter]);

  const loadHistory = async () => {
    if (!user) return;

    let query = supabase
      .from('rides')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filter === 'completed') {
      query = query.eq('status', 'completed');
    } else if (filter === 'cancelled') {
      query = query.eq('status', 'cancelled');
    } else {
      query = query.in('status', ['completed', 'cancelled']);
    }

    const { data } = await query;
    setRides(data || []);
    setLoading(false);
  };

  const totalRides = rides.filter((r) => r.status === 'completed').length;
  const totalDistance = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.estimated_distance || 0), 0);
  const totalSaved = rides
    .filter((r) => r.status === 'completed')
    .reduce((sum, r) => sum + (r.estimated_fare || 0) * 0.4, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Ride History</h2>
            <p className="text-gray-600 mt-1">View your past rides and savings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <History className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{totalRides}</div>
            <div className="text-blue-100">Completed Rides</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Navigation className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{totalDistance.toFixed(1)} km</div>
            <div className="text-green-100">Total Distance</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <DollarSign className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">₹{totalSaved.toFixed(0)}</div>
            <div className="text-purple-100">Total Saved</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : rides.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No ride history</p>
          <p className="text-sm text-gray-500">Your completed rides will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
            <div
              key={ride.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ride.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ride.scheduled_time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500">From</div>
                        <div className="text-sm font-medium text-gray-800">
                          {ride.pickup_address}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Navigation className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-500">To</div>
                        <div className="text-sm font-medium text-gray-800">
                          {ride.destination_address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Total Fare</div>
                  <div className="text-2xl font-bold text-gray-800">
                    ₹{ride.estimated_fare?.toFixed(0)}
                  </div>
                  {ride.status === 'completed' && (
                    <div className="text-xs text-green-600 mt-1">
                      Saved ~₹{((ride.estimated_fare || 0) * 0.4).toFixed(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{ride.estimated_distance?.toFixed(1)} km</span>
                  <span>•</span>
                  <span>{ride.max_passengers} seats</span>
                </div>

                {ride.status === 'completed' && (
                  <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                    <Star className="w-4 h-4" />
                    Rate Ride
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
