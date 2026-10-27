"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  is_read: boolean;
  data?: {
    status?: string;
    [key: string]: any;
  };
  created_at?: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  triggerTestAlert: (notification?: Partial<NotificationItem>) => void;
}

const defaultNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Audition Shortlisted",
    body: "Dharma Productions has shortlisted your profile for upcoming feature film.",
    is_read: false,
    data: { status: "Selected" },
    created_at: "10m ago",
  },
  {
    id: "notif-2",
    title: "Profile Viewed",
    body: "A casting director viewed your showreel.",
    is_read: false,
    data: { status: "Viewed" },
    created_at: "1h ago",
  },
];

const NotificationContext = createContext<NotificationContextType>({
  notifications: defaultNotifications,
  unreadCount: 2,
  markAsRead: () => {},
  markAllAsRead: () => {},
  triggerTestAlert: () => {},
});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const triggerTestAlert = (notification?: Partial<NotificationItem>) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: notification?.title || "New Audition Notice",
      body: notification?.body || "A new casting call matching your craft is now open.",
      is_read: false,
      data: notification?.data || { status: "Alert" },
      created_at: "Just now",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        triggerTestAlert,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
