'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'CIVIL_ENG' | 'SNT_ENG' | 'TRD_ENG' | 'CONTROLLER' | 'SR_DOM';
  department: string;
  designation: string;
  division: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile, redirectUrl: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('rail_auth_token');
    const storedUser = localStorage.getItem('rail_user_data');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (jwtToken: string, userData: UserProfile, redirectUrl: string) => {
    localStorage.setItem('rail_auth_token', jwtToken);
    localStorage.setItem('rail_user_data', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    router.push(redirectUrl);
  };

  const logout = () => {
    localStorage.removeItem('rail_auth_token');
    localStorage.removeItem('rail_user_data');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}