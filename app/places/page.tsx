'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Place } from '@/types';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlaceModal } from '@/components/places/PlaceModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [userId, setUserId] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const categories = ['all', 'Restaurant', 'Cafe', 'Tourist Spot', 'Shopping', 'Entertainment'];

  useEffect(() => {
    fetchPlaces();
    getUserId();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [search, category, places]);

  const getUserId = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setUserId(session.user.id);
  };

  const fetchPlaces = async () => {
    const { data } = await supabase
      .from('places')
      .select('*')
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (data) setPlaces(data as Place[]);
  };

  const filterPlaces = () => {
    let filtered = places;

    if (search) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    setFilteredPlaces(filtered);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => router.push('/places/submit')}>
              <Plus className="w-5 h-5 mr-2" />
              Submit Place
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Discover Pune
          </h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search places..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  category === cat
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, idx) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <PlaceCard place={place} onClick={() => setSelectedPlace(place)} />
            </motion.div>
          ))}
        </div>

        {filteredPlaces.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No places found
          </div>
        )}
      </div>

      {selectedPlace && (
        <PlaceModal
          isOpen={!!selectedPlace}
          onClose={() => setSelectedPlace(null)}
          place={selectedPlace}
          userId={userId}
        />
      )}
    </div>
  );
}
