
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Log events for debugging
        console.log('Auth event:', event);
        
        if (event === 'SIGNED_IN') {
          // Update last login time in profiles
          if (newSession?.user) {
            setTimeout(() => {
              updateLastLogin(newSession.user.id);
            }, 0);
          }
          
          // Show success toast for Google login
          if (newSession?.user?.app_metadata?.provider === 'google') {
            toast({
              title: "Google login successful",
              description: "Welcome to Calmora!",
            });
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateLastLogin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        console.error('Error updating last login:', error);
      }
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Login successful",
        description: "Welcome back to Calmora!",
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const signup = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      // First check if user already exists
      const { data: checkResult, error: checkError } = await supabase.functions.invoke('check-user-exists', {
        body: { email }
      });

      if (checkError) {
        console.error('Error checking user existence:', checkError);
        toast({
          title: "Signup error",
          description: "Unable to verify email availability. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (checkResult?.exists) {
        toast({
          title: "Email already registered",
          description: "An account with this email already exists. Please try logging in instead.",
          variant: "destructive"
        });
        return false;
      }

      // Proceed with signup if user doesn't exist
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered')) {
          toast({
            title: "Email already registered",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Signup failed",
            description: error.message,
            variant: "destructive"
          });
        }
        return false;
      }

      toast({
        title: "Registration successful",
        description: "Welcome to Calmora!",
      });
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Even if there's an error, we've cleared local state
        toast({
          title: "Logged out",
          description: "You have been logged out.",
        });
        return;
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even on error
      setUser(null);
      setSession(null);
      toast({
        title: "Logged out",
        description: "You have been logged out.",
      });
    }
  };

  return {
    user,
    session,
    loading,
    login,
    signup,
    logout,
  };
}
