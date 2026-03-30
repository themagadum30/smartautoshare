import { Ride } from '../../lib/supabase';
import { MapPin, Navigation, Clock, Users, ChevronRight } from 'lucide-react';

type RideCardProps = {
  ride: Ride;
  isOwn: boolean;
  onViewMatches?: () => void;
  onViewRide: () => void;
};

export default function RideCard({ ride, isOwn, onViewMatches, onViewRide }: RideCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'searching':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ride.status)}`}>
                {getStatusText(ride.status)}
              </span>
              {isOwn && ride.status === 'searching' && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 animate-pulse">
                  Finding matches...
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Pickup</div>
                  <div className="text-sm font-medium text-gray-800">{ride.pickup_address}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Navigation className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-500">Destination</div>
                  <div className="text-sm font-medium text-gray-800">{ride.destination_address}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{new Date(ride.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{ride.max_passengers} seats</span>
            </div>
            {ride.estimated_fare && (
              <div className="font-semibold text-green-600">
                ₹{ride.estimated_fare.toFixed(0)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isOwn && ride.status === 'searching' && onViewMatches && (
              <button
                onClick={onViewMatches}
                className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                View Matches
              </button>
            )}
            <button
              onClick={onViewRide}
              className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
