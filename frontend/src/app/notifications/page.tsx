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
  SlidersHorizontal,
  Eye,
  Calendar,
  FileText,
  X,
  Check,
} from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerTestAlert,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<
    "all" | "APPLICATION_STATUS" | "DIRECT_MESSAGE" | "unread" | "callbacks" | "reviews"
  >("all");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState({
    callbacks: true,
    aiMatches: true,
    showreelViews: true,
    callSheets: true,
    pitchRequests: true,
    soundAlerts: true,
  });
  const [optionsSavedToast, setOptionsSavedToast] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.is_read;
    if (activeFilter === "APPLICATION_STATUS") return n.notification_type === "APPLICATION_STATUS";
    if (activeFilter === "DIRECT_MESSAGE") return n.notification_type === "DIRECT_MESSAGE";
    if (activeFilter === "callbacks") {
      const status = n.metadata_json?.status;
      return (
        status === "Selected" ||
        n.title.toLowerCase().includes("callback") ||
        n.title.toLowerCase().includes("screen test") ||
        n.title.toLowerCase().includes("selected")
      );
    }
    if (activeFilter === "reviews") {
      const status = n.metadata_json?.status;
      return (
        status === "Under Review" ||
        n.title.toLowerCase().includes("review") ||
        n.title.toLowerCase().includes("showreel")
      );
    }
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
            <button
              id="web-notif-options-btn"
              onClick={() => setShowOptionsModal(!showOptionsModal)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: showOptionsModal ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.05)",
                border: showOptionsModal ? "1px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.15)",
                color: showOptionsModal ? "#FFB74D" : "#94A3B8",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <SlidersHorizontal size={15} color={showOptionsModal ? "#FF9800" : "#94A3B8"} />
              Alert Options
            </button>

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

        {/* Collapsible CineConnect Notification & Alert Options Panel */}
        {showOptionsModal && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(20, 24, 36, 0.95) 0%, rgba(11, 14, 22, 0.98) 100%)",
              border: "1px solid rgba(255, 152, 0, 0.35)",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.7)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "rgba(255, 152, 0, 0.2)",
                    border: "1px solid #FF9800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SlidersHorizontal size={16} color="#FF9800" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF" }}>
                    CineConnect Alert &amp; Dispatch Options
                  </h3>
                  <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "#94A3B8" }}>
                    Configure real-time push triggers for verified director callbacks, AI casting matches, and shoot schedules.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowOptionsModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "none",
                  color: "#94A3B8",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "18px" }}>
              {[
                {
                  key: "callbacks" as const,
                  label: "Director Screen Tests & Callbacks",
                  desc: "Instant push & sound chime when directors invite you to callbacks.",
                  icon: Clapperboard,
                  color: "#F59E0B",
                },
                {
                  key: "aiMatches" as const,
                  label: "90%+ AI Smart Casting Matches",
                  desc: "Daily alerts for open roles matching your physical profile and craft.",
                  icon: Sparkles,
                  color: "#38BDF8",
                },
                {
                  key: "showreelViews" as const,
                  label: "Casting Director Showreel Views",
                  desc: "Real-time notice when verified studio executives watch your reels.",
                  icon: Eye,
                  color: "#10B981",
                },
                {
                  key: "callSheets" as const,
                  label: "Call Sheets & Shoot Schedules",
                  desc: "Urgent call time and soundstage location alerts on active shoots.",
                  icon: Calendar,
                  color: "#F43F5E",
                },
                {
                  key: "pitchRequests" as const,
                  label: "Screenplay Option & NDA Requests",
                  desc: "Notifications when production houses request scripts or NDAs.",
                  icon: FileText,
                  color: "#A855F7",
                },
                {
                  key: "soundAlerts" as const,
                  label: "Cinematic In-App Sound Alerts",
                  desc: "Play audio chime when urgent studio notices are delivered.",
                  icon: Bell,
                  color: "#FF9800",
                },
              ].map((opt) => {
                const IconComp = opt.icon;
                const isEnabled = alertPreferences[opt.key];

                return (
                  <div
                    key={opt.key}
                    onClick={() => setAlertPreferences((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                    style={{
                      padding: "12px 14px",
                      background: isEnabled ? "rgba(255, 152, 0, 0.06)" : "rgba(255, 255, 255, 0.02)",
                      border: isEnabled ? "1px solid rgba(255, 152, 0, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "10px",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: `${opt.color}20`,
                          border: `1px solid ${opt.color}40`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <IconComp size={14} color={opt.color} />
                      </div>
                      <div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#94A3B8", lineHeight: 1.35, display: "block", marginTop: "2px" }}>
                          {opt.desc}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        width: "36px",
                        height: "20px",
                        borderRadius: "10px",
                        background: isEnabled ? "#FF9800" : "rgba(255, 255, 255, 0.16)",
                        position: "relative",
                        flexShrink: 0,
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "#FFFFFF",
                          position: "absolute",
                          top: "2px",
                          left: isEnabled ? "18px" : "2px",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" }}>
              {optionsSavedToast && (
                <span style={{ fontSize: "0.78rem", color: "#10B981", fontWeight: 700 }}>
                  ✓ Preferences saved to your CineConnect account!
                </span>
              )}
              <button
                onClick={() => {
                  setOptionsSavedToast(true);
                  setTimeout(() => {
                    setOptionsSavedToast(false);
                    setShowOptionsModal(false);
                  }, 1200);
                }}
                style={{
                  background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                  color: "#08090C",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(255, 152, 0, 0.4)",
                }}
              >
                Save &amp; Apply Alert Preferences
              </button>
            </div>
          </div>
        )}

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
                Real-Time Dispatch Engine (Live WebSocket &amp; Push)
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
              🎉 Test &quot;Selected&quot;
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
              🎬 Test &quot;Under Review&quot;
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
            { id: "callbacks", label: "🎬 Audition Callbacks & Screen Tests" },
            { id: "reviews", label: "👁️ Showreel Reviews & Status" },
            { id: "APPLICATION_STATUS", label: "📋 All Applications" },
            { id: "DIRECT_MESSAGE", label: "💬 Casting DMs" },
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
