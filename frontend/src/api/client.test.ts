import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiFetch, apiUpload } from './client';
import { authStore } from '@/services/authStore';

describe('apiFetch', () => {
  beforeEach(() => {
    authStore.setToken('test-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    authStore.clear();
  });

  it('makes a GET request with auth header', async () => {
    const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({ data: 'test' }) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const result = await apiFetch('/moods');
    expect(result).toEqual({ data: 'test' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/moods'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('throws on error response', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ detail: 'Server error' }),
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    await expect(apiFetch('/moods')).rejects.toThrow('Server error');
  });

  it('works without token', async () => {
    authStore.clear();
    const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({}) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    await apiFetch('/health');
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBeUndefined();
  });
});

describe('apiUpload', () => {
  beforeEach(() => {
    authStore.setToken('test-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    authStore.clear();
  });

  it('uploads file with FormData', async () => {
    const mockResponse = { ok: true, json: vi.fn().mockResolvedValue({ avatar_url: 'url' }) };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const result = await apiUpload('/profile/me/avatar', file);
    expect(result).toEqual({ avatar_url: 'url' });
  });
});
