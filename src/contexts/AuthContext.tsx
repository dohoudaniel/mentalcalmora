
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('calmoraUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('calmoraUser');
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call to your backend
      // Simulating successful login for demonstration
      if (email && password) {
        // Mock user for demonstration
        const user = {
          id: 1,
          firstName: 'Demo',
          lastName: 'User',
          email: email
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('calmoraUser', JSON.stringify(user));
        
        toast({
          title: "Login successful",
          description: "Welcome back to Calmora!",
        });
        
        return true;
      }
      
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
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
      // In a real app, this would be an API call to your backend
      // Simulating successful signup for demonstration
      if (firstName && lastName && email && password) {
        const user = {
          id: 1,
          firstName,
          lastName,
          email
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('calmoraUser', JSON.stringify(user));
        
        toast({
          title: "Registration successful",
          description: "Welcome to Calmora!",
        });
        
        return true;
      }
      
      toast({
        title: "Signup failed",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return false;
    } catch (error) {
      toast({
        title: "Signup error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('calmoraUser');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
