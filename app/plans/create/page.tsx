'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Plus, X, Clock, MapPin, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Checkpoint {
  id: string;
  place_id: string | null;
  place_name: string;
  place_image: string | null;
  time_start: string;
  time_end: string;
  checkpoint_type: string;
  description: string;
  estimated_cost: string;
}

interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  images: string[];
  rating: number;
}

export default function CreatePlanPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_days: 1,
    budget_estimate: '₹₹',
    difficulty_level: 'Easy',
    tags: ''
  });
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('places')
        .select('*')
        .eq('status', 'approved')
        .order('rating', { ascending: false });
      
      if (error) {
        console.error('Error fetching places:', error);
        toast.error('Failed to load places');
        return;
      }

      if (data) {
        console.log('Total approved places:', data.length);
        
        // Try to get places with images first
        const placesWithImages = data.filter((p: any) => {
          return p.images && Array.isArray(p.images) && p.images.length > 0 && p.images[0];
        });
        
        console.log('Places with images:', placesWithImages.length);
        
        // If no places have images, use all places
        if (placesWithImages.length > 0) {
          setPlaces(placesWithImages as Place[]);
        } else {
          console.log('No places with images, showing all places');
          setPlaces(data as Place[]);
          toast('Note: Some places may not have images', { icon: 'ℹ️' });
        }
      }
    } catch (error) {
      console.error('Error in fetchPlaces:', error);
      toast.error('Failed to load places');
    }
  };

  const addCheckpoint = () => {
    const newCheckpoint: Checkpoint = {
      id: Date.now().toString(),
      place_id: null,
      place_name: '',
      place_image: null,
      time_start: '',
      time_end: '',
      checkpoint_type: 'stop',
      description: '',
      estimated_cost: '₹₹'
    };
    setCheckpoints([...checkpoints, newCheckpoint]);
  };

  const removeCheckpoint = (id: string) => {
    setCheckpoints(checkpoints.filter(cp => cp.id !== id));
  };

  const updateCheckpoint = (id: string, field: string, value: any) => {
    setCheckpoints(checkpoints.map(cp => 
      cp.id === id ? { ...cp, [field]: value } : cp
    ));
  };

  const selectPlace = (place: Place, checkpointId: string) => {
    console.log('Selecting place:', place.name, 'for checkpoint:', checkpointId);
    
    // Update all fields at once to avoid race conditions
    setCheckpoints(checkpoints.map(cp => {
      if (cp.id === checkpointId) {
        return {
          ...cp,
          place_id: place.id,
          place_name: place.name,
          place_image: place.images && place.images[0] ? place.images[0] : null
        };
      }
      return cp;
    }));
    
    setShowPlaceSearch(false);
    setCurrentCheckpointIndex(null);
    setSearchQuery('');
    toast.success(`Added ${place.name}`);
  };

  const filteredPlaces = places.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (checkpoints.length === 0) {
      toast.error('Please add at least one checkpoint to your plan');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);

      // Create the plan
      const { data: plan, error: planError } = await (supabase as any)
        .from('travel_plans')
        .insert({
          title: formData.title,
          description: formData.description,
          duration_days: formData.duration_days,
          budget_estimate: formData.budget_estimate,
          difficulty_level: formData.difficulty_level,
          tags: tagsArray,
          created_by: session.user.id,
          status: 'published',
          is_public: true
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create checkpoints
      const checkpointsData = checkpoints.map((cp, index) => ({
        plan_id: plan.id,
        place_id: cp.place_id,
        checkpoint_order: index + 1,
        checkpoint_type: cp.checkpoint_type,
        title: cp.place_name,
        description: cp.description,
        estimated_duration: calculateDuration(cp.time_start, cp.time_end),
        estimated_cost: cp.estimated_cost,
        time_of_day: getTimeOfDay(cp.time_start),
        notes: `${cp.time_start} - ${cp.time_end}`
      }));

      const { error: checkpointsError } = await (supabase as any)
        .from('plan_checkpoints')
        .insert(checkpointsData);

      if (checkpointsError) throw checkpointsError;

      toast.success('Travel plan created successfully!');
      router.push(`/plans/${plan.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 60;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const getTimeOfDay = (time: string) => {
    if (!time) return 'morning';
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/plans')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Create Travel Plan
        </h1>
        <p className="text-gray-600 mb-8">
          Share your amazing travel itinerary with the community
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
            
            <Input
              label="Plan Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Pune Heritage Walk"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                rows={3}
                placeholder="Describe your travel plan..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                <select
                  value={formData.budget_estimate}
                  onChange={(e) => setFormData({ ...formData, budget_estimate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option>₹</option>
                  <option>₹₹</option>
                  <option>₹₹₹</option>
                  <option>₹₹₹₹</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                >
                  <option>Easy</option>
                  <option>Moderate</option>
                  <option>Challenging</option>
                </select>
              </div>
            </div>

            <Input
              label="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., heritage, food, culture"
            />
          </div>

          {/* Checkpoints */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Itinerary Timeline</h2>
              <Button type="button" onClick={addCheckpoint} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </div>

            {checkpoints.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No stops added yet</p>
                <Button type="button" onClick={addCheckpoint} variant="secondary">
                  Add Your First Stop
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {checkpoints.map((checkpoint, index) => (
                    <motion.div
                      key={checkpoint.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="relative border-2 border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                    >
                      {/* Checkpoint Number */}
                      <div className="absolute -left-4 top-4 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeCheckpoint(checkpoint.id)}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="ml-6 space-y-4">
                        {/* Place Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Place</label>
                          {checkpoint.place_id ? (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                              {checkpoint.place_image && (
                                <img src={checkpoint.place_image} alt={checkpoint.place_name} className="w-16 h-16 object-cover rounded-lg" />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{checkpoint.place_name}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentCheckpointIndex(index);
                                    setShowPlaceSearch(true);
                                  }}
                                  className="text-sm text-purple-600 hover:underline"
                                >
                                  Change place
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentCheckpointIndex(index);
                                setShowPlaceSearch(true);
                              }}
                              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors"
                            >
                              <MapPin className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Select a place</p>
                            </button>
                          )}
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              required
                              value={checkpoint.time_start}
                              onChange={(e) => updateCheckpoint(checkpoint.id, 'time_start', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input
                              type="time"
                              required
                              value={checkpoint.time_end}
                              onChange={(e) => updateCheckpoint(checkpoint.id, 'time_end', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                          <textarea
                            value={checkpoint.description}
                            onChange={(e) => updateCheckpoint(checkpoint.id, 'description', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                            rows={2}
                            placeholder="Add any notes or activities..."
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>
            Create Travel Plan
          </Button>
        </form>

        {/* Place Search Modal */}
        {showPlaceSearch && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Select a Place</h3>
                  <button
                    onClick={() => {
                      setShowPlaceSearch(false);
                      setCurrentCheckpointIndex(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search places..."
                    className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="overflow-y-auto max-h-96 p-6">
                {filteredPlaces.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No places found</p>
                    <p className="text-sm text-gray-500">
                      {searchQuery ? 'Try a different search term' : 'No approved places available'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPlaces.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => currentCheckpointIndex !== null && selectPlace(place, checkpoints[currentCheckpointIndex].id)}
                        className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 transition-colors text-left"
                      >
                        {place.images && place.images[0] ? (
                          <img
                            src={place.images[0]}
                            alt={place.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="40" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3E📍%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                            📍
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">{place.name}</h4>
                          <p className="text-sm text-gray-600">{place.category}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{place.address}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-500">⭐</span>
                            <span className="text-sm font-semibold">{place.rating}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
