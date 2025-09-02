/**
 * Authentication Context Provider
 * Manages user authentication state and security operations
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types/common';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: string[];
  sessionTimeout: number;
  lastActivity: Date;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'UPDATE_ACTIVITY' }
  | { type: 'SESSION_TIMEOUT' };

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  mfaToken?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        permissions: action.payload.permissions,
        lastActivity: new Date()
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: []
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: [],
        sessionTimeout: 0
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null
      };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        lastActivity: new Date()
      };
    case 'SESSION_TIMEOUT':
      return {
        ...state,
        sessionTimeout: state.sessionTimeout + 1
      };
    default:
      return state;
  }
};

export const AuthenticationProvider: React.FC<{ 
  children: ReactNode; 
  user?: User | null; 
}> = ({ children, user: initialUser }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: initialUser || null,
    isAuthenticated: !!initialUser,
    isLoading: false,
    permissions: initialUser?.permissions || [],
    sessionTimeout: 0,
    lastActivity: new Date()
  });

  // Session timeout monitoring
  useEffect(() => {
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    const checkInterval = 60 * 1000; // Check every minute

    const interval = setInterval(() => {
      if (state.isAuthenticated && state.lastActivity) {
        const timeSinceActivity = Date.now() - state.lastActivity.getTime();
        if (timeSinceActivity > sessionTimeout) {
          dispatch({ type: 'SESSION_TIMEOUT' });
          logout();
        }
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, [state.isAuthenticated, state.lastActivity]);

  // Activity tracking
  useEffect(() => {
    const updateActivity = () => {
      if (state.isAuthenticated) {
        dispatch({ type: 'UPDATE_ACTIVITY' });
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [state.isAuthenticated]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Simulate API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, token } = await response.json();
      
      // Store token
      localStorage.setItem('auth_token', token);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Clear local storage
      localStorage.removeItem('auth_token');
      
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (updates: Partial<User>): void => {
    dispatch({ type: 'UPDATE_USER', payload: updates });
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const { token } = await response.json();
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const hasPermission = (permission: string): boolean => {
    return state.permissions.includes(permission) || state.permissions.includes('admin');
  };

  const hasRole = (role: string): boolean => {
    return state.user?.role === role || state.user?.role === 'admin';
  };

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    updateUser,
    refreshToken,
    hasPermission,
    hasRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
};