import { useState, useEffect, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mountedRef.current) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mountedRef.current) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      toast({ title: 'Login successful', description: 'Welcome back to Calmora!' });
      return true;
    } catch {
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const signup = useCallback(async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: error.message.includes('already registered') ? 'Email already registered' : 'Signup failed',
          description: error.message.includes('already registered')
            ? 'An account with this email already exists. Please try logging in instead.'
            : error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({ title: 'Registration successful', description: 'Welcome to Calmora!' });
      return true;
    } catch {
      toast({
        title: 'Signup error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    toast({ title: 'Logged out', description: 'You have been logged out.' });
  }, []);

  return { user, session, loading, login, signup, logout };
}
