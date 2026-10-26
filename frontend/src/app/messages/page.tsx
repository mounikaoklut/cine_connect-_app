"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import { UserProfile, CompletenessData } from "@/lib/api";
import {
  MessageSquare,
  Search,
  Send,
  Video,
  Phone,
  Paperclip,
  CheckCircle2,
  FileText,
  Shield,
  Film,
  X,
  Plus,
} from "lucide-react";

export default function MessagesPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string>("msg-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "castings" | "studios">("all");
  const [replyText, setReplyText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mockUser: UserProfile = {
    id: "d3b07384-d113-4a44-9c81-c30089f23d88",
    email: "kabir.mehra@cineconnect.com",
    auth_provider: "email",
    email_verified: true,
    phone_verified: true,
    identity_verified: true,
    profile: {
      name: "Kabir Mehra",
      primary_craft: "Actor",
      city: "Mumbai",
      photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    },
    skills: [],
    experiences: [],
    portfolio: [],
  };

  const completeness: CompletenessData = {
    score: 85,
    max_score: 100,
    suggestions: [],
  };

  const [threads, setThreads] = useState([
    {
      id: "msg-1",
      sender: "Shanoo Sharma",
      role: "Head of Casting, YRF",
      studio: "Yash Raj Films",
      project: "Shadow of Verity",
      category: "castings" as const,
      hasSides: true,
      unread: true,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      time: "12m ago",
      lastMessage: "Kabir, the director screened your audition tape. Can you do a chemistry read tomorrow at 4 PM at YRF Studios, Stage 3?",
      messages: [
        { sender: "Shanoo Sharma", text: "Loved your audition tape for the gritty crime thriller!", time: "Yesterday, 3:15 PM" },
        { sender: "You", text: "Thank you Shanoo! Looking forward to hearing feedback.", time: "Yesterday, 4:02 PM" },
        { sender: "Shanoo Sharma", text: "Kabir, the director screened your audition tape. Can you do a chemistry read tomorrow at 4 PM at YRF Studios, Stage 3?", time: "12m ago" },
      ],
    },
    {
      id: "msg-2",
      sender: "Karan Johar",
      role: "Dharma Productions",
      studio: "Dharma Productions",
      project: "Dhadak 2 (Lead Antagonist)",
      category: "castings" as const,
      hasSides: true,
      unread: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      time: "45m ago",
      lastMessage: "Script sides for Scene 14 attached. Please review monologue and self-tape by Thursday.",
      messages: [
        { sender: "Karan Johar", text: "Hello Kabir, we are finalizing the primary cast for the crime sequel. Your NSD theatre work impressed the writing room.", time: "2h ago" },
        { sender: "Karan Johar", text: "Script sides for Scene 14 attached. Please review monologue and self-tape by Thursday.", time: "45m ago" },
      ],
    },
    {
      id: "msg-3",
      sender: "Rohit Shetty Picturez",
      role: "Production Office",
      studio: "Rohit Shetty Picturez",
      project: "Cop Universe Spin-off",
      category: "studios" as const,
      hasSides: false,
      unread: false,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      time: "1h ago",
      lastMessage: "Pitch deck NDA verified. Logline approved for table discussion with creative execs.",
      messages: [
        { sender: "Rohit Shetty Picturez", text: "Pitch deck NDA verified and logged. Logline approved for table discussion with creative execs.", time: "1h ago" },
      ],
    },
    {
      id: "msg-4",
      sender: "Zoya Akhtar",
      role: "Tiger Baby Films",
      studio: "Tiger Baby Films",
      project: "Made in Heaven Season 3",
      category: "studios" as const,
      hasSides: false,
      unread: false,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      time: "Yesterday",
      lastMessage: "The look-test photos came through really sharp. Let's schedule the ensemble table read next Monday.",
      messages: [
        { sender: "Zoya Akhtar", text: "The look-test photos came through really sharp. Let's schedule the ensemble table read next Monday.", time: "Yesterday" },
      ],
    },
  ]);

  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.project && t.project.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterCategory === "castings") return t.category === "castings";
    if (filterCategory === "studios") return t.category === "studios";
    return true;
  });

  const handleSendMessage = () => {
    if (!replyText.trim() || !activeThread) return;
    const textToSend = replyText.trim();
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            lastMessage: textToSend,
            time: "Just now",
            unread: false,
            messages: [...t.messages, { sender: "You", text: textToSend, time: "Just now" }],
          };
        }
        return t;
      })
    );
    setReplyText("");
  };

  const unreadTotal = threads.filter((t) => t.unread).length;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex" }}>
      {/* Curved Navigation Arc (Left) */}
      <CurvedWheelNav currentActivePath="/messages" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="messages"
          onSelectView={(view) => {
            if (view === "landing") window.location.href = "/";
            else if (view === "home") window.location.href = "/home";
            else if (view === "profile") window.location.href = "/profile";
          }}
          userData={mockUser}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => {
            window.location.href = "/portfolio";
          }}
        />

        {toastMessage && (
          <div
            style={{
              position: "fixed",
              top: "84px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#FF9800",
              color: "#08090C",
              padding: "10px 20px",
              borderRadius: "20px",
              fontWeight: 800,
              fontSize: "0.85rem",
              zIndex: 9999,
              boxShadow: "0 4px 20px rgba(255, 152, 0, 0.4)",
            }}
          >
            {toastMessage}
          </div>
        )}

        <main style={{ flex: 1, padding: "24px 24px 40px", maxWidth: "1320px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #1A1C23 0%, #222530 100%)",
              border: "1px solid #2E3340",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "20px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(255, 165, 0, 0.18)",
                    color: "#FFA500",
                    border: "1px solid rgba(255, 165, 0, 0.38)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <MessageSquare size={13} />
                  PRODUCTION INQUIRIES & DIRECT MESSAGES
                </span>
                <span style={{ fontSize: "0.72rem", color: "#10b981", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <Shield size={12} /> DPDP 2026 Watermark Protected
                </span>
              </div>
              <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                Studio Direct Messages
              </h1>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: "4px 0 0" }}>
                Secure, end-to-end communication channels with verified casting directors and studio showrunners.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1.5px solid #FF9800",
                  color: "#FFB703",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                }}
              >
                {unreadTotal} Active Inquiries
              </span>
            </div>
          </div>

          {/* Dual-Column Full-Page Chat Container */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "360px 1fr",
              background: "#10131B",
              border: "1px solid #232734",
              borderRadius: "16px",
              overflow: "hidden",
              minHeight: "600px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.45)",
            }}
          >
            {/* Left Column: Conversations List */}
            <div
              style={{
                borderRight: "1px solid #232734",
                display: "flex",
                flexDirection: "column",
                background: "#0d1017",
              }}
            >
              {/* Search & Tabs */}
              <div style={{ padding: "16px", borderBottom: "1px solid #1E2330" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "10px",
                    padding: "8px 12px",
                    marginBottom: "12px",
                  }}
                >
                  <Search size={16} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Search directors, studios, or roles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      color: "#fff",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {(["all", "castings", "studios"] as const).map((cat) => {
                    const isActive = filterCategory === cat;
                    const labels = {
                      all: "All Messages",
                      castings: "🎬 Castings",
                      studios: "🏢 Studios",
                    };
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFilterCategory(cat)}
                        style={{
                          flex: 1,
                          padding: "6px 8px",
                          borderRadius: "8px",
                          fontSize: "0.72rem",
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? "rgba(255, 152, 0, 0.2)" : "rgba(255, 255, 255, 0.04)",
                          border: isActive ? "1.2px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isActive ? "#FFB703" : "#94a3b8",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Threads List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {filteredThreads.map((thread) => {
                  const isSelected = thread.id === selectedThreadId;
                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        setThreads((prev) =>
                          prev.map((t) => (t.id === thread.id ? { ...t, unread: false } : t))
                        );
                      }}
                      style={{
                        padding: "12px",
                        borderRadius: "12px",
                        marginBottom: "8px",
                        cursor: "pointer",
                        background: isSelected
                          ? "linear-gradient(135deg, rgba(255, 152, 0, 0.18) 0%, rgba(20, 24, 34, 0.95) 100%)"
                          : thread.unread
                          ? "rgba(255, 152, 0, 0.08)"
                          : "rgba(255, 255, 255, 0.02)",
                        border: isSelected
                          ? "1.5px solid #FF9800"
                          : thread.unread
                          ? "1.2px solid rgba(255, 152, 0, 0.35)"
                          : "1px solid rgba(255, 255, 255, 0.06)",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <img
                          src={thread.avatar}
                          alt={thread.sender}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: isSelected ? "2px solid #FF9800" : "1.5px solid rgba(255, 255, 255, 0.1)",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            width: "11px",
                            height: "11px",
                            borderRadius: "50%",
                            background: "#10b981",
                            border: "2px solid #0d1017",
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: thread.unread ? 800 : 700, color: "#fff" }}>
                            {thread.sender}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: thread.unread ? "#FFB703" : "#64748b" }}>
                            {thread.time}
                          </span>
                        </div>

                        <div style={{ fontSize: "0.72rem", color: "var(--accent-gold)", fontWeight: 600, marginBottom: "4px" }}>
                          {thread.role}
                        </div>

                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: thread.unread ? "#fff" : "#94a3b8",
                            fontWeight: thread.unread ? 600 : 400,
                            margin: 0,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {thread.lastMessage}
                        </p>
                      </div>

                      {thread.unread && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#FF9800",
                            boxShadow: "0 0 8px #FF9800",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Full-Page Active Chat Room */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#080a0f",
                height: "100%",
                overflow: "hidden",
              }}
            >
              {/* Active Chat Header */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "linear-gradient(180deg, #131722 0%, #0c0f16 100%)",
                  borderBottom: "1px solid #232734",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={activeThread.avatar}
                    alt={activeThread.sender}
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FF9800" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>
                        {activeThread.sender}
                      </span>
                      <CheckCircle2 size={15} color="#38bdf8" />
                      <span
                        style={{
                          fontSize: "0.68rem",
                          background: "rgba(255, 152, 0, 0.15)",
                          color: "#FFB703",
                          border: "1px solid rgba(255, 152, 0, 0.35)",
                          padding: "1px 7px",
                          borderRadius: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {activeThread.studio}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--accent-gold)" }}>
                      {activeThread.role} &bull; Project: {activeThread.project}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Connecting encrypted voice call to ${activeThread.sender}... 📞`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "10px",
                      padding: "8px 12px",
                      color: "#E2E8F0",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Phone size={14} /> Voice Call
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setToastMessage(`Launching encrypted video self-tape room with ${activeThread.sender}... 🎥`);
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    style={{
                      background: "rgba(255, 152, 0, 0.18)",
                      border: "1.5px solid #FF9800",
                      borderRadius: "10px",
                      padding: "8px 14px",
                      color: "#FFB703",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Video size={15} /> Video Callback Room
                  </button>
                </div>
              </div>

              {/* Chat Message History */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  background: "#080a0f",
                }}
              >
                <div style={{ textAlign: "center", margin: "10px 0" }}>
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "4px 14px",
                      borderRadius: "14px",
                      fontSize: "0.72rem",
                      color: "#94a3b8",
                    }}
                  >
                    Session verified with CineConnect Forensic Key &bull; DPDP 2026 Compliant
                  </span>
                </div>

                {activeThread.messages.map((msg, idx) => {
                  const isMe = msg.sender === "You";
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          background: isMe
                            ? "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                            : "rgba(22, 27, 38, 0.95)",
                          color: "#fff",
                          padding: "12px 16px",
                          borderRadius: isMe ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                          border: isMe ? "1px solid rgba(255, 183, 3, 0.4)" : "1px solid rgba(255, 255, 255, 0.09)",
                          boxShadow: isMe ? "0 4px 14px rgba(217, 119, 6, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.3)",
                          fontSize: "0.88rem",
                          lineHeight: 1.5,
                        }}
                      >
                        <div>{msg.text}</div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "5px",
                            marginTop: "6px",
                            fontSize: "0.68rem",
                            color: isMe ? "rgba(255, 255, 255, 0.8)" : "#64748b",
                          }}
                        >
                          <span>{msg.time}</span>
                          {isMe && <span style={{ color: "#38bdf8" }}>✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Script Sides Preview Box if applicable */}
                {activeThread.hasSides && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      maxWidth: "75%",
                      background: "rgba(18, 22, 33, 0.95)",
                      border: "1.5px solid rgba(245, 158, 11, 0.4)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "rgba(245, 158, 11, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FF9800",
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                          {activeThread.project}_Scene_14_Audition_Sides.pdf
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                          2.4 MB &bull; Forensically Watermarked with UID #CC-9421
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage("Opening watermarked script viewer... 📑");
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        style={{
                          flex: 1,
                          background: "rgba(245, 158, 11, 0.2)",
                          border: "1px solid #FF9800",
                          color: "#FFB703",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Film size={14} /> View Script Sides
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Chat Input Bar */}
              <div
                style={{
                  padding: "16px 20px",
                  background: "#0c0f16",
                  borderTop: "1px solid #1E2330",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  title="Attach Reel or Sides"
                  onClick={() => {
                    setToastMessage("Attach portfolio reel or headshot from Vault 📎");
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent-gold)",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Plus size={18} />
                </button>

                <input
                  type="text"
                  placeholder={`Reply to ${activeThread.sender}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "24px",
                    padding: "10px 18px",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  style={{
                    background: replyText.trim()
                      ? "linear-gradient(135deg, #FFB703 0%, #FF9800 100%)"
                      : "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "50%",
                    width: "42px",
                    height: "42px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: replyText.trim() ? "#08090C" : "#64748b",
                    cursor: replyText.trim() ? "pointer" : "default",
                    boxShadow: replyText.trim() ? "0 4px 16px rgba(255, 152, 0, 0.5)" : "none",
                    flexShrink: 0,
                    transition: "all 0.18s ease",
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
