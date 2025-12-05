'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { addMapos } from '@/lib/api/mapos';
import { celebrateWin, boomEffect } from '@/lib/utils/animations';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface MiniGameProps {
  userId: string;
  onComplete: () => void;
}

export const MiniGame = ({ userId, onComplete }: MiniGameProps) => {
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [answer, setAnswer] = useState('');
  
  // Simple math puzzle
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const correctAnswer = num1 + num2;

  const checkAnswer = async () => {
    if (parseInt(answer) === correctAnswer) {
      setGameState('won');
      boomEffect();
      celebrateWin();
      
      try {
        await addMapos(userId, 20, 'Mini-game win');
        toast.success('🎉 You won 20 Mapos!');
        setTimeout(onComplete, 2000);
      } catch (error) {
        toast.error('Failed to award Mapos');
      }
    } else {
      setGameState('lost');
      toast.error('Wrong answer! Try again.');
      setTimeout(() => setGameState('playing'), 1500);
      setAnswer('');
    }
  };

  return (
    <div className="text-center p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-6"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Quick Math Challenge!
        </h3>
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-8 mb-4">
          <p className="text-4xl font-bold text-gray-800 mb-4">
            {num1} + {num2} = ?
          </p>
        </div>
      </motion.div>

      {gameState === 'playing' && (
        <div className="space-y-4">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            placeholder="Your answer"
            className="w-full px-6 py-4 text-2xl text-center rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none"
            autoFocus
          />
          <Button onClick={checkAnswer} className="w-full" size="lg">
            Submit Answer
          </Button>
        </div>
      )}

      {gameState === 'won' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-2xl font-bold text-green-600">Correct!</p>
          <p className="text-gray-600">You earned 20 Mapos!</p>
        </motion.div>
      )}

      {gameState === 'lost' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">😅</div>
          <p className="text-2xl font-bold text-red-600">Try Again!</p>
        </motion.div>
      )}
    </div>
  );
};
