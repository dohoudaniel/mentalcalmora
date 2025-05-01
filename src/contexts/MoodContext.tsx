
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from "@/components/ui/use-toast";
import { fetchUserMoodEntries, addMoodEntry as addMoodEntryToDb, fetchRecommendations } from '@/services/moodService';

export interface MoodEntry {
  id: string | number;
  userId: string;
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
  addMoodEntry: (mood: string, description?: string) => Promise<MoodEntry | null>;
  getLatestEntry: () => MoodEntry | null;
  getUserTrend: () => { trend: string | null, notes: string, chart?: { labels: string[], data: number[] } };
  loading: boolean;
}

const MoodContext = createContext<MoodContextType>({
  entries: [],
  recommendations: [],
  addMoodEntry: async () => null,
  getLatestEntry: () => null,
  getUserTrend: () => ({ trend: null, notes: "No data available." }),
  loading: false
});

export const useMood = () => useContext(MoodContext);

interface MoodProviderProps {
  children: ReactNode;
}

export function MoodProvider({ children }: MoodProviderProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load entries and recommendations when user changes
  useEffect(() => {
    const loadData = async () => {
      if (isAuthenticated && currentUser) {
        setLoading(true);
        try {
          // Load mood entries
          const userEntries = await fetchUserMoodEntries(currentUser.id);
          setEntries(userEntries);
          
          // Generate recommendations based on latest entry
          await generateRecommendations(userEntries);
        } catch (error) {
          console.error('Error loading mood data:', error);
          toast({
            title: "Error",
            description: "Failed to load your mood data. Please try refreshing the page.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Reset when logged out
        setEntries([]);
        setRecommendations([]);
      }
    };
    
    loadData();
  }, [currentUser, isAuthenticated]);

  const generateRecommendations = async (userEntries: MoodEntry[]) => {
    if (!userEntries || userEntries.length === 0) {
      // Load neutral recommendations if no entries
      const neutralRecs = await fetchRecommendations('NEUTRAL');
      setRecommendations(neutralRecs);
      return;
    }
    
    // Get latest entry to determine recommendation type
    const latestEntry = userEntries[0];
    let sentimentTarget: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    
    if (latestEntry.sentiment === 'POSITIVE' || latestEntry.score > 0.6) {
      sentimentTarget = 'POSITIVE';
    } else if (latestEntry.sentiment === 'NEGATIVE' || latestEntry.score < 0.4) {
      sentimentTarget = 'NEGATIVE';
    } else {
      sentimentTarget = 'NEUTRAL';
    }
    
    // Fetch appropriate recommendations
    const recs = await fetchRecommendations(sentimentTarget);
    setRecommendations(recs);
  };

  const analyzeSentiment = (text: string): { sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL', score: number } => {
    // Simplified sentiment analysis for demo
    const positiveWords = ['happy', 'great', 'excellent', 'good', 'joy', 'excited', 'calm', 'peaceful', 'relaxed'];
    const negativeWords = ['sad', 'angry', 'upset', 'anxious', 'stressed', 'worried', 'tired', 'frustrated', 'depressed'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    let score: number;
    
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
    
    return { sentiment, score };
  };

  const addMoodEntry = async (mood: string, description?: string): Promise<MoodEntry | null> => {
    if (!currentUser) return null;
    
    try {
      // Analyze sentiment
      const text = (mood + ' ' + (description || '')).toLowerCase();
      const { sentiment, score } = analyzeSentiment(text);
      
      // Save to database
      const newEntry = await addMoodEntryToDb(
        currentUser.id,
        mood,
        description,
        sentiment,
        score
      );
      
      if (!newEntry) {
        throw new Error('Failed to save mood entry');
      }
      
      // Update local state
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      
      // Generate new recommendations
      await generateRecommendations([newEntry, ...entries]);
      
      toast({
        title: "Mood recorded",
        description: "Your mood entry has been saved successfully.",
      });
      
      return newEntry;
    } catch (error) {
      console.error('Error adding mood entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your mood entry. Please try again.",
        variant: "destructive",
      });
      return null;
    }
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
    getUserTrend,
    loading
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}
