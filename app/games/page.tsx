'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { QuizGame } from '@/components/games/QuizGame';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Trophy, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GamesPage() {
  const [userId, setUserId] = useState('');
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [mapos, setMapos] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setUserId(session.user.id);
    
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('mapos')
      .eq('id', session.user.id)
      .single();
    
    if (profile) setMapos(profile.mapos);
  };

  const games = [
    {
      id: 'math',
      title: 'Math Challenge',
      description: 'Solve math problems quickly!',
      icon: '🔢',
      reward: 20
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Match pairs of cards',
      icon: '🧠',
      reward: 20
    },
    {
      id: 'quiz',
      title: 'Travel Quiz',
      description: 'Test your travel knowledge',
      icon: '🌍',
      reward: 20
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2 bg-purple-100 rounded-full px-4 py-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="font-bold text-purple-600">{mapos} Mapos</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!selectedGame ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Play & Earn Mapos
              </h1>
              <p className="text-xl text-gray-600">
                Choose a game and earn 20 Mapos for each win!
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {games.map((game, idx) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => setSelectedGame(game.id)}
                >
                  <div className="text-6xl mb-4 text-center">{game.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    {game.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-center">{game.description}</p>
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="text-2xl font-bold text-purple-600">{game.reward} 💎</p>
                  </div>
                  <Button className="w-full mt-4">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Play Now
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-blue-800 mb-2">💡 How It Works</h3>
              <ul className="space-y-2 text-blue-700">
                <li>• Choose any game to play</li>
                <li>• Complete the challenge successfully</li>
                <li>• Earn 20 Mapos instantly!</li>
                <li>• Play as many times as you want</li>
                <li>• Use Mapos to unlock chat and features</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setSelectedGame(null)}
              className="mb-6"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Games
            </Button>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <QuizGame
                userId={userId}
                onComplete={() => {
                  setSelectedGame(null);
                  checkAuth(); // Refresh mapos
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
