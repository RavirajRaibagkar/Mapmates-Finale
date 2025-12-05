'use client';

import { motion } from 'framer-motion';
import { User } from '@/types';

interface UserMarkerProps {
  user: User;
  onClick: () => void;
}

export const UserMarker = ({ user, onClick }: UserMarkerProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div className="relative">
        <div className="text-4xl">{user.avatar_emoji}</div>
        {user.is_verified && (
          <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
