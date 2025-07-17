import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthUser } from '@/types/auth';
import { loginUser as apiLoginUser, fetchMe } from '@/lib/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ redirect?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'volunteerapp.auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore from localStorage --------------------------------------------
  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) { setLoading(false); return; }
    try {
      const stored: StoredAuth = JSON.parse(raw);
      if (stored?.token) {
        fetchMe(stored.token)
          .then(u => {
            setToken(stored.token);
            setUser(u);
          })
          .catch(() => {
            window.localStorage.removeItem(STORAGE_KEY);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  const persist = (token: string, user: AuthUser) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user } satisfies StoredAuth));
  };

  const clearPersist = () => {
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const login = useCallback(async (email: string, password: string) => {
    const resp = await apiLoginUser(email, password);
    setToken(resp.access_token);
    setUser(resp.user);
    persist(resp.access_token, resp.user);
    return { redirect: resp.user.redirect };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearPersist();
  }, []);

  const value: AuthContextType = { user, token, login, logout, loading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}