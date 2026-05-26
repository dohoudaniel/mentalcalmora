export interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  description?: string;
  text: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
  timestamp: string;
  insights?: string;
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  type: 'exercise' | 'mindfulness' | 'health' | 'social' | 'general';
  sentiment_target?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface UserTrend {
  trend: string | null;
  notes: string;
  chart?: {
    labels: string[];
    data: number[];
  };
}
