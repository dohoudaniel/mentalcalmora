
import { supabase } from "@/integrations/supabase/client";
import { MoodEntry, Recommendation } from "@/contexts/MoodContext";

export async function fetchUserMoodEntries(userId: string): Promise<MoodEntry[]> {
  try {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });
      
    if (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }
    
    return data.map((entry) => ({
      id: entry.id,
      userId: entry.user_id,
      mood: entry.mood,
      description: entry.description || undefined,
      text: entry.text,
      sentiment: entry.sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
      score: entry.score,
      timestamp: entry.timestamp
    }));
  } catch (error) {
    console.error('Failed to fetch mood entries:', error);
    return [];
  }
}

export async function addMoodEntry(
  userId: string,
  mood: string,
  description: string | undefined,
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
  score: number
): Promise<MoodEntry | null> {
  try {
    const text = description || mood;
    
    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: userId,
        mood,
        description,
        text,
        sentiment,
        score,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding mood entry:', error);
      return null;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      mood: data.mood,
      description: data.description || undefined,
      text: data.text,
      sentiment: data.sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
      score: data.score,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Failed to add mood entry:', error);
    return null;
  }
}

export async function fetchRecommendations(sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'ANY' = 'ANY'): Promise<Recommendation[]> {
  try {
    let query = supabase
      .from('recommendations')
      .select('*');
      
    if (sentiment !== 'ANY') {
      query = query.eq('sentiment_target', sentiment);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
    
    return data.map((rec, index) => ({
      id: Number(index + 1), // Keep using numbers for IDs to maintain compatibility
      title: rec.title,
      description: rec.description,
      type: rec.type as 'exercise' | 'mindfulness' | 'health' | 'social' | 'general'
    }));
  } catch (error) {
    console.error('Failed to fetch recommendations:', error);
    return [];
  }
}
