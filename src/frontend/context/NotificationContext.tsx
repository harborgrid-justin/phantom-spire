/**
 * Notification Context Provider
 * Manages application-wide notifications and alerts
 */

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { NotificationLevel, ThreatSeverity } from '../types/common';

export interface Notification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  category: NotificationCategory;
  timestamp: Date;
  read: boolean;
  persistent: boolean;
  actionRequired: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export type NotificationCategory = 
  | 'security' 
  | 'system' 
  | 'incident' 
  | 'threat' 
  | 'user' 
  | 'integration' 
  | 'workflow';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  handler: () => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  maxNotifications: number;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
}

type NotificationActionType =
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'CLEAR_ALL' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<NotificationState> };

interface NotificationContextType {
  state: NotificationState;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  showSuccess: (message: string, title?: string) => string;
  showError: (message: string, title?: string) => string;
  showWarning: (message: string, title?: string) => string;
  showInfo: (message: string, title?: string) => string;
  showThreatAlert: (message: string, severity: ThreatSeverity, title?: string) => string;
  updateSettings: (settings: Partial<NotificationState>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationReducer = (
  state: NotificationState, 
  action: NotificationActionType
): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications];
      // Limit to max notifications
      const limitedNotifications = newNotifications.slice(0, state.maxNotifications);
      
      return {
        ...state,
        notifications: limitedNotifications,
        unreadCount: state.unreadCount + 1
      };
    
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(n => n.id !== action.payload);
      const wasUnread = state.notifications.find(n => n.id === action.payload && !n.read);
      
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount
      };
    
    case 'MARK_READ':
      const updatedNotifications = state.notifications.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      const wasUnreadBefore = state.notifications.find(n => n.id === action.payload && !n.read);
      
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: wasUnreadBefore ? state.unreadCount - 1 : state.unreadCount
      };
    
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      };
    
    case 'CLEAR_ALL':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    maxNotifications: 100,
    soundEnabled: true,
    browserNotificationsEnabled: false
  });

  // Request browser notification permission
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        dispatch({
          type: 'UPDATE_SETTINGS',
          payload: { browserNotificationsEnabled: permission === 'granted' }
        });
      });
    }
  }, []);

  const generateId = (): string => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addNotification = useCallback((
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): string => {
    const id = generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });

    // Play notification sound
    if (state.soundEnabled && notification.level === 'error') {
      playNotificationSound();
    }

    // Show browser notification for high-priority alerts
    if (
      state.browserNotificationsEnabled && 
      (notification.level === 'error' || notification.level === 'warning')
    ) {
      showBrowserNotification(fullNotification);
    }

    // Auto-remove non-persistent notifications
    if (!notification.persistent) {
      const timeout = getAutoRemoveTimeout(notification.level);
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, timeout);
    }

    return id;
  }, [state.soundEnabled, state.browserNotificationsEnabled]);

  const removeNotification = useCallback((id: string): void => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  const markAsRead = useCallback((id: string): void => {
    dispatch({ type: 'MARK_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback((): void => {
    dispatch({ type: 'MARK_ALL_READ' });
  }, []);

  const clearAll = useCallback((): void => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const showSuccess = useCallback((message: string, title = 'Success'): string => {
    return addNotification({
      title,
      message,
      level: 'success',
      category: 'system',
      persistent: false,
      actionRequired: false
    });
  }, [addNotification]);

  const showError = useCallback((message: string, title = 'Error'): string => {
    return addNotification({
      title,
      message,
      level: 'error',
      category: 'system',
      persistent: true,
      actionRequired: true
    });
  }, [addNotification]);

  const showWarning = useCallback((message: string, title = 'Warning'): string => {
    return addNotification({
      title,
      message,
      level: 'warning',
      category: 'system',
      persistent: false,
      actionRequired: false
    });
  }, [addNotification]);

  const showInfo = useCallback((message: string, title = 'Information'): string => {
    return addNotification({
      title,
      message,
      level: 'info',
      category: 'system',
      persistent: false,
      actionRequired: false
    });
  }, [addNotification]);

  const showThreatAlert = useCallback((
    message: string, 
    severity: ThreatSeverity, 
    title = 'Threat Alert'
  ): string => {
    const level: NotificationLevel = severity === 'critical' || severity === 'high' 
      ? 'error' 
      : severity === 'medium' 
        ? 'warning' 
        : 'info';

    return addNotification({
      title,
      message,
      level,
      category: 'threat',
      persistent: severity === 'critical' || severity === 'high',
      actionRequired: severity === 'critical',
      metadata: { severity }
    });
  }, [addNotification]);

  const updateSettings = useCallback((settings: Partial<NotificationState>): void => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  // Helper functions
  const getAutoRemoveTimeout = (level: NotificationLevel): number => {
    switch (level) {
      case 'error':
        return 10000; // 10 seconds
      case 'warning':
        return 8000;  // 8 seconds
      case 'success':
        return 5000;  // 5 seconds
      case 'info':
      default:
        return 6000;  // 6 seconds
    }
  };

  const playNotificationSound = (): void => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.warn('Could not play notification sound:', error);
      });
    } catch (error) {
      console.warn('Notification sound not available:', error);
    }
  };

  const showBrowserNotification = (notification: Notification): void => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          tag: notification.category,
          requireInteraction: notification.actionRequired
        });

        browserNotification.onclick = () => {
          window.focus();
          browserNotification.close();
        };

        // Auto-close browser notification
        setTimeout(() => {
          browserNotification.close();
        }, 10000);
      } catch (error) {
        console.warn('Could not show browser notification:', error);
      }
    }
  };

  const contextValue: NotificationContextType = {
    state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showThreatAlert,
    updateSettings
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};