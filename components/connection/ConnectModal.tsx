'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MiniGame } from '@/components/games/MiniGame';
import { User } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { spendMapos } from '@/lib/api/mapos';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { MessageCircle, Check } from 'lucide-react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User;
  currentUser: User;
}

export const ConnectModal = ({ isOpen, onClose, targetUser, currentUser }: ConnectModalProps) => {
  const [showGame, setShowGame] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAlreadyConnected, setIsAlreadyConnected] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Check if already connected when modal opens
  useEffect(() => {
    if (isOpen) {
      checkExistingConnection();
    }
  }, [isOpen, targetUser.id]);

  const checkExistingConnection = async () => {
    setLoading(true);
    try {
      // Check both directions of connection
      const { data, error } = await (supabase as any)
        .from('connections')
        .select('*')
        .or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${targetUser.id}),and(user1_id.eq.${targetUser.id},user2_id.eq.${currentUser.id})`)
        .eq('status', 'accepted');

      if (error) throw error;

      if (data && data.length > 0) {
        setIsAlreadyConnected(true);
      } else {
        setIsAlreadyConnected(false);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = () => {
    setShowGame(true);
  };

  const handleSkipGame = async () => {
    await createConnection();
  };

  const handleSkip = async () => {
    if (currentUser.mapos < 20) {
      toast.error('Not enough Mapos! Play games to earn more.');
      return;
    }

    setLoading(true);
    try {
      await spendMapos(currentUser.id, 20, 'Skip game to unlock chat');
      await createConnection();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async () => {
    const { error } = await (supabase as any).from('connections').insert({
      user1_id: currentUser.id,
      user2_id: targetUser.id,
      status: 'accepted',
      unlocked_at: new Date().toISOString()
    });

    if (error) throw error;

    toast.success(`Connected with ${targetUser.username}!`);
    onClose();
    router.push('/chat');
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading..." size="md">
        <div className="p-6 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isAlreadyConnected ? "Already Connected!" : "Wanna Connect?"} size="md">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{targetUser.avatar_emoji}</div>
          <h3 className="text-2xl font-bold text-gray-800">{targetUser.username}</h3>
          {targetUser.bio && (
            <p className="text-gray-600 mt-2">{targetUser.bio}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="bg-purple-100 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-600">Level</p>
              <p className="text-xl font-bold text-purple-600">{targetUser.level}</p>
            </div>
            <div className="bg-blue-100 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-600">Mapos</p>
              <p className="text-xl font-bold text-blue-600">{targetUser.mapos}</p>
            </div>
          </div>
        </div>

        {isAlreadyConnected ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200 text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-800 mb-2">
                You're already connected with {targetUser.username}!
              </p>
              <p className="text-gray-600 text-sm">
                Go to chat to start messaging
              </p>
            </div>

            <Button 
              onClick={() => {
                onClose();
                router.push('/chat');
              }} 
              className="w-full"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Go to Chat
            </Button>
          </div>
        ) : !showGame ? (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-center text-gray-700">
                Play a mini-game to connect! You can skip the game if you want.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handlePlayGame} variant="primary" className="w-full">
                🎮 Play Game
              </Button>
              <Button
                onClick={handleSkip}
                variant="secondary"
                className="w-full"
                disabled={currentUser.mapos < 20}
              >
                Skip (20 💎)
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <MiniGame userId={currentUser.id} onComplete={async () => {
              await createConnection();
              setShowGame(false);
            }} />
            <Button 
              onClick={handleSkipGame} 
              variant="ghost" 
              className="w-full mt-4"
            >
              Skip Game & Connect
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
