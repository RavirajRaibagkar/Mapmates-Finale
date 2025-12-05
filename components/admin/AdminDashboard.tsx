'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Users, MapPin, Trophy, Bell, TrendingUp, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlaces: 0,
    pendingPlaces: 0,
    totalMapos: 0,
    newMessages: 0
  });
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [users, places, pending, messages] = await Promise.all([
        (supabase as any).from('profiles').select('mapos', { count: 'exact' }),
        (supabase as any).from('places').select('*', { count: 'exact' }),
        (supabase as any).from('places').select('*', { count: 'exact' }).eq('status', 'pending'),
        (supabase as any).from('contact_messages').select('*', { count: 'exact' }).eq('status', 'new')
          .then((res: any) => res)
          .catch(() => ({ count: 0, data: null, error: null })) // Gracefully handle if table doesn't exist
      ]);

      const totalMapos = users.data?.reduce((sum: number, u: any) => sum + (u.mapos || 0), 0) || 0;

      setStats({
        totalUsers: users.count || 0,
        totalPlaces: places.count || 0,
        pendingPlaces: pending.count || 0,
        totalMapos,
        newMessages: messages.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load some statistics');
    }
  };

  const sendGlobalReward = async () => {
    const { data: users } = await (supabase as any).from('profiles').select('id');
    
    if (users) {
      for (const user of users) {
        await (supabase as any).from('transactions').insert({
          user_id: user.id,
          amount: 50,
          type: 'earn',
          reason: 'Global reward from admin'
        });

        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('mapos')
          .eq('id', user.id)
          .single();

        await (supabase as any)
          .from('profiles')
          .update({ mapos: (profile?.mapos || 0) + 50 })
          .eq('id', user.id);
      }
      toast.success('Global reward sent to all users!');
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'purple' },
    { icon: MapPin, label: 'Total Places', value: stats.totalPlaces, color: 'blue' },
    { icon: Bell, label: 'Pending Approvals', value: stats.pendingPlaces, color: 'orange' },
    { icon: Mail, label: 'New Messages', value: stats.newMessages, color: 'red' },
    { icon: Trophy, label: 'Total Mapos', value: stats.totalMapos, color: 'green' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Admin Control Panel
        </h1>
        <Button onClick={sendGlobalReward}>
          <Trophy className="w-5 h-5 mr-2" />
          Send Global Reward
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className={`inline-flex p-3 rounded-xl bg-${stat.color}-100 mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
