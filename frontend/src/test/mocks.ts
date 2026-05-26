import { vi } from 'vitest';

export const mockSupabaseUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: { first_name: 'Test', last_name: 'User' },
};

export const mockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh',
  user: mockSupabaseUser,
};

export const createMockSupabaseClient = () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: mockSupabaseUser }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: mockSupabaseUser }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    updateUser: vi.fn().mockResolvedValue({ error: null }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
  },
});
