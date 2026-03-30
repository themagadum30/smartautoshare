import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/Auth/AuthPage';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import ProfilePage from './components/Profile/ProfilePage';
import HistoryPage from './components/History/HistoryPage';
import MessagesPage from './components/Chat/MessagesPage';
import CreateRideForm from './components/Rides/CreateRideForm';
import MatchesView from './components/Rides/MatchesView';
import RideDetailsView from './components/Rides/RideDetailsView';
import { Ride } from './lib/supabase';

type Page = 'dashboard' | 'history' | 'profile' | 'messages';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showCreateRide, setShowCreateRide] = useState(false);
  const [showMatches, setShowMatches] = useState<Ride | null>(null);
  const [showRideDetails, setShowRideDetails] = useState<Ride | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleOpenChat = (userId: string) => {
    setCurrentPage('messages');
    setShowMatches(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={setCurrentPage} currentPage={currentPage} />

      <main>
        {currentPage === 'dashboard' && (
          <Dashboard
            onCreateRide={() => setShowCreateRide(true)}
            onViewMatches={(ride) => setShowMatches(ride)}
            onViewRide={(ride) => setShowRideDetails(ride)}
          />
        )}

        {currentPage === 'history' && <HistoryPage />}

        {currentPage === 'profile' && <ProfilePage />}

        {currentPage === 'messages' && <MessagesPage />}
      </main>

      {showCreateRide && (
        <CreateRideForm
          onClose={() => setShowCreateRide(false)}
          onSuccess={() => {
            setShowCreateRide(false);
          }}
        />
      )}

      {showMatches && (
        <MatchesView
          ride={showMatches}
          onClose={() => setShowMatches(null)}
          onOpenChat={handleOpenChat}
        />
      )}

      {showRideDetails && (
        <RideDetailsView
          ride={showRideDetails}
          onClose={() => setShowRideDetails(null)}
          onConfirmBooking={() => {
            setShowRideDetails(null);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
