import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';
import { authStore } from '@/services/authStore';
import { authService } from '@/services/authService';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const token = authStore.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser(token);
          setUser(userData);
        } catch {
          authStore.clear();
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });
      authStore.setToken(response.access_token);
      setUser(response.user);
      toast({ title: 'Welcome back!', description: 'You are now logged in.' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
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
      const response = await authService.signup({ email, password, firstName, lastName });
      authStore.setToken(response.access_token);
      setUser(response.user);
      toast({ title: 'Account created', description: 'Welcome to Calmora!' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      toast({ title: 'Signup failed', description: message, variant: 'destructive' });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    authStore.clear();
    setUser(null);
    toast({ title: 'Logged out', description: 'See you soon!' });
  }, []);

  const value: AuthContextType = {
    currentUser: user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
