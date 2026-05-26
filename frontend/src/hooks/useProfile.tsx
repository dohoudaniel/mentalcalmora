import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch, apiUpload } from '@/api/client';
import { toast } from '@/components/ui/use-toast';
import type { Profile } from '@/types';

export function useProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<Profile>('/profile/me');
      if (mountedRef.current) {
        setProfile(data);
      }
    } catch (error) {
      if (mountedRef.current) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load profile',
          variant: 'destructive',
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => { mountedRef.current = false; };
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<boolean> => {
    try {
      const data = await apiFetch<Profile>('/profile/me', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setProfile((prev) => (prev ? { ...prev, ...data } : data));
      toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.' });
      return true;
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<string | null> => {
    try {
      const result = await apiUpload('/profile/me/avatar', file) as { avatar_url: string };
      setProfile((prev) => (prev ? { ...prev, avatar_url: result.avatar_url } : null));
      toast({ title: 'Avatar uploaded', description: 'Your profile picture has been updated.' });
      return result.avatar_url;
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  const changePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      await apiFetch('/profile/me/change-password', {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
      });
      toast({ title: 'Password changed', description: 'Your password has been updated successfully.' });
      return true;
    } catch (error) {
      toast({
        title: 'Password change failed',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      await apiFetch('/profile/me', { method: 'DELETE' });
      toast({ title: 'Account deleted', description: 'Your account has been permanently deleted.' });
      return true;
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    changePassword,
    deleteAccount,
    refetch: fetchProfile,
  };
}
