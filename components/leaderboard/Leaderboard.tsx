'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types';
import { Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_banned', false)
      .order('mapos', { ascending: false })
      .limit(10);

    if (data) setTopUsers(data as User[]);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 1:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 2:
        return <Award className="w-8 h-8 text-orange-600" />;
      default:
        return <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-white';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-purple-600" />
        Top 10 Leaderboard
      </h2>

      <div className="space-y-3">
        {topUsers.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${getRankBg(index)} ${
              index < 3 ? 'text-white' : 'text-gray-800'
            } rounded-xl p-4 shadow-md`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(index)}
                </div>
                <div className="text-3xl">{user.avatar_emoji}</div>
                <div>
                  <p className="font-bold text-lg">{user.username}</p>
                  <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>
                    Level {user.level} • {user.streak_days} day streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{user.mapos}</p>
                <p className={`text-sm ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>
                  Mapos
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
