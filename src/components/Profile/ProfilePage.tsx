import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Phone, Mail, Star, Award, CreditCard as Edit2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
      })
      .eq('id', user.id);

    if (!error) {
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32"></div>

        <div className="px-8 pb-8">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-16 h-16 text-gray-400" />
              </div>
              <div className="mb-2">
                {editing ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-2xl font-bold text-gray-800 border-b-2 border-blue-600 focus:outline-none"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800">{profile.full_name}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-semibold text-gray-700">{profile.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({profile.total_rides} rides)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => (editing ? handleSave() : setEditing(true))}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {editing ? (
                <>
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save'}
                </>
              ) : (
                <>
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Email</h3>
              </div>
              <p className="text-gray-600">{user?.email}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-800">Phone</h3>
              </div>
              {editing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-gray-600">{profile.phone || 'Not provided'}</p>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Total Rides</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{profile.total_rides}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-800">Average Rating</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-600">{profile.rating.toFixed(1)} / 5.0</p>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Member Since</h3>
            <p className="text-gray-600">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
