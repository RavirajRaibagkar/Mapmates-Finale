'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Place } from '@/types';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { ConnectModal } from '@/components/connection/ConnectModal';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceModal } from '@/components/places/PlaceModal';
import { Button } from '@/components/ui/Button';
import { getCurrentPosition } from '@/lib/utils/geolocation';
import { MapPin, Trophy, LogOut, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/');
      return;
    }

    const { data: profile, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      // Profile doesn't exist or table doesn't exist
      if (error.message.includes('relation') || error.code === 'PGRST116') {
        toast.error('Database not set up. Please run the SQL setup script.');
        router.push('/setup');
        return;
      }
      
      // Profile missing, create it
      const { error: insertError } = await (supabase as any).from('profiles').insert({
        id: session.user.id,
        email: session.user.email,
        username: session.user.email?.split('@')[0] || 'user',
        avatar_emoji: '😊',
        mapos: 100,
        level: 1,
        streak_days: 0,
        last_active: new Date().toISOString(),
        is_banned: false,
        is_verified: false,
        role: 'user'
      });
      
      if (!insertError) {
        // Retry fetching profile
        const { data: newProfile } = await (supabase as any)
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (newProfile) {
          const userProfile = newProfile as User;
          setUser(userProfile);
          updateLocation(userProfile.id);
          fetchPlaces();
        }
      }
    } else if (profile) {
      const userProfile = profile as User;
      setUser(userProfile);
      updateLocation(userProfile.id);
      fetchPlaces();
    }
    
    setLoading(false);
  };

  const updateLocation = async (userId: string) => {
    try {
      const position = await getCurrentPosition();
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const { error } = await (supabase as any)
        .from('profiles')
        .update({ location })
        .eq('id', userId);
      
      if (error) console.error('Location update error:', error);
    } catch (error) {
      console.error('Location error:', error);
    }
  };

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false })
      .limit(20);

    if (data) setPlaces(data as Place[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                MapMates
              </h1>
              <div className="flex items-center gap-1 sm:gap-2 bg-purple-100 rounded-full px-2 sm:px-4 py-1 sm:py-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                <span className="font-bold text-purple-600 text-sm sm:text-base">{user.mapos}</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/notifications')}>
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/plans')}>
                🗺️ Plans
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/chat')}>
                💬 Chat
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/games')}>
                🎮 Games
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/contact')}>
                📧 Contact
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/wallet')}>
                <Trophy className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/profile')}>
                <span className="text-2xl">{user.avatar_emoji}</span>
              </Button>
              {user.role === 'admin' && (
                <Button size="sm" onClick={() => router.push('/admin')}>
                  👑 Admin
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:hidden mt-4 pb-4 border-t pt-4"
            >
              <div className="flex flex-col gap-2">
                <Button variant="ghost" className="justify-start" onClick={() => { router.push('/notifications'); setShowMobileMenu(false); }}>
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { router.push('/plans'); setShowMobileMenu(false); }}>
                  🗺️ <span className="ml-2">Travel Plans</span>
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { router.push('/chat'); setShowMobileMenu(false); }}>
                  💬 <span className="ml-2">Chat</span>
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { router.push('/games'); setShowMobileMenu(false); }}>
                  🎮 <span className="ml-2">Games</span>
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { router.push('/wallet'); setShowMobileMenu(false); }}>
                  <Trophy className="w-5 h-5 mr-2" />
                  Wallet
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => { router.push('/profile'); setShowMobileMenu(false); }}>
                  <span className="text-2xl mr-2">{user.avatar_emoji}</span>
                  Profile
                </Button>
                {user.role === 'admin' && (
                  <Button className="justify-start" onClick={() => { router.push('/admin'); setShowMobileMenu(false); }}>
                    👑 <span className="ml-2">Admin</span>
                  </Button>
                )}
                <Button variant="ghost" className="justify-start text-red-600" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
          {/* Map Section - Takes 3 columns */}
          <div className="lg:col-span-3 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 relative z-0"
              style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-purple-600" />
                Explore Map
              </h2>
              <div className="h-[calc(100%-60px)] relative z-0">
                <InteractiveMap
                  currentUser={user}
                  onUserClick={setSelectedUser}
                  onPlaceClick={() => {}} // Popup handled inside map
                  focusPlace={selectedPlace}
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Takes 1 column, full height */}
          <div className="space-y-6">
            {/* Places Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
              style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Top Places</h2>
                <Button size="sm" onClick={() => router.push('/places')}>
                  View All
                </Button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2" style={{ height: 'calc(100% - 60px)' }}>
                {places.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onClick={() => setSelectedPlace(place)}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <ConnectModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          targetUser={selectedUser}
          currentUser={user}
        />
      )}

      {/* Place modal removed - details shown in map popup */}
    </div>
  );
}
