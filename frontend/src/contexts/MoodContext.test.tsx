import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { MoodProvider, useMood } from './MoodContext';
import React from 'react';

const mockFetchUserMoodEntries = vi.fn();
const mockAddMoodEntry = vi.fn();
const mockFetchRecommendations = vi.fn();

vi.mock('@/services/moodService', () => ({
  fetchUserMoodEntries: (...args: unknown[]) => mockFetchUserMoodEntries(...args),
  addMoodEntry: (...args: unknown[]) => mockAddMoodEntry(...args),
  fetchRecommendations: (...args: unknown[]) => mockFetchRecommendations(...args),
}));

vi.mock('./AuthContext', () => ({
  useAuth: () => ({
    currentUser: { id: 'user-1', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MoodProvider>{children}</MoodProvider>
);

describe('MoodContext', () => {
  it('loads entries and recommendations on mount', async () => {
    mockFetchUserMoodEntries.mockResolvedValue([
      { id: '1', mood: 'Happy', sentiment: 'POSITIVE', score: 0.8, timestamp: new Date().toISOString() },
    ]);
    mockFetchRecommendations.mockResolvedValue([
      { id: 1, title: 'Walk', description: 'Take a walk', type: 'exercise' },
    ]);

    const { result } = renderHook(() => useMood(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].mood).toBe('Happy');
    expect(result.current.recommendations).toHaveLength(1);
  });

  it('calculates trend correctly', async () => {
    mockFetchUserMoodEntries.mockResolvedValue([
      { id: '1', mood: 'Happy', sentiment: 'POSITIVE', score: 0.9, timestamp: new Date().toISOString() },
      { id: '2', mood: 'Sad', sentiment: 'NEGATIVE', score: 0.2, timestamp: new Date().toISOString() },
      { id: '3', mood: 'Calm', sentiment: 'POSITIVE', score: 0.7, timestamp: new Date().toISOString() },
    ]);
    mockFetchRecommendations.mockResolvedValue([]);

    const { result } = renderHook(() => useMood(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const trend = result.current.getUserTrend();
    expect(trend.trend).toBeTruthy();
    expect(trend.chart).toBeDefined();
  });

  it('returns empty trend when less than 3 entries', async () => {
    mockFetchUserMoodEntries.mockResolvedValue([
      { id: '1', mood: 'Happy', sentiment: 'POSITIVE', score: 0.8, timestamp: new Date().toISOString() },
    ]);
    mockFetchRecommendations.mockResolvedValue([]);

    const { result } = renderHook(() => useMood(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const trend = result.current.getUserTrend();
    expect(trend.trend).toBeNull();
    expect(trend.chart).toBeUndefined();
  });
});
