"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { NotificationItem, ApiClient } from "@/lib/api";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  activeToast: NotificationItem | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  triggerTestAlert: (status: "Selected" | "Under Review" | "Not Selected") => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const DEMO_INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "demo-notif-1",
    user_id: "demo-user-1",
    title: "🎉 Selected! Director Screen Test Scheduled",
    body: "Dharma Productions has SELECTED your self-tape for 'Shadow of Verity' (Male Lead Antagonist).",
    notification_type: "APPLICATION_STATUS",
    deep_link_route: "/opportunities/applications/demo-app-1",
    metadata_json: {
      status: "Selected",
      project_title: "Shadow of Verity",
      role_name: "Male Lead Antagonist",
      production_house: "Dharma Productions",
      instructions: "Chemistry read with director scheduled for Oct 24th at 4:00 PM.",
    },
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "demo-notif-2",
    user_id: "demo-user-1",
    title: "🎬 Application Under Review",
    body: "Yash Raj Films casting associates are actively reviewing your showreel for 'Dhoom Reborn'.",
    notification_type: "APPLICATION_STATUS",
    deep_link_route: "/opportunities/applications/demo-app-2",
    metadata_json: {
      status: "Under Review",
      project_title: "Dhoom Reborn",
      role_name: "Action Specialist",
      production_house: "YRF Casting",
    },
    is_read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "demo-notif-3",
    user_id: "demo-user-1",
    title: "💬 Direct Message from Shanoo Sharma",
    body: "Loved your work in the teaser. Can you do a chemistry read tomorrow?",
    notification_type: "DIRECT_MESSAGE",
    deep_link_route: "/messages",
    metadata_json: {
      sender_name: "Shanoo Sharma",
      sender_role: "Head of Casting, YRF",
    },
    is_read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_INITIAL_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState<number>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  const triggerToast = useCallback((item: NotificationItem) => {
    setActiveToast(item);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
  }, []);

  // Fetch from backend API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ApiClient.getNotifications("all", 1, 30);
      if (res && res.items) {
        setNotifications(res.items.length > 0 ? res.items : DEMO_INITIAL_NOTIFICATIONS);
        setUnreadCount(res.unread_count ?? res.items.filter((n) => !n.is_read).length);
      }
    } catch {
      // Fallback to local demo state if backend is offline in local preview
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark single notification read
  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await ApiClient.markNotificationRead(id);
    } catch {
      // Offline local handling
    }
  }, []);

  // Mark all read
  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await ApiClient.markAllNotificationsRead();
    } catch {
      // Offline local handling
    }
  }, []);

  // Trigger test alert (Selected, Under Review, Not Selected)
  const triggerTestAlert = useCallback(
    async (status: "Selected" | "Under Review" | "Not Selected") => {
      let title = "";
      let body = "";
      if (status === "Selected") {
        title = "🎉 Congratulations! You have been Selected";
        body = "Dharma Productions has marked your application as SELECTED for 'The Bombay Spy'.";
      } else if (status === "Under Review") {
        title = "🎬 Application Under Review";
        body = "Roy Kapur Films casting associate is currently reviewing your self-tape submission.";
      } else {
        title = "Application Update: Casting Closed";
        body = "Thank you for auditioning. The production has chosen other candidates for this role.";
      }

      const newNotif: NotificationItem = {
        id: `mock-${Date.now()}`,
        user_id: "demo-user-1",
        title,
        body,
        notification_type: "APPLICATION_STATUS",
        deep_link_route: "/opportunities",
        metadata_json: {
          status,
          project_title: status === "Selected" ? "The Bombay Spy" : "Aarya Season 4",
          role_name: status === "Selected" ? "Covert Operative" : "Supporting Ensemble",
          production_house: status === "Selected" ? "Dharma Productions" : "Roy Kapur Films",
        },
        is_read: false,
        created_at: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
      triggerToast(newNotif);

      try {
        await ApiClient.triggerStatusUpdate({
          target_user_id: "00000000-0000-0000-0000-000000000001",
          project_title: "The Bombay Spy",
          role_name: "Covert Operative",
          production_house: "Dharma Productions",
          status,
        });
      } catch {
        // Mock fallback active
      }
    },
    [triggerToast]
  );

  // Setup WebSocket connection
  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/notifications/demo-user-1";

    function connect() {
      try {
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "NEW_NOTIFICATION" && data.notification) {
              const incoming: NotificationItem = data.notification;
              setNotifications((prev) => [incoming, ...prev]);
              setUnreadCount((prev) => (data.unread_count !== undefined ? data.unread_count : prev + 1));
              triggerToast(incoming);
            } else if (data.type === "INITIAL_STATE" || data.type === "COUNT_UPDATE") {
              if (data.unread_count !== undefined) {
                setUnreadCount(data.unread_count);
              }
            }
          } catch {
            // Non-JSON packet
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          reconnectTimeoutRef.current = setTimeout(connect, 5000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch {
        setIsConnected(false);
      }
    }

    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [triggerToast]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isConnected,
        activeToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        triggerTestAlert,
      }}
    >
      {children}

      {/* Floating Cinematic Real-Time Alert Toast */}
      {activeToast && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: "94px",
            right: "24px",
            zIndex: 9999,
            maxWidth: "380px",
            background: "rgba(16, 21, 34, 0.96)",
            border:
              activeToast.metadata_json?.status === "Selected"
                ? "1.5px solid #FF9800"
                : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "14px",
            padding: "14px 16px",
            boxShadow:
              activeToast.metadata_json?.status === "Selected"
                ? "0 10px 30px rgba(255, 152, 0, 0.35), 0 0 16px rgba(0,0,0,0.8)"
                : "0 10px 30px rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            color: "#fff",
            animation: "slideInRight 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background:
                activeToast.metadata_json?.status === "Selected"
                  ? "#FF9800"
                  : activeToast.metadata_json?.status === "Under Review"
                  ? "rgba(255, 152, 0, 0.2)"
                  : "rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "18px",
            }}
          >
            {activeToast.metadata_json?.status === "Selected"
              ? "🏆"
              : activeToast.metadata_json?.status === "Under Review"
              ? "🎬"
              : "🔔"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color:
                  activeToast.metadata_json?.status === "Selected"
                    ? "#FFB74D"
                    : "#FFFFFF",
                marginBottom: "3px",
              }}
            >
              {activeToast.title}
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: "#CBD5E1",
                lineHeight: "1.35",
                margin: 0,
              }}
            >
              {activeToast.body}
            </p>
          </div>

          <button
            onClick={dismissToast}
            style={{
              background: "none",
              border: "none",
              color: "#94A3B8",
              cursor: "pointer",
              fontSize: "16px",
              padding: "0 4px",
              lineHeight: 1,
            }}
            aria-label="Close alert"
          >
            ×
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
