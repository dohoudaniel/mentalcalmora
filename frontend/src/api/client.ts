import { supabase } from '@/integrations/supabase/client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiUpload(
  path: string,
  file: File,
  options: RequestInit = {}
): Promise<unknown> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}
