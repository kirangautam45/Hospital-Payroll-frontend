import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, getAccessToken, clearTokens } from '../utils/api';
import type { User, LoginRequest, RegisterRequest } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = getAccessToken();
    const storedUser = localStorage.getItem(USER_KEY);

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearTokens();
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    setUser(response.user);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    setUser(response.user);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
