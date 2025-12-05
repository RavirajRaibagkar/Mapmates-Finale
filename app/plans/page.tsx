'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Heart, Star, Eye, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface TravelPlan {
  id: string;
  title: string;
  description: string;
  cover_image: string | null;
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

export default function PlansPage() {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'popular' | 'recent'>('all');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
  }, [filter]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('travel_plans')
        .select(`
          *,
          creator:profiles!travel_plans_created_by_fkey(username, avatar_emoji)
        `)
        .eq('status', 'published')
        .eq('is_public', true);

      if (filter === 'popular') {
        query = query.order('likes', { ascending: false });
      } else if (filter === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('rating', { ascending: false });
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;
      setPlans(data as TravelPlan[]);
    } catch (error: any) {
      toast.error('Failed to load plans');
      console.error(error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button onClick={() => router.push('/plans/create')}>
              <Plus className="w-5 h-5 mr-2" />
              Create Plan
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Travel Plans
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover amazing travel itineraries created by fellow explorers. Plan your next adventure!
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => setFilter('popular')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'popular'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === 'recent'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Recent
          </button>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗺️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Plans Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to create a travel plan!</p>
            <Button onClick={() => router.push('/plans/create')}>
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(`/plans/${plan.id}`)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-400 to-blue-500">
                  {plan.cover_image ? (
                    <img
                      src={plan.cover_image}
                      alt={plan.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                      🗺️
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(plan.difficulty_level)}`}>
                    {plan.difficulty_level}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {plan.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{plan.duration_days} {plan.duration_days === 1 ? 'day' : 'days'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{plan.budget_estimate}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {plan.tags && plan.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plan.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Heart className="w-4 h-4 text-red-500" />
                        <span>{plan.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>{plan.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="w-4 h-4" />
                        <span>{plan.views}</span>
                      </div>
                    </div>
                    {plan.creator && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{plan.creator.avatar_emoji}</span>
                        <span className="text-xs text-gray-500">{plan.creator.username}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
