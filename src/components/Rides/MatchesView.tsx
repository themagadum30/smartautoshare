import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Ride, Profile } from '../../lib/supabase';
import { findMatches, MatchResult } from '../../utils/matchingAlgorithm';
import { X, Users, MapPin, Navigation, Star, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';

type MatchesViewProps = {
  ride: Ride;
  onClose: () => void;
  onOpenChat: (otherUserId: string) => void;
};

export default function MatchesView({ ride, onClose, onOpenChat }: MatchesViewProps) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<(MatchResult & { profile?: Profile })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, [ride.id]);

  const loadMatches = async () => {
    const { data: availableRides } = await supabase
      .from('rides')
      .select('*')
      .eq('status', 'searching')
      .neq('user_id', user!.id);

    if (availableRides) {
      const matchResults = findMatches(ride, availableRides);

      const matchesWithProfiles = await Promise.all(
        matchResults.map(async (match) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', match.ride.user_id)
            .maybeSingle();

          return { ...match, profile: profile || undefined };
        })
      );

      setMatches(matchesWithProfiles);
    }

    setLoading(false);
  };

  const handleAcceptMatch = async (matchedRide: Ride) => {
    const { error } = await supabase.from('ride_matches').insert({
      ride_id: ride.id,
      matched_ride_id: matchedRide.id,
      user_id: user!.id,
      matched_user_id: matchedRide.user_id,
      match_score: matches.find((m) => m.ride.id === matchedRide.id)?.matchScore || 0,
      shared_distance: matches.find((m) => m.ride.id === matchedRide.id)?.sharedDistance || 0,
      status: 'pending',
    });

    if (!error) {
      await supabase.from('rides').update({ status: 'matched' }).eq('id', ride.id);

      await loadMatches();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Potential Matches</h2>
            <p className="text-sm text-gray-600 mt-1">
              Found {matches.length} compatible ride{matches.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Your Ride</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {ride.pickup_address}
              </div>
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                {ride.destination_address}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No matches found yet</p>
              <p className="text-sm text-gray-500">
                We'll notify you when someone with a similar route creates a ride
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match.ride.id}
                  className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {match.profile?.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{match.profile?.full_name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{match.profile?.rating.toFixed(1)}</span>
                          <span className="text-gray-400">•</span>
                          <span>{match.profile?.total_rides} rides</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {match.matchScore}% Match
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Pickup</div>
                      <div className="text-sm font-medium text-gray-800 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {match.ride.pickup_address}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Destination</div>
                      <div className="text-sm font-medium text-gray-800 flex items-start gap-1">
                        <Navigation className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                        {match.ride.destination_address}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-600 font-semibold">
                        <TrendingUp className="w-4 h-4" />
                        Save ₹{match.estimatedSavings}
                      </div>
                      <div className="text-gray-600">
                        {match.sharedDistance.toFixed(1)} km shared
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenChat(match.ride.user_id)}
                        className="flex items-center gap-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </button>
                      <button
                        onClick={() => handleAcceptMatch(match.ride)}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Request Match
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
