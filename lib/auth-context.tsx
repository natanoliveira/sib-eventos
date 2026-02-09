import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { apiClient } from './api-client';
import { toastWarning } from './toast';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const profile = await apiClient.getProfile();
        setUser(profile);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const handleLogout = (event: Event) => {
      const detail = (event as CustomEvent).detail as { reason?: string } | undefined;
      setUser(null);
      if (detail?.reason === 'expired') {
        toastWarning('Sua sessão expirou. Faça login novamente.');
      }
      if (pathname !== '/login') {
        const target = detail?.reason === 'expired' ? '/login?reason=expired' : '/login';
        router.replace(target);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', handleLogout);
      return () => window.removeEventListener('auth:logout', handleLogout);
    }
  }, [router, pathname]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await apiClient.login(email, password);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      throw new Error('Login com Google temporariamente desabilitado');
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Falha na autenticação Google');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      loginWithGoogle,
      logout,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
