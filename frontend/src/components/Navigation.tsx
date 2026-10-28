"use client";

import React, { useState } from "react";
import {
  Clapperboard,
  Sparkles,
  Bell,
  MessageSquare,
  Send,
  Lock,
  Upload,
  CheckCircle2,
  Calendar,
  ChevronDown,
  User,
  LogOut,
  X,
  Zap,
  Check,
  CheckCheck,
  Smartphone,
} from "lucide-react";
import { UserProfile, CompletenessData } from "@/lib/api";
import { useNotifications } from "@/context/NotificationContext";

// Official Instagram Direct Message Icon (Iconic Paper Airplane)
export function InstagramDmIcon({
  size = 18,
  color = "currentColor",
  style,
}: {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

interface NavigationProps {
  currentView: "landing" | "home" | "profile" | "opportunities" | "applications" | "portfolio" | "settings" | string;
  onSelectView: (view: any) => void;
  userData: UserProfile;
  completeness: CompletenessData;
  onOpenAuthModal: () => void;
  onOpenUploadModal: () => void;
}

export default function Navigation({
  currentView,
  onSelectView,
  userData,
  completeness,
  onOpenAuthModal,
  onOpenUploadModal,
}: NavigationProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatReply, setChatReply] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const {
    notifications,
    unreadCount: unreadNotifCount,
    markAsRead,
    markAllAsRead,
    triggerTestAlert,
  } = useNotifications();

  const [messages, setMessages] = useState([
    {
      id: "msg-1",
      sender: "Shanoo Sharma",
      role: "Head of Casting, YRF",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      text: "Kabir, the director screened your audition tape for the crime thriller. Can you do a chemistry read tomorrow at 4 PM?",
      time: "12m ago",
      unread: true,
      online: true,
      thread: [
        { sender: "Shanoo Sharma", text: "Hi Kabir, loved your work in the web series.", time: "Yesterday, 3:15 PM" },
        { sender: "You", text: "Thank you Shanoo! I just uploaded my latest self-tape and monologue reel.", time: "Yesterday, 4:02 PM" },
        { sender: "Shanoo Sharma", text: "Kabir, the director screened your audition tape for the crime thriller. Can you do a chemistry read tomorrow at 4 PM?", time: "12m ago" }
      ]
    },
    {
      id: "msg-2",
      sender: "Rohit Shetty Picturez",
      role: "Production Office",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      text: "NDA signed for the feature film pitch deck. Reviewing logline and synopsis now.",
      time: "1h ago",
      unread: true,
      online: false,
      thread: [
        { sender: "Rohit Shetty Picturez", text: "NDA countersigned and logged into the CineConnect Vault. Reviewing logline and synopsis now.", time: "1h ago" }
      ]
    },
    {
      id: "msg-3",
      sender: "Vikramaditya Motwane",
      role: "Director & Showrunner",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      text: "Your showreel scene 3 has fantastic tonal restraint. Let's discuss a secondary lead for the upcoming series.",
      time: "Yesterday",
      unread: false,
      online: true,
      thread: [
        { sender: "Vikramaditya Motwane", text: "Your showreel scene 3 has fantastic tonal restraint. Let's discuss a secondary lead for the upcoming series.", time: "Yesterday" }
      ]
    },
  ]);

  const handleSendReply = (msgId: string) => {
    if (!chatReply.trim()) return;
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          unread: false,
          text: chatReply,
          time: "Just now",
          thread: [...m.thread, { sender: "You", text: chatReply, time: "Just now" }]
        };
      }
      return m;
    }));
    setChatReply("");
  };

  const unreadMsgCount = messages.filter(m => m.unread).length;

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        borderBottom: "none",
        boxShadow: "none",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "72px",
          gap: "16px",
        }}
      >
        {/* Brand */}
        <div
          onClick={() => onSelectView("landing")}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(255, 165, 0, 0.4)",
            }}
          >
            <Clapperboard size={22} color="#000" />
          </div>
          <div>
            <span
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontFamily: "var(--font-display)",
                color: "#fff",
              }}
            >
              Cine<span style={{ color: "var(--accent-gold)" }}>Connect</span>
            </span>
            <span
              style={{
                display: "block",
                fontSize: "0.62rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginTop: "-2px",
              }}
            >
              Cinema & Talent Platform
            </span>
          </div>
        </div>

        {/* Center Main View Switcher */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(255, 255, 255, 0.04)",
            padding: "4px 6px",
            borderRadius: "var(--radius-full)",
            border: "none",
          }}
        >
          <button
            onClick={() => onSelectView("landing")}
            style={{
              background: currentView === "landing" ? "var(--accent-gold)" : "transparent",
              color: currentView === "landing" ? "#000" : "var(--text-secondary)",
              border: "none",
              padding: "7px 18px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Landing Page
          </button>

          <button
            onClick={() => onSelectView("home")}
            style={{
              background: currentView === "home" ? "var(--accent-gold)" : "transparent",
              color: currentView === "home" ? "#000" : "var(--text-secondary)",
              border: "none",
              padding: "7px 18px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Zap size={14} fill={currentView === "home" ? "#000" : "var(--accent-gold)"} color={currentView === "home" ? "#000" : "var(--accent-gold)"} />
            <span>Home Studio Hub</span>
          </button>

          <button
            onClick={() => onSelectView("profile")}
            style={{
              background: currentView === "profile" ? "var(--accent-gold)" : "transparent",
              color: currentView === "profile" ? "#000" : "var(--text-secondary)",
              border: "none",
              padding: "7px 18px",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            My Profile & Media
          </button>
        </nav>

        {/* Right Section: Notifications, Messages, Profile & Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
          
          {/* 1. Notifications Button & Dropdown (First) */}
          <div style={{ position: "relative" }}>
            <button
              id="top-nav-notifications-btn"
              title="Studio Notifications"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowMessages(false);
                setShowUserDropdown(false);
              }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: showNotifications ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.05)",
                border: showNotifications ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                color: showNotifications ? "var(--accent-gold)" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              <Bell size={18} />
              {unreadNotifCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 4px",
                    borderRadius: "9px",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #06080c",
                    boxShadow: "0 0 10px rgba(239, 68, 68, 0.6)",
                  }}
                >
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div
                className="glass-panel"
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "-40px",
                  width: "360px",
                  background: "#0c1017",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
                  zIndex: 70,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Bell size={16} color="var(--accent-gold)" />
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 }}>Notification</h4>
                  </div>
                  {unreadNotifCount > 0 ? (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "0.74rem",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  ) : (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>All caught up</span>
                  )}
                </div>

                {/* Instant Alert Simulator Buttons for testing */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                  <button
                    onClick={() => triggerTestAlert("Selected")}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "6px",
                      background: "rgba(255, 152, 0, 0.15)",
                      border: "1px solid #FF9800",
                      color: "#FFB74D",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Simulate Selected status update"
                  >
                    + Selected
                  </button>
                  <button
                    onClick={() => triggerTestAlert("Under Review")}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "6px",
                      background: "rgba(59, 130, 246, 0.15)",
                      border: "1px solid #60A5FA",
                      color: "#93C5FD",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Simulate Under Review status update"
                  >
                    + Review
                  </button>
                  <button
                    onClick={() => triggerTestAlert("Not Selected")}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "6px",
                      background: "rgba(148, 163, 184, 0.15)",
                      border: "1px solid #94A3B8",
                      color: "#CBD5E1",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Simulate Not Selected status update"
                  >
                    + Closed
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                  {notifications.slice(0, 6).map((n) => {
                    const statusVal = n.metadata_json?.status;
                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: !n.is_read
                            ? statusVal === "Selected"
                              ? "rgba(255, 152, 0, 0.12)"
                              : "rgba(255, 255, 255, 0.05)"
                            : "rgba(255, 255, 255, 0.02)",
                          border: !n.is_read
                            ? statusVal === "Selected"
                              ? "1px solid rgba(255, 152, 0, 0.45)"
                              : "1px solid rgba(255, 255, 255, 0.15)"
                            : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 700,
                              color: statusVal === "Selected" ? "#FFB74D" : "#fff",
                            }}
                          >
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "#FF9800",
                                display: "inline-block",
                              }}
                            />
                          )}
                        </div>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.35, margin: 0 }}>
                          {n.body}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: "12px", textAlign: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                  <a
                    href="/notifications"
                    onClick={() => setShowNotifications(false)}
                    style={{
                      color: "var(--accent-gold)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    View All Notifications →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 2. Messages Button & Dropdown (Second) */}
          <div style={{ position: "relative" }}>
            <button
              id="top-nav-messages-btn"
              title="Direct Messages & Inquiries"
              onClick={() => {
                setShowMessages(!showMessages);
                setShowNotifications(false);
                setShowUserDropdown(false);
              }}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: showMessages ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.05)",
                border: showMessages ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                color: showMessages ? "var(--accent-gold)" : "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              <InstagramDmIcon size={19} style={{ transform: "rotate(-5deg)", marginLeft: "-1px" }} />
              {unreadMsgCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 4px",
                    borderRadius: "9px",
                    background: "#10b981",
                    color: "#000",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #06080c",
                    boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)",
                  }}
                >
                  {unreadMsgCount}
                </span>
              )}
            </button>

            {/* Messages Dropdown */}
            {showMessages && (
              <div
                className="glass-panel"
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "-20px",
                  width: "380px",
                  background: "#0c1017",
                  border: "1px solid rgba(245, 158, 11, 0.35)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.85)",
                  zIndex: 70,
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <InstagramDmIcon size={17} color="var(--accent-gold)" />
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                      {activeChatId ? "Direct Message" : "Production Messages"}
                    </h4>
                  </div>
                  {activeChatId ? (
                    <button
                      onClick={() => setActiveChatId(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ← Back to All
                    </button>
                  ) : (
                    <span className="badge badge-emerald" style={{ fontSize: "0.7rem" }}>
                      {unreadMsgCount} New
                    </span>
                  )}
                </div>

                {/* Body: Thread or Conversations list */}
                {activeChatId ? (
                  // Active Single Chat Thread
                  (() => {
                    const activeChat = messages.find((m) => m.id === activeChatId);
                    if (!activeChat) return null;
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                          <img
                            src={activeChat.avatar}
                            alt={activeChat.sender}
                            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", display: "block" }}>
                              {activeChat.sender}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)" }}>
                              {activeChat.role} • {activeChat.online ? "🟢 Active now" : "Offline"}
                            </span>
                          </div>
                        </div>

                        {/* Thread Bubbles */}
                        <div
                          style={{
                            maxHeight: "220px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            padding: "6px 2px",
                          }}
                        >
                          {activeChat.thread.map((t, idx) => {
                            const isMe = t.sender === "You";
                            return (
                              <div
                                key={idx}
                                style={{
                                  alignSelf: isMe ? "flex-end" : "flex-start",
                                  maxWidth: "85%",
                                  background: isMe ? "linear-gradient(135deg, #d97706, #b45309)" : "rgba(255,255,255,0.07)",
                                  color: "#fff",
                                  padding: "8px 12px",
                                  borderRadius: isMe ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                  fontSize: "0.78rem",
                                  lineHeight: 1.4,
                                  border: isMe ? "none" : "1px solid var(--border-subtle)",
                                }}
                              >
                                <div>{t.text}</div>
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "0.64rem",
                                    color: isMe ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
                                    textAlign: "right",
                                    marginTop: "3px",
                                  }}
                                >
                                  {t.time}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Reply Input */}
                        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                          <input
                            type="text"
                            placeholder="Type a response..."
                            value={chatReply}
                            onChange={(e) => setChatReply(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSendReply(activeChat.id);
                            }}
                            style={{
                              flex: 1,
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              fontSize: "0.8rem",
                              color: "#fff",
                              outline: "none",
                            }}
                          />
                          <button
                            onClick={() => handleSendReply(activeChat.id)}
                            style={{
                              background: "var(--accent-gold)",
                              border: "none",
                              borderRadius: "8px",
                              padding: "0 14px",
                              color: "#000",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Send size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Conversation List
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto" }}>
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setActiveChatId(m.id);
                          setMessages((prev) =>
                            prev.map((item) => (item.id === m.id ? { ...item, unread: false } : item))
                          );
                        }}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          background: m.unread ? "rgba(245, 158, 11, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          border: m.unread ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid var(--border-subtle)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ position: "relative" }}>
                          <img
                            src={m.avatar}
                            alt={m.sender}
                            style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          {m.online && (
                            <span
                              style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: "#10b981",
                                border: "2px solid #0c1017",
                              }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {m.sender}
                            </span>
                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: "6px" }}>{m.time}</span>
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)", display: "block" }}>{m.role}</span>
                          <p
                            style={{
                              fontSize: "0.76rem",
                              color: m.unread ? "#fff" : "var(--text-secondary)",
                              margin: "3px 0 0",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontWeight: m.unread ? 600 : 400,
                            }}
                          >
                            {m.text}
                          </p>
                        </div>
                        {m.unread && (
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: "var(--accent-gold)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Link to Full-Page Messages Center */}
                <a
                  href="/messages"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "8px 12px",
                    marginTop: "12px",
                    background: "linear-gradient(135deg, rgba(255, 152, 0, 0.22) 0%, rgba(20, 24, 34, 0.95) 100%)",
                    border: "1px solid rgba(255, 152, 0, 0.45)",
                    borderRadius: "8px",
                    color: "#FFB703",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  Open Full-Page Studio Messages ↗
                </a>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div
            onClick={() => onSelectView("profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-subtle)",
              padding: "4px 12px 4px 6px",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
            }}
          >
            <img
              src={userData.profile?.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"}
              alt="User"
              style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
            />
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff", display: "block", lineHeight: 1.2 }}>
                {userData.profile?.name || "Kabir Mehra"}
              </span>
              <span style={{ fontSize: "0.68rem", color: "var(--accent-gold)" }}>
                {userData.profile?.primary_craft || "Actor"}
              </span>
            </div>
          </div>

          {/* Mobile App Simulator Link */}
          <a
            href="/mobile"
            title="Open Mobile Experience"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 152, 0, 0.14)",
              border: "1px solid rgba(255, 152, 0, 0.4)",
              color: "var(--accent-gold)",
              fontSize: "0.82rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            <Smartphone size={14} />
            <span>Mobile App</span>
          </a>

          {/* Auth Switcher */}
          <button
            onClick={onOpenAuthModal}
            className="btn-secondary"
            style={{ padding: "6px 14px", fontSize: "0.82rem" }}
          >
            <Lock size={13} /> Sign In / Account
          </button>
        </div>
      </div>
    </header>
  );
}
