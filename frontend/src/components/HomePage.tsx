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
  Film,
  Volume2,
  VolumeX,
  Pause,
  X,
  Music,
  ChevronLeft,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Flag,
  EyeOff,
} from "lucide-react";
import {
  FEATURED_TALENT,
  OPEN_CASTINGS,
  PITCH_DECKS,
  HOME_FEED_POSTS,
  MY_APPLICATIONS,
  CINE_REELS,
  CineReelItem,
  FeedPost,
  CastingCall,
  TalentItem,
  PitchDeck,
  ApplicationPipelineItem,
} from "@/lib/mockData";
import CineStoriesSection from "@/components/CineStoriesSection";
import FeedVideoPlayer from "@/components/FeedVideoPlayer";
import InstagramCommentsModal, { CineCommentItem } from "@/components/InstagramCommentsModal";
import PostActionMenu from "@/components/PostActionMenu";

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
  const [activeNav, setActiveNav] = useState<"feed" | "reels" | "castings" | "talent" | "pitches" | "pipeline">("feed");
  const [feedFilter, setFeedFilter] = useState<"all" | "casting" | "showreel" | "pitch" | "bts">("all");
  const [userRole, setUserRole] = useState<"talent" | "producer">("talent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cinema Reels State
  const [selectedReel, setSelectedReel] = useState<CineReelItem | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [reelLikes, setReelLikes] = useState<Record<string, boolean>>({});
  const [reelCounts, setReelCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    CINE_REELS.forEach((r) => {
      counts[r.id] = r.likes;
    });
    return counts;
  });

  const handleToggleReelLike = (reelId: string) => {
    setReelLikes((prev) => {
      const isLiked = !prev[reelId];
      setReelCounts((cp) => ({
        ...cp,
        [reelId]: (cp[reelId] || 0) + (isLiked ? 1 : -1),
      }));
      return { ...prev, [reelId]: isLiked };
    });
  };

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

  // 3-Dots Menu & Feed Tuning State (Interested, Not Interested, Report)
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);

  // Instagram Comments Modal State & Data
  const [activeCommentsItem, setActiveCommentsItem] = useState<{
    id: string;
    author: {
      name: string;
      avatar: string;
      craft?: string;
      verified?: boolean;
    };
    content: string;
    commentsCount: number;
  } | null>(null);

  const [postCommentsMap, setPostCommentsMap] = useState<Record<string, CineCommentItem[]>>({
    "feed-1": [
      { id: "pc-1", user: "Vikramaditya Motwane", craft: "Director / Showrunner", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", text: "Brilliant character breakdown. Sent this to 2 talented actors from our workshop.", time: "12m ago", likes: 14, verified: true },
      { id: "pc-2", user: "Manoj Bajpayee Fanclub", craft: "Cinephile", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", text: "Whoever lands Vikram has some serious shoes to fill! Excited for this series 🔥", time: "25m ago", likes: 8 },
      { id: "pc-3", user: "Ananya Roy", craft: "Cinematographer", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Looking forward to seeing who heads the camera department on this one!", time: "1h ago", likes: 5, verified: true },
    ],
    "feed-2": [
      { id: "pc-4", user: "Sudeep Chatterjee, ISC", craft: "Cinematographer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80", text: "The sodium vapor roll-off on the wet cobblestones is pure poetry Aanya! Fantastic test.", time: "45m ago", likes: 29, verified: true },
      { id: "pc-5", user: "Zoya Akhtar", craft: "Director", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80", text: "Gorgeous tones. Would love to test these anamorphic primes on our next night sequence.", time: "1h ago", likes: 42, verified: true },
    ],
    "feed-3": [
      { id: "pc-6", user: "Dharma Productions", craft: "Studio", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80", text: "Our creative team has requested the pitch deck. Connecting via CineConnect DMs.", time: "2h ago", likes: 19, verified: true },
    ],
    "feed-4": [
      { id: "pc-7", user: "Kabir Mehra", craft: "Actor", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80", text: "Such an unforgettable schedule in Manali! Proud to be part of this ensemble 🏔️🎬", time: "3h ago", likes: 37, verified: true },
    ],
    "reel-1": [
      { id: "rc-1", user: "Anurag Kashyap", craft: "Director", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80", text: "Kabir's intensity in this monologue is spine-chilling. That eye twitch at 0:42 was purely intuitive.", time: "20m ago", likes: 88, verified: true },
      { id: "rc-2", user: "Nawazuddin Siddiqui", craft: "Actor", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", text: "Very honest pauses. Keep honing this craft brother! 👏", time: "1h ago", likes: 52, verified: true },
    ],
    "reel-2": [
      { id: "rc-3", user: "Rajeev Ravi (ISC)", craft: "Cinematographer", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80", text: "The Cooke flare roll-off in the rain is masterclass material! 🎥", time: "35m ago", likes: 34, verified: true },
    ],
    "reel-3": [
      { id: "rc-4", user: "Sham Kaushal", craft: "Action Director", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80", text: "Clean landing! The wire work was so well concealed. Great stunt coordination! 💥", time: "15m ago", likes: 45, verified: true },
    ],
  });

  const [postCommentCounts, setPostCommentCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    HOME_FEED_POSTS.forEach((p) => {
      counts[p.id] = p.commentsCount;
    });
    CINE_REELS.forEach((r) => {
      counts[r.id] = r.commentsCount;
    });
    return counts;
  });

  const handlePostInterested = (id: string) => {
    setOpenMenuPostId(null);
    setToastMessage("⭐ Marked as Interested! We'll show you more content like this in your feed.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePostNotInterested = (id: string) => {
    setOpenMenuPostId(null);
    setHiddenPostIds((prev) => [...prev, id]);
    setToastMessage("Feed tuned: Post hidden. You'll see fewer posts like this.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUndoHide = (id: string) => {
    setHiddenPostIds((prev) => prev.filter((item) => item !== id));
    setToastMessage("Post restored to your feed.");
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePostReport = (id: string) => {
    setOpenMenuPostId(null);
    setToastMessage("🚩 Report submitted for review. Thank you for keeping CineConnect safe!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenComments = (item: {
    id: string;
    author: { name: string; avatar: string; craft?: string; verified?: boolean };
    content: string;
    commentsCount: number;
  }) => {
    setActiveCommentsItem(item);
  };

  const handleAddComment = (targetId: string, text: string) => {
    const newComment: CineCommentItem = {
      id: "cmt-" + Date.now(),
      user: "Kabir Mehra",
      craft: "Method Actor",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      text,
      time: "Just now",
      likes: 0,
      isLiked: false,
      verified: true,
    };

    setPostCommentsMap((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []), newComment],
    }));

    setPostCommentCounts((prev) => ({
      ...prev,
      [targetId]: (prev[targetId] || 0) + 1,
    }));

    setToastMessage("💬 Comment posted successfully!");
    setTimeout(() => setToastMessage(null), 2500);
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
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80"
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
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
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

                {/* Cinema Reels Spotlight Section */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #1A1C23 0%, #12141A 100%)",
                    border: "1px solid #2E3340",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle cinema flare */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "10%",
                      width: "180px",
                      height: "80px",
                      background: "radial-gradient(ellipse, rgba(255, 165, 0, 0.15) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#0D0E12",
                          boxShadow: "0 2px 10px rgba(255, 165, 0, 0.4)",
                        }}
                      >
                        <Film size={20} />
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                            Cinema Reels & Showreel Shorts
                          </h3>
                          <span
                            style={{
                              background: "rgba(255, 165, 0, 0.18)",
                              color: "#FFA500",
                              border: "1px solid rgba(255, 165, 0, 0.35)",
                              padding: "2px 8px",
                              borderRadius: "9999px",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            ⚡ Trending
                          </span>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>
                          Vertical cinematography tests, audition monologues & action choreo
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveNav("reels")}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#FFA500",
                        padding: "6px 14px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      Browse Reel Vault <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Horizontal Scrollable Reel Cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {CINE_REELS.map((reel) => {
                      const isLiked = reelLikes[reel.id] || false;
                      const likes = reelCounts[reel.id] || reel.likes;
                      return (
                        <div
                          key={reel.id}
                          onClick={() => setSelectedReel(reel)}
                          style={{
                            position: "relative",
                            aspectRatio: "9 / 14",
                            borderRadius: "14px",
                            overflow: "hidden",
                            cursor: "pointer",
                            background: "#0D0E12",
                            border: "1px solid #2E3340",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                            transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.borderColor = "#FFA500";
                            e.currentTarget.style.boxShadow = "0 8px 24px rgba(255, 165, 0, 0.25)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.borderColor = "#2E3340";
                            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4)";
                          }}
                        >
                          {/* Looping Background Video for Live Motion */}
                          <video
                            src={reel.videoUrl}
                            poster={reel.thumbnailUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                          />

                          {/* Gradient Overlays */}
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(0,0,0,0.88) 100%)",
                            }}
                          />

                          {/* Category Badge Top */}
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              right: "10px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                background: "rgba(0, 0, 0, 0.65)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                color: "#FFA500",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              {reel.category}
                            </span>
                            <span
                              style={{
                                background: "rgba(0,0,0,0.6)",
                                color: "#FFFFFF",
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                padding: "2px 6px",
                                borderRadius: "4px",
                              }}
                            >
                              9:16 HD
                            </span>
                          </div>

                          {/* Center Play Icon Hover Target */}
                          <div
                            style={{
                              position: "absolute",
                              top: "42%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              background: "rgba(255, 165, 0, 0.9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#0D0E12",
                              boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
                            }}
                          >
                            <Play size={20} fill="#0D0E12" style={{ marginLeft: "2px" }} />
                          </div>

                          {/* Bottom Info Bar */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              left: "10px",
                              right: "10px",
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            {/* Creator */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <img
                                src={reel.creator.avatar}
                                alt={reel.creator.name}
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1.5px solid #FFA500",
                                }}
                              />
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  color: "#FFFFFF",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {reel.creator.name}
                              </span>
                              {reel.creator.verified && <CheckCircle2 size={12} color="#FFA500" />}
                            </div>

                            {/* Title */}
                            <p
                              style={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "#FFFFFF",
                                margin: 0,
                                lineHeight: 1.25,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {reel.title}
                            </p>

                            {/* Audio track & likes footer */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: "2px",
                                paddingTop: "4px",
                                borderTop: "1px solid rgba(255,255,255,0.12)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  color: "#9E9E9E",
                                  fontSize: "0.7rem",
                                  maxWidth: "65%",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                <Music size={11} color="#FFA500" />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{reel.soundTrack}</span>
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleReelLike(reel.id);
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  padding: 0,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "3px",
                                  color: isLiked ? "#FF3B5C" : "#FFFFFF",
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                }}
                              >
                                <Heart
                                  size={13}
                                  fill={isLiked ? "#FF3B5C" : "none"}
                                  color={isLiked ? "#FF3B5C" : "#FFFFFF"}
                                />
                                {likes}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feed Posts List Interspersed with Reels */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {displayedPosts.map((post, postIndex) => (
                    <React.Fragment key={post.id}>
                      {hiddenPostIds.includes(post.id) ? (
                        <div
                          style={{
                            background: "#12141A",
                            border: "1px dashed #2E3340",
                            borderRadius: "var(--radius-lg)",
                            padding: "16px 22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "#9E9E9E",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <EyeOff size={18} color="#9E9E9E" />
                            <span style={{ fontSize: "0.85rem", color: "#9E9E9E" }}>
                              Post hidden • You'll see fewer posts like this.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUndoHide(post.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#FFA500",
                              fontWeight: 700,
                              fontSize: "0.82rem",
                              cursor: "pointer",
                              padding: "4px 8px",
                            }}
                          >
                            Undo
                          </button>
                        </div>
                      ) : (
                        <article
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

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

                              {/* 3-Dots Menu with Interested, Not Interested, Report */}
                              <PostActionMenu
                                itemId={post.id}
                                isOpen={openMenuPostId === post.id}
                                onToggle={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                                onInterested={handlePostInterested}
                                onNotInterested={handlePostNotInterested}
                                onReport={handlePostReport}
                              />
                            </div>
                          </div>

                          {/* Content Body */}
                          <p style={{ color: "#FFFFFF", fontSize: "0.95rem", lineHeight: 1.6 }}>
                            {post.content}
                          </p>

                          {/* Media Image / Video with Background Autoplay & Missing-Media Auto-Fill */}
                          {(() => {
                            const fallbackVideos: Record<string, string> = {
                              "feed-1": "/reels/reel1.mp4",
                              "feed-2": "/reels/reel2.mp4",
                              "feed-3": "/reels/reel4.mp4",
                              "feed-4": "/reels/reel3.mp4",
                              "feed-5": "/reels/reel1.mp4",
                              "feed-6": "/reels/reel2.mp4",
                            };
                            const mediaUrl = post.mediaUrl || fallbackVideos[post.id] || "/reels/reel1.mp4";
                            const isVideo = post.mediaType === "video" || mediaUrl.endsWith(".mp4");

                            return isVideo ? (
                              <FeedVideoPlayer
                                src={mediaUrl}
                                poster="https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1000&auto=format&fit=crop&q=80"
                                title={post.author.name}
                                aspectRatio="16 / 9"
                                maxHeight="440px"
                              />
                            ) : (
                              <div
                                style={{
                                  borderRadius: "14px",
                                  overflow: "hidden",
                                  width: "100%",
                                  minHeight: "300px",
                                  maxHeight: "440px",
                                  position: "relative",
                                  border: "1px solid #2E3340",
                                  background: "#07090E",
                                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                                }}
                              >
                                <img
                                  src={mediaUrl}
                                  alt={post.author.name}
                                  style={{ width: "100%", height: "100%", minHeight: "300px", objectFit: "cover", display: "block" }}
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80";
                                  }}
                                />
                              </div>
                            );
                          })()}

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

                              {/* Instagram Comment Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenComments({
                                    id: post.id,
                                    author: post.author,
                                    content: post.content,
                                    commentsCount: postCommentCounts[post.id] || post.commentsCount,
                                  })
                                }
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
                                  transition: "color 0.15s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFA500")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                              >
                                <MessageSquare size={18} />
                                <span>{postCommentCounts[post.id] || post.commentsCount}</span>
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
                      )}

                    {/* IN-FEED REEL 1: Spotlight Drama Reel right after 1st post */}
                    {postIndex === 0 && CINE_REELS[0] && (() => {
                      const reel = CINE_REELS[0];
                      const isLiked = reelLikes[reel.id] || false;
                      const likes = reelCounts[reel.id] || reel.likes;
                      const isHidden = hiddenPostIds.includes(reel.id);

                      if (isHidden) {
                        return (
                          <div
                            key={`infeed-reel-${reel.id}`}
                            style={{
                              background: "#12141A",
                              border: "1px dashed #2E3340",
                              borderRadius: "var(--radius-lg)",
                              padding: "16px 22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              color: "#9E9E9E",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <EyeOff size={18} color="#9E9E9E" />
                              <span style={{ fontSize: "0.85rem", color: "#9E9E9E" }}>
                                Reel hidden • You'll see fewer reels like this.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUndoHide(reel.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#FFA500",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                padding: "4px 8px",
                              }}
                            >
                              Undo
                            </button>
                          </div>
                        );
                      }

                      return (
                        <article
                          key={`infeed-reel-${reel.id}`}
                          style={{
                            background: "linear-gradient(180deg, #1C1E27 0%, #14161E 100%)",
                            border: "1px solid rgba(255, 165, 0, 0.4)",
                            borderRadius: "var(--radius-lg)",
                            padding: "24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            boxShadow: "0 6px 24px rgba(255, 165, 0, 0.12), 0 4px 20px rgba(0, 0, 0, 0.35)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Header */}
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img
                                src={reel.creator.avatar}
                                alt={reel.creator.name}
                                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FFA500" }}
                              />
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{reel.creator.name}</h4>
                                  {reel.creator.verified && <CheckCircle2 size={15} color="#FFA500" />}
                                  <span
                                    style={{
                                      background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                                      color: "#0D0E12",
                                      fontSize: "0.68rem",
                                      fontWeight: 800,
                                      padding: "2px 8px",
                                      borderRadius: "9999px",
                                      letterSpacing: "0.04em",
                                      textTransform: "uppercase",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    🎬 Trending Reel
                                  </span>
                                </div>
                                <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>
                                  {reel.creator.craft} • Verified Self-Tape Showcase
                                </span>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button
                                type="button"
                                onClick={() => handleToggleFollow(reel.creator.name)}
                                style={{
                                  background: followedAuthors.includes(reel.creator.name)
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "#FFA500",
                                  color: followedAuthors.includes(reel.creator.name) ? "#E2E8F0" : "#0D0E12",
                                  border: followedAuthors.includes(reel.creator.name)
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
                                }}
                              >
                                {followedAuthors.includes(reel.creator.name) ? "Following" : "Follow"}
                              </button>

                              {/* 3-Dots Menu with Interested, Not Interested, Report */}
                              <PostActionMenu
                                itemId={reel.id}
                                isOpen={openMenuPostId === reel.id}
                                onToggle={() => setOpenMenuPostId(openMenuPostId === reel.id ? null : reel.id)}
                                onInterested={handlePostInterested}
                                onNotInterested={handlePostNotInterested}
                                onReport={handlePostReport}
                              />
                            </div>
                          </div>

                          {/* Reel Title & Description */}
                          <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                              {reel.title}
                            </h3>
                            <p style={{ color: "#E2E8F0", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                              {reel.description}
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", background: "rgba(255, 165, 0, 0.12)", border: "1px solid rgba(255, 165, 0, 0.25)", padding: "4px 10px", borderRadius: "9999px", color: "#FFA500", fontSize: "0.75rem", fontWeight: 600 }}>
                              <Music size={12} />
                              <span>{reel.soundTrack}</span>
                            </div>
                          </div>

                          {/* Cinematic Video Player with Scroll Autoplay */}
                          <FeedVideoPlayer
                            src={reel.videoUrl}
                            poster={reel.thumbnailUrl}
                            title={reel.title}
                            soundTrack={reel.soundTrack}
                            aspectRatio="16 / 9"
                            maxHeight="420px"
                            onOpenFullscreen={() => setSelectedReel(reel)}
                          />

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
                                type="button"
                                onClick={() => handleToggleReelLike(reel.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  background: "transparent",
                                  border: "none",
                                  color: isLiked ? "#FF3B5C" : "#9E9E9E",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                <Heart size={18} fill={isLiked ? "#FF3B5C" : "none"} color={isLiked ? "#FF3B5C" : "#9E9E9E"} />
                                <span>{likes}</span>
                              </button>

                              {/* Instagram Comment Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenComments({
                                    id: reel.id,
                                    author: reel.creator,
                                    content: `${reel.title} — ${reel.description}`,
                                    commentsCount: postCommentCounts[reel.id] || reel.commentsCount,
                                  })
                                }
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
                                  transition: "color 0.15s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFA500")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                              >
                                <MessageSquare size={18} />
                                <span>{postCommentCounts[reel.id] || reel.commentsCount}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(window.location.origin + "#reel-" + reel.id);
                                    setToastMessage("Reel link copied! 📋");
                                    setTimeout(() => setToastMessage(null), 2000);
                                  }
                                }}
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
                                <Share2 size={16} />
                                <span>{reel.shares}</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedReel(reel)}
                              style={{
                                background: "linear-gradient(135deg, rgba(255, 165, 0, 0.22) 0%, rgba(255, 133, 0, 0.1) 100%)",
                                border: "1px solid rgba(255, 165, 0, 0.45)",
                                color: "#FFA500",
                                padding: "6px 16px",
                                borderRadius: "8px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Film size={14} /> Play Video Reel
                            </button>
                          </div>
                        </article>
                      );
                    })()}

                    {/* IN-FEED REEL 2: Horizontal Trending Reels Carousel Strip after 2nd post */}
                    {postIndex === 1 && (
                      <div
                        key="infeed-trending-reels-strip"
                        style={{
                          background: "#161822",
                          border: "1px solid #2E3340",
                          borderRadius: "var(--radius-lg)",
                          padding: "20px 22px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "14px",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#0D0E12",
                              }}
                            >
                              <Film size={17} />
                            </div>
                            <div>
                              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                                Cinema Reels For You
                              </h4>
                              <span style={{ fontSize: "0.76rem", color: "#9E9E9E" }}>
                                Swipe through audition monologues, camera tests & fight choreography
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveNav("reels")}
                            style={{
                              background: "rgba(255, 255, 255, 0.06)",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              color: "#FFA500",
                              padding: "4px 12px",
                              borderRadius: "var(--radius-full)",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            Explore Vault <ChevronRight size={13} />
                          </button>
                        </div>

                        {/* 4 Cards Grid */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "12px",
                          }}
                        >
                          {CINE_REELS.map((reel) => {
                            const isLiked = reelLikes[reel.id] || false;
                            const likes = reelCounts[reel.id] || reel.likes;
                            return (
                              <div
                                key={`strip-${reel.id}`}
                                onClick={() => setSelectedReel(reel)}
                                style={{
                                  position: "relative",
                                  aspectRatio: "9 / 14",
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  cursor: "pointer",
                                  background: "#0D0E12",
                                  border: "1px solid #2E3340",
                                  transition: "transform 0.2s ease, border-color 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "translateY(-4px)";
                                  e.currentTarget.style.borderColor = "#FFA500";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "translateY(0)";
                                  e.currentTarget.style.borderColor = "#2E3340";
                                }}
                              >
                                <video
                                  src={reel.videoUrl}
                                  poster={reel.thumbnailUrl}
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    inset: 0,
                                    background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.85) 100%)",
                                  }}
                                />

                                <div
                                  style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    background: "rgba(255, 165, 0, 0.9)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#0D0E12",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.6)",
                                  }}
                                >
                                  <Play size={16} fill="#0D0E12" style={{ marginLeft: "2px" }} />
                                </div>

                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: "8px",
                                    left: "8px",
                                    right: "8px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "2px",
                                  }}
                                >
                                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {reel.creator.name}
                                  </span>
                                  <span style={{ fontSize: "0.68rem", color: "#FFA500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {reel.category}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* IN-FEED REEL 3: Stunts / Cinematography Action Reel after 3rd post */}
                    {postIndex === 2 && CINE_REELS[2] && (() => {
                      const reel = CINE_REELS[2];
                      const isLiked = reelLikes[reel.id] || false;
                      const likes = reelCounts[reel.id] || reel.likes;
                      const isHidden = hiddenPostIds.includes(reel.id);

                      if (isHidden) {
                        return (
                          <div
                            key={`infeed-reel-${reel.id}`}
                            style={{
                              background: "#12141A",
                              border: "1px dashed #2E3340",
                              borderRadius: "var(--radius-lg)",
                              padding: "16px 22px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              color: "#9E9E9E",
                              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <EyeOff size={18} color="#9E9E9E" />
                              <span style={{ fontSize: "0.85rem", color: "#9E9E9E" }}>
                                Reel hidden • You'll see fewer reels like this.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUndoHide(reel.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#FFA500",
                                fontWeight: 700,
                                fontSize: "0.82rem",
                                cursor: "pointer",
                                padding: "4px 8px",
                              }}
                            >
                              Undo
                            </button>
                          </div>
                        );
                      }

                      return (
                        <article
                          key={`infeed-reel-${reel.id}`}
                          style={{
                            background: "linear-gradient(180deg, #1C1E27 0%, #14161E 100%)",
                            border: "1px solid rgba(255, 165, 0, 0.4)",
                            borderRadius: "var(--radius-lg)",
                            padding: "24px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "16px",
                            boxShadow: "0 6px 24px rgba(255, 165, 0, 0.12), 0 4px 20px rgba(0, 0, 0, 0.35)",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <img
                                src={reel.creator.avatar}
                                alt={reel.creator.name}
                                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FFA500" }}
                              />
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>{reel.creator.name}</h4>
                                  {reel.creator.verified && <CheckCircle2 size={15} color="#FFA500" />}
                                  <span
                                    style={{
                                      background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                                      color: "#0D0E12",
                                      fontSize: "0.68rem",
                                      fontWeight: 800,
                                      padding: "2px 8px",
                                      borderRadius: "9999px",
                                      letterSpacing: "0.04em",
                                      textTransform: "uppercase",
                                      marginLeft: "4px",
                                    }}
                                  >
                                    ⚡ Stunt Showcase Reel
                                  </span>
                                </div>
                                <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>
                                  {reel.creator.craft} • Action Directors Guild
                                </span>
                              </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <button
                                type="button"
                                onClick={() => handleToggleFollow(reel.creator.name)}
                                style={{
                                  background: followedAuthors.includes(reel.creator.name)
                                    ? "rgba(255, 255, 255, 0.08)"
                                    : "#FFA500",
                                  color: followedAuthors.includes(reel.creator.name) ? "#E2E8F0" : "#0D0E12",
                                  border: followedAuthors.includes(reel.creator.name)
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
                                }}
                              >
                                {followedAuthors.includes(reel.creator.name) ? "Following" : "Follow"}
                              </button>

                              {/* 3-Dots Menu with Interested, Not Interested, Report */}
                              <PostActionMenu
                                itemId={reel.id}
                                isOpen={openMenuPostId === reel.id}
                                onToggle={() => setOpenMenuPostId(openMenuPostId === reel.id ? null : reel.id)}
                                onInterested={handlePostInterested}
                                onNotInterested={handlePostNotInterested}
                                onReport={handlePostReport}
                              />
                            </div>
                          </div>

                          <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                              {reel.title}
                            </h3>
                            <p style={{ color: "#E2E8F0", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
                              {reel.description}
                            </p>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "10px", background: "rgba(255, 165, 0, 0.12)", border: "1px solid rgba(255, 165, 0, 0.25)", padding: "4px 10px", borderRadius: "9999px", color: "#FFA500", fontSize: "0.75rem", fontWeight: 600 }}>
                              <Music size={12} />
                              <span>{reel.soundTrack}</span>
                            </div>
                          </div>

                          {/* Cinematic Video Player with Scroll Autoplay */}
                          <FeedVideoPlayer
                            src={reel.videoUrl}
                            poster={reel.thumbnailUrl}
                            title={reel.title}
                            soundTrack={reel.soundTrack}
                            aspectRatio="16 / 9"
                            maxHeight="420px"
                            onOpenFullscreen={() => setSelectedReel(reel)}
                          />

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
                                type="button"
                                onClick={() => handleToggleReelLike(reel.id)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  background: "transparent",
                                  border: "none",
                                  color: isLiked ? "#FF3B5C" : "#9E9E9E",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                <Heart size={18} fill={isLiked ? "#FF3B5C" : "none"} color={isLiked ? "#FF3B5C" : "#9E9E9E"} />
                                <span>{likes}</span>
                              </button>

                              {/* Instagram Comment Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenComments({
                                    id: reel.id,
                                    author: reel.creator,
                                    content: `${reel.title} — ${reel.description}`,
                                    commentsCount: postCommentCounts[reel.id] || reel.commentsCount,
                                  })
                                }
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
                                  transition: "color 0.15s ease",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFA500")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                              >
                                <MessageSquare size={18} />
                                <span>{postCommentCounts[reel.id] || reel.commentsCount}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (navigator.clipboard) {
                                    navigator.clipboard.writeText(window.location.origin + "#reel-" + reel.id);
                                    setToastMessage("Reel link copied! 📋");
                                    setTimeout(() => setToastMessage(null), 2000);
                                  }
                                }}
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
                                <Share2 size={16} />
                                <span>{reel.shares}</span>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedReel(reel)}
                              style={{
                                background: "linear-gradient(135deg, rgba(255, 165, 0, 0.22) 0%, rgba(255, 133, 0, 0.1) 100%)",
                                border: "1px solid rgba(255, 165, 0, 0.45)",
                                color: "#FFA500",
                                padding: "6px 16px",
                                borderRadius: "8px",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Film size={14} /> Play Video Reel
                            </button>
                          </div>
                        </article>
                      );
                    })()}
                  </React.Fragment>
                ))}
              </div>
              </>
            )}

            {/* ===================== VIEW: CINEMA REELS ===================== */}
            {activeNav === "reels" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                {/* Reels Header Banner */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #1A1C23 0%, #202430 100%)",
                    border: "1px solid #2E3340",
                    borderRadius: "var(--radius-lg)",
                    padding: "24px 28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: "-20px",
                      top: "-20px",
                      width: "160px",
                      height: "160px",
                      background: "radial-gradient(circle, rgba(255, 165, 0, 0.14) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div style={{ zIndex: 1, maxWidth: "620px" }}>
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
                        🎬 Cinema Reels & Short Vault
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>{CINE_REELS.length} Production Tapes Live</span>
                    </div>
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.25,
                        margin: "0 0 6px 0",
                      }}
                    >
                      Showcase Your Craft in 9:16 Cinema
                    </h2>
                    <p style={{ color: "#9E9E9E", fontSize: "0.9rem", lineHeight: 1.5, margin: 0 }}>
                      Watch vertical audition tapes, Cooke anamorphic low-light tests, tactical stunt choreography, and spatial audio showcases.
                    </p>
                  </div>

                  <button
                    onClick={onOpenCreatePost}
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
                    }}
                  >
                    <Plus size={16} /> Upload Reel Tape
                  </button>
                </div>

                {/* Reels Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {CINE_REELS.map((reel) => {
                    const isLiked = reelLikes[reel.id] || false;
                    const likes = reelCounts[reel.id] || reel.likes;
                    return (
                      <div
                        key={reel.id}
                        style={{
                          background: "#1A1C23",
                          border: "1px solid #2E3340",
                          borderRadius: "var(--radius-lg)",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* Video Poster with aspect 9:14 */}
                        <div
                          onClick={() => setSelectedReel(reel)}
                          style={{
                            position: "relative",
                            aspectRatio: "9 / 13",
                            cursor: "pointer",
                            overflow: "hidden",
                            background: "#0D0E12",
                          }}
                        >
                          <video
                            src={reel.videoUrl}
                            poster={reel.thumbnailUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)",
                            }}
                          />
                          {/* Category Badge */}
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              left: "12px",
                              background: "rgba(0,0,0,0.7)",
                              backdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 165, 0, 0.35)",
                              color: "#FFA500",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "4px 10px",
                              borderRadius: "6px",
                            }}
                          >
                            {reel.category}
                          </div>

                          {/* Center Play Button */}
                          <div
                            style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "52px",
                              height: "52px",
                              borderRadius: "50%",
                              background: "rgba(255, 165, 0, 0.95)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#0D0E12",
                              boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                            }}
                          >
                            <Play size={24} fill="#0D0E12" style={{ marginLeft: "3px" }} />
                          </div>

                          {/* Sound track footer */}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "10px",
                              left: "12px",
                              right: "12px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              color: "#E2E8F0",
                              fontSize: "0.75rem",
                              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                            }}
                          >
                            <Music size={13} color="#FFA500" />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {reel.soundTrack}
                            </span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <img
                              src={reel.creator.avatar}
                              alt={reel.creator.name}
                              style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FFA500" }}
                            />
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                                  {reel.creator.name}
                                </h4>
                                {reel.creator.verified && <CheckCircle2 size={13} color="#FFA500" />}
                              </div>
                              <span style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>{reel.creator.craft}</span>
                            </div>
                          </div>

                          <h3 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>
                            {reel.title}
                          </h3>
                          <p style={{ fontSize: "0.82rem", color: "#9E9E9E", margin: 0, lineHeight: 1.4, flex: 1 }}>
                            {reel.description}
                          </p>

                          {/* Actions */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderTop: "1px solid #2E3340",
                              paddingTop: "10px",
                              marginTop: "4px",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleReelLike(reel.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                color: isLiked ? "#FF3B5C" : "#9E9E9E",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                              }}
                            >
                              <Heart size={16} fill={isLiked ? "#FF3B5C" : "none"} color={isLiked ? "#FF3B5C" : "#9E9E9E"} />
                              {likes}
                            </button>

                            <button
                              onClick={() => setSelectedReel(reel)}
                              style={{
                                background: "rgba(255, 165, 0, 0.12)",
                                border: "1px solid rgba(255, 165, 0, 0.35)",
                                color: "#FFA500",
                                padding: "6px 14px",
                                borderRadius: "var(--radius-md)",
                                fontSize: "0.8rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <Play size={12} fill="#FFA500" /> Watch Full Reel
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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
                      {/* Casting Media Banner Fill */}
                      <div
                        style={{
                          width: "100%",
                          height: "170px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          background: "#08090C",
                        }}
                      >
                        <img
                          src={casting.bannerUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80"}
                          alt={casting.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(180deg, transparent 40%, rgba(13, 14, 18, 0.85) 100%)",
                          }}
                        />
                      </div>

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
                      {/* Talent Cover Image Fill */}
                      <div
                        style={{
                          width: "100%",
                          height: "120px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          background: "#08090C",
                        }}
                      >
                        <img
                          src={talent.coverImage || "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1000&auto=format&fit=crop&q=80"}
                          alt={talent.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1000&auto=format&fit=crop&q=80";
                          }}
                        />
                      </div>

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
                      {/* Pitch Deck Cover Image Fill */}
                      <div
                        style={{
                          width: "100%",
                          height: "170px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          position: "relative",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          background: "#08090C",
                        }}
                      >
                        <img
                          src={pitch.coverImage || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80"}
                          alt={pitch.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(180deg, transparent 40%, rgba(13, 14, 18, 0.85) 100%)",
                          }}
                        />
                      </div>

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

      {/* ===================== FULL-SCREEN CINEMA REEL PLAYER MODAL ===================== */}
      {selectedReel && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 5, 10, 0.92)",
            backdropFilter: "blur(20px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setSelectedReel(null)}
        >
          {/* Reel Frame Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "420px",
              height: "min(88vh, 760px)",
              background: "#050608",
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(255, 165, 0, 0.35)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* HTML5 Video Player */}
            <video
              key={selectedReel.id}
              src={selectedReel.videoUrl}
              autoPlay
              loop
              playsInline
              muted={isReelMuted}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Audio Track Tag if audio exists */}
            {selectedReel.audioUrl && (
              <audio
                key={`audio-${selectedReel.id}`}
                src={selectedReel.audioUrl}
                autoPlay
                loop
                muted={isReelMuted}
              />
            )}

            {/* Top Bar Overlay */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 100%)",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    background: "rgba(255, 165, 0, 0.25)",
                    border: "1px solid rgba(255, 165, 0, 0.5)",
                    color: "#FFA500",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  🎬 Cinema Reel • 9:16
                </span>
                <span
                  style={{
                    background: "rgba(0,0,0,0.5)",
                    color: "#FFFFFF",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {selectedReel.category.toUpperCase()}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Audio Mute/Unmute */}
                <button
                  onClick={() => setIsReelMuted(!isReelMuted)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title={isReelMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isReelMuted ? <VolumeX size={18} color="#FF3B5C" /> : <Volume2 size={18} color="#FFA500" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedReel(null)}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Close Reel"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Right Side Floating Social Action Bar */}
            <div
              style={{
                position: "absolute",
                right: "14px",
                bottom: "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                zIndex: 10,
              }}
            >
              {/* Like Button */}
              <button
                onClick={() => handleToggleReelLike(selectedReel.id)}
                style={{
                  background: "rgba(0, 0, 0, 0.55)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: reelLikes[selectedReel.id] ? "#FF3B5C" : "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
              >
                <Heart
                  size={22}
                  fill={reelLikes[selectedReel.id] ? "#FF3B5C" : "none"}
                  color={reelLikes[selectedReel.id] ? "#FF3B5C" : "#FFFFFF"}
                />
              </button>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF", marginTop: "-10px", textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
                {reelCounts[selectedReel.id] || selectedReel.likes}
              </span>

              {/* Share Button */}
              <button
                onClick={() => {
                  setToastMessage("Reel link copied to clipboard! 🎬");
                  setTimeout(() => setToastMessage(null), 2500);
                }}
                style={{
                  background: "rgba(0, 0, 0, 0.55)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                }}
                title="Share Reel"
              >
                <Share2 size={20} />
              </button>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF", marginTop: "-10px", textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
                {selectedReel.shares}
              </span>

              {/* Prev / Next Reel Carousel Switchers */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                <button
                  onClick={() => {
                    const currentIndex = CINE_REELS.findIndex((r) => r.id === selectedReel.id);
                    const prevIndex = (currentIndex - 1 + CINE_REELS.length) % CINE_REELS.length;
                    setSelectedReel(CINE_REELS[prevIndex]);
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Previous Reel"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    const currentIndex = CINE_REELS.findIndex((r) => r.id === selectedReel.id);
                    const nextIndex = (currentIndex + 1) % CINE_REELS.length;
                    setSelectedReel(CINE_REELS[nextIndex]);
                  }}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Next Reel"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Bottom Details Overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 18px",
                background: "linear-gradient(0deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                zIndex: 10,
                maxWidth: "80%",
              }}
            >
              {/* Creator info */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={selectedReel.creator.avatar}
                  alt={selectedReel.creator.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #FFA500",
                  }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                      {selectedReel.creator.name}
                    </h4>
                    {selectedReel.creator.verified && <CheckCircle2 size={14} color="#FFA500" />}
                  </div>
                  <span style={{ fontSize: "0.78rem", color: "#FFA500", fontWeight: 600 }}>
                    {selectedReel.creator.craft}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleFollow(selectedReel.creator.name)}
                  style={{
                    background: followedAuthors.includes(selectedReel.creator.name)
                      ? "rgba(255, 255, 255, 0.15)"
                      : "#FFA500",
                    color: followedAuthors.includes(selectedReel.creator.name) ? "#FFFFFF" : "#0D0E12",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    marginLeft: "4px",
                  }}
                >
                  {followedAuthors.includes(selectedReel.creator.name) ? "Following" : "+ Follow"}
                </button>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF", margin: 0, lineHeight: 1.3 }}>
                {selectedReel.title}
              </h3>
              <p style={{ fontSize: "0.82rem", color: "#D1D5DB", margin: 0, lineHeight: 1.35 }}>
                {selectedReel.description}
              </p>

              {/* Sound Track Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(6px)",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
                  width: "fit-content",
                }}
              >
                <Music size={12} color="#FFA500" />
                <span>{selectedReel.soundTrack}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-Style Comments Modal Sheet */}
      <InstagramCommentsModal
        isOpen={activeCommentsItem !== null}
        onClose={() => setActiveCommentsItem(null)}
        targetItem={activeCommentsItem}
        comments={activeCommentsItem ? postCommentsMap[activeCommentsItem.id] || [] : []}
        onAddComment={handleAddComment}
      />

      {/* Toast Notification Container */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            background: "#1A1C23",
            border: "1px solid #FFA500",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5), 0 0 15px rgba(255, 165, 0, 0.25)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          <Sparkles size={16} color="#FFA500" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
