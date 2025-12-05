'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { User } from '@/types';

interface LeafletMapProps {
  currentUser: User;
  nearbyUsers: User[];
  places: any[];
  topPlaces?: any[];
  onUserClick: (user: User) => void;
  onPlaceClick: (place: any) => void;
  focusPlace?: any | null;
}

// Get emoji for place category
const getPlaceEmoji = (category: string) => {
  const emojis: { [key: string]: string } = {
    'Restaurant': '🍽️',
    'Cafe': '☕',
    'Tourist Spot': '🏛️',
    'Shopping': '🛍️',
    'Entertainment': '🎭',
    'Hotel': '🏨',
    'Park': '🌳',
    'Museum': '🖼️',
    'Beach': '🏖️',
    'Temple': '🕉️'
  };
  return emojis[category] || '📍';
};

// Create custom emoji marker
const createEmojiIcon = (emoji: string, size: number = 40) => {
  return L.divIcon({
    html: `<div style="font-size: ${size}px; text-align: center; line-height: 1;">${emoji}</div>`,
    className: 'emoji-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export function LeafletMap({ currentUser, nearbyUsers, places, topPlaces, onUserClick, focusPlace }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const placeMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const [currentZoom, setCurrentZoom] = useState(13);

  // Setup global functions for popup buttons
  useEffect(() => {
    (window as any).connectUser = (userId: string) => {
      const user = nearbyUsers.find(u => u.id === userId);
      if (user) onUserClick(user);
    };

    (window as any).viewPlace = (placeId: string) => {
      window.location.href = `/places?id=${placeId}`;
    };

    return () => {
      delete (window as any).connectUser;
      delete (window as any).viewPlace;
    };
  }, [nearbyUsers, onUserClick]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const userLat = currentUser.location?.lat || 18.5204;
    const userLng = currentUser.location?.lng || 73.8567;

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([userLat, userLng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Track zoom changes
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const userLat = currentUser.location?.lat || 18.5204;
    const userLng = currentUser.location?.lng || 73.8567;

    // Add current user marker
    const userMarker = L.marker([userLat, userLng], {
      icon: createEmojiIcon(currentUser.avatar_emoji, 50),
      zIndexOffset: 1000
    }).addTo(mapRef.current);

    userMarker.bindPopup(`
      <div style="text-align: center; padding: 8px;">
        <div style="font-size: 32px; margin-bottom: 8px;">${currentUser.avatar_emoji}</div>
        <strong>${currentUser.username}</strong><br/>
        <span style="color: #666;">Level ${currentUser.level}</span><br/>
        <span style="color: #9333ea; font-weight: bold;">${currentUser.mapos} Mapos</span>
      </div>
    `);

    markersRef.current.push(userMarker);

    // Add nearby users
    nearbyUsers.forEach(user => {
      if (!user.location) return;
      const loc = typeof user.location === 'string' ? JSON.parse(user.location) : user.location;
      
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createEmojiIcon(user.avatar_emoji, 40),
        zIndexOffset: 500
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <div style="font-size: 28px; margin-bottom: 8px;">${user.avatar_emoji}</div>
          <strong>${user.username}</strong><br/>
          <span style="color: #666;">Level ${user.level}</span><br/>
          <button onclick="window.connectUser('${user.id}')" style="margin-top: 8px; padding: 6px 12px; background: #9333ea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
            Connect
          </button>
        </div>
      `);

      marker.on('click', () => onUserClick(user));
      markersRef.current.push(marker);
    });

    // Determine which places to show based on zoom level
    // Zoom < 14: Show only top places (like Google Maps)
    // Zoom >= 14: Show all places
    const placesToShow = currentZoom < 14 && topPlaces ? topPlaces : places;

    // Add places
    placesToShow.forEach(place => {
      if (!place.location) return;
      const loc = typeof place.location === 'string' ? JSON.parse(place.location) : place.location;
      
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createEmojiIcon(getPlaceEmoji(place.category), 35),
        zIndexOffset: 100
      }).addTo(mapRef.current!);

      const imageHtml = place.images && place.images[0] 
        ? `<img src="${place.images[0]}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
        : '';

      marker.bindPopup(`
        <div style="min-width: 200px; padding: 8px;">
          ${imageHtml}
          <div style="font-size: 24px; margin-bottom: 8px;">${getPlaceEmoji(place.category)}</div>
          <strong style="font-size: 16px;">${place.name}</strong><br/>
          <span style="color: #666; font-size: 12px;">${place.category}</span><br/>
          <div style="margin: 8px 0;">
            <span style="color: #f59e0b;">⭐</span>
            <strong>${place.rating}</strong>
            <span style="margin-left: 8px; color: #666;">₹${place.budget}</span>
          </div>
          <p style="color: #666; font-size: 12px; margin: 8px 0;">${place.description?.substring(0, 100) || 'No description'}...</p>
          <button onclick="window.viewPlace('${place.id}')" style="width: 100%; padding: 8px; background: #9333ea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 8px;">
            View Details
          </button>
        </div>
      `);

      // Store marker reference for focusing
      placeMarkersRef.current.set(place.id, marker);
      markersRef.current.push(marker);
    });

  }, [currentUser, nearbyUsers, places, topPlaces, currentZoom]);

  // Handle focus on specific place
  useEffect(() => {
    if (!mapRef.current || !focusPlace) return;

    const marker = placeMarkersRef.current.get(focusPlace.id);
    if (marker) {
      const loc = typeof focusPlace.location === 'string' 
        ? JSON.parse(focusPlace.location) 
        : focusPlace.location;
      
      // Fly to the place location
      mapRef.current.flyTo([loc.lat, loc.lng], 16, {
        duration: 1.5
      });

      // Open the popup after a short delay
      setTimeout(() => {
        marker.openPopup();
      }, 1600);
    }
  }, [focusPlace]);

  return (
    <>
      <style jsx global>{`
        .emoji-marker {
          background: none !important;
          border: none !important;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          display: none;
        }
        .leaflet-popup {
          z-index: 10 !important;
        }
        .leaflet-pane {
          z-index: 1 !important;
        }
        .leaflet-map-pane {
          z-index: 1 !important;
        }
      `}</style>
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden" />
    </>
  );
}
