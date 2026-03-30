import { useState, useEffect } from 'react';
import { supabase, Ride } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, MapPin, Navigation, Clock, Users } from 'lucide-react';
import RideCard from './RideCard';

type DashboardProps = {
  onCreateRide: () => void;
  onViewMatches: (ride: Ride) => void;
  onViewRide: (ride: Ride) => void;
};

export default function Dashboard({ onCreateRide, onViewMatches, onViewRide }: DashboardProps) {
  const { user } = useAuth();
  const [activeRides, setActiveRides] = useState<Ride[]>([]);
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRides();

    const channel = supabase
      .channel('rides_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        loadRides();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadRides = async () => {
    if (!user) return;

    const { data: myRides } = await supabase
      .from('rides')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['searching', 'matched', 'confirmed', 'in_progress'])
      .order('created_at', { ascending: false });

    const { data: otherRides } = await supabase
      .from('rides')
      .select('*')
      .neq('user_id', user.id)
      .eq('status', 'searching')
      .order('created_at', { ascending: false })
      .limit(10);

    setActiveRides(myRides || []);
    setNearbyRides(otherRides || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-600 mt-1">Find and share rides to save money</p>
          </div>
          <button
            onClick={onCreateRide}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Ride
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <MapPin className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{activeRides.length}</div>
            <div className="text-blue-100">Active Rides</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <Users className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">{nearbyRides.length}</div>
            <div className="text-green-100">Available Rides</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <Navigation className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">0 km</div>
            <div className="text-purple-100">This Month</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <Clock className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-3xl font-bold">₹0</div>
            <div className="text-orange-100">Saved</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Your Active Rides
          </h3>
          {activeRides.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No active rides</p>
              <button
                onClick={onCreateRide}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Create your first ride
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  isOwn={true}
                  onViewMatches={() => onViewMatches(ride)}
                  onViewRide={() => onViewRide(ride)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Available Rides Nearby
          </h3>
          {nearbyRides.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
              <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No nearby rides available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  isOwn={false}
                  onViewRide={() => onViewRide(ride)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}
