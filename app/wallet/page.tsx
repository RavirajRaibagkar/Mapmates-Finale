'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Transaction, Achievement } from '@/types';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, TrendingUp, TrendingDown, Trophy, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function WalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [mapos, setMapos] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [txData, achData, profileData] = await Promise.all([
      (supabase as any).from('transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
      (supabase as any).from('achievements').select('*').eq('user_id', session.user.id),
      (supabase as any).from('profiles').select('mapos').eq('id', session.user.id).single()
    ]);

    if (txData.data) setTransactions(txData.data as Transaction[]);
    if (achData.data) setAchievements(achData.data as Achievement[]);
    if (profileData.data) setMapos(profileData.data.mapos);
  };

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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white mb-8"
        >
          <p className="text-lg opacity-90 mb-2">Total Balance</p>
          <h1 className="text-5xl font-bold mb-4">{mapos} 💎</h1>
          <p className="opacity-75">Keep earning to unlock more features!</p>
        </motion.div>

        {/* Achievements */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-600" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((ach) => (
              <motion.div
                key={ach.id}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-xl shadow-lg p-4 text-center"
              >
                <div className="text-4xl mb-2">{ach.badge_icon}</div>
                <p className="font-semibold text-sm text-gray-800">{ach.badge_name}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            Transaction History
          </h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'earn' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.type === 'earn' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{tx.reason}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount} 💎
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
