export interface User {
  id: string;
  email: string;
  username: string;
  avatar_emoji: string;
  full_name?: string;
  bio?: string;
  location?: { lat: number; lng: number };
  mapos: number;
  level: number;
  streak_days: number;
  last_active: string;
  is_banned: boolean;
  is_verified: boolean;
  role: 'user' | 'admin';
}

export interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  location: { lat: number; lng: number };
  address: string;
  budget: string;
  rating: number;
  images: string[];
  menu?: any;
  pricing?: any;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user?: User;
}

export interface Connection {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  unlocked_at?: string;
  other_user?: User;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  content: string;
  read_at?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend';
  reason: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_name: string;
  badge_icon: string;
  earned_at: string;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  type: string;
  config: any;
  reward_mapos: number;
  is_active: boolean;
}
