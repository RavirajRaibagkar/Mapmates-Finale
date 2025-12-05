export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          avatar_emoji: string;
          full_name: string | null;
          bio: string | null;
          location: Json | null;
          mapos: number;
          level: number;
          streak_days: number;
          last_active: string;
          is_banned: boolean;
          is_verified: boolean;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      places: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          location: Json;
          address: string;
          budget: string;
          rating: number;
          images: string[];
          menu: Json | null;
          pricing: Json | null;
          likes: number;
          status: 'pending' | 'approved' | 'rejected';
          submitted_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['places']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['places']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      connections: {
        Row: {
          id: string;
          user1_id: string;
          user2_id: string;
          status: 'pending' | 'accepted' | 'blocked';
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['connections']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['connections']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          connection_id: string;
          sender_id: string;
          content: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'earn' | 'spend';
          reason: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
      };
      achievements: {
        Row: {
          id: string;
          user_id: string;
          badge_name: string;
          badge_icon: string;
          earned_at: string;
        };
        Insert: Omit<Database['public']['Tables']['achievements']['Row'], 'id' | 'earned_at'>;
        Update: Partial<Database['public']['Tables']['achievements']['Insert']>;
      };
      games: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: string;
          config: Json;
          reward_mapos: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['games']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['games']['Insert']>;
      };
      saved_places: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saved_places']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['saved_places']['Insert']>;
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          message: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>;
      };
    };
  };
}
