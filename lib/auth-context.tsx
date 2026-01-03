import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Mock API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock credentials for demo (in production, this would be a real API call)
      const validCredentials = [
        { email: 'admin@igreja.com', password: 'admin123', user: { id: '1', name: 'Administrador', email: 'admin@igreja.com', role: 'ADMIN' } },
        { email: 'pastor@igreja.com', password: 'pastor123', user: { id: '2', name: 'Pastor João', email: 'pastor@igreja.com', role: 'LEADER' } },
        { email: 'membro@igreja.com', password: 'membro123', user: { id: '3', name: 'Maria Silva', email: 'membro@igreja.com', role: 'MEMBER' } }
      ];
      
      const credential = validCredentials.find(cred => 
        cred.email === email && cred.password === password
      );
      
      if (!credential) {
        throw new Error('Email ou senha incorretos');
      }
      
      const mockToken = 'mock_token_' + Date.now();
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(credential.user));
      setUser(credential.user);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      // Simulate Google OAuth without popups - for demo purposes
      setIsLoading(true);
      
      // Mock Google authentication process
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      const mockGoogleUser = {
        id: 'google_' + Date.now(),
        name: 'Usuário Google',
        email: 'usuario.google@exemplo.com',
        image: 'https://via.placeholder.com/100x100/d946ef/ffffff?text=UG',
        role: 'MEMBER'
      };

      const mockToken = 'mock_google_token_' + Date.now();
      
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser);
      
    } catch (error) {
      console.error('Google login error:', error);
      throw new Error('Falha na autenticação Google');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
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