'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: string;
  points: number;
  explanation: string;
}

interface QuizGameProps {
  userId: string;
  onComplete: () => void;
}

export function QuizGame({ userId, onComplete }: QuizGameProps) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  useEffect(() => {
    if (!showResult && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeout();
    }
  }, [timeLeft, showResult]);

  const fetchRandomQuestion = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('quiz_questions')
        .select('*')
        .eq('is_active', true)
        .limit(50);

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.code === '42P01') {
          console.warn('Quiz questions table not found. Run quiz-games-schema.sql');
          setQuestion(null);
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        const randomQuestion = data[Math.floor(Math.random() * data.length)];
        setQuestion(randomQuestion);
      } else {
        toast.error('No questions available');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      // Don't show error toast if table doesn't exist
      if (!(error as any)?.message?.includes('relation')) {
        toast.error('Failed to load question');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeout = () => {
    setShowResult(true);
    setIsCorrect(false);
    saveAttempt(null, false, 0);
  };

  const handleAnswer = async (answerIndex: number) => {
    if (showResult || !question) return;

    setSelectedAnswer(answerIndex);
    const correct = answerIndex === question.correct_answer;
    setIsCorrect(correct);
    setShowResult(true);

    const pointsEarned = correct ? question.points : 0;
    setScore(score + pointsEarned);

    if (correct) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    await saveAttempt(answerIndex, correct, pointsEarned);
  };

  const saveAttempt = async (answerIndex: number | null, correct: boolean, points: number) => {
    try {
      // Save attempt
      await (supabase as any).from('quiz_attempts').insert({
        user_id: userId,
        question_id: question?.id,
        selected_answer: answerIndex ?? -1,
        is_correct: correct,
        points_earned: points,
        time_taken: 30 - timeLeft
      });

      // Update user's mapos
      if (correct && points > 0) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('mapos')
          .eq('id', userId)
          .single();

        await (supabase as any)
          .from('profiles')
          .update({ mapos: (profile?.mapos || 0) + points })
          .eq('id', userId);

        // Record transaction
        await (supabase as any).from('transactions').insert({
          user_id: userId,
          amount: points,
          type: 'earn',
          reason: `Quiz: ${question?.category}`
        });
      }
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(30);
    setLoading(true);
    fetchRandomQuestion();
  };

  const handleFinish = () => {
    toast.success(`Quiz complete! You earned ${score} Mapos!`);
    onComplete();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center p-8">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Quiz System Not Set Up
          </h3>
          <p className="text-gray-600 mb-4">
            The quiz questions table hasn't been created yet.
          </p>
          <div className="bg-white rounded-lg p-4 text-left max-w-md mx-auto mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">To enable quiz games:</p>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Go to Supabase → SQL Editor</li>
              <li>Copy contents of <code className="bg-gray-100 px-2 py-1 rounded">quiz-games-schema.sql</code></li>
              <li>Paste and run the SQL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
          <Button onClick={onComplete}>Back to Games</Button>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojis: { [key: string]: string } = {
      places: '🏛️',
      travel: '✈️',
      culture: '🎭',
      food: '🍽️',
      trends: '📱',
      geography: '🌍'
    };
    return emojis[category] || '❓';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getCategoryEmoji(question.category)}</div>
          <div>
            <h3 className="font-bold text-gray-800 capitalize">{question.category}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(question.difficulty)}`}>
              {question.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-100 rounded-lg px-3 py-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span className="font-bold text-purple-600">{score}</span>
          </div>
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-bold">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
        <p className="text-lg font-semibold text-gray-800">{question.question}</p>
        <div className="flex items-center gap-2 mt-2">
          <Trophy className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-purple-600 font-semibold">{question.points} Mapos</span>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectAnswer = index === question.correct_answer;
            
            let bgColor = 'bg-white hover:bg-gray-50';
            let borderColor = 'border-gray-200';
            
            if (showResult) {
              if (isCorrectAnswer) {
                bgColor = 'bg-green-50';
                borderColor = 'border-green-500';
              } else if (isSelected && !isCorrect) {
                bgColor = 'bg-red-50';
                borderColor = 'border-red-500';
              }
            } else if (isSelected) {
              bgColor = 'bg-purple-50';
              borderColor = 'border-purple-500';
            }

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`${bgColor} border-2 ${borderColor} rounded-xl p-4 text-left transition-all ${
                  !showResult ? 'hover:scale-102 cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{option}</span>
                  {showResult && isCorrectAnswer && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Result & Explanation */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 ${
            isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {isCorrect ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h4 className="font-bold text-green-800">Correct! 🎉</h4>
                  <p className="text-sm text-green-700">+{question.points} Mapos earned!</p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h4 className="font-bold text-red-800">Incorrect</h4>
                  <p className="text-sm text-red-700">Better luck next time!</p>
                </div>
              </>
            )}
          </div>
          
          {question.explanation && (
            <div className="bg-white rounded-lg p-4 mt-3">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Did you know?</p>
                  <p className="text-sm text-gray-600">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <Button onClick={handleNext} className="flex-1">
              Next Question
            </Button>
            <Button onClick={handleFinish} variant="secondary" className="flex-1">
              Finish Quiz
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
