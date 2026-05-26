import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSupabaseAuth } from './useSupabaseAuth';

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn().mockReturnValue({
  data: { subscription: { unsubscribe: vi.fn() } },
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
    },
  },
}));

describe('useSupabaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  it('initializes with null user and loading=false after check', async () => {
    const { result } = renderHook(() => useSupabaseAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
  });

  it('logs in successfully', async () => {
    mockSignIn.mockResolvedValue({ data: { user: { id: '1', email: 'a@b.com' } }, error: null });
    const { result } = renderHook(() => useSupabaseAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.login('a@b.com', 'password');
    });

    expect(success).toBe(true);
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'a@b.com', password: 'password' });
  });

  it('signs up successfully', async () => {
    mockSignUp.mockResolvedValue({ data: { user: { id: '1' } }, error: null });
    const { result } = renderHook(() => useSupabaseAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.signup('John', 'Doe', 'john@example.com', 'password123');
    });

    expect(success).toBe(true);
    expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
      email: 'john@example.com',
      password: 'password123',
    }));
  });

  it('logs out', async () => {
    mockSignOut.mockResolvedValue({ error: null });
    const { result } = renderHook(() => useSupabaseAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });
});
