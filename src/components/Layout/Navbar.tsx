import { useAuth } from '../../contexts/AuthContext';
import { Car, LogOut, User, History, MessageSquare } from 'lucide-react';

type NavbarProps = {
  onNavigate: (page: 'dashboard' | 'history' | 'profile' | 'messages') => void;
  currentPage: string;
};

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { profile, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Smart Auto Share</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('messages')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'messages'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Messages</span>
            </button>

            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'history'
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="hidden sm:inline">History</span>
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {profile?.full_name || 'Profile'}
                </span>
              </button>

              <button
                onClick={signOut}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
