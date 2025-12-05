'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';
import { isWithinRadius } from '@/lib/utils/geolocation';

// Dynamically import LeafletMap to avoid SSR issues
const LeafletMap = dynamic(
  () => import('./LeafletMap').then(mod => ({ default: mod.LeafletMap })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }
);

interface InteractiveMapProps {
  currentUser: User;
  onUserClick: (user: User) => void;
  onPlaceClick?: (place: any) => void;
  focusPlace?: any | null;
}

// Old InteractiveMapView removed - now using LeafletMap

export const InteractiveMap = ({ currentUser, onUserClick, onPlaceClick, focusPlace }: InteractiveMapProps) => {
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [topPlaces, setTopPlaces] = useState<any[]>([]);
  const [zoom, setZoom] = useState(1);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    const userLat = currentUser.location?.lat || 18.5204;
    const userLng = currentUser.location?.lng || 73.8567;
    fetchNearbyUsers(userLat, userLng);
    fetchNearbyPlaces(userLat, userLng);
  }, [currentUser]);

  const fetchNearbyUsers = async (userLat: number, userLng: number) => {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .neq('id', currentUser.id)
      .eq('is_banned', false);

    if (error) {
      console.error('Error fetching users:', error);
      return;
    }

    const nearby = data.filter((user: any) => {
      if (!user.location) return false;
      const loc = typeof user.location === 'string' ? JSON.parse(user.location) : user.location;
      return isWithinRadius(userLat, userLng, loc.lat, loc.lng, 50); // 50km radius
    });

    setNearbyUsers(nearby as User[]);
  };

  const fetchNearbyPlaces = async (userLat: number, userLng: number) => {
    const { data, error } = await (supabase as any)
      .from('places')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching places:', error);
      return;
    }

    console.log('Fetched places:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('No approved places found in database');
      setPlaces([]);
      setTopPlaces([]);
      return;
    }

    const nearby = data.filter((place: any) => {
      if (!place.location) {
        console.log('Place without location:', place.name);
        return false;
      }
      const loc = typeof place.location === 'string' ? JSON.parse(place.location) : place.location;
      const isNearby = isWithinRadius(userLat, userLng, loc.lat, loc.lng, 50); // 50km radius for places
      return isNearby;
    });

    console.log('Nearby places:', nearby.length);
    setPlaces(nearby);
    // Top 10 places for default view
    setTopPlaces(nearby.slice(0, 10));
  };

  const handlePlaceClick = (place: any) => {
    if (onPlaceClick) {
      onPlaceClick(place);
    }
  };

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <LeafletMap
        currentUser={currentUser}
        nearbyUsers={nearbyUsers}
        places={places}
        topPlaces={topPlaces}
        onUserClick={onUserClick}
        onPlaceClick={handlePlaceClick}
        focusPlace={focusPlace}
      />
      
      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 z-10 pointer-events-none">
        <p className="text-sm font-semibold text-gray-700 mb-1">
          👥 {nearbyUsers.length} users nearby
        </p>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          📍 {places.length} places
        </p>
        <p className="text-xs text-gray-500">
          Zoom in to see more places
        </p>
      </div>
    </div>
  );
};
