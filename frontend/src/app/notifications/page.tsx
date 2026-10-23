"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import { useNotifications } from "@/context/NotificationContext";
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  Clapperboard,
  CheckCheck,
  Film,
} from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerTestAlert,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<"all" | "APPLICATION_STATUS" | "DIRECT_MESSAGE" | "unread">("all");

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.is_read;
    if (activeFilter === "APPLICATION_STATUS") return n.notification_type === "APPLICATION_STATUS";
    if (activeFilter === "DIRECT_MESSAGE") return n.notification_type === "DIRECT_MESSAGE";
    return true;
  });

  const mockUser = {
    id: "demo-user-1",
    auth_provider: "email",
    email_verified: true,
    phone_verified: true,
    identity_verified: true,
    skills: [],
    experiences: [],
    portfolio: [],
  };

  const completeness = { score: 92, max_score: 100, suggestions: [] };

  return (
    <div style={{ minHeight: "100vh", background: "#080a0f", color: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      {/* Top Header */}
      <Navigation
        currentView="notifications"
        onSelectView={(v) => {
          if (v === "landing") window.location.href = "/";
          else if (v === "home") window.location.href = "/home";
          else if (v === "profile") window.location.href = "/profile";
        }}
        userData={mockUser}
        completeness={completeness}
        onOpenAuthModal={() => {}}
        onOpenUploadModal={() => {}}
      />

      <main style={{ flex: 1, padding: "32px 16px 120px", maxWidth: "860px", margin: "0 auto", width: "100%" }}>
        {/* Page Title & Actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "28px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "rgba(255, 152, 0, 0.15)",
                  border: "1px solid #FF9800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={20} color="#FF9800" />
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                Notification Center
              </h1>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: "4px" }}>
              Real-time casting updates, director callbacks, and studio communications.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFB74D",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <CheckCheck size={16} />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Live Simulation Banner: Test Application Status Update */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(13, 17, 26, 0.8) 100%)",
            border: "1px solid rgba(255, 152, 0, 0.3)",
            borderRadius: "16px",
            padding: "16px 20px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} color="#FF9800" />
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FFB74D" }}>
                Real-Time Dispatch Engine (Live WebSocket & Push)
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", margin: "4px 0 0" }}>
              Trigger sample application status changes to test instant WebSocket push, toast notifications, and Redis counter updates:
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => triggerTestAlert("Selected")}
              style={{
                background: "#FF9800",
                color: "#08090C",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              🎉 Test "Selected"
            </button>
            <button
              onClick={() => triggerTestAlert("Under Review")}
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                color: "#93C5FD",
                border: "1px solid #60A5FA",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🎬 Test "Under Review"
            </button>
            <button
              onClick={() => triggerTestAlert("Not Selected")}
              style={{
                background: "rgba(148, 163, 184, 0.15)",
                color: "#CBD5E1",
                border: "1px solid #64748B",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
          {[
            { id: "all", label: "All Notifications" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "APPLICATION_STATUS", label: "Career & Applications" },
            { id: "DIRECT_MESSAGE", label: "Direct Messages" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              style={{
                background: activeFilter === f.id ? "rgba(255, 152, 0, 0.18)" : "rgba(255, 255, 255, 0.04)",
                border: activeFilter === f.id ? "1.5px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.1)",
                color: activeFilter === f.id ? "#FFB74D" : "#94A3B8",
                padding: "7px 16px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: activeFilter === f.id ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notifications Feed */}
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              background: "rgba(255, 255, 255, 0.02)",
              borderRadius: "16px",
              border: "1px dashed rgba(255, 255, 255, 0.15)",
            }}
          >
            <CheckCircle2 size={36} color="#64748B" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 6px" }}>No notifications in this view</h3>
            <p style={{ color: "#94A3B8", fontSize: "0.82rem", margin: 0 }}>
              You're all caught up! New casting calls and callback updates will stream in automatically.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredNotifications.map((n) => {
              const statusVal = n.metadata_json?.status;
              const isSelected = statusVal === "Selected";
              const isUnderReview = statusVal === "Under Review";
              const isNotSelected = statusVal === "Not Selected";

              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  style={{
                    background: isSelected
                      ? "linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(18, 24, 38, 0.95) 100%)"
                      : isUnderReview
                      ? "rgba(18, 24, 38, 0.9)"
                      : isNotSelected
                      ? "rgba(15, 19, 28, 0.85)"
                      : "rgba(18, 24, 38, 0.8)",
                    border: isSelected
                      ? "1.5px solid #FF9800"
                      : isUnderReview
                      ? "1px solid rgba(255, 152, 0, 0.35)"
                      : !n.is_read
                      ? "1px solid rgba(255, 255, 255, 0.25)"
                      : "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "20px 22px",
                    boxShadow: isSelected
                      ? "0 6px 24px rgba(255, 152, 0, 0.2)"
                      : "0 4px 16px rgba(0,0,0,0.4)",
                    position: "relative",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                    {/* Icon Pill */}
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: isSelected
                          ? "#FF9800"
                          : isUnderReview
                          ? "rgba(255, 152, 0, 0.2)"
                          : isNotSelected
                          ? "rgba(148, 163, 184, 0.15)"
                          : "rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: isSelected ? "#08090C" : isUnderReview ? "#FFB74D" : "#94A3B8",
                      }}
                    >
                      {isSelected ? <Clapperboard size={22} /> : isUnderReview ? <Film size={22} /> : <Bell size={22} />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h3
                            style={{
                              fontSize: "1rem",
                              fontWeight: 800,
                              color: isSelected ? "#FFB74D" : "#FFFFFF",
                              margin: 0,
                            }}
                          >
                            {n.title}
                          </h3>
                          {statusVal && (
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                background: isSelected
                                  ? "#FF9800"
                                  : isUnderReview
                                  ? "rgba(255, 152, 0, 0.2)"
                                  : "rgba(148, 163, 184, 0.2)",
                                color: isSelected ? "#000" : isUnderReview ? "#FFB74D" : "#CBD5E1",
                              }}
                            >
                              {statusVal}
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.72rem", color: "#64748B", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock size={12} />
                            {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!n.is_read && (
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#FF9800",
                                display: "inline-block",
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <p style={{ fontSize: "0.84rem", color: "#CBD5E1", lineHeight: 1.45, margin: "0 0 12px" }}>
                        {n.body}
                      </p>

                      {/* Instructions Box for Selected Status */}
                      {isSelected && n.metadata_json?.instructions && (
                        <div
                          style={{
                            background: "rgba(0, 0, 0, 0.35)",
                            border: "1px solid rgba(255, 152, 0, 0.3)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FF9800", display: "block", marginBottom: "2px" }}>
                            Director & Casting Instructions:
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#F1F5F9" }}>
                            {n.metadata_json.instructions}
                          </span>
                        </div>
                      )}

                      {/* Action Links */}
                      {n.deep_link_route && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <a
                            href={n.deep_link_route}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              color: isSelected ? "#FFB74D" : "#38BDF8",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none",
                            }}
                          >
                            View Application Details <ArrowRight size={14} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Transparent Crystal-Glass 2-by-2 Wheel Bottom Dock */}
      <CurvedWheelNav currentActivePath="/notifications" />
    </div>
  );
}
