'use client';

import { motion } from 'framer-motion';
import { Place } from '@/types';
import { MapPin, Star, Heart, DollarSign } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onClick: () => void;
}

// Convert budget to display format
const getBudgetPrice = (budget: string | number) => {
  // If it's a number, format it
  if (!isNaN(Number(budget))) {
    const num = Number(budget);
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`;
    }
    return `₹${num}`;
  }
  
  // Legacy symbol format
  const prices: { [key: string]: string } = {
    '₹': '₹100-300',
    '₹₹': '₹300-700',
    '₹₹₹': '₹700-1500',
    '₹₹₹₹': '₹1500+'
  };
  return prices[budget] || `₹${budget}`;
};

// Get category emoji
const getCategoryEmoji = (category: string) => {
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

// Mock menu items based on category
const getTopMenuItems = (category: string) => {
  const menuItems: { [key: string]: string[] } = {
    'Restaurant': ['Butter Chicken', 'Biryani', 'Paneer Tikka'],
    'Cafe': ['Cappuccino', 'Croissant', 'Cold Brew'],
    'Tourist Spot': ['Guided Tour', 'Photo Spots', 'Souvenirs'],
    'Shopping': ['Fashion', 'Electronics', 'Accessories'],
    'Entertainment': ['Live Music', 'Shows', 'Events'],
    'Hotel': ['Deluxe Room', 'Suite', 'Spa'],
    'Park': ['Nature Walk', 'Picnic Area', 'Playground'],
    'Museum': ['Art Gallery', 'History Tour', 'Exhibits'],
    'Beach': ['Water Sports', 'Beach Shack', 'Sunset View'],
    'Temple': ['Darshan', 'Aarti', 'Prasad']
  };
  return menuItems[category] || ['Popular Items'];
};

export const PlaceCard = ({ place, onClick }: PlaceCardProps) => {
  const topItems = getTopMenuItems(place.category);
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-shadow hover:shadow-xl"
    >
      <div className="relative h-40">
        <img
          src={place.images && place.images[0] ? place.images[0] : placeholderImage}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold text-xs">{place.rating.toFixed(1)}</span>
        </div>
        <div className="absolute top-2 left-2 text-2xl">
          {getCategoryEmoji(place.category)}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-bold text-base text-gray-800 mb-1 line-clamp-1">{place.name}</h3>
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{place.description}</p>
        
        {/* Budget with real price */}
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {getBudgetPrice(place.budget)}
          </div>
          <div className="flex items-center gap-1 text-red-500">
            <Heart className="w-3 h-3" />
            <span className="text-xs font-semibold">{place.likes}</span>
          </div>
        </div>

        {/* Top Menu Items */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-700 mb-1">Popular:</p>
          <div className="flex flex-wrap gap-1">
            {topItems.slice(0, 2).map((item, idx) => (
              <span key={idx} className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <MapPin className="w-3 h-3" />
          <span className="line-clamp-1">{place.address}</span>
        </div>
      </div>
    </motion.div>
  );
};
