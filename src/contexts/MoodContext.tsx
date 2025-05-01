
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "@/components/ui/use-toast";

export interface MoodEntry {
  id: number;
  userId: number;
  text: string;
  mood: string;
  description?: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;
  timestamp: string;
}

export interface Recommendation {
  id: number;
  title: string;
  description: string;
  type: 'exercise' | 'mindfulness' | 'health' | 'social' | 'general';
}

interface MoodContextType {
  entries: MoodEntry[];
  recommendations: Recommendation[];
  addMoodEntry: (mood: string, description?: string) => void;
  getLatestEntry: () => MoodEntry | null;
  getUserTrend: () => { trend: string | null, notes: string, chart?: { labels: string[], data: number[] } };
}

const MoodContext = createContext<MoodContextType>({
  entries: [],
  recommendations: [],
  addMoodEntry: () => {},
  getLatestEntry: () => null,
  getUserTrend: () => ({ trend: null, notes: "No data available." }),
});

export const useMood = () => useContext(MoodContext);

interface MoodProviderProps {
  children: ReactNode;
}

export function MoodProvider({ children }: MoodProviderProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Load entries from localStorage when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const storedEntries = localStorage.getItem(`calmora_entries_${currentUser.id}`);
      
      if (storedEntries) {
        try {
          setEntries(JSON.parse(storedEntries));
        } catch (error) {
          console.error('Error parsing stored entries:', error);
          setEntries([]);
        }
      }
      
      generateRecommendations();
    } else {
      setEntries([]);
      setRecommendations([]);
    }
  }, [currentUser, isAuthenticated]);

  const generateRecommendations = () => {
    // Simplified recommendation logic based on recent entries
    const positiveRecommendations = [
      {
        id: 1,
        title: "Maintain Your Momentum",
        description: "You're doing great! Try starting your day with a gratitude journal to maintain this positive outlook.",
        type: "mindfulness" as const,
      },
      {
        id: 2,
        title: "Healthy Habit Boost",
        description: "Your positive mood is perfect for establishing a new healthy habit. Consider adding a short morning walk to your routine.",
        type: "health" as const,
      },
      {
        id: 3,
        title: "Share Your Positivity",
        description: "Your good mood can be contagious! Reach out to a friend or family member who might need some encouragement today.",
        type: "social" as const,
      }
    ];

    const neutralRecommendations = [
      {
        id: 4,
        title: "Mindful Moment",
        description: "Take 5 minutes for mindful breathing to center yourself and bring awareness to your present state.",
        type: "mindfulness" as const,
      },
      {
        id: 5,
        title: "Small Achievement",
        description: "Set and complete one small goal today - it can help shift your mood in a positive direction.",
        type: "general" as const,
      },
      {
        id: 6,
        title: "Nature Connection",
        description: "Spending even 15 minutes in nature can help stabilize and potentially improve your mood.",
        type: "health" as const,
      }
    ];

    const negativeRecommendations = [
      {
        id: 7,
        title: "Gentle Movement",
        description: "Even a short 5-minute stretch can help release tension and slightly boost your mood.",
        type: "exercise" as const,
      },
      {
        id: 8,
        title: "Self-Compassion Break",
        description: "Acknowledge that you're going through a difficult time. Place a hand on your heart and offer yourself some kind words.",
        type: "mindfulness" as const,
      },
      {
        id: 9,
        title: "Supportive Connection",
        description: "Consider reaching out to someone you trust. Sometimes sharing your feelings can help lighten the load.",
        type: "social" as const,
      }
    ];

    const latestEntry = getLatestEntry();
    
    if (!latestEntry) {
      setRecommendations(neutralRecommendations);
      return;
    }
    
    if (latestEntry.sentiment === 'POSITIVE' || latestEntry.score > 0.6) {
      setRecommendations(positiveRecommendations);
    } else if (latestEntry.sentiment === 'NEGATIVE' || latestEntry.score < 0.4) {
      setRecommendations(negativeRecommendations);
    } else {
      setRecommendations(neutralRecommendations);
    }
  };

  const addMoodEntry = (mood: string, description?: string) => {
    if (!currentUser) return;
    
    // Analyze sentiment (simplified for demo)
    let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    let score: number;
    
    const positiveWords = ['happy', 'great', 'excellent', 'good', 'joy', 'excited', 'calm', 'peaceful', 'relaxed'];
    const negativeWords = ['sad', 'angry', 'upset', 'anxious', 'stressed', 'worried', 'tired', 'frustrated', 'depressed'];
    
    const text = (mood + ' ' + (description || '')).toLowerCase();
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      sentiment = 'POSITIVE';
      score = 0.5 + (positiveCount * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'NEGATIVE';
      score = 0.5 - (negativeCount * 0.1);
    } else {
      sentiment = 'NEUTRAL';
      score = 0.5;
    }
    
    // Cap the score between 0 and 1
    score = Math.min(1, Math.max(0, score));
    
    const newEntry: MoodEntry = {
      id: Date.now(),
      userId: currentUser.id,
      text: description || mood,
      mood,
      description,
      sentiment,
      score,
      timestamp: new Date().toISOString(),
    };
    
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    
    // Save to localStorage
    localStorage.setItem(`calmora_entries_${currentUser.id}`, JSON.stringify(updatedEntries));
    
    // Generate new recommendations based on this entry
    generateRecommendations();
    
    toast({
      title: "Mood recorded",
      description: "Your mood entry has been saved successfully.",
    });
  };
  
  const getLatestEntry = (): MoodEntry | null => {
    if (entries.length === 0) return null;
    return entries[0]; // Entries are sorted with newest first
  };
  
  const getUserTrend = () => {
    if (entries.length < 3) {
      return {
        trend: null,
        notes: "Not enough data to analyze trends yet. Add more mood entries.",
      };
    }
    
    // Simple trend analysis
    const recentScores = entries.slice(0, 7).map(entry => entry.score);
    const average = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    
    const oldestEntries = entries.slice(Math.max(0, entries.length - 7));
    const oldestAverage = oldestEntries.reduce((sum, entry) => sum + entry.score, 0) / oldestEntries.length;
    
    let trend: string | null;
    let notes: string;
    
    if (average > oldestAverage + 0.1) {
      trend = "upward";
      notes = "Your mood is trending more positive 📈";
    } else if (average < oldestAverage - 0.1) {
      trend = "downward";
      notes = "Your mood is trending downward 📉";
    } else {
      trend = "flat";
      notes = "Your mood is relatively stable.";
    }
    
    // Create chart data
    const labels = entries.slice(0, 7).reverse().map(entry => {
      const date = new Date(entry.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = entries.slice(0, 7).reverse().map(entry => Number(entry.score.toFixed(2)));
    
    return {
      trend,
      notes,
      chart: {
        labels,
        data
      }
    };
  };

  const value = {
    entries,
    recommendations,
    addMoodEntry,
    getLatestEntry,
    getUserTrend
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}
