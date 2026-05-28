import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only initialize if env vars are present; otherwise export a null client.
// Auth has been moved to the backend, so this client is only kept for
// backwards compatibility in case any feature still needs direct Supabase access.
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    : (null as unknown as ReturnType<typeof createClient<Database>>);
