"use client";

import React, { useState } from "react";
import {
  Clapperboard,
  Sparkles,
  Search,
  Bell,
  MessageSquare,
  Plus,
  Play,
  Heart,
  Share2,
  Calendar,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  TrendingUp,
  Video,
  Image as ImageIcon,
  FileText,
  UserCheck,
  Award,
  ExternalLink,
  Filter,
  Eye,
  Camera,
  Layers,
  ArrowUpRight,
  Check,
  Bookmark,
} from "lucide-react";
import {
  FEATURED_TALENT,
  OPEN_CASTINGS,
  PITCH_DECKS,
  HOME_FEED_POSTS,
  MY_APPLICATIONS,
  FeedPost,
  CastingCall,
  TalentItem,
  PitchDeck,
  ApplicationPipelineItem,
} from "@/lib/mockData";
import CineStoriesSection from "@/components/CineStoriesSection";

interface HomePageProps {
  onSwitchToLanding: () => void;
  onSwitchToProfile: () => void;
  onOpenAuditionModal: (casting: CastingCall) => void;
  onOpenShowreelModal: (talent: TalentItem) => void;
  onOpenPitchModal: (pitch: PitchDeck) => void;
  onOpenCreatePost: () => void;
  feedPosts: FeedPost[];
  onToggleLikePost: (postId: string) => void;
  pipelineItems: ApplicationPipelineItem[];
}

export default function HomePage({
  onSwitchToLanding,
  onSwitchToProfile,
  onOpenAuditionModal,
  onOpenShowreelModal,
  onOpenPitchModal,
  onOpenCreatePost,
  feedPosts,
  onToggleLikePost,
  pipelineItems,
}: HomePageProps) {
  const [activeNav, setActiveNav] = useState<"feed" | "castings" | "talent" | "pitches" | "pipeline">("feed");
  const [feedFilter, setFeedFilter] = useState<"all" | "casting" | "showreel" | "pitch" | "bts">("all");
  const [userRole, setUserRole] = useState<"talent" | "producer">("talent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleFollow = (authorName: string) => {
    setFollowedAuthors((prev) =>
      prev.includes(authorName)
        ? prev.filter((name) => name !== authorName)
        : [...prev, authorName]
    );
  };

  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const isSaved = prev.includes(postId);
      const next = isSaved ? prev.filter((id) => id !== postId) : [...prev, postId];
      setToastMessage(isSaved ? "Post removed from Saved collection" : "Post saved to your Collection 🔖");
      setTimeout(() => setToastMessage(null), 2400);
      return next;
    });
  };

  // Filter posts
  const displayedPosts = feedPosts.filter((post) => {
    if (feedFilter !== "all" && post.type !== feedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        post.content.toLowerCase().includes(q) ||
        post.author.name.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* ===================== HOME SUB-NAVBAR ===================== */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(10, 14, 22, 0.95)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: "72px",
          zIndex: 30,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {/* Left search */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 300px", maxWidth: "460px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search talent, auditions, camera gear, scripts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: "38px", height: "40px", fontSize: "0.88rem" }}
              />
            </div>
          </div>

          {/* Center Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[
              { id: "feed" as const, label: "Stream & Feed" },
              { id: "castings" as const, label: "Audition Board" },
              { id: "talent" as const, label: "Talent Vault" },
              { id: "pitches" as const, label: "Pitch Decks" },
              { id: "pipeline" as const, label: "My Applications" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveNav(tab.id)}
                style={{
                  background: activeNav === tab.id ? "rgba(245, 158, 11, 0.18)" : "transparent",
                  color: activeNav === tab.id ? "var(--accent-gold)" : "var(--text-secondary)",
                  border: activeNav === tab.id ? "1px solid rgba(245, 158, 11, 0.35)" : "1px solid transparent",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Role Switcher & Action */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.05)",
                padding: "3px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <button
                onClick={() => setUserRole("talent")}
                style={{
                  background: userRole === "talent" ? "var(--accent-gold)" : "transparent",
                  color: userRole === "talent" ? "#000" : "var(--text-secondary)",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Talent Mode
              </button>
              <button
                onClick={() => setUserRole("producer")}
                style={{
                  background: userRole === "producer" ? "var(--accent-gold)" : "transparent",
                  color: userRole === "producer" ? "#000" : "var(--text-secondary)",
                  border: "none",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Producer Mode
              </button>
            </div>

            <button
              onClick={onOpenCreatePost}
              className="btn-primary"
              style={{ height: "38px", fontSize: "0.85rem", padding: "0 16px" }}
            >
              <Plus size={16} /> New Post / Notice
            </button>
          </div>
        </div>
      </div>

      {/* ===================== MAIN STUDIO LAYOUT ===================== */}
      <div className="container" style={{ padding: "28px 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr 340px",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* ===================== LEFT SIDEBAR ===================== */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* User Quick Card: Dark slate container with 1px border */}
            <div
              style={{
                background: "#1A1C23",
                border: "1px solid #2E3340",
                borderRadius: "16px",
                padding: "22px",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ position: "relative", width: "72px", height: "72px", margin: "0 auto 12px" }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                  alt="Kabir Mehra"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", border: "2px solid #FFA500" }}
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "#FFA500",
                    color: "#0D0E12",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle2 size={13} strokeWidth={2.8} />
                </span>
              </div>

              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "2px" }}>
                Kabir Mehra
              </h3>
              <span style={{ fontSize: "0.82rem", color: "#FFA500", fontWeight: 700 }}>
                Active Explorer
              </span>
              <span style={{ display: "block", fontSize: "0.78rem", color: "#9E9E9E", marginTop: "2px" }}>
                <MapPin size={11} style={{ display: "inline", marginRight: "3px" }} /> Mumbai, India
              </span>

              {/* 85% Completeness green-to-amber tracker */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "#14161D",
                  borderRadius: "10px",
                  border: "1px solid #2E3340",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "6px" }}>
                  <span style={{ color: "#9E9E9E" }}>Profile Completeness</span>
                  <span style={{ color: "#FFA500", fontWeight: 800 }}>85%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "linear-gradient(90deg, #10B981, #FFA500)", borderRadius: "3px" }} />
                </div>
                <span style={{ fontSize: "0.72rem", color: "#757575", display: "block", marginTop: "6px" }}>
                  Add voice sample to reach 92%
                </span>
              </div>

              {/* Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "16px" }}>
                <div style={{ background: "#14161D", border: "1px solid #2E3340", padding: "8px 4px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", display: "block" }}>1.4k</span>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Views</span>
                </div>
                <div style={{ background: "#14161D", border: "1px solid #2E3340", padding: "8px 4px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFA500", display: "block" }}>18</span>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Shortlists</span>
                </div>
                <div style={{ background: "#14161D", border: "1px solid #2E3340", padding: "8px 4px", borderRadius: "8px" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FF9900", display: "block" }}>4</span>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Callbacks</span>
                </div>
              </div>

              <button
                onClick={onSwitchToProfile}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  background: "#14161D",
                  color: "#FFFFFF",
                  border: "1px solid #2E3340",
                  borderRadius: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Edit Portfolio & Media
              </button>
            </div>

            {/* Quick Navigation Links */}
            <div className="glass-panel" style={{ padding: "16px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: "10px", paddingLeft: "8px" }}>
                Studio Workspaces
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  { id: "feed" as const, label: "Stream & Live Feed", icon: <Sparkles size={16} /> },
                  { id: "castings" as const, label: "Auditions & Roles", icon: <Clapperboard size={16} /> },
                  { id: "talent" as const, label: "Talent Directory", icon: <UserCheck size={16} /> },
                  { id: "pitches" as const, label: "Screenplay Vault", icon: <FileText size={16} /> },
                  { id: "pipeline" as const, label: "My Applications", icon: <TrendingUp size={16} /> },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "10px 12px",
                      background: activeNav === item.id ? "rgba(245, 158, 11, 0.15)" : "transparent",
                      color: activeNav === item.id ? "var(--accent-gold)" : "var(--text-secondary)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch to Landing Page Button */}
            <button
              onClick={onSwitchToLanding}
              className="btn-ghost"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "10px",
                border: "1px dashed var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
              }}
            >
              ← Back to Public Landing Page
            </button>
          </aside>

          {/* ===================== CENTER FEED STREAM ===================== */}
          <main style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {activeNav === "feed" && (
              <>
                {/* Discover Gravity-Defying Roles Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #1A1C23 0%, #222530 100%)",
                    border: "1px solid #2E3340",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px 26px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "20px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "-30px",
                      top: "-30px",
                      width: "160px",
                      height: "160px",
                      background: "radial-gradient(circle, rgba(255, 165, 0, 0.12) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div style={{ zIndex: 1, maxWidth: "560px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <span
                        style={{
                          background: "rgba(255, 165, 0, 0.18)",
                          color: "#FFA500",
                          border: "1px solid rgba(255, 165, 0, 0.35)",
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}
                      >
                        ⚡ Gravity Spotlight
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>Exclusive CineConnect Network</span>
                    </div>
                    <h2
                      style={{
                        fontSize: "1.45rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.25,
                        marginBottom: "6px",
                      }}
                    >
                      Discover Gravity-Defying Roles
                    </h2>
                    <p style={{ color: "#9E9E9E", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                      Connect with Bollywood, OTT & Indie production directors looking for verified actors, cinematographers, and screenwriters.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav("castings")}
                    style={{
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                      color: "#0D0E12",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 22px",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      boxShadow: "0 4px 18px rgba(255, 165, 0, 0.35)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    + Search Opportunities
                  </button>
                </div>

                {/* Square-Shaped Stories Section */}
                <div style={{ marginBottom: "6px" }}>
                  <CineStoriesSection onOpenCreateStory={onOpenCreatePost} />
                </div>

                {/* Status Post Composer */}
                <div
                  style={{
                    background: "#1A1C23",
                    border: "1px solid #2E3340",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  <div style={{ display: "flex", gap: "12px" }}>
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                      alt="Kabir"
                      style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FFA500" }}
                    />
                    <div
                      onClick={onOpenCreatePost}
                      style={{
                        flex: 1,
                        background: "#0D0E12",
                        border: "1px solid #2E3340",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 16px",
                        color: "#9E9E9E",
                        fontSize: "0.9rem",
                        cursor: "pointer",
                      }}
                    >
                      Share an update, audition tape, announce availability, or post a casting breakdown...
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid #2E3340",
                      paddingTop: "12px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={onOpenCreatePost}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(255, 165, 0, 0.1)",
                          border: "1px solid rgba(255, 165, 0, 0.3)",
                          color: "#FFA500",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 12px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Video size={16} /> Showreel
                      </button>
                      <button
                        onClick={onOpenCreatePost}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(255, 165, 0, 0.1)",
                          border: "1px solid rgba(255, 165, 0, 0.3)",
                          color: "#FFA500",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 12px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <Clapperboard size={16} /> Casting Call
                      </button>
                      <button
                        onClick={onOpenCreatePost}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "rgba(46, 51, 64, 0.5)",
                          border: "1px solid #2E3340",
                          color: "#E2E8F0",
                          borderRadius: "var(--radius-md)",
                          padding: "6px 12px",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <FileText size={16} /> Pitch Screenplay
                      </button>
                    </div>

                    <button
                      onClick={onOpenCreatePost}
                      style={{
                        background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                        color: "#0D0E12",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        padding: "7px 18px",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 2px 10px rgba(255, 165, 0, 0.3)",
                      }}
                    >
                      Publish Update
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                  {[
                    { id: "all" as const, label: "All Updates" },
                    { id: "casting" as const, label: "🎭 Casting Notices" },
                    { id: "showreel" as const, label: "🎬 Showreels & Clips" },
                    { id: "pitch" as const, label: "📜 Pitch Decks" },
                    { id: "bts" as const, label: "📸 Behind The Scenes" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFeedFilter(f.id)}
                      style={{
                        background: feedFilter === f.id ? "rgba(255, 165, 0, 0.18)" : "#1A1C23",
                        color: feedFilter === f.id ? "#FFA500" : "#9E9E9E",
                        border: feedFilter === f.id ? "1px solid #FFA500" : "1px solid #2E3340",
                        padding: "6px 14px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Feed Posts List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {displayedPosts.map((post) => (
                    <article
                      key={post.id}
                      style={{
                        background: "#1A1C23",
                        border: "1px solid #2E3340",
                        borderRadius: "var(--radius-lg)",
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      {/* Author Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FFA500" }}
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" }}>{post.author.name}</h4>
                              {post.author.verified && <CheckCircle2 size={15} color="#FFA500" />}
                            </div>
                            <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>
                              {post.author.craft} {post.author.company ? `• ${post.author.company}` : ""} • {post.timestamp}
                            </span>
                          </div>
                        </div>

                        {/* Instagram-style Follow / Following Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleFollow(post.author.name)}
                          style={{
                            background: followedAuthors.includes(post.author.name)
                              ? "rgba(255, 255, 255, 0.08)"
                              : "#FFA500",
                            color: followedAuthors.includes(post.author.name) ? "#E2E8F0" : "#0D0E12",
                            border: followedAuthors.includes(post.author.name)
                              ? "1px solid rgba(255, 255, 255, 0.2)"
                              : "none",
                            padding: "6px 16px",
                            borderRadius: "8px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            transition: "all 0.18s ease",
                            boxShadow: followedAuthors.includes(post.author.name)
                              ? "none"
                              : "0 2px 8px rgba(255, 165, 0, 0.3)",
                          }}
                        >
                          {followedAuthors.includes(post.author.name) ? (
                            <>
                              <Check size={14} strokeWidth={2.6} />
                              <span>Following</span>
                            </>
                          ) : (
                            <span>Follow</span>
                          )}
                        </button>
                      </div>

                      {/* Content Body */}
                      <p style={{ color: "#FFFFFF", fontSize: "0.95rem", lineHeight: 1.6 }}>
                        {post.content}
                      </p>

                      {/* Media Image / Video Preview */}
                      {post.mediaUrl && (
                        <div
                          style={{
                            borderRadius: "var(--radius-md)",
                            overflow: "hidden",
                            maxHeight: "420px",
                            position: "relative",
                            border: "1px solid #2E3340",
                          }}
                        >
                          <img
                            src={post.mediaUrl}
                            alt="Feed Media"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}

                      {/* Tags */}
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {post.tags.map((t, i) => (
                          <span key={i} style={{ fontSize: "0.78rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Action Bar */}
                      <div
                        style={{
                          borderTop: "1px solid #2E3340",
                          paddingTop: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <button
                            onClick={() => onToggleLikePost(post.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "transparent",
                              border: "none",
                              color: post.isLiked ? "#FFA500" : "#9E9E9E",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            <Heart size={18} fill={post.isLiked ? "#f43f5e" : "none"} />
                            <span>{post.likes}</span>
                          </button>

                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "transparent",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            <MessageSquare size={18} />
                            <span>{post.commentsCount}</span>
                          </button>

                          <button
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              background: "transparent",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Share2 size={16} />
                            <span>{post.shares}</span>
                          </button>
                        </div>

                        {/* Right: Embedded CTA & Instagram-style Save Button */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {post.actionButton && (
                            <button
                              onClick={() => {
                                if (post.actionButton?.type === "apply") {
                                  const casting = OPEN_CASTINGS.find((c) => c.id === post.actionButton?.targetId) || OPEN_CASTINGS[0];
                                  onOpenAuditionModal(casting);
                                } else if (post.actionButton?.type === "view_reel") {
                                  const talent = FEATURED_TALENT.find((t) => t.id === post.actionButton?.targetId) || FEATURED_TALENT[1];
                                  onOpenShowreelModal(talent);
                                } else if (post.actionButton?.type === "request_pitch") {
                                  const pitch = PITCH_DECKS.find((p) => p.id === post.actionButton?.targetId) || PITCH_DECKS[0];
                                  onOpenPitchModal(pitch);
                                }
                              }}
                              className="btn-primary"
                              style={{ fontSize: "0.85rem", padding: "6px 16px" }}
                            >
                              {post.actionButton.label}
                            </button>
                          )}

                          {/* Instagram Save / Bookmark Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleSavePost(post.id)}
                            title={savedPostIds.includes(post.id) ? "Saved to collection" : "Save post"}
                            style={{
                              background: savedPostIds.includes(post.id) ? "rgba(255, 152, 0, 0.18)" : "transparent",
                              border: savedPostIds.includes(post.id) ? "1px solid rgba(255, 152, 0, 0.45)" : "none",
                              borderRadius: "8px",
                              padding: "6px 8px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                            }}
                          >
                            <Bookmark
                              size={18}
                              color={savedPostIds.includes(post.id) ? "#FF9800" : "var(--text-muted)"}
                              fill={savedPostIds.includes(post.id) ? "#FF9800" : "none"}
                              strokeWidth={savedPostIds.includes(post.id) ? 2.5 : 2}
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {/* ===================== VIEW: CASTINGS ===================== */}
            {activeNav === "castings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                      Audition & Casting Board
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Live casting calls matching acting, camera, and department crafts
                    </span>
                  </div>
                  <span className="badge badge-emerald">{OPEN_CASTINGS.length} Active Production Calls</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  {OPEN_CASTINGS.map((casting) => (
                    <div
                      key={casting.id}
                      className="glass-panel hover-lift"
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        border: casting.isUrgent ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="badge badge-gold">{casting.projectType}</span>
                          <span className="badge badge-cyan">{casting.craft}</span>
                          {casting.isUrgent && (
                            <span className="badge badge-rose" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span className="live-dot" /> Urgent Notice
                            </span>
                          )}
                        </div>

                        {casting.matchScore && (
                          <span className="badge badge-emerald">
                            ⚡ {casting.matchScore}% AI Profile Match
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                          {casting.title}
                        </h3>
                        <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                          {casting.productionHouse} {casting.director ? `• Dir. ${casting.director}` : ""}
                        </span>
                      </div>

                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                        {casting.characterDescription}
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                          gap: "8px",
                          background: "rgba(0,0,0,0.3)",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                        }}
                      >
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Location</span>
                          <span style={{ color: "#fff", fontWeight: 600 }}>{casting.location}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Compensation</span>
                          <span style={{ color: "#34d399", fontWeight: 700 }}>{casting.payRange}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Shoot Dates</span>
                          <span style={{ color: "#fff", fontWeight: 600 }}>{casting.shootDates}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)", display: "block" }}>Deadline</span>
                          <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>{casting.deadline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================== VIEW: TALENT DIRECTORY ===================== */}
            {activeNav === "talent" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                      Creative Talent Directory
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Verified actors, cinematographers, sound mixers, and editors
                    </span>
                  </div>
                  <span className="badge badge-cyan">{FEATURED_TALENT.length} Featured Creators</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {FEATURED_TALENT.map((talent) => (
                    <div
                      key={talent.id}
                      className="glass-panel hover-lift"
                      style={{
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={talent.avatar}
                          alt={talent.name}
                          style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-gold)" }}
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>{talent.name}</h4>
                            {talent.verified && <CheckCircle2 size={14} color="var(--accent-gold)" />}
                          </div>
                          <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)" }}>{talent.craft}</span>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {talent.city}, {talent.country}
                          </span>
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {talent.bio}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {talent.creditsCount} Credits
                        </span>
                        <button
                          onClick={() => onOpenShowreelModal(talent)}
                          className="btn-secondary"
                          style={{ fontSize: "0.8rem", padding: "5px 12px" }}
                        >
                          <Play size={12} fill="var(--accent-gold)" color="var(--accent-gold)" /> Showreel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================== VIEW: PITCHES ===================== */}
            {activeNav === "pitches" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                      Curated Screenplay & Pitch Vault
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Protected by Forensic Dynamic Watermarking & Digital NDA
                    </span>
                  </div>
                  <span className="badge badge-purple">{PITCH_DECKS.length} Protected Scripts</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
                  {PITCH_DECKS.map((pitch) => (
                    <div
                      key={pitch.id}
                      className="glass-panel hover-lift"
                      style={{
                        padding: "20px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <span className="badge badge-purple">{pitch.format}</span>
                          <span className="badge badge-gold">{pitch.status}</span>
                        </div>
                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-gold)" }}>
                          Budget: {pitch.estimatedBudget}
                        </span>
                      </div>

                      <div>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{pitch.title}</h3>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Screenplay by {pitch.writer}</span>
                      </div>

                      <p style={{ fontStyle: "italic", color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5 }}>
                        "{pitch.logline}"
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Lock size={12} color="var(--accent-gold)" /> NDA & Watermark Protected
                        </span>
                        <button
                          onClick={() => onOpenPitchModal(pitch)}
                          className="btn-primary"
                          style={{ fontSize: "0.85rem", padding: "6px 16px" }}
                        >
                          Review Pitch Deck 📜
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================== VIEW: PIPELINE ===================== */}
            {activeNav === "pipeline" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
                      Active Audition Application Pipeline
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Real-time stage tracking for submissions to casting directors
                    </span>
                  </div>
                  <span className="badge badge-emerald">{pipelineItems.length} Active Submissions</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {pipelineItems.map((item) => (
                    <div
                      key={item.id}
                      className="glass-panel"
                      style={{
                        padding: "24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <div>
                          <span className="badge badge-gold" style={{ marginBottom: "6px" }}>
                            {item.stage}
                          </span>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                            {item.projectTitle}
                          </h3>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            Role: <strong>{item.roleTitle}</strong> • {item.productionHouse}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                          Applied: {item.appliedDate}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "6px", color: "var(--text-muted)" }}>
                          <span>Application Submitted</span>
                          <span>Casting Review</span>
                          <span>Tape Shortlist</span>
                          <span style={{ color: item.progressPercent >= 75 ? "var(--accent-gold)" : "inherit" }}>Callback Scheduled</span>
                        </div>
                        <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                          <div
                            style={{
                              width: `${item.progressPercent}%`,
                              height: "100%",
                              background: "linear-gradient(90deg, #10b981 0%, #f59e0b 100%)",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      </div>

                      {/* Next Step Box */}
                      <div
                        style={{
                          background: "rgba(245, 158, 11, 0.08)",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            NEXT MILESTONE
                          </span>
                          <span style={{ fontSize: "0.88rem", color: "#fff" }}>{item.nextStepNote}</span>
                        </div>

                        {item.meetingLink && (
                          <a
                            href={item.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ fontSize: "0.85rem", padding: "6px 14px", textDecoration: "none" }}
                          >
                            <Calendar size={14} /> Join Studio Meeting (Oct 24)
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ===================== RIGHT SIDEBAR ===================== */}
          <aside style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* AI Recommendation Widget */}
            <div
              className="glass-panel"
              style={{
                padding: "20px",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Sparkles size={18} color="var(--accent-gold)" />
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                  AI Casting Matches (pgvector)
                </h4>
              </div>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: "14px" }}>
                Top vector-ranked roles matching your dialect, age, and dramatic monologue reel:
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {OPEN_CASTINGS.slice(0, 2).map((call) => (
                  <div
                    key={call.id}
                    onClick={() => onOpenAuditionModal(call)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span className="badge badge-emerald" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>
                        ⚡ {call.matchScore}% Match
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>{call.payRange}</span>
                    </div>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", display: "block" }}>
                      {call.title}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {call.productionHouse} • {call.location}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Callbacks / Studio Calendar */}
            <div
              style={{
                background: "#1A1C23",
                border: "1px solid #2E3340",
                borderRadius: "var(--radius-lg)",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Calendar size={18} color="#FFA500" />
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                  Scheduled Screen Tests
                </h4>
              </div>

              <div
                style={{
                  background: "rgba(255, 165, 0, 0.08)",
                  border: "1px solid rgba(255, 165, 0, 0.25)",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "#FFA500", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                  OCT 24, 2026 • 03:00 PM IST
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF", display: "block", marginTop: "2px" }}>
                  Director Chemistry Read
                </span>
                <span style={{ fontSize: "0.78rem", color: "#9E9E9E", display: "block" }}>
                  Netflix Original 'Shadow of Verity'
                </span>
                <a
                  href="https://meet.google.com/cin-dhar-vkm"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.78rem",
                    color: "#FFA500",
                    marginTop: "6px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Launch Video Call <ArrowUpRight size={12} />
                </a>
              </div>
            </div>

            {/* Trending Film Gigs */}
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <TrendingUp size={18} color="var(--accent-emerald)" />
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                  Trending Industry Gigs
                </h4>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Chief AC (Arri Alexa 35)</span>
                  <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>Jaipur, 1940s Epic</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Stunt Rigging Coordinator</span>
                  <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>Hyderabad, Actioner</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Dolby Atmos Foley Recordist</span>
                  <span style={{ color: "var(--accent-gold)", fontWeight: 600 }}>Mumbai, Sound Lab</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
