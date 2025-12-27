import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AuthState, LoginCredentials } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // DEMO: Simulate API call - In production, replace with actual backend authentication
      // Example: const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // DEMO: Accept any non-empty credentials for demonstration purposes
      // In production, validate against backend and handle errors properly
      if (credentials.username && credentials.password) {
        const user: User = {
          id: '1',
          username: credentials.username,
          email: `${credentials.username}@infinity.os`,
          role: 'admin',
        };
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('infinity_user', JSON.stringify(user));
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error: unknown) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      if (error instanceof Error) {
        // Provide more specific error messages based on error type/message
        if (error.message === 'Invalid credentials') {
          throw new Error('Invalid username or password. Please try again.');
        } else {
          throw new Error(`Login failed: ${error.message}`);
        }
      } else {
        throw new Error('An unknown error occurred during login.');
      }
  }, []);

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    localStorage.removeItem('infinity_user');
  }, []);

  // Check for stored user on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('infinity_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        localStorage.removeItem('infinity_user');
      }
    }
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
