import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';
import { fetchUserMoodEntries, addMoodEntry, fetchRecommendations } from '@/services/moodService';
import type { MoodEntry, Recommendation, UserTrend } from '@/types';

interface MoodContextType {
  entries: MoodEntry[];
  recommendations: Recommendation[];
  addMoodEntry: (mood: string, description?: string) => Promise<MoodEntry | null>;
  getLatestEntry: () => MoodEntry | null;
  getUserTrend: () => UserTrend;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const MoodContext = createContext<MoodContextType>({
  entries: [],
  recommendations: [],
  addMoodEntry: async () => null,
  getLatestEntry: () => null,
  getUserTrend: () => ({ trend: null, notes: 'No data available.' }),
  loading: false,
  error: null,
  refresh: async () => {},
});

export const useMood = () => useContext(MoodContext);

interface MoodProviderProps {
  children: ReactNode;
}

export function MoodProvider({ children }: MoodProviderProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      setEntries([]);
      setRecommendations([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [userEntries, recs] = await Promise.all([
        fetchUserMoodEntries(),
        fetchRecommendations('ANY'),
      ]);
      setEntries(userEntries);
      setRecommendations(recs);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load mood data';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddMoodEntry = useCallback(async (mood: string, description?: string): Promise<MoodEntry | null> => {
    if (!currentUser) return null;
    try {
      const newEntry = await addMoodEntry(mood, description);
      setEntries((prev) => [newEntry, ...prev]);

      // Update recommendations based on latest sentiment
      const target = newEntry.sentiment;
      const recs = await fetchRecommendations(target);
      setRecommendations(recs);

      toast({ title: 'Mood recorded', description: 'Your mood entry has been saved successfully.' });
      return newEntry;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save mood entry';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    }
  }, [currentUser]);

  const getLatestEntry = useCallback((): MoodEntry | null => {
    return entries.length > 0 ? entries[0] : null;
  }, [entries]);

  const getUserTrend = useCallback((): UserTrend => {
    if (entries.length < 3) {
      return {
        trend: null,
        notes: 'Not enough data to analyze trends yet. Add more mood entries.',
      };
    }

    const recentScores = entries.slice(0, 7).map((e) => e.score);
    const average = recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;

    const oldestEntries = entries.slice(Math.max(0, entries.length - 7));
    const oldestAverage = oldestEntries.reduce((sum, e) => sum + e.score, 0) / oldestEntries.length;

    let trend: string | null;
    let notes: string;

    if (average > oldestAverage + 0.1) {
      trend = 'upward';
      notes = 'Your mood is trending more positive 📈';
    } else if (average < oldestAverage - 0.1) {
      trend = 'downward';
      notes = 'Your mood is trending downward 📉';
    } else {
      trend = 'flat';
      notes = 'Your mood is relatively stable.';
    }

    const labels = entries.slice(0, 7).reverse().map((e) => {
      const date = new Date(e.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const data = entries.slice(0, 7).reverse().map((e) => Number(e.score.toFixed(2)));

    return { trend, notes, chart: { labels, data } };
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      recommendations,
      addMoodEntry: handleAddMoodEntry,
      getLatestEntry,
      getUserTrend,
      loading,
      error,
      refresh: loadData,
    }),
    [entries, recommendations, handleAddMoodEntry, getLatestEntry, getUserTrend, loading, error, loadData]
  );

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
}
