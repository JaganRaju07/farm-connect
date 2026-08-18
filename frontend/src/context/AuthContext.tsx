'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * Shape of our auth context
 * Everything any component might need about authentication
 */
interface AuthUser {
  id: number;
  name: string;
  phone: string;
  email?: string;
  profile_image?: string;
  is_profile_complete: boolean;
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
  const [isLoading, setIsLoading] = useState(true); // True while checking localStorage
  const router = useRouter();

  /**
   * On app load: restore auth state from localStorage
   * 
   * STUDY NOTE — Persistence:
   * When browser refreshes, React state resets to initial values.
   * We read localStorage on mount to restore the previous session.
   * isLoading stays true until this check completes so UI doesn't
   * flash a "not logged in" state before we've checked.
   */
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('fc_token');
      const storedUser = localStorage.getItem('fc_user');
      const storedRole = localStorage.getItem('fc_role');

      if (storedToken && storedUser && storedRole) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setRole(storedRole as 'farmer' | 'consumer' | 'admin');
        
        // Attach token to all future axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      // If localStorage is corrupted, clear everything
      localStorage.removeItem('fc_token');
      localStorage.removeItem('fc_user');
      localStorage.removeItem('fc_role');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login: called after successful OTP verification
   * Stores everything in both state and localStorage
   */
  const login = (newToken: string, newUser: AuthUser, newRole: string) => {
    // Update state
    setToken(newToken);
    setUser(newUser);
    setRole(newRole as 'farmer' | 'consumer' | 'admin');

    // Persist to localStorage
    localStorage.setItem('fc_token', newToken);
    localStorage.setItem('fc_user', JSON.stringify(newUser));
    localStorage.setItem('fc_role', newRole);

    // Attach to all future axios requests automatically
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  /**
   * Logout: clears everything
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);

    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_user');
    localStorage.removeItem('fc_role');

    delete axios.defaults.headers.common['Authorization'];

    router.push('/');
  };

  /**
   * Update user in state and localStorage (e.g., after profile edit)
   */
  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('fc_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value: AuthContextType = {
    user,
    token,
    role,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to use auth context
 * Throws if used outside AuthProvider (catches mistakes early)
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
