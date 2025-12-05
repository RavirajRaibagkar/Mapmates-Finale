'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Achievement } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { ArrowLeft, Edit2, Save, Trophy, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: ''
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }

    const [profileData, achData] = await Promise.all([
      (supabase as any).from('profiles').select('*').eq('id', session.user.id).single(),
      (supabase as any).from('achievements').select('*').eq('user_id', session.user.id)
    ]);

    if (profileData.data) {
      const profile = profileData.data;
      setUser(profile as User);
      setFormData({
        username: profile.username,
        full_name: profile.full_name || '',
        bio: profile.bio || ''
      });
    }

    if (achData.data) setAchievements(achData.data as Achievement[]);
  };

  const handleSave = async () => {
    if (!user) return;

    const { error } = await (supabase as any)
      .from('profiles')
      .update(formData)
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    toast.success('Profile updated!');
    setIsEditing(false);
    fetchProfile();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <div className="text-7xl">{user.avatar_emoji}</div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">{user.username}</h1>
                    {user.full_name && (
                      <p className="text-gray-600 text-lg">{user.full_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {user.is_verified && (
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ Verified
                        </span>
                      )}
                      {user.role === 'admin' && (
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                          👑 Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  variant={isEditing ? 'primary' : 'ghost'}
                >
                  {isEditing ? <Save className="w-5 h-5 mr-2" /> : <Edit2 className="w-5 h-5 mr-2" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    label="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                  <Input
                    label="Full Name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  {user.bio && (
                    <p className="text-gray-700 mb-6">{user.bio}</p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{user.mapos}</p>
                  <p className="text-sm text-gray-600">Mapos</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{user.level}</p>
                  <p className="text-sm text-gray-600">Level</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 text-center">
                  <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{user.streak_days}</p>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Achievements ({achievements.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((ach) => (
                  <motion.div
                    key={ach.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 text-center border-2 border-purple-200"
                  >
                    <div className="text-4xl mb-2">{ach.badge_icon}</div>
                    <p className="font-semibold text-sm text-gray-800">{ach.badge_name}</p>
                  </motion.div>
                ))}
                {achievements.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No achievements yet. Keep exploring!
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Leaderboard */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
