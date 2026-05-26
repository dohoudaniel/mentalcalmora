import { apiFetch } from '@/api/client';
import type { MoodEntry, Recommendation } from '@/types';

export async function fetchUserMoodEntries(): Promise<MoodEntry[]> {
  return apiFetch<MoodEntry[]>('/moods');
}

export async function addMoodEntry(
  mood: string,
  description?: string
): Promise<MoodEntry> {
  return apiFetch<MoodEntry>('/moods', {
    method: 'POST',
    body: JSON.stringify({ mood, description }),
  });
}

export async function fetchMoodEntry(entryId: string): Promise<MoodEntry> {
  return apiFetch<MoodEntry>(`/moods/${entryId}`);
}

export async function generateInsightsForEntry(entryId: string): Promise<{ insights: string }> {
  return apiFetch<{ insights: string }>(`/moods/${entryId}/insights`, {
    method: 'POST',
  });
}

export async function fetchRecommendations(
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'ANY' = 'ANY'
): Promise<Recommendation[]> {
  return apiFetch<Recommendation[]>(`/recommendations?sentiment=${sentiment}`);
}
