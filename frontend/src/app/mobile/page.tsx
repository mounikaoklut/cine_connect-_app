"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ChevronLeft,
  TrendingUp,
  Video,
  FileText,
  UserCheck,
  Award,
  Filter,
  ArrowUpRight,
  Shield,
  Smartphone,
  ExternalLink,
  Laptop,
  X,
  Send,
  Home,
  FolderHeart,
  UserRound,
  Settings,
  Check,
  Film,
  Music,
  Bookmark,
  Volume2,
  VolumeX,
  Pause,
  Disc,
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
import AuditionModal from "@/components/AuditionModal";
import ShowreelModal from "@/components/ShowreelModal";
import PitchModal from "@/components/PitchModal";
import CreatePostModal from "@/components/CreatePostModal";
import { InstagramDmIcon } from "@/components/Navigation";
import CineStoriesSection from "@/components/CineStoriesSection";

interface CineInstagramReelCardProps {
  reel: {
    id: string;
    creator: {
      name: string;
      craft: string;
      avatar: string;
      verified?: boolean;
    };
    title: string;
    description: string;
    videoUrl: string;
    audioUrl?: string;
    thumbnailUrl: string;
    category: string;
    soundTrack: string;
    likes: number;
    commentsCount: number;
    shares: number;
    isLiked: boolean;
  };
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleLike: (id: string) => void;
  onOpenComments: (reel: any) => void;
  onShare: (reel: any) => void;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
  isFollowing: boolean;
  onToggleFollow: (name: string) => void;
  onShowToast: (msg: string) => void;
  onOpenPostModal: () => void;
}

function CineInstagramReelCard({
  reel,
  isActive,
  isMuted,
  onToggleMute,
  onToggleLike,
  onOpenComments,
  onShare,
  onToggleSave,
  isSaved,
  isFollowing,
  onToggleFollow,
  onShowToast,
  onOpenPostModal,
}: CineInstagramReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastTapRef = useRef<number>(0);
  const doubleTapTimerRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [heartPos, setHeartPos] = useState({ x: 50, y: 50 });
  const [playPauseState, setPlayPauseState] = useState<"play" | "pause" | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Auto-play/pause when becoming active/inactive
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (isActive) {
      video.muted = isMuted;
      if (audio) {
        audio.muted = isMuted;
        audio.currentTime = video.currentTime;
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            if (audio && !isMuted) {
              audio.play().catch(() => {});
            }
          })
          .catch(() => {
            // Browser restricted unmuted autoplay; fallback to muted
            video.muted = true;
            video.play().then(() => setIsPlaying(true)).catch(() => {});
          });
      }
    } else {
      video.pause();
      if (audio) audio.pause();
      setIsPlaying(false);
      video.currentTime = 0;
      if (audio) audio.currentTime = 0;
      setProgress(0);
    }
  }, [isActive]);

  // Sync mute changes
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) video.muted = isMuted;
    if (audio) {
      audio.muted = isMuted;
      if (isActive && !isMuted && isPlaying) {
        audio.currentTime = video?.currentTime || 0;
        audio.play().catch(() => {});
      } else if (isMuted) {
        audio.pause();
      }
    }
  }, [isMuted, isActive, isPlaying]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);

    const audio = audioRef.current;
    if (audio && Math.abs(audio.currentTime - video.currentTime) > 0.3) {
      audio.currentTime = video.currentTime;
    }
  };

  const handleSurfaceClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const diff = now - lastTapRef.current;

    if (diff < 320) {
      // DOUBLE TAP: Like!
      clearTimeout(doubleTapTimerRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      setHeartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setShowBigHeart(true);
      setTimeout(() => setShowBigHeart(false), 850);

      if (!reel.isLiked) {
        onToggleLike(reel.id);
      }
      onShowToast("❤️ Liked!");
    } else {
      // SINGLE TAP: Play / Pause
      doubleTapTimerRef.current = setTimeout(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video) return;

        if (video.paused) {
          video
            .play()
            .then(() => {
              setIsPlaying(true);
              if (audio && !isMuted) audio.play().catch(() => {});
              setPlayPauseState("play");
            })
            .catch(() => {});
        } else {
          video.pause();
          if (audio) audio.pause();
          setIsPlaying(false);
          setPlayPauseState("pause");
        }
        setTimeout(() => setPlayPauseState(null), 650);
      }, 240);
    }
    lastTapRef.current = now;
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100%",
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        backgroundColor: "#000",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* HTML5 Video Layer */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl}
        playsInline
        loop
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          cursor: "pointer",
        }}
        onClick={handleSurfaceClick}
      />

      {/* Sync Audio Soundtrack */}
      {reel.audioUrl && (
        <audio
          ref={audioRef}
          src={reel.audioUrl}
          loop
          preload="auto"
          muted={isMuted}
        />
      )}

      {/* Click / Tap Surface Overlay */}
      <div
        onClick={handleSurfaceClick}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          background: "transparent",
          cursor: "pointer",
        }}
      />

      {/* Big Animated Popping Heart on Double-Tap */}
      {showBigHeart && (
        <div
          style={{
            position: "absolute",
            left: `${heartPos.x}px`,
            top: `${heartPos.y}px`,
            zIndex: 25,
            pointerEvents: "none",
            animation: "instagramHeartPop 0.85s ease-out forwards",
            filter: "drop-shadow(0 0 20px rgba(244, 63, 94, 0.85))",
          }}
        >
          <Heart size={84} fill="#f43f5e" color="#ffffff" strokeWidth={1.5} />
        </div>
      )}

      {/* Play / Pause Feedback Badge */}
      {playPauseState && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "68px",
            height: "68px",
            borderRadius: "50%",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            pointerEvents: "none",
            animation: "pulse 0.6s ease-out",
          }}
        >
          {playPauseState === "play" ? (
            <Play size={32} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: "4px" }} />
          ) : (
            <Pause size={30} fill="#FFFFFF" color="#FFFFFF" />
          )}
        </div>
      )}

      {/* Top Header Floating Controls (Category Pill & Sound Toggle) */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "44px 14px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            background: "rgba(16, 20, 30, 0.75)",
            border: "1px solid rgba(255, 152, 0, 0.4)",
            color: "#FF9800",
            fontSize: "0.68rem",
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: "12px",
            letterSpacing: "0.06em",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {reel.category.toUpperCase()}
        </span>

        {/* Volume Unmute Button at Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
            onShowToast(isMuted ? "🔊 Sound On" : "🔇 Sound Muted");
          }}
          style={{
            background: isMuted ? "rgba(0, 0, 0, 0.6)" : "#FF9800",
            color: isMuted ? "#FFFFFF" : "#08090C",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            pointerEvents: "auto",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.6)",
            transition: "all 0.2s ease",
          }}
          title={isMuted ? "Unmute Sound" : "Mute Sound"}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Bottom Overlays: Creator & Description on Left, Action Rail on Right */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "16px 14px 112px",
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 60%, transparent 100%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {/* Left Column: Creator Profile, Follow, Title, Description, Soundtrack */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", pointerEvents: "auto" }}>
          {/* Creator Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img
              src={reel.creator.avatar}
              alt={reel.creator.name}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #FF9800",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
              }}
            />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>
                  {reel.creator.name}
                </span>
                {reel.creator.verified && <CheckCircle2 size={13} color="#FF9800" />}
              </div>
              <span style={{ fontSize: "0.68rem", color: "#A0AEC0", fontWeight: 600 }}>
                {reel.creator.craft}
              </span>
            </div>

            {/* Follow Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow(reel.creator.name);
                onShowToast(isFollowing ? `Unfollowed ${reel.creator.name}` : `Following ${reel.creator.name}`);
              }}
              style={{
                background: isFollowing ? "rgba(255, 255, 255, 0.12)" : "#FF9800",
                color: isFollowing ? "#E2E8F0" : "#08090C",
                border: isFollowing ? "1px solid rgba(255, 255, 255, 0.25)" : "none",
                padding: "3px 10px",
                borderRadius: "8px",
                fontSize: "0.7rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginLeft: "4px",
                transition: "all 0.2s ease",
              }}
            >
              {isFollowing ? (
                <>
                  <Check size={11} strokeWidth={3} />
                  <span>Following</span>
                </>
              ) : (
                <span>Follow</span>
              )}
            </button>
          </div>

          {/* Title */}
          <h4
            style={{
              fontSize: "0.92rem",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: 0,
              lineHeight: 1.3,
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)",
            }}
          >
            {reel.title}
          </h4>

          {/* Caption / Description with more/less toggle */}
          <div style={{ fontSize: "0.75rem", color: "#E2E8F0", lineHeight: 1.35, margin: 0 }}>
            <span
              style={{
                display: isDescExpanded ? "inline" : "-webkit-box",
                WebkitLineClamp: isDescExpanded ? "unset" : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textShadow: "0 1px 3px rgba(0, 0, 0, 0.8)",
              }}
            >
              {reel.description}
            </span>
            {reel.description && reel.description.length > 70 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescExpanded(!isDescExpanded);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FF9800",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "0 0 0 6px",
                }}
              >
                {isDescExpanded ? "less" : "...more"}
              </button>
            )}
          </div>

          {/* Audio Soundtrack Pill with Equalizer Wave */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(10, 12, 18, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              padding: "3px 10px",
              borderRadius: "14px",
              width: "fit-content",
              maxWidth: "85%",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <Music size={12} color="#FF9800" />
            <span
              style={{
                fontSize: "0.68rem",
                color: "#F5F5F5",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {reel.soundTrack}
            </span>

            {/* Equalizer Wave bars when audio is playing */}
            {!isMuted && isPlaying && (
              <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "4px" }}>
                <span style={{ width: "2px", height: "8px", background: "#FF9800", borderRadius: "1px", animation: "equalizerWave 0.8s ease-in-out infinite" }} />
                <span style={{ width: "2px", height: "12px", background: "#FF9800", borderRadius: "1px", animation: "equalizerWave 0.8s ease-in-out 0.2s infinite" }} />
                <span style={{ width: "2px", height: "6px", background: "#FF9800", borderRadius: "1px", animation: "equalizerWave 0.8s ease-in-out 0.4s infinite" }} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Instagram Action Rail */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            pointerEvents: "auto",
          }}
        >
          {/* Like */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <button
              type="button"
              id={`reel-like-btn-${reel.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike(reel.id);
                onShowToast(reel.isLiked ? "Unliked" : "❤️ Liked");
              }}
              style={{
                background: "rgba(10, 12, 18, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: reel.isLiked ? "#f43f5e" : "#FFFFFF",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                transition: "transform 0.15s ease",
              }}
            >
              <Heart size={20} fill={reel.isLiked ? "#f43f5e" : "none"} />
            </button>
            <span style={{ fontSize: "0.68rem", color: "#FFFFFF", fontWeight: 700 }}>
              {reel.likes}
            </span>
          </div>

          {/* Comments */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <button
              type="button"
              id={`reel-comment-btn-${reel.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onOpenComments(reel);
              }}
              style={{
                background: "rgba(10, 12, 18, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                transition: "transform 0.15s ease",
              }}
            >
              <MessageSquare size={20} />
            </button>
            <span style={{ fontSize: "0.68rem", color: "#FFFFFF", fontWeight: 700 }}>
              {reel.commentsCount}
            </span>
          </div>

          {/* Share */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
            <button
              type="button"
              id={`reel-share-btn-${reel.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onShare(reel);
              }}
              style={{
                background: "rgba(10, 12, 18, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
                transition: "transform 0.15s ease",
              }}
            >
              <Share2 size={19} />
            </button>
            <span style={{ fontSize: "0.68rem", color: "#FFFFFF", fontWeight: 700 }}>
              {reel.shares}
            </span>
          </div>

          {/* Bookmark / Save */}
          <button
            type="button"
            id={`reel-bookmark-btn-${reel.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(reel.id);
            }}
            style={{
              background: isSaved ? "rgba(255, 152, 0, 0.25)" : "rgba(10, 12, 18, 0.65)",
              border: isSaved ? "1px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isSaved ? "#FF9800" : "#FFFFFF",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              transition: "transform 0.15s ease",
            }}
            title={isSaved ? "Saved in Portfolio" : "Save Reel"}
          >
            <Bookmark size={19} fill={isSaved ? "#FF9800" : "none"} />
          </button>

          {/* Post Reel Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPostModal();
            }}
            style={{
              background: "#FF9800",
              border: "none",
              borderRadius: "50%",
              width: "42px",
              height: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#08090C",
              boxShadow: "0 4px 12px rgba(255, 152, 0, 0.5)",
              transition: "transform 0.15s ease",
            }}
            title="Post Your Reel"
          >
            <Plus size={20} strokeWidth={3} />
          </button>

          {/* Rotating Vinyl Record */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #2a2d36 30%, #0c0d12 70%)",
              border: "2px solid rgba(255, 152, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: isPlaying ? "vinylSpin 3.5s linear infinite" : "none",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
              marginTop: "4px",
            }}
          >
            <Disc size={18} color="#FF9800" />
          </div>
        </div>
      </div>

      {/* Razor-Thin Bottom Playback Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2.5px",
          background: "rgba(255, 255, 255, 0.25)",
          zIndex: 35,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "#FF9800",
            boxShadow: "0 0 6px #FF9800",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
}

export default function MobileAppSimulatorPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<"stream" | "reels" | "auditions" | "messages" | "notifications" | "profile" | "settings" | "talent" | "pitches" | "pipeline">("stream");
  const [feedFilter, setFeedFilter] = useState<string>("all");
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(HOME_FEED_POSTS);
  const [pipelineItems, setPipelineItems] = useState<ApplicationPipelineItem[]>(MY_APPLICATIONS);
  const [activeAudition, setActiveAudition] = useState<CastingCall | null>(null);
  const [activeShowreel, setActiveShowreel] = useState<TalentItem | null>(null);
  const [activePitch, setActivePitch] = useState<PitchDeck | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [deviceModel, setDeviceModel] = useState<"iphone" | "android" | "fullscreen">("iphone");
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
      setToastMessage(isSaved ? "Removed from Saved collection" : "Saved to your Collection 🔖");
      setTimeout(() => setToastMessage(null), 2400);
      return next;
    });
  };

  const handleSharePost = (post: FeedPost) => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `${post.author.name} on CineConnect`,
          text: post.content,
          url: window.location.href,
        })
        .catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#post-${post.id}`);
      setToastMessage("Post link copied to clipboard! 📋");
      setTimeout(() => setToastMessage(null), 2400);
    } else {
      setToastMessage("Post link copied to clipboard! 📋");
      setTimeout(() => setToastMessage(null), 2400);
    }
  };

  // Complete Core Navigation Destinations (1-by-1)
  const ALL_MOBILE_NAV_ITEMS = [
    { id: "stream" as const, label: "Home", subtitle: "Studio Feed", icon: Home },
    { id: "reels" as const, label: "Reels", subtitle: "CineReels", icon: Film },
    { id: "auditions" as const, label: "Opportunities", subtitle: "Auditions & Roles", icon: Clapperboard },
    { id: "messages" as const, label: "Messages", subtitle: "Production DMs", icon: MessageSquare },
    { id: "notifications" as const, label: "Notification", subtitle: "Callbacks & Match", icon: Bell },
    { id: "profile" as const, label: "Profile", subtitle: "Showreels & Bio", icon: UserRound },
    { id: "pipeline" as const, label: "My Applications", subtitle: "Applied Castings", icon: FolderHeart },
    { id: "settings" as const, label: "Settings", subtitle: "App & Security", icon: Settings },
  ];

  // 2-by-2 Rotating Wheel Navigation System (4 Pairs = 8 Total Options)
  const NAV_PAIRS = [
    {
      id: 0,
      name: "Pair 1",
      pairLabel: "Home & Reels",
      primary: { id: "stream" as const, label: "Home", icon: Home, subtitle: "Studio Feed" },
      companion: { id: "reels" as const, label: "Reels", icon: Film, subtitle: "CineReels" },
    },
    {
      id: 1,
      name: "Pair 2",
      pairLabel: "Opportunities & Messages",
      primary: { id: "auditions" as const, label: "Opportunities", icon: Clapperboard, subtitle: "Production Roles" },
      companion: { id: "messages" as const, label: "Messages", icon: MessageSquare, subtitle: "Production DMs" },
    },
    {
      id: 2,
      name: "Pair 3",
      pairLabel: "Notification & Profile",
      primary: { id: "notifications" as const, label: "Notification", icon: Bell, subtitle: "Callbacks & Match" },
      companion: { id: "profile" as const, label: "Profile", icon: UserRound, subtitle: "Showreels & Bio" },
    },
    {
      id: 3,
      name: "Pair 4",
      pairLabel: "My Applications & Settings",
      primary: { id: "pipeline" as const, label: "My Applications", icon: FolderHeart, subtitle: "Track Submissions" },
      companion: { id: "settings" as const, label: "Settings", icon: Settings, subtitle: "App & Security" },
    },
  ];

  // Reels State & Posting System
  // Reels State & Posting System (Instagram Reels Engine)
  const [reelsList, setReelsList] = useState([
    {
      id: "reel-1",
      creator: {
        name: "Kabir Mehra",
        craft: "Method Actor",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "Shadow of Verity - Dramatic Monologue",
      description: "Screen test scene for Netflix crime thriller. 12-minute unbroken monologue take. Directed by Anurag Kashyap.",
      videoUrl: "/reels/reel1.mp4",
      audioUrl: "/reels/audio1.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
      category: "acting",
      soundTrack: "Original Sound - Kabir Mehra",
      likes: 2420,
      commentsCount: 184,
      shares: 412,
      isLiked: false,
    },
    {
      id: "reel-2",
      creator: {
        name: "Ananya Roy",
        craft: "Cinematographer (ISC)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "2.39:1 Anamorphic Low-Light Lighting Showcase",
      description: "ARRI Alexa Mini LF + Cooke Anamorphic /i Full Frame Plus. Low-light Mumbai neon noir aesthetics.",
      videoUrl: "/reels/reel2.mp4",
      audioUrl: "/reels/audio2.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1518134346374-184f9d21eb29?w=800&auto=format&fit=crop&q=80",
      category: "cinematography",
      soundTrack: "Dolby Atmos Ambient Score - Ananya Roy",
      likes: 3810,
      commentsCount: 295,
      shares: 610,
      isLiked: false,
    },
    {
      id: "reel-3",
      creator: {
        name: "Vikram Rathore",
        craft: "Action Director & Stunt Lead",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "High-Octane Combat & Wire Stunt Choreography",
      description: "Pre-viz fight choreography for upcoming action thriller. Unarmed hand-to-hand combat & tactical movement.",
      videoUrl: "/reels/reel3.mp4",
      audioUrl: "/reels/audio3.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
      category: "stunts",
      soundTrack: "War Drums - High Tempo Combat Score",
      likes: 5120,
      commentsCount: 420,
      shares: 890,
      isLiked: false,
    },
    {
      id: "reel-4",
      creator: {
        name: "Tanya Sharma",
        craft: "Independent Director",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "MAMI Award Winning Short - Director's Cut",
      description: "Scenes from 'Bridges of Ganga' selected at Cannes Short Film Corner and Sundance Indie Lab.",
      videoUrl: "/reels/reel4.mp4",
      audioUrl: "/reels/audio4.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80",
      category: "direction",
      soundTrack: "Indian Classical Cello - Sandeep Roy",
      likes: 1980,
      commentsCount: 142,
      shares: 260,
      isLiked: false,
    },
  ]);

  const [showPostReelModal, setShowPostReelModal] = useState(false);
  const [reelsCategoryFilter, setReelsCategoryFilter] = useState<string>("all");
  const [playingReelId, setPlayingReelId] = useState<string | null>("reel-1");

  // Instagram Reels Audio & Navigation State
  const [isReelsMuted, setIsReelsMuted] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [activeReelComments, setActiveReelComments] = useState<any | null>(null);
  const [newReelCommentText, setNewReelCommentText] = useState("");
  const [savedReelIds, setSavedReelIds] = useState<string[]>([]);
  const reelsContainerRef = useRef<HTMLDivElement>(null);

  // Community Comments for Reels
  const [reelCommentsMap, setReelCommentsMap] = useState<Record<string, Array<{ id: string; user: string; avatar: string; text: string; time: string; verified?: boolean }>>>({
    "reel-1": [
      { id: "c1", user: "Rohan Varma", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80", text: "Incredible emotional range Kabir! That pause at 0:45 gave me literal goosebumps 🔥", time: "2h ago", verified: true },
      { id: "c2", user: "Zoya Akhtar Office", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Please DM your agency representation contact. Casting team is reviewing.", time: "4h ago", verified: true },
      { id: "c3", user: "Pooja Hegde", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", text: "Pure craft!! 🙌 Keep shining!", time: "5h ago" },
    ],
    "reel-2": [
      { id: "c4", user: "Sudeep Chatterjee (ISC)", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80", text: "Exceptional shadow roll-off with those Cooke Anamorphics. Great flare control in the rain! 🎥", time: "1h ago", verified: true },
      { id: "c5", user: "Dharma Productions", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80", text: "Saved to our camera crew roster for Q3 shoot.", time: "3h ago", verified: true },
    ],
    "reel-3": [
      { id: "c6", user: "Action Directors Guild", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80", text: "The wire transition at the vault jump was seamless. High level stunt rigging! 💥", time: "30m ago", verified: true },
    ],
    "reel-4": [
      { id: "c7", user: "Karan Johar", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80", text: "Brilliant framing and atmospheric storytelling. Very promising vision!", time: "3h ago", verified: true },
    ],
  });

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2200);
  };

  const handleToggleSaveReel = (id: string) => {
    setSavedReelIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((item) => item !== id) : [...prev, id];
      handleShowToast(isSaved ? "Removed from Saved Reels" : "Saved Reel to Portfolio 🔖");
      return next;
    });
  };

  const handleShareReel = (reel: any) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/mobile#reel-${reel.id}`);
      handleShowToast("🔗 Reel link copied to clipboard!");
    } else {
      handleShowToast("🔗 Reel link copied!");
    }
  };

  const handleAddReelComment = (reelId: string) => {
    if (!newReelCommentText.trim()) return;
    const newComment = {
      id: "cm-" + Date.now(),
      user: "Current Creator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      text: newReelCommentText.trim(),
      time: "Just now",
      verified: true,
    };
    setReelCommentsMap((prev) => ({
      ...prev,
      [reelId]: [newComment, ...(prev[reelId] || [])],
    }));
    setReelsList((prev) =>
      prev.map((r) => (r.id === reelId ? { ...r, commentsCount: r.commentsCount + 1 } : r))
    );
    setNewReelCommentText("");
    handleShowToast("💬 Comment posted!");
  };

  // Synchronous zero-lag scroll snap detection
  const handleReelsScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const itemHeight = container.clientHeight;
    if (itemHeight <= 0) return;
    const newIndex = Math.round(container.scrollTop / itemHeight);
    if (newIndex !== activeReelIndex && newIndex >= 0 && newIndex < reelsList.length) {
      setActiveReelIndex(newIndex);
    }
  };

  // Post Reel Modal Form Fields
  const [newReelTitle, setNewReelTitle] = useState("");
  const [newReelCreatorName, setNewReelCreatorName] = useState("Kabir Mehra");
  const [newReelCraft, setNewReelCraft] = useState("Method Actor");
  const [newReelCategory, setNewReelCategory] = useState<"acting" | "cinematography" | "stunts" | "direction">("acting");
  const [newReelVideoUrl, setNewReelVideoUrl] = useState("/reels/reel1.mp4");
  const [newReelDesc, setNewReelDesc] = useState("");
  const [newReelSoundTrack, setNewReelSoundTrack] = useState("Original Sound - Kabir Mehra");

  const handlePublishReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelTitle.trim()) return;

    const newReel = {
      id: "reel-" + Date.now(),
      creator: {
        name: newReelCreatorName || "Kabir Mehra",
        craft: newReelCraft || "Creator",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: newReelTitle,
      description: newReelDesc || "Exclusive reel submission on CineConnect showcase.",
      videoUrl: newReelVideoUrl || "/reels/reel1.mp4",
      audioUrl: "/reels/audio1.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
      category: newReelCategory,
      soundTrack: newReelSoundTrack || "Original Sound - " + newReelCreatorName,
      likes: 1,
      commentsCount: 0,
      shares: 0,
      isLiked: false,
    };

    setReelsList([newReel, ...reelsList]);
    setShowPostReelModal(false);
    setNewReelTitle("");
    setNewReelDesc("");
    setPlayingReelId(newReel.id);
    setActiveReelIndex(0);
    setActiveTab("reels");
    handleShowToast("✨ Reel Published Successfully!");
  };

  const handleToggleLikeReel = (id: string) => {
    setReelsList((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const liked = !r.isLiked;
          return {
            ...r,
            isLiked: liked,
            likes: liked ? r.likes + 1 : r.likes - 1,
          };
        }
        return r;
      })
    );
  };

  const mobileBodyScrollRef = React.useRef<HTMLDivElement>(null);
  const messagesChatScrollRef = React.useRef<HTMLDivElement>(null);

  // Settings interactive state
  const [pushNotifsEnabled, setPushNotifsEnabled] = useState(true);
  const [ndaVaultEnabled, setNdaVaultEnabled] = useState(true);

  // Tab Navigation Handler
  const handleSelectTab = (tabId: "stream" | "reels" | "auditions" | "messages" | "notifications" | "profile" | "settings" | "talent" | "pitches" | "pipeline") => {
    setActiveTab(tabId);
    setShowMobileNotifs(false);
    setShowMobileMessages(false);
    if (tabId === "messages") {
      setSelectedMobileThread(null);
    }
    if (mobileBodyScrollRef.current) {
      mobileBodyScrollRef.current.scrollTop = 0;
    }
  };

  // Complete Core Navigation Destinations (8 Total Options)
  // Index: 0=stream, 1=reels, 2=auditions, 3=messages, 4=notifications, 5=profile, 6=pipeline, 7=settings
  const getNavIndexForTab = (tabId: string): number => {
    const idx = ALL_MOBILE_NAV_ITEMS.findIndex((item) => item.id === tabId);
    return idx !== -1 ? idx : 0;
  };

  // Semi-Circle Rotating Wheel Engine State
  const [wheelRotation, setWheelRotation] = useState(() => -getNavIndexForTab(activeTab) * 45);
  const [isWheelDragging, setIsWheelDragging] = useState(false);

  const navContainerRef = useRef<HTMLElement | null>(null);
  const isPointerDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const lastClientXRef = useRef(0);
  const startRotationRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const hasWheelDraggedRef = useRef(false);
  const wheelScrollCooldownRef = useRef(0);

  // Synchronize rotation with activeTab using shortest path
  useEffect(() => {
    const targetIdx = getNavIndexForTab(activeTab);
    const targetAngle = -targetIdx * 45;
    setWheelRotation((prev) => {
      const diff = (((targetAngle - prev) % 360) + 540) % 360 - 180;
      return prev + diff;
    });
  }, [activeTab]);

  const currentNavIndex = Math.max(0, ALL_MOBILE_NAV_ITEMS.findIndex((item) => item.id === activeTab));

  const handleNextItem = () => {
    const nextIdx = (currentNavIndex + 1) % ALL_MOBILE_NAV_ITEMS.length;
    handleSelectTab(ALL_MOBILE_NAV_ITEMS[nextIdx].id);
  };

  const handlePrevItem = () => {
    const prevIdx = (currentNavIndex - 1 + ALL_MOBILE_NAV_ITEMS.length) % ALL_MOBILE_NAV_ITEMS.length;
    handleSelectTab(ALL_MOBILE_NAV_ITEMS[prevIdx].id);
  };

  const rotateWheelToItem = (itemIndex: number) => {
    const normalizedIndex = ((itemIndex % ALL_MOBILE_NAV_ITEMS.length) + ALL_MOBILE_NAV_ITEMS.length) % ALL_MOBILE_NAV_ITEMS.length;
    const targetItem = ALL_MOBILE_NAV_ITEMS[normalizedIndex];
    if (targetItem) {
      handleSelectTab(targetItem.id);
    }
  };

  const handleNavPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    isPointerDownRef.current = true;
    dragStartXRef.current = e.clientX;
    lastClientXRef.current = e.clientX;
    hasWheelDraggedRef.current = false;
  };

  const handleNavPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isPointerDownRef.current) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        handleNextItem();
      } else {
        handlePrevItem();
      }
      dragStartXRef.current = e.clientX;
      isPointerDownRef.current = false;
    }
  };

  const handleNavPointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleNavMouseLeave = () => {
    isPointerDownRef.current = false;
  };

  const handleNavWheel = (e: React.WheelEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - wheelScrollCooldownRef.current < 200) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 10) {
      wheelScrollCooldownRef.current = now;
      if (delta > 0) {
        handleNextItem();
      } else {
        handlePrevItem();
      }
    }
  };

  // Mobile App Top-Right Actions State
  const [showMobileNotifs, setShowMobileNotifs] = useState(false);
  const [showMobileMessages, setShowMobileMessages] = useState(false);
  const [selectedMobileThread, setSelectedMobileThread] = useState<string | null>(null);
  const [mobileReplyText, setMobileReplyText] = useState("");
  const [messagesSearchQuery, setMessagesSearchQuery] = useState("");
  const [messagesFilterTab, setMessagesFilterTab] = useState<"all" | "castings" | "studios">("all");
  const [mobileNotifications, setMobileNotifications] = useState([
    {
      id: "mn-1",
      title: "Audition Callback Scheduled!",
      desc: "Dharma Productions invited you to a Director Screen Test on Oct 24 for 'Shadow of Verity'.",
      time: "20m ago",
      urgent: true,
      read: false,
    },
    {
      id: "mn-2",
      title: "New 98% AI Casting Match",
      desc: "Prime Video crime series has an open call for Male Lead Antagonist (Hindi/Urdu).",
      time: "2h ago",
      urgent: false,
      read: false,
    },
    {
      id: "mn-3",
      title: "Profile Viewed by Casting Associate",
      desc: "Roy Kapur Films reviewed your dramatic showreel and credits timeline.",
      time: "5h ago",
      urgent: false,
      read: true,
    },
  ]);

  const [mobileMessages, setMobileMessages] = useState([
    {
      id: "mm-1",
      sender: "Shanoo Sharma",
      role: "Head of Casting, YRF",
      studio: "Yash Raj Films",
      project: "Shadow of Verity",
      category: "castings" as const,
      hasSides: true,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      text: "Kabir, the director screened your audition tape. Can you do a chemistry read tomorrow at 4 PM at YRF Studios, Stage 3?",
      time: "12m ago",
      unread: true,
      thread: [
        { sender: "Shanoo Sharma", text: "Loved your audition tape for the gritty crime thriller!", time: "Yesterday, 3:15 PM" },
        { sender: "You", text: "Thank you Shanoo! Looking forward to hearing feedback.", time: "Yesterday, 4:02 PM" },
        { sender: "Shanoo Sharma", text: "Kabir, the director screened your audition tape. Can you do a chemistry read tomorrow at 4 PM at YRF Studios, Stage 3?", time: "12m ago" },
      ],
    },
    {
      id: "mm-2",
      sender: "Karan Johar",
      role: "Dharma Productions",
      studio: "Dharma Productions",
      project: "Dhadak 2 (Lead Antagonist)",
      category: "castings" as const,
      hasSides: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      text: "Script sides for Scene 14 attached. Please review monologue and self-tape by Thursday.",
      time: "45m ago",
      unread: true,
      thread: [
        { sender: "Karan Johar", text: "Hello Kabir, we are finalizing the primary cast for the crime sequel. Your NSD theatre work impressed the writing room.", time: "2h ago" },
        { sender: "Karan Johar", text: "Script sides for Scene 14 attached. Please review monologue and self-tape by Thursday.", time: "45m ago" },
      ],
    },
    {
      id: "mm-3",
      sender: "Rohit Shetty Picturez",
      role: "Production Office",
      studio: "Rohit Shetty Picturez",
      project: "Cop Universe Spin-off",
      category: "studios" as const,
      hasSides: false,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      text: "Pitch deck NDA verified. Logline approved for table discussion with creative execs.",
      time: "1h ago",
      unread: false,
      thread: [
        { sender: "Rohit Shetty Picturez", text: "Pitch deck NDA verified and logged. Logline approved for table discussion with creative execs.", time: "1h ago" },
      ],
    },
    {
      id: "mm-4",
      sender: "Zoya Akhtar",
      role: "Tiger Baby Films",
      studio: "Tiger Baby Films",
      project: "Made in Heaven Season 3",
      category: "studios" as const,
      hasSides: false,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      text: "The look-test photos came through really sharp. Let's schedule the ensemble table read next Monday.",
      time: "Yesterday",
      unread: false,
      thread: [
        { sender: "Zoya Akhtar", text: "The look-test photos came through really sharp. Let's schedule the ensemble table read next Monday.", time: "Yesterday" },
      ],
    },
  ]);

  const handleMobileSendReply = (threadId: string) => {
    if (!mobileReplyText.trim()) return;
    const textToSend = mobileReplyText.trim();
    setMobileMessages((prev) =>
      prev.map((m) => {
        if (m.id === threadId) {
          return {
            ...m,
            unread: false,
            text: textToSend,
            time: "Just now",
            thread: [...m.thread, { sender: "You", text: textToSend, time: "Just now" }],
          };
        }
        return m;
      })
    );
    setMobileReplyText("");
    setTimeout(() => {
      if (messagesChatScrollRef.current) {
        messagesChatScrollRef.current.scrollTop = messagesChatScrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const unreadMobileNotifCount = mobileNotifications.filter((n) => !n.read).length;
  const unreadMobileMsgCount = mobileMessages.filter((m) => m.unread).length;

  const handleToggleLike = (id: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p))
    );
  };

  const handleAuditionSubmitted = (castingId: string, roleName: string, productionHouse: string) => {
    const newItem: ApplicationPipelineItem = {
      id: "app-" + Date.now(),
      projectTitle: roleName,
      roleTitle: roleName,
      productionHouse,
      appliedDate: "Just now",
      stage: "Applied",
      progressPercent: 25,
      nextStepNote: "Application received by casting team. Video self-tape under review.",
    };
    setPipelineItems([newItem, ...pipelineItems]);
  };

  // Render Mobile Content
  const renderMobileScreen = () => {
    switch (activeTab) {
      case "stream":
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "4px" }}>
            {/* Square-Shaped Stories Section */}
            <CineStoriesSection onOpenCreateStory={() => setShowCreatePost(true)} />

            <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Quick composer banner */}
              <div
                onClick={() => setShowCreatePost(true)}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "12px",
                  padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                alt="Avatar"
                style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
              />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Share an audition tape or update...
              </span>
            </div>

            {/* Feed Cards */}
            {feedPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    background: "#0f131c",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "14px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img
                        src={post.author.avatar}
                        alt="Author"
                        style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                            {post.author.name}
                          </span>
                          {post.author.verified && <CheckCircle2 size={12} color="var(--accent-gold)" />}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                          {post.author.craft} • {post.timestamp}
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
                          : "#FF9800",
                        color: followedAuthors.includes(post.author.name) ? "#E2E8F0" : "#08090C",
                        border: followedAuthors.includes(post.author.name)
                          ? "1px solid rgba(255, 255, 255, 0.2)"
                          : "none",
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "all 0.18s ease",
                        boxShadow: followedAuthors.includes(post.author.name)
                          ? "none"
                          : "0 2px 6px rgba(255, 152, 0, 0.3)",
                      }}
                    >
                      {followedAuthors.includes(post.author.name) ? (
                        <>
                          <Check size={12} strokeWidth={2.8} />
                          <span>Following</span>
                        </>
                      ) : (
                        <span>Follow</span>
                      )}
                    </button>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                    {post.content}
                  </p>

                  {post.mediaUrl && (
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        background: "#08090C",
                        position: "relative",
                      }}
                    >
                      <img
                        src={post.mediaUrl}
                        alt={post.author.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px" }}>
                    {/* Left: Like, Comment, and Share Buttons */}
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      {/* Like Button */}
                      <button
                        type="button"
                        id={`post-like-btn-${post.id}`}
                        onClick={() => handleToggleLike(post.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: post.isLiked ? "#f43f5e" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.75rem",
                          fontWeight: post.isLiked ? 700 : 500,
                          cursor: "pointer",
                          padding: 0,
                          transition: "transform 0.15s ease",
                        }}
                      >
                        <Heart size={16} fill={post.isLiked ? "#f43f5e" : "none"} strokeWidth={post.isLiked ? 2.5 : 2} />
                        <span>{post.likes}</span>
                      </button>

                      {/* Comment Button */}
                      <button
                        type="button"
                        id={`post-comment-btn-${post.id}`}
                        onClick={() => {
                          setToastMessage(`Viewing ${post.commentsCount} comments... 💬`);
                          setTimeout(() => setToastMessage(null), 2000);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <MessageSquare size={15} />
                        <span>{post.commentsCount}</span>
                      </button>

                      {/* Share Button (beside Like & Comment) */}
                      <button
                        type="button"
                        id={`post-share-btn-${post.id}`}
                        onClick={() => handleSharePost(post)}
                        title="Share post"
                        style={{
                          background: "none",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          padding: 0,
                          transition: "color 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#FF9800")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        <Share2 size={15} />
                        <span>{post.shares || 18}</span>
                      </button>
                    </div>

                    {/* Right: Embedded CTA & Instagram-style Save Button */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {post.actionButton && (
                        <button
                          onClick={() => {
                            if (post.actionButton?.type === "apply") {
                              setActiveAudition(OPEN_CASTINGS[0]);
                            } else if (post.actionButton?.type === "view_reel") {
                              setActiveShowreel(FEATURED_TALENT[1]);
                            } else if (post.actionButton?.type === "request_pitch") {
                              setActivePitch(PITCH_DECKS[0]);
                            }
                          }}
                          className="btn-primary"
                          style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                        >
                          {post.actionButton.label}
                        </button>
                      )}

                      {/* Instagram Save / Bookmark Button */}
                      <button
                        type="button"
                        id={`post-save-btn-${post.id}`}
                        onClick={() => handleToggleSavePost(post.id)}
                        title={savedPostIds.includes(post.id) ? "Saved to collection" : "Save post"}
                        style={{
                          background: savedPostIds.includes(post.id) ? "rgba(255, 152, 0, 0.18)" : "transparent",
                          border: savedPostIds.includes(post.id) ? "1px solid rgba(255, 152, 0, 0.45)" : "none",
                          borderRadius: "8px",
                          padding: "4px 6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                        }}
                      >
                        <Bookmark
                          size={16}
                          color={savedPostIds.includes(post.id) ? "#FF9800" : "var(--text-muted)"}
                          fill={savedPostIds.includes(post.id) ? "#FF9800" : "none"}
                          strokeWidth={savedPostIds.includes(post.id) ? 2.5 : 2}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "reels":
        const filteredReels = reelsCategoryFilter === "all"
          ? reelsList
          : reelsList.filter((r) => r.category === reelsCategoryFilter);

        const currentReelCommentsList = activeReelComments ? (reelCommentsMap[activeReelComments.id] || []) : [];

        return (
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              minHeight: 0,
              backgroundColor: "#000",
              overflow: "hidden",
            }}
          >
            {/* Top Floating Category Filter Pills (Instagram style) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 28,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                overflowX: "auto",
                scrollbarWidth: "none",
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0.75) 0%, rgba(0,0,0,0) 100%)",
                pointerEvents: "auto",
              }}
              className="no-scrollbar"
            >
              {[
                { id: "all", label: "🔥 All Reels" },
                { id: "acting", label: "🎭 Acting" },
                { id: "cinematography", label: "🎥 Cinematography" },
                { id: "stunts", label: "💥 Stunts" },
                { id: "direction", label: "🎬 Directing" },
              ].map((tab) => {
                const isSelected = reelsCategoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setReelsCategoryFilter(tab.id);
                      setActiveReelIndex(0);
                      if (reelsContainerRef.current) {
                        reelsContainerRef.current.scrollTop = 0;
                      }
                    }}
                    style={{
                      background: isSelected ? "#FF9800" : "rgba(16, 20, 28, 0.75)",
                      color: isSelected ? "#08090C" : "#E2E8F0",
                      border: isSelected ? "1.5px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.16)",
                      borderRadius: "18px",
                      padding: "4px 11px",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      boxShadow: isSelected ? "0 2px 10px rgba(255, 152, 0, 0.45)" : "0 2px 6px rgba(0, 0, 0, 0.4)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Full-Height Vertical Snap Scrollable Container */}
            <div
              ref={reelsContainerRef}
              onScroll={handleReelsScroll}
              className="no-scrollbar"
              style={{
                width: "100%",
                height: "100%",
                overflowY: "scroll",
                scrollSnapType: "y mandatory",
                WebkitOverflowScrolling: "touch",
                position: "relative",
              }}
            >
              {filteredReels.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#94A3B8",
                    gap: "10px",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <Film size={42} color="#FF9800" />
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>
                    No reels in this category yet
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPostReelModal(true)}
                    style={{
                      background: "#FF9800",
                      color: "#08090C",
                      border: "none",
                      borderRadius: "12px",
                      padding: "8px 16px",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Post the First Reel
                  </button>
                </div>
              ) : (
                filteredReels.map((reel, index) => (
                  <CineInstagramReelCard
                    key={reel.id}
                    reel={reel}
                    isActive={index === activeReelIndex}
                    isMuted={isReelsMuted}
                    onToggleMute={() => setIsReelsMuted(!isReelsMuted)}
                    onToggleLike={handleToggleLikeReel}
                    onOpenComments={(r) => setActiveReelComments(r)}
                    onShare={handleShareReel}
                    onToggleSave={handleToggleSaveReel}
                    isSaved={savedReelIds.includes(reel.id)}
                    isFollowing={followedAuthors.includes(reel.creator.name)}
                    onToggleFollow={handleToggleFollow}
                    onShowToast={handleShowToast}
                    onOpenPostModal={() => setShowPostReelModal(true)}
                  />
                ))
              )}
            </div>

            {/* Slide-Up Instagram Comments Sheet */}
            {activeReelComments && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  backgroundColor: "rgba(0, 0, 0, 0.65)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
                onClick={() => setActiveReelComments(null)}
              >
                <div
                  style={{
                    backgroundColor: "#0F131C",
                    borderTop: "1px solid rgba(255, 152, 0, 0.35)",
                    borderRadius: "22px 22px 0 0",
                    maxHeight: "72%",
                    height: "72%",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.9)",
                    overflow: "hidden",
                    paddingBottom: "10px",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Top Sheet Drag Indicator & Header */}
                  <div
                    style={{
                      padding: "10px 16px 8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: "38px",
                        height: "4px",
                        borderRadius: "2px",
                        backgroundColor: "rgba(255, 255, 255, 0.25)",
                        marginBottom: "10px",
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <MessageSquare size={16} color="#FF9800" />
                        <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>
                          Comments ({activeReelComments.commentsCount})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveReelComments(null)}
                        style={{
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "none",
                          color: "#CBD5E1",
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {currentReelCommentsList.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#64748B", padding: "30px 10px", fontSize: "0.8rem" }}>
                        No comments yet. Be the first to applaud this reel!
                      </div>
                    ) : (
                      currentReelCommentsList.map((comm) => (
                        <div key={comm.id} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                          <img
                            src={comm.avatar}
                            alt={comm.user}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid rgba(255, 152, 0, 0.3)",
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "#FFFFFF" }}>
                                {comm.user}
                              </span>
                              {comm.verified && <CheckCircle2 size={11} color="#FF9800" />}
                              <span style={{ fontSize: "0.65rem", color: "#64748B" }}>
                                {comm.time}
                              </span>
                            </div>
                            <p style={{ fontSize: "0.78rem", color: "#E2E8F0", lineHeight: 1.35, margin: 0 }}>
                              {comm.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Input Bar */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddReelComment(activeReelComments.id);
                    }}
                    style={{
                      padding: "10px 14px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "rgba(10, 12, 18, 0.95)",
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="Current User"
                      style={{ width: "30px", height: "30px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <input
                      type="text"
                      placeholder={`Add a comment for ${activeReelComments.creator.name}...`}
                      value={newReelCommentText}
                      onChange={(e) => setNewReelCommentText(e.target.value)}
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.14)",
                        borderRadius: "20px",
                        padding: "8px 14px",
                        color: "#FFFFFF",
                        fontSize: "0.78rem",
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newReelCommentText.trim()}
                      style={{
                        background: newReelCommentText.trim() ? "#FF9800" : "rgba(255, 255, 255, 0.1)",
                        color: newReelCommentText.trim() ? "#08090C" : "#64748B",
                        border: "none",
                        borderRadius: "50%",
                        width: "32px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: newReelCommentText.trim() ? "pointer" : "default",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        );

      case "auditions":
        return (
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                  🎬 Production Opportunities
                </h3>
                <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)" }}>
                  {OPEN_CASTINGS.length} Active Audition Notices & Open Calls
                </span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>⚡ Live Opportunities</span>
            </div>

            {OPEN_CASTINGS.map((casting) => (
              <div
                key={casting.id}
                style={{
                  background: "#0f131c",
                  borderRadius: "14px",
                  padding: "14px",
                  border: casting.isUrgent ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>{casting.projectType}</span>
                  {casting.matchScore && (
                    <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>⚡ {casting.matchScore}% Match</span>
                  )}
                </div>

                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 }}>{casting.title}</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: 600 }}>{casting.productionHouse}</span>

                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
                  {casting.characterDescription}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px", fontSize: "0.72rem" }}>
                  <span>{casting.location}</span>
                  <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>{casting.payRange}</span>
                </div>

                <button
                  onClick={() => setActiveAudition(casting)}
                  className="btn-primary"
                  style={{ width: "100%", padding: "7px", fontSize: "0.8rem", marginTop: "4px" }}
                >
                  Instant Audition 🎬
                </button>
              </div>
            ))}
          </div>
        );

      case "messages":
        const currentActiveThread = mobileMessages.find((m) => m.id === selectedMobileThread);
        const filteredMobileThreads = mobileMessages.filter((m) => {
          const matchesSearch =
            m.sender.toLowerCase().includes(messagesSearchQuery.toLowerCase()) ||
            m.role.toLowerCase().includes(messagesSearchQuery.toLowerCase()) ||
            (m.project && m.project.toLowerCase().includes(messagesSearchQuery.toLowerCase())) ||
            m.text.toLowerCase().includes(messagesSearchQuery.toLowerCase());
          if (!matchesSearch) return false;
          if (messagesFilterTab === "castings") return m.category === "castings";
          if (messagesFilterTab === "studios") return m.category === "studios";
          return true;
        });

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              minHeight: 0,
              flex: 1,
              background: "#080a0f",
              overflow: "hidden",
            }}
          >
            {selectedMobileThread && currentActiveThread ? (
              /* ================= Full-Page Interactive Chat Room ================= */
              <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, flex: 1, overflow: "hidden" }}>
                {/* Chat Top Header */}
                <div
                  style={{
                    padding: "10px 14px",
                    background: "linear-gradient(180deg, #121622 0%, #0c0f17 100%)",
                    borderBottom: "1px solid rgba(255, 152, 0, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedMobileThread(null)}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "var(--accent-gold)",
                        borderRadius: "8px",
                        padding: "5px 9px",
                        fontSize: "0.74rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        flexShrink: 0,
                      }}
                    >
                      <ChevronLeft size={14} /> Back
                    </button>

                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <img
                        src={currentActiveThread.avatar}
                        alt={currentActiveThread.sender}
                        style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FF9800" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          background: "#10b981",
                          border: "1.5px solid #080a0f",
                        }}
                      />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {currentActiveThread.sender}
                        </span>
                        <CheckCircle2 size={12} color="#38bdf8" />
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--accent-gold)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {currentActiveThread.role}
                      </div>
                    </div>
                  </div>

                  {/* Header Call & Info Icons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                    <button
                      type="button"
                      title="Audio Call"
                      onClick={() => {
                        setToastMessage(`Connecting encrypted studio voice line to ${currentActiveThread.sender}... 📞`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#E2E8F0",
                        cursor: "pointer",
                      }}
                    >
                      📞
                    </button>
                    <button
                      type="button"
                      title="Video Call"
                      onClick={() => {
                        setToastMessage(`Launching secure self-tape audition room with ${currentActiveThread.sender}... 🎥`);
                        setTimeout(() => setToastMessage(null), 3000);
                      }}
                      style={{
                        background: "rgba(255, 152, 0, 0.15)",
                        border: "1px solid rgba(255, 152, 0, 0.4)",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FF9800",
                        cursor: "pointer",
                      }}
                    >
                      <Video size={14} />
                    </button>
                  </div>
                </div>

                {/* Project / Security Banner */}
                <div
                  style={{
                    background: "rgba(16, 20, 29, 0.95)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    padding: "6px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.68rem",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "var(--accent-gold)", display: "flex", alignItems: "center", gap: "5px", fontWeight: 700 }}>
                    🎬 Project: {currentActiveThread.project}
                  </span>
                  <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Shield size={11} /> Watermark Active
                  </span>
                </div>

                {/* Message History (Scrollable) */}
                <div
                  ref={messagesChatScrollRef}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    background: "#080a0f",
                  }}
                >
                  <div style={{ textAlign: "center", margin: "6px 0 10px" }}>
                    <span
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.62rem",
                        color: "#94a3b8",
                      }}
                    >
                      Today &bull; End-to-End Encrypted DPDP 2026
                    </span>
                  </div>

                  {currentActiveThread.thread.map((msg, idx) => {
                    const isMe = msg.sender === "You";
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "85%",
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
                            padding: "9px 12px",
                            borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                            border: isMe ? "1px solid rgba(255, 183, 3, 0.4)" : "1px solid rgba(255, 255, 255, 0.09)",
                            boxShadow: isMe ? "0 4px 14px rgba(217, 119, 6, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.3)",
                            fontSize: "0.78rem",
                            lineHeight: 1.45,
                          }}
                        >
                          <div>{msg.text}</div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: "4px",
                              marginTop: "4px",
                              fontSize: "0.6rem",
                              color: isMe ? "rgba(255, 255, 255, 0.75)" : "#64748b",
                            }}
                          >
                            <span>{msg.time}</span>
                            {isMe && <span style={{ color: "#38bdf8" }}>✓✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Script Sides Attachment Card preview if thread hasSides */}
                  {currentActiveThread.hasSides && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        maxWidth: "88%",
                        background: "rgba(18, 22, 33, 0.95)",
                        border: "1px solid rgba(245, 158, 11, 0.35)",
                        borderRadius: "12px",
                        padding: "10px 12px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            background: "rgba(245, 158, 11, 0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FF9800",
                          }}
                        >
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>
                            {currentActiveThread.project}_Scene_14_Sides.pdf
                          </div>
                          <div style={{ fontSize: "0.62rem", color: "#94a3b8" }}>
                            2.4 MB &bull; Forensically Watermarked
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage("Opening watermarked script sides reader... 📑");
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        style={{
                          width: "100%",
                          background: "rgba(245, 158, 11, 0.18)",
                          border: "1px solid #FF9800",
                          color: "#FFB703",
                          borderRadius: "6px",
                          padding: "6px 10px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <Clapperboard size={12} /> Preview Script Sides
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Action Suggestion Chips */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    padding: "6px 12px",
                    overflowX: "auto",
                    background: "rgba(10, 13, 20, 0.95)",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setMobileReplyText("Yes, confirming availability for the chemistry read tomorrow at 4 PM! 🎬")}
                    style={{
                      background: "rgba(255, 152, 0, 0.12)",
                      border: "1px solid rgba(255, 152, 0, 0.35)",
                      color: "#FFB703",
                      borderRadius: "14px",
                      padding: "4px 10px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📅 Confirm 4 PM Read
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileReplyText("Self-tape monologue uploaded to my CineConnect Portfolio. Reviewing sides now! 🎭")}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#E2E8F0",
                      borderRadius: "14px",
                      padding: "4px 10px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    🎬 Send Self-Tape
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileReplyText("Shared my updated theatre credits & showreel link.")}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#E2E8F0",
                      borderRadius: "14px",
                      padding: "4px 10px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📄 Share Showreel
                  </button>
                </div>

                {/* Bottom Chat Input Bar */}
                <div
                  style={{
                    padding: "8px 12px",
                    background: "#0c0f17",
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    title="Attach Reel or Sides"
                    onClick={() => {
                      setToastMessage("Choose attachment: Video Showreel, Headshot, or PDF sides 📎");
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "50%",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--accent-gold)",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <Plus size={16} />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${currentActiveThread.sender}...`}
                    value={mobileReplyText}
                    onChange={(e) => setMobileReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleMobileSendReply(currentActiveThread.id);
                    }}
                    style={{
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.07)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "18px",
                      padding: "8px 14px",
                      color: "#fff",
                      fontSize: "0.78rem",
                      outline: "none",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => handleMobileSendReply(currentActiveThread.id)}
                    style={{
                      background: mobileReplyText.trim()
                        ? "linear-gradient(135deg, #FFB703 0%, #FF9800 100%)"
                        : "rgba(255, 255, 255, 0.1)",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: mobileReplyText.trim() ? "#08090C" : "#64748b",
                      cursor: mobileReplyText.trim() ? "pointer" : "default",
                      boxShadow: mobileReplyText.trim() ? "0 2px 10px rgba(255, 152, 0, 0.5)" : "none",
                      flexShrink: 0,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            ) : (
              /* ================= Full-Page Threads & Direct Inquiries List ================= */
              <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, flex: 1, overflow: "hidden" }}>
                {/* Header Row */}
                <div
                  style={{
                    padding: "12px 14px",
                    background: "linear-gradient(180deg, #121622 0%, #0c0f17 100%)",
                    borderBottom: "1px solid rgba(255, 152, 0, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleSelectTab("stream")}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "var(--accent-gold)",
                        borderRadius: "8px",
                        padding: "5px 9px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <Home size={13} /> Feed
                    </button>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                        💬 Studio Messages
                      </h3>
                      <span style={{ fontSize: "0.68rem", color: "var(--accent-gold)" }}>
                        Direct Inquiries & Casting Calls
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      background: "rgba(245, 158, 11, 0.18)",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                      color: "#FFB703",
                      padding: "3px 8px",
                      borderRadius: "12px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                    }}
                  >
                    {unreadMobileMsgCount} Unread
                  </span>
                </div>

                {/* Compliance / Security Tag */}
                <div
                  style={{
                    padding: "6px 14px",
                    background: "rgba(16, 20, 29, 0.95)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.68rem",
                    color: "#94a3b8",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Shield size={12} color="#10b981" /> DPDP 2026 End-to-End Encrypted
                  </span>
                  <span style={{ color: "#38bdf8", fontWeight: 600 }}>CineConnect Studio Vault</span>
                </div>

                {/* Search Bar */}
                <div style={{ padding: "8px 12px 6px", flexShrink: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255, 255, 255, 0.06)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "10px",
                      padding: "6px 10px",
                    }}
                  >
                    <Search size={14} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search directors, casting calls, or studios..."
                      value={messagesSearchQuery}
                      onChange={(e) => setMessagesSearchQuery(e.target.value)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        color: "#fff",
                        fontSize: "0.76rem",
                        outline: "none",
                      }}
                    />
                    {messagesSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setMessagesSearchQuery("")}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Category Chips */}
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    padding: "2px 12px 8px",
                    overflowX: "auto",
                    flexShrink: 0,
                  }}
                >
                  {(["all", "castings", "studios"] as const).map((tab) => {
                    const isTabActive = messagesFilterTab === tab;
                    const tabLabels = {
                      all: "All Inquiries",
                      castings: "🎬 Casting Calls",
                      studios: "🏢 Production Houses",
                    };
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setMessagesFilterTab(tab)}
                        style={{
                          background: isTabActive
                            ? "linear-gradient(135deg, rgba(255, 152, 0, 0.28) 0%, rgba(20, 24, 34, 0.98) 100%)"
                            : "rgba(255, 255, 255, 0.05)",
                          border: isTabActive ? "1.2px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.08)",
                          color: isTabActive ? "#FFFFFF" : "#94a3b8",
                          borderRadius: "14px",
                          padding: "4px 10px",
                          fontSize: "0.68rem",
                          fontWeight: isTabActive ? 700 : 500,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tabLabels[tab]}
                      </button>
                    );
                  })}
                </div>

                {/* Conversation Threads (Full height with internal scroll) */}
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    padding: "6px 12px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {filteredMobileThreads.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 14px", color: "#94a3b8" }}>
                      <MessageSquare size={32} color="#64748b" style={{ margin: "0 auto 10px", display: "block" }} />
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                        No conversations found
                      </div>
                      <div style={{ fontSize: "0.72rem" }}>
                        Try searching with a different director, casting call, or production name.
                      </div>
                    </div>
                  ) : (
                    filteredMobileThreads.map((thread) => (
                      <div
                        key={thread.id}
                        onClick={() => {
                          setSelectedMobileThread(thread.id);
                          setMobileMessages((prev) =>
                            prev.map((item) => (item.id === thread.id ? { ...item, unread: false } : item))
                          );
                        }}
                        style={{
                          background: thread.unread
                            ? "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, #111520 100%)"
                            : "#0f131c",
                          border: thread.unread
                            ? "1.2px solid rgba(245, 158, 11, 0.45)"
                            : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "14px",
                          padding: "11px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          cursor: "pointer",
                          boxShadow: thread.unread ? "0 4px 16px rgba(245, 158, 11, 0.15)" : "0 2px 8px rgba(0,0,0,0.3)",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img
                            src={thread.avatar}
                            alt={thread.sender}
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: thread.unread ? "2px solid #FF9800" : "1.5px solid rgba(255, 255, 255, 0.1)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: "#10b981",
                              border: "1.5px solid #080a0f",
                            }}
                          />
                        </div>

                        {/* Thread Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: thread.unread ? 800 : 700,
                                  color: thread.unread ? "#FFFFFF" : "#E2E8F0",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {thread.sender}
                              </span>
                              <CheckCircle2 size={12} color="#38bdf8" />
                            </div>
                            <span style={{ fontSize: "0.65rem", color: thread.unread ? "#FFB703" : "#64748b", flexShrink: 0 }}>
                              {thread.time}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                            <span style={{ fontSize: "0.68rem", color: "var(--accent-gold)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {thread.role}
                            </span>
                            {thread.project && (
                              <span
                                style={{
                                  fontSize: "0.6rem",
                                  background: "rgba(255, 255, 255, 0.08)",
                                  padding: "1px 6px",
                                  borderRadius: "6px",
                                  color: "#cbd5e1",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                🎬 {thread.project}
                              </span>
                            )}
                          </div>

                          <p
                            style={{
                              fontSize: "0.72rem",
                              color: thread.unread ? "#FFFFFF" : "#94a3b8",
                              fontWeight: thread.unread ? 600 : 400,
                              margin: 0,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {thread.text}
                          </p>
                        </div>

                        {/* Unread dot or chevron */}
                        {thread.unread ? (
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
                        ) : (
                          <ChevronRight size={15} color="#475569" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case "notifications":
        return (
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                  🔔 Notifications
                </h3>
                <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)" }}>
                  Audition Callbacks & Studio Updates
                </span>
              </div>
              {unreadMobileNotifCount > 0 && (
                <button
                  onClick={() => setMobileNotifications((prev) => prev.map((n) => ({ ...n, read: true, urgent: false })))}
                  style={{ background: "none", border: "none", color: "var(--accent-gold)", fontSize: "0.72rem", cursor: "pointer", fontWeight: 700 }}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {mobileNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() =>
                    setMobileNotifications((prev) =>
                      prev.map((item) => (item.id === n.id ? { ...item, read: true, urgent: false } : item))
                    )
                  }
                  style={{
                    padding: "12px",
                    background: n.urgent ? "rgba(245, 158, 11, 0.1)" : n.read ? "rgba(255,255,255,0.02)" : "#0f131c",
                    border: n.urgent ? "1px solid rgba(245, 158, 11, 0.35)" : "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {n.urgent && <span className="badge badge-rose" style={{ fontSize: "0.62rem", padding: "1px 5px" }}>URGENT</span>}
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: n.urgent ? "var(--accent-gold)" : "#fff" }}>
                        {n.title}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                    {n.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "talent":
        return (
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-gold)" }}>
              {FEATURED_TALENT.length} Featured Creators & Crew
            </span>

            {FEATURED_TALENT.map((talent) => (
              <div
                key={talent.id}
                style={{
                  background: "#0f131c",
                  borderRadius: "14px",
                  padding: "12px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={talent.avatar}
                    alt={talent.name}
                    style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-gold)" }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{talent.name}</span>
                      {talent.verified && <CheckCircle2 size={12} color="var(--accent-gold)" />}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)" }}>{talent.craft}</span>
                    <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                      {talent.creditsCount} Credits • {talent.city}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveShowreel(talent)}
                  className="btn-secondary"
                  style={{ padding: "6px 10px", fontSize: "0.72rem" }}
                >
                  <Play size={12} fill="var(--accent-gold)" color="var(--accent-gold)" /> Reel
                </button>
              </div>
            ))}
          </div>
        );

      case "pitches":
        return (
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFA500" }}>
              Screenplay & Pitch Vault (NDA Protected)
            </span>

            {PITCH_DECKS.map((pitch) => (
              <div
                key={pitch.id}
                style={{
                  background: "#0f131c",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <img src={pitch.coverImage} alt={pitch.title} style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{pitch.format}</span>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-gold)" }}>{pitch.estimatedBudget}</span>
                  </div>

                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{pitch.title}</h4>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Screenplay by {pitch.writer}</span>

                  <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.3 }}>
                    "{pitch.logline}"
                  </p>

                  <button
                    onClick={() => setActivePitch(pitch)}
                    className="btn-primary"
                    style={{ width: "100%", padding: "6px", fontSize: "0.75rem", marginTop: "4px" }}
                  >
                    Review Pitch Deck 📜
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case "pipeline":
        return (
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-emerald)" }}>
                {pipelineItems.length} Submissions in Progress
              </span>
              <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>
                My Applications
              </span>
            </div>

            {pipelineItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#0f131c",
                  borderRadius: "14px",
                  padding: "14px",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>{item.stage}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{item.appliedDate}</span>
                </div>

                <h4 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", margin: 0 }}>{item.projectTitle}</h4>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Role: <strong>{item.roleTitle}</strong> • {item.productionHouse}
                </span>

                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${item.progressPercent}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #f59e0b)" }} />
                </div>

                <div style={{ background: "rgba(245, 158, 11, 0.08)", padding: "8px", borderRadius: "6px", fontSize: "0.72rem" }}>
                  <span style={{ color: "var(--accent-gold)", fontWeight: 700, display: "block" }}>NEXT STEP</span>
                  <span style={{ color: "#fff" }}>{item.nextStepNote}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setToastMessage(`Tracking application for "${item.projectTitle}" (${item.stage}) 📋`);
                    setTimeout(() => setToastMessage(null), 2400);
                  }}
                  className="btn-primary"
                  style={{ width: "100%", padding: "6px", fontSize: "0.74rem", marginTop: "2px" }}
                >
                  View Submission Details 📄
                </button>
              </div>
            ))}
          </div>
        );

      case "profile":
        return (
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ textAlign: "center" }}>
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                alt="Profile"
                style={{ width: "70px", height: "70px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-gold)", margin: "0 auto 8px" }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0 }}>Kabir Mehra</h3>
              <span style={{ fontSize: "0.78rem", color: "var(--accent-gold)", display: "block", marginTop: "2px" }}>Lead Actor & Voice Artist</span>
              <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>Mumbai, India</span>
            </div>

            <div style={{ background: "#0f131c", padding: "12px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                <span>Profile Completeness</span>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>85%</span>
              </div>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "85%", height: "100%", background: "linear-gradient(90deg, #10b981, #f59e0b)" }} />
              </div>
            </div>

            <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Shield size={20} color="var(--accent-emerald)" />
              <div>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff", display: "block" }}>Government ID Verified</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Aadhaar & Passport Verified</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setToastMessage("Opening Portfolio & Showreel Editor 🎬");
                setTimeout(() => setToastMessage(null), 2400);
              }}
              className="btn-primary"
              style={{ width: "100%", padding: "8px", fontSize: "0.78rem" }}
            >
              Edit Studio Profile & Showreel
            </button>
          </div>
        );

      case "settings":
        return (
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FFA500" }}>
                Mobile Settings & Preferences
              </span>
              <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>
                System Ready
              </span>
            </div>

            <div style={{ background: "#1A1C23", padding: "12px", borderRadius: "12px", border: "1px solid #2E3340", display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Push Notifications Toggle */}
              <div
                onClick={() => {
                  setPushNotifsEnabled((prev) => {
                    const next = !prev;
                    setToastMessage(next ? "Push Notifications Enabled 🔔" : "Push Notifications Paused 🔕");
                    setTimeout(() => setToastMessage(null), 2200);
                    return next;
                  });
                }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>Push Notifications</span>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>Audition callbacks & instant director alerts</span>
                </div>
                <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: pushNotifsEnabled ? "#FFA500" : "rgba(255,255,255,0.15)", position: "relative", transition: "all 0.2s ease" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: pushNotifsEnabled ? "#0D0E12" : "#FFFFFF", position: "absolute", left: pushNotifsEnabled ? "18px" : "2px", top: "2px", transition: "all 0.2s ease" }} />
                </div>
              </div>

              <div style={{ height: "1px", background: "#2E3340" }} />

              {/* Dark Obsidian Theme */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>Dark Obsidian Theme</span>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>High-contrast gold & charcoal mode</span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#FFA500", fontWeight: 700 }}>Active</span>
              </div>

              <div style={{ height: "1px", background: "#2E3340" }} />

              {/* NDA Vault Security Toggle */}
              <div
                onClick={() => {
                  setNdaVaultEnabled((prev) => {
                    const next = !prev;
                    setToastMessage(next ? "Biometric NDA Vault Locked 🔒" : "Biometric NDA Vault Unlocked 🔓");
                    setTimeout(() => setToastMessage(null), 2200);
                    return next;
                  });
                }}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
              >
                <div>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>NDA Vault Security</span>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>Biometric pitch deck & script lock</span>
                </div>
                <div style={{ width: "36px", height: "20px", borderRadius: "10px", background: ndaVaultEnabled ? "#FFA500" : "rgba(255,255,255,0.15)", position: "relative", transition: "all 0.2s ease" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: ndaVaultEnabled ? "#0D0E12" : "#FFFFFF", position: "absolute", left: ndaVaultEnabled ? "18px" : "2px", top: "2px", transition: "all 0.2s ease" }} />
                </div>
              </div>
            </div>

            <div style={{ background: "#1A1C23", padding: "12px", borderRadius: "12px", border: "1px solid #2E3340" }}>
              <span style={{ fontSize: "0.72rem", color: "#9E9E9E", display: "block" }}>APP VERSION</span>
              <span style={{ fontSize: "0.82rem", color: "#FFFFFF", fontWeight: 700 }}>Antigravity Mobile v2.4 (Studio Build)</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06080c", padding: "24px 16px" }}>
      {/* Top Banner Control Bar */}
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          background: "rgba(15, 19, 28, 0.8)",
          padding: "12px 20px",
          borderRadius: "14px",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Smartphone size={22} color="var(--accent-gold)" />
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              CineConnect Mobile App Experience
            </h2>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Interactive mobile simulator running the Flutter & native mobile UI
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            <Laptop size={15} /> Switch to Desktop Web
          </a>

          <div
            style={{
              display: "inline-flex",
              background: "rgba(255,255,255,0.06)",
              padding: "3px",
              borderRadius: "8px",
            }}
          >
            <button
              onClick={() => setDeviceModel("iphone")}
              style={{
                background: deviceModel === "iphone" ? "var(--accent-gold)" : "transparent",
                color: deviceModel === "iphone" ? "#000" : "#fff",
                border: "none",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              iPhone
            </button>
            <button
              onClick={() => setDeviceModel("android")}
              style={{
                background: deviceModel === "android" ? "var(--accent-gold)" : "transparent",
                color: deviceModel === "android" ? "#000" : "#fff",
                border: "none",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Android
            </button>
          </div>
        </div>
      </div>

      {/* Center Phone Chassis Frame */}
      <div
        style={{
          maxWidth: "390px",
          height: "780px",
          margin: "0 auto",
          background: "#080a0f",
          borderRadius: deviceModel === "iphone" ? "48px" : "28px",
          border: "8px solid #1c2230",
          boxShadow: "0 25px 60px -10px rgba(0,0,0,0.9), 0 0 25px rgba(245, 158, 11, 0.25)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Notch / Dynamic Island */}
        <div
          style={{
            height: "44px",
            background: "#080a0f",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            fontSize: "0.75rem",
            color: "#fff",
            fontWeight: 700,
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            zIndex: 10,
          }}
        >
          <span>9:41</span>
          {deviceModel === "iphone" ? (
            <div
              style={{
                width: "90px",
                height: "22px",
                background: "#000",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            />
          ) : (
            <div style={{ width: "10px", height: "10px", background: "#000", borderRadius: "50%" }} />
          )}
          <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)" }}>5G 100%</span>
        </div>

        {/* Floating Action Toast Banner (Instagram Style) */}
        {toastMessage && (
          <div
            style={{
              position: "absolute",
              top: "92px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(18, 22, 32, 0.96)",
              border: "1.5px solid #FF9800",
              color: "#FFFFFF",
              padding: "7px 16px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 700,
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.75), 0 0 12px rgba(255, 152, 0, 0.4)",
              zIndex: 99,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backdropFilter: "blur(12px)",
              whiteSpace: "nowrap",
            }}
          >
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Mobile App Header */}
        <div
          style={{
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%)",
            boxShadow: "inset 0 -1px 0 rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "var(--accent-gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clapperboard size={16} color="#000" />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff" }}>
              Cine<span style={{ color: "var(--accent-gold)" }}>Connect</span>
            </span>
          </div>

          {/* Top Right Mobile Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {/* Notifications Button */}
            <button
              id="mobile-notifications-top-btn"
              title="Notifications"
              onClick={() => handleSelectTab("notifications")}
              style={{
                background: activeTab === "notifications" ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.08)",
                border: activeTab === "notifications" ? "1.5px solid #FF9800" : "1px solid var(--border-subtle)",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activeTab === "notifications" ? "var(--accent-gold)" : "#fff",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Bell size={14} />
              {unreadMobileNotifCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #080a0f",
                  }}
                >
                  {unreadMobileNotifCount}
                </span>
              )}
            </button>

            {/* Messages Button (Second) */}
            <button
              id="mobile-messages-top-btn"
              title="Messages"
              onClick={() => handleSelectTab("messages")}
              style={{
                background: activeTab === "messages" ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.08)",
                border: activeTab === "messages" ? "1.5px solid #FF9800" : "1px solid var(--border-subtle)",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activeTab === "messages" ? "var(--accent-gold)" : "#fff",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <InstagramDmIcon size={15} style={{ transform: "rotate(-5deg)", marginLeft: "-1px" }} />
              {unreadMobileMsgCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#10b981",
                    color: "#000",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1.5px solid #080a0f",
                  }}
                >
                  {unreadMobileMsgCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Screen Body Viewport (Zero feed leakage when in Messages, full-height for Reels) */}
        <div
          ref={mobileBodyScrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            height: "100%",
            overflowY: activeTab === "messages" || activeTab === "reels" ? "hidden" : "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            background: "#080a0f",
            paddingBottom: activeTab === "reels" ? "0" : "100px",
          }}
        >
          {renderMobileScreen()}
        </div>

        {/* Prominent Semi-Circle Rotating Wheel Navigation Bar with All 8 Icons Fully Visible */}
        <nav
          ref={navContainerRef}
          onPointerDown={handleNavPointerDown}
          onPointerMove={handleNavPointerMove}
          onPointerUp={handleNavPointerUp}
          onPointerCancel={handleNavPointerUp}
          onMouseLeave={handleNavMouseLeave}
          onWheel={handleNavWheel}
          suppressHydrationWarning
          aria-label="CineConnect Semi-Circle Rotating Wheel Navigation"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "124px",
            background: "linear-gradient(180deg, rgba(16, 20, 32, 0.96) 0%, rgba(8, 10, 16, 0.99) 100%)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderRadius: "50% 50% 0 0 / 44px 44px 0 0",
            borderTop: "2.5px solid #FF9800",
            overflow: "hidden",
            zIndex: 40,
            boxShadow: "0 -8px 28px rgba(255, 152, 0, 0.45), 0 -14px 40px rgba(0, 0, 0, 0.95)",
            userSelect: "none",
            touchAction: "pan-y",
          }}
        >
          {/* Top Amber Specular Glare Arc */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "2.5px",
              background: "linear-gradient(90deg, transparent 0%, #FFE082 30%, #FF9800 50%, #FFE082 70%, transparent 100%)",
              boxShadow: "0 0 14px #FF9800, 0 0 24px rgba(255, 152, 0, 0.7)",
              pointerEvents: "none",
            }}
          />

          {/* Semi-Circle Arc SVG Rim Highlight Contour */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "54px",
              pointerEvents: "none",
              overflow: "visible",
            }}
            viewBox="0 0 374 54"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="wheelRimContour" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="rgba(255, 152, 0, 0.35)" />
                <stop offset="50%" stopColor="rgba(255, 152, 0, 1)" />
                <stop offset="80%" stopColor="rgba(255, 152, 0, 0.35)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M 0 44 Q 187 2 374 44"
              fill="none"
              stroke="url(#wheelRimContour)"
              strokeWidth="2.5"
            />
          </svg>

          {/* Rotating Wheel Dial Disc with Concentric Tracks & 8 Graduation Ticks */}
          <div
            style={{
              position: "absolute",
              bottom: "-150px",
              left: "50%",
              width: "350px",
              height: "350px",
              marginLeft: "-175px",
              borderRadius: "50%",
              border: "2px dashed rgba(255, 152, 0, 0.32)",
              boxShadow: "inset 0 0 30px rgba(255, 152, 0, 0.12)",
              pointerEvents: "none",
              transform: `rotate(${wheelRotation}deg)`,
              transition: isPointerDownRef.current ? "none" : "transform 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
              zIndex: 10,
            }}
          >
            {/* Inner Concentric Bezel Ring */}
            <div
              style={{
                position: "absolute",
                inset: "26px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 152, 0, 0.15)",
              }}
            />

            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
              <div
                key={deg}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  width: "2px",
                  height: "12px",
                  marginLeft: "-1px",
                  background: i === currentNavIndex ? "#FF9800" : "rgba(255, 255, 255, 0.28)",
                  boxShadow: i === currentNavIndex ? "0 0 10px #FF9800" : "none",
                  transformOrigin: "50% 175px",
                  transform: `rotate(${deg}deg)`,
                }}
              />
            ))}
          </div>

          {/* All 8 Destinations Arrayed Along Semi-Circle Trigonometric Arc (100% Fully Visible) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "82px",
              zIndex: 25,
            }}
          >
            {ALL_MOBILE_NAV_ITEMS.map((item, idx) => {
              const isActive = activeTab === item.id;
              const IconComp = item.icon;

              // 8 exact angles spanning the upper semi-circle from -65° to +65°
              const ARC_ANGLES = [-65, -46.5, -28, -9.5, 9.5, 28, 46.5, 65];
              const angleDeg = ARC_ANGLES[idx];
              const rad = (angleDeg * Math.PI) / 180;

              // Semi-circular trigonometry with 142px horizontal radius
              const xOffset = Math.sin(rad) * 142;
              // Parabolic vertical drop: apex is highest at y = 16px, edges at y = 45px
              const yOffset = 16 + (1 - Math.cos(rad)) * 46;

              const badgeCount =
                item.id === "messages"
                  ? unreadMobileMsgCount
                  : item.id === "notifications"
                  ? unreadMobileNotifCount
                  : 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`semi-wheel-item-${item.id}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTab(item.id);
                  }}
                  title={item.label}
                  style={{
                    position: "absolute",
                    left: `calc(50% + ${xOffset}px)`,
                    top: `${yOffset}px`,
                    transform: `translate(-50%, -50%) ${isActive ? "scale(1.2) translateY(-4px)" : "scale(0.96)"}`,
                    transition: "all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                    background: "none",
                    border: "none",
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    outline: "none",
                    zIndex: isActive ? 35 : 20,
                  }}
                >
                  {/* Glowing Aura Ring for Active 1-by-1 Item */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "rgba(255, 152, 0, 0.45)",
                        filter: "blur(8px)",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  {/* Icon Container */}
                  <div
                    style={{
                      position: "relative",
                      width: isActive ? "38px" : "28px",
                      height: isActive ? "38px" : "28px",
                      borderRadius: "50%",
                      background: isActive
                        ? "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)"
                        : "rgba(20, 24, 36, 0.88)",
                      border: isActive
                        ? "2.5px solid #FFFFFF"
                        : "1px solid rgba(255, 255, 255, 0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isActive
                        ? "0 4px 18px rgba(255, 152, 0, 0.8), 0 0 12px rgba(255, 152, 0, 0.5)"
                        : "0 2px 6px rgba(0, 0, 0, 0.5)",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <IconComp
                      size={isActive ? 20 : 14}
                      color={isActive ? "#08090C" : "#CBD5E1"}
                      strokeWidth={isActive ? 2.6 : 2}
                    />

                    {/* Unread Counter Badge */}
                    {badgeCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-3px",
                          right: "-3px",
                          minWidth: "14px",
                          height: "14px",
                          padding: "0 2.5px",
                          borderRadius: "7px",
                          background: item.id === "messages" ? "#10b981" : "#ef4444",
                          color: "#fff",
                          fontSize: "7.5px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1.5px solid #080a0f",
                        }}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </div>

                  {/* Option Label */}
                  <div
                    style={{
                      marginTop: "2px",
                      background: isActive ? "#101219" : "transparent",
                      border: isActive ? "1px solid #FF9800" : "1px solid transparent",
                      padding: isActive ? "1px 5px" : "1px 2px",
                      borderRadius: "6px",
                      boxShadow: isActive ? "0 2px 6px rgba(255, 152, 0, 0.4)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        fontSize: item.label.length > 8 ? "6.8px" : "7.5px",
                        fontWeight: isActive ? 800 : 600,
                        color: isActive ? "#FFFFFF" : "#858995",
                        letterSpacing: item.label.length > 8 ? "-0.02em" : "0.01em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Controls: Prev Stepper (←) + Active Breadcrumb + 8 Beads + Next Stepper (→) */}
          <div
            style={{
              position: "absolute",
              bottom: "4px",
              left: "10px",
              right: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 38,
            }}
          >
            {/* Prev 1-by-1 Stepper Button */}
            <button
              type="button"
              id="mobile-nav-prev-btn"
              title="Previous destination"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handlePrevItem();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: "12px",
                padding: "2.5px 8px",
                color: "#CBD5E1",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={13} color="#CBD5E1" strokeWidth={2.5} />
              <span style={{ fontSize: "8px", fontWeight: 700 }}>Prev</span>
            </button>

            {/* Center: Active Tab Pill & 8-Dot Dial Stream */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {/* Active Tab Subtitle Pill */}
              <div
                style={{
                  background: "rgba(255, 152, 0, 0.18)",
                  border: "1px solid rgba(255, 152, 0, 0.5)",
                  borderRadius: "8px",
                  padding: "1.5px 7px",
                  display: "flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                <span style={{ fontSize: "8px", fontWeight: 800, color: "#FF9800" }}>
                  {ALL_MOBILE_NAV_ITEMS[currentNavIndex]?.label}
                </span>
                <span style={{ fontSize: "7px", fontWeight: 600, color: "#CBD5E1" }}>
                  • {ALL_MOBILE_NAV_ITEMS[currentNavIndex]?.subtitle}
                </span>
              </div>

              {/* 8 Indicator Beads */}
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {ALL_MOBILE_NAV_ITEMS.map((item, idx) => {
                  const isSelected = currentNavIndex === idx;
                  return (
                    <button
                      key={`indicator-${item.id}`}
                      type="button"
                      title={item.label}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTab(item.id);
                      }}
                      style={{
                        height: "3.5px",
                        width: isSelected ? "15px" : "4px",
                        borderRadius: "2px",
                        background: isSelected ? "#FF9800" : "rgba(255, 255, 255, 0.25)",
                        boxShadow: isSelected ? "0 0 6px #FF9800" : "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        transition: "all 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Next 1-by-1 Stepper Button */}
            <button
              type="button"
              id="mobile-nav-next-btn"
              title="Next destination"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleNextItem();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                borderRadius: "12px",
                padding: "2.5px 8px",
                color: "#CBD5E1",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "8px", fontWeight: 700 }}>Next</span>
              <ChevronRight size={13} color="#CBD5E1" strokeWidth={2.5} />
            </button>
          </div>
        </nav>


      </div>

      {/* Modals */}
      <AuditionModal
        casting={activeAudition}
        onClose={() => setActiveAudition(null)}
        onSubmitSuccess={handleAuditionSubmitted}
      />
      <ShowreelModal talent={activeShowreel} onClose={() => setActiveShowreel(null)} />
      <PitchModal pitch={activePitch} onClose={() => setActivePitch(null)} />
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={(post) => setFeedPosts([post, ...feedPosts])}
        />
      )}

      {/* Post Your Reel Modal */}
      {showPostReelModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowPostReelModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "500px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              background: "#0c1017",
              border: "1px solid rgba(255, 152, 0, 0.4)",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 152, 0, 0.2)",
              padding: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(to right, rgba(255, 152, 0, 0.12), transparent)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(255, 152, 0, 0.2)",
                    border: "1px solid #FF9800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Film size={20} color="#FF9800" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                    Post Your Reel
                  </h3>
                  <p style={{ fontSize: "0.72rem", color: "#A0AEC0", margin: 0 }}>
                    Share your showreel, monologue, or action sequence
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPostReelModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "none",
                  color: "#A0AEC0",
                  width: "32px",
                  height: "32px",
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

            {/* Form */}
            <form onSubmit={handlePublishReel} style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Craft Category Picker */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0", marginBottom: "6px" }}>
                  Select Craft Category
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                  {[
                    { id: "acting" as const, label: "🎭 Acting Monologue" },
                    { id: "cinematography" as const, label: "🎥 Cinematography" },
                    { id: "stunts" as const, label: "💥 Stunts & Action" },
                    { id: "direction" as const, label: "🎬 Directing Cut" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewReelCategory(cat.id)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "10px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: newReelCategory === cat.id ? "1.5px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.1)",
                        background: newReelCategory === cat.id ? "rgba(255, 152, 0, 0.18)" : "rgba(255, 255, 255, 0.03)",
                        color: newReelCategory === cat.id ? "#FF9800" : "#CBD5E1",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reel Title */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0", marginBottom: "6px" }}>
                  Reel Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Macbeth Monologue - Raw Screen Test"
                  value={newReelTitle}
                  onChange={(e) => setNewReelTitle(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Creator Name & Craft */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0", marginBottom: "6px" }}>
                    Creator / Talent Name
                  </label>
                  <input
                    type="text"
                    value={newReelCreatorName}
                    onChange={(e) => setNewReelCreatorName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0", marginBottom: "6px" }}>
                    Specialization / Craft
                  </label>
                  <input
                    type="text"
                    value={newReelCraft}
                    onChange={(e) => setNewReelCraft(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      fontSize: "0.82rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              {/* Video URL & Quick Presets */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0" }}>
                    Video URL or Demo Preset
                  </label>
                  <span style={{ fontSize: "0.68rem", color: "#FF9800" }}>
                    MP4 / WebM / CDN
                  </span>
                </div>
                <input
                  type="url"
                  required
                  value={newReelVideoUrl}
                  onChange={(e) => setNewReelVideoUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.78rem",
                    outline: "none",
                    marginBottom: "8px",
                  }}
                />

                {/* Preset Video Pickers */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[
                    {
                      label: "🎭 Acting Reel",
                      url: "/reels/reel1.mp4",
                    },
                    {
                      label: "🎥 Cinematography",
                      url: "/reels/reel2.mp4",
                    },
                    {
                      label: "💥 Combat Stunts",
                      url: "/reels/reel3.mp4",
                    },
                    {
                      label: "🎬 Directing Cut",
                      url: "/reels/reel4.mp4",
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewReelVideoUrl(preset.url)}
                      style={{
                        background: newReelVideoUrl === preset.url ? "rgba(255, 152, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
                        border: newReelVideoUrl === preset.url ? "1px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "3px 8px",
                        fontSize: "0.68rem",
                        color: newReelVideoUrl === preset.url ? "#FF9800" : "#CBD5E1",
                        cursor: "pointer",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Soundtrack Tag */}
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0", marginBottom: "6px" }}>
                  <Music size={13} color="#FF9800" />
                  <span>Audio / Soundtrack Tag</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Original Sound - Kabir Mehra"
                  value={newReelSoundTrack}
                  onChange={(e) => setNewReelSoundTrack(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Logline / Description */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#E2E8F0", marginBottom: "6px" }}>
                  Logline / Scene Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell directors, casting agents, and collaborators about this scene, gear used, or audition context..."
                  value={newReelDesc}
                  onChange={(e) => setNewReelDesc(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
                <button
                  type="button"
                  onClick={() => setShowPostReelModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#E2E8F0",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-reel-btn"
                  style={{
                    flex: 2,
                    padding: "10px",
                    borderRadius: "12px",
                    background: "#FF9800",
                    border: "none",
                    color: "#08090C",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(255, 152, 0, 0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <Film size={16} strokeWidth={2.5} />
                  <span>Publish Reel 🚀</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
