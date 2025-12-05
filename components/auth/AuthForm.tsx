'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState('😊');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const emojis = ['😊', '😎', '🤩', '🥳', '🚀', '🌟', '💫', '🎯', '🎨', '🎭', '🎪', '🎸'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Check if profile exists, create if missing
        if (authData.user) {
          const { data: profile } = await (supabase as any)
            .from('profiles')
            .select('id')
            .eq('id', authData.user.id)
            .single();
          
          if (!profile) {
            // Profile doesn't exist, create it
            await (supabase as any).from('profiles').insert({
              id: authData.user.id,
              email: authData.user.email,
              username: authData.user.email?.split('@')[0] || 'user',
              avatar_emoji: '😊',
              mapos: 100,
              level: 1,
              streak_days: 0,
              last_active: new Date().toISOString(),
              is_banned: false,
              is_verified: false,
              role: 'user'
            });
          }
        }
        
        toast.success('Welcome back!');
        router.push('/dashboard');
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          await (supabase as any).from('profiles').insert({
            id: data.user.id,
            email,
            username,
            avatar_emoji: avatarEmoji,
            mapos: 100,
            level: 1,
            streak_days: 0,
            last_active: new Date().toISOString(),
            is_banned: false,
            is_verified: false,
            role: 'user'
          });
          toast.success('Account created! Welcome to MapMates!');
          router.push('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          MapMates
        </h1>
        <p className="text-gray-600">Connect, Explore, Discover</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Choose a username"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Your Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`text-3xl p-2 rounded-lg transition-all ${
                      avatarEmoji === emoji
                        ? 'bg-purple-100 ring-2 ring-purple-500 scale-110'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        <Button type="submit" className="w-full" isLoading={loading}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </motion.div>
  );
};
