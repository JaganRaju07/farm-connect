'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string;
  profile_photo_url?: string;
  is_profile_complete: boolean;
  city?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: 'farmer' | 'consumer' | 'admin' | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser, role: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<'farmer' | 'consumer' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      const storedRole = localStorage.getItem('auth_role');

      if (storedToken && storedUser && storedRole) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(storedRole as 'farmer' | 'consumer' | 'admin');
        
        // Automatically attach token to all future API requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch {
      // Corrupted localStorage — clear everything
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_role');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: AuthUser, newRole: string) => {
    setToken(newToken);
    setUser(newUser);
    setRole(newRole as 'farmer' | 'consumer' | 'admin');

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_role', newRole);

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);

    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_role');

    delete axios.defaults.headers.common['Authorization'];
    router.push('/');
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user, token, role, isLoading,
      isAuthenticated: !!token && !!user,
      login, logout, updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
