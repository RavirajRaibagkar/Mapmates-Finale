'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Heart, Star, Eye, Clock, DollarSign, MapPin, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface TravelPlan {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  budget_estimate: string;
  difficulty_level: string;
  tags: string[];
  likes: number;
  rating: number;
  views: number;
  created_by: string;
  created_at: string;
  creator?: {
    username: string;
    avatar_emoji: string;
  };
}

interface Checkpoint {
  id: string;
  place_id: string | null;
  checkpoint_order: number;
  checkpoint_type: string;
  title: string;
  description: string;
  estimated_duration: number;
  estimated_cost: string;
  time_of_day: string;
  notes: string;
  place?: {
    id: string;
    name: string;
    category: string;
    address: string;
    images: string[];
    rating: number;
  };
}

export default function PlanDetailPage() {
  const params = useParams();
  const [plan, setPlan] = useState<TravelPlan | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (params.id) {
      fetchPlanDetails();
      incrementViews();
    }
  }, [params.id]);

  const fetchPlanDetails = async () => {
    try {
      const planId = params.id as string;
      
      // Fetch plan
      const { data: planData, error: planError } = await (supabase as any)
        .from('travel_plans')
        .select(`
          *,
          creator:profiles!travel_plans_created_by_fkey(username, avatar_emoji)
        `)
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      setPlan(planData as TravelPlan);

      // Fetch checkpoints with places
      const { data: checkpointsData, error: checkpointsError } = await (supabase as any)
        .from('plan_checkpoints')
        .select(`
          *,
          place:places(id, name, category, address, images, rating)
        `)
        .eq('plan_id', planId)
        .order('checkpoint_order');

      if (checkpointsError) throw checkpointsError;
      setCheckpoints(checkpointsData as Checkpoint[]);

      // Check if user has liked
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: likeData } = await (supabase as any)
          .from('plan_likes')
          .select('id')
          .eq('plan_id', planId)
          .eq('user_id', session.user.id)
          .single();
        
        setHasLiked(!!likeData);

        // Check user rating
        const { data: ratingData } = await (supabase as any)
          .from('plan_ratings')
          .select('rating')
          .eq('plan_id', planId)
          .eq('user_id', session.user.id)
          .single();
        
        if (ratingData) setUserRating(ratingData.rating);
      }
    } catch (error: any) {
      toast.error('Failed to load plan');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    const planId = params.id as string;
    await (supabase as any).rpc('increment_plan_views', { plan_id: planId });
  };

  const handleLike = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please login to like');
      return;
    }

    const planId = params.id as string;

    try {
      if (hasLiked) {
        await (supabase as any)
          .from('plan_likes')
          .delete()
          .eq('plan_id', planId)
          .eq('user_id', session.user.id);
        setHasLiked(false);
        setPlan(prev => prev ? { ...prev, likes: prev.likes - 1 } : null);
      } else {
        await (supabase as any)
          .from('plan_likes')
          .insert({ plan_id: planId, user_id: session.user.id });
        setHasLiked(true);
        setPlan(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleRate = async (rating: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error('Please login to rate');
      return;
    }

    const planId = params.id as string;

    try {
      await (supabase as any)
        .from('plan_ratings')
        .upsert({
          plan_id: planId,
          user_id: session.user.id,
          rating
        });
      setUserRating(rating);
      toast.success('Rating submitted!');
      fetchPlanDetails();
    } catch (error) {
      toast.error('Failed to submit rating');
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Moderate': return 'bg-yellow-100 text-yellow-700';
      case 'Challenging': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeOfDayEmoji = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '⏰';
    }
  };

  const parseTime = (notes: string) => {
    const match = notes.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    return match ? { start: match[1], end: match[2] } : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Plan not found</h2>
          <Button onClick={() => router.push('/plans')}>Back to Plans</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/plans')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Plan Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-800 mb-3">{plan.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{plan.description}</p>
              
              {/* Tags */}
              {plan.tags && plan.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {plan.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(plan.difficulty_level)}`}>
              {plan.difficulty_level}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <Clock className="w-6 h-6 text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-xl font-bold text-gray-800">{plan.duration_days} {plan.duration_days === 1 ? 'day' : 'days'}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <DollarSign className="w-6 h-6 text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-xl font-bold text-gray-800">{plan.budget_estimate}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <MapPin className="w-6 h-6 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Stops</p>
              <p className="text-xl font-bold text-gray-800">{checkpoints.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <Eye className="w-6 h-6 text-yellow-600 mb-2" />
              <p className="text-sm text-gray-600">Views</p>
              <p className="text-xl font-bold text-gray-800">{plan.views}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t">
            <Button
              onClick={handleLike}
              variant={hasLiked ? 'primary' : 'secondary'}
              className="flex-1"
            >
              <Heart className={`w-5 h-5 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
              {hasLiked ? 'Liked' : 'Like'} ({plan.likes})
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= userRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-gray-700">
                {plan.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Creator */}
          {plan.creator && (
            <div className="flex items-center gap-3 mt-6 pt-6 border-t">
              <span className="text-3xl">{plan.creator.avatar_emoji}</span>
              <div>
                <p className="text-sm text-gray-600">Created by</p>
                <p className="font-semibold text-gray-800">{plan.creator.username}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Timeline - Snake UI */}
        <div className="relative">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Itinerary</h2>
          
          {checkpoints.map((checkpoint, index) => {
            const isEven = index % 2 === 0;
            const time = parseTime(checkpoint.notes || '');
            
            return (
              <motion.div
                key={checkpoint.id}
                initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative mb-12 ${isEven ? 'pr-0 md:pr-12' : 'pl-0 md:pl-12'}`}
              >
                {/* Timeline Line */}
                {index < checkpoints.length - 1 && (
                  <div className={`hidden md:block absolute top-24 ${isEven ? 'right-6' : 'left-6'} w-0.5 h-24 bg-gradient-to-b from-purple-500 to-blue-500`} />
                )}

                {/* Checkpoint Card */}
                <div className={`flex ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 items-start`}>
                  {/* Number Badge */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                    {/* Place Image */}
                    {checkpoint.place && checkpoint.place.images && checkpoint.place.images.length > 0 && (
                      <div className="relative h-48">
                        <img
                          src={checkpoint.place.images[0]}
                          alt={checkpoint.place.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{checkpoint.place.rating}</span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Time Badge */}
                      {time && (
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full mb-4">
                          <span className="text-xl">{getTimeOfDayEmoji(checkpoint.time_of_day)}</span>
                          <span className="font-semibold">{time.start} - {time.end}</span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        {checkpoint.title || checkpoint.place?.name}
                      </h3>

                      {/* Place Info */}
                      {checkpoint.place && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{checkpoint.place.address}</span>
                          </div>
                          <div className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                            {checkpoint.place.category}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      {checkpoint.description && (
                        <p className="text-gray-600 mb-4">{checkpoint.description}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 pt-4 border-t text-sm text-gray-600">
                        {checkpoint.estimated_duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{checkpoint.estimated_duration} min</span>
                          </div>
                        )}
                        {checkpoint.estimated_cost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{checkpoint.estimated_cost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
