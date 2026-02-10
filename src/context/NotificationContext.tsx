import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification, NotificationSettings } from '@/types';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  archiveAll: () => void;
  updateSettings: (settings: NotificationSettings) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => void;
}

const defaultSettings: NotificationSettings = {
  documentSync: { email: true, inApp: true },
  documentUpload: { email: false, inApp: true },
  shares: { email: true, inApp: true },
  whatsappMessages: { email: false, inApp: true },
  systemUpdates: { email: false, inApp: true },
};

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'document_sync',
    title: '5 new documents synced from your gmail account',
    description: 'Your Gmail integration has synced 5 new documents to your inbox.',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
    read: false,
    archived: false,
    actionUrl: '/documents',
  },
  {
    id: 'notif-2',
    type: 'whatsapp',
    title: 'New document received via WhatsApp',
    description: 'Invoice from +1234567890 has been processed and added to your documents.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: false,
    archived: false,
    actionUrl: '/documents',
  },
  {
    id: 'notif-3',
    type: 'share',
    title: 'Document shared with you',
    description: 'Sarah Miller shared "Q4 Financial Report" with you.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    archived: false,
    actionUrl: '/documents',
  },
  {
    id: 'notif-4',
    type: 'document_upload',
    title: '3 documents uploaded successfully',
    description: 'Your batch upload has completed successfully.',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    read: true,
    archived: true,
  },
  {
    id: 'notif-5',
    type: 'system',
    title: 'System maintenance scheduled',
    description: 'Scheduled maintenance on Jan 30, 2025 from 2:00 AM - 4:00 AM UTC.',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
    archived: true,
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, archived: true, read: true } : n))
    );
  };

  const archiveAll = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, archived: true, read: true }))
    );
  };

  const updateSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        archiveAll,
        updateSettings,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
