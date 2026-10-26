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
  EyeOff,
  XCircle,
  Trash2,
  Clock,
  Download,
  LogOut,
  CreditCard,
  Users,
  SlidersHorizontal,
  CheckCheck,
  Eye,
} from "lucide-react";
import {
  FEATURED_TALENT,
  OPEN_CASTINGS,
  PITCH_DECKS,
  HOME_FEED_POSTS,
  MY_APPLICATIONS,
  OPPORTUNITY_APPLICATIONS,
  OpportunityApplicationItem,
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
import FeedVideoPlayer from "@/components/FeedVideoPlayer";
import InstagramCommentsModal, { CommentItem } from "@/components/InstagramCommentsModal";
import PostActionMenu from "@/components/PostActionMenu";

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
              audio.play().catch(() => { });
            }
          })
          .catch(() => {
            // Browser restricted unmuted autoplay; fallback to muted
            video.muted = true;
            video.play().then(() => setIsPlaying(true)).catch(() => { });
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
        audio.play().catch(() => { });
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
              if (audio && !isMuted) audio.play().catch(() => { });
              setPlayPauseState("play");
            })
            .catch(() => { });
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
  const [opportunityApplications, setOpportunityApplications] = useState<OpportunityApplicationItem[]>(OPPORTUNITY_APPLICATIONS);
  const [opportunityAppTab, setOpportunityAppTab] = useState<"applied" | "saved" | "rejected" | "all">("all");
  const [auditionsSubView, setAuditionsSubView] = useState<"opportunities" | "my-applications">("opportunities");
  const [showMobileMyAppsModal, setShowMobileMyAppsModal] = useState<boolean>(false);
  const [activeShowreel, setActiveShowreel] = useState<TalentItem | null>(null);
  const [activePitch, setActivePitch] = useState<PitchDeck | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [deviceModel, setDeviceModel] = useState<"iphone" | "android" | "fullscreen">("iphone");
  const [followedAuthors, setFollowedAuthors] = useState<string[]>([]);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchCategory, setSearchCategory] = useState<"all" | "reels" | "posts" | "opportunities" | "talent" | "pitches">("all");

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
        .catch(() => { });
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#post-${post.id}`);
      setToastMessage("Post link copied to clipboard! 📋");
      setTimeout(() => setToastMessage(null), 2400);
    } else {
      setToastMessage("Post link copied to clipboard! 📋");
      setTimeout(() => setToastMessage(null), 2400);
    }
  };

  // Complete Core Navigation Destinations (7 Core Options)
  const ALL_MOBILE_NAV_ITEMS = [
    { id: "stream" as const, label: "Home", subtitle: "Studio Feed", icon: Home },
    { id: "talent" as const, label: "Search", subtitle: "Reels, Posts & Roles", icon: Search },
    { id: "auditions" as const, label: "Opportunities", subtitle: "Auditions & Roles", icon: Clapperboard },
    { id: "notifications" as const, label: "Notification", subtitle: "Callbacks & Match", icon: Bell },
    { id: "profile" as const, label: "Profile", subtitle: "Showreels & Bio", icon: UserRound },
    { id: "messages" as const, label: "Messages", subtitle: "Production DMs", icon: MessageSquare },
    { id: "settings" as const, label: "Settings", subtitle: "App & Security", icon: Settings },
  ];

  // 2-by-2 Rotating Wheel Navigation System
  const NAV_PAIRS = [
    {
      id: 0,
      name: "Pair 1",
      pairLabel: "Home & Search",
      primary: { id: "stream" as const, label: "Home", icon: Home, subtitle: "Studio Feed" },
      companion: { id: "talent" as const, label: "Search", icon: Search, subtitle: "Reels, Posts & Roles" },
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
      pairLabel: "Settings & Security",
      primary: { id: "settings" as const, label: "Settings", icon: Settings, subtitle: "App & Security" },
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
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },

      title: "Interrogation Room - Unbroken Monologue",
      description: "Screen test for Netflix psychological thriller 'Shadow of Verity'. Single continuous monologue take under harsh tungsten lamp.",
      videoUrl: "/reels/reel1.mp4",
      audioUrl: "/reels/audio1.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=800&auto=format&fit=crop&q=80",
      category: "acting",
      soundTrack: "Original Dialogue Monologue — Kabir Mehra",
      likes: 2420,
      commentsCount: 184,
      shares: 412,
      isLiked: false,
    },
    {
      id: "reel-2",
      creator: {
        name: "Aanya Sen",
        craft: "Cinematographer (ISC)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "2.39:1 Anamorphic Neon Rain Sequence",
      description: "Arri Alexa 35 + Cooke Anamorphic /i Full Frame Plus. Natural sodium streetlights, rain streaks, and deep optical flaring.",
      videoUrl: "/reels/reel2.mp4",
      audioUrl: "/reels/audio2.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&auto=format&fit=crop&q=80",
      category: "cinematography",
      soundTrack: "Neo-Noir Rain Atmosphere — Aanya Sen",
      likes: 3810,
      commentsCount: 295,
      shares: 610,
      isLiked: false,
    },
    {
      id: "reel-3",
      creator: {
        name: "Vikram Rathore",
        craft: "Action Director & Stunts",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "Pre-Viz Close Quarters Combat & Wire Stunts",
      description: "Martial arts choreography test for upcoming OTT thriller. Tactical disarms, wire ascents, and high-impact crash mat landings.",
      videoUrl: "/reels/reel3.mp4",
      audioUrl: "/reels/audio3.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
      category: "stunts",
      soundTrack: "High-Tempo Combat Drums — Stunt Team",
      likes: 5120,
      commentsCount: 420,
      shares: 890,
      isLiked: false,
    },
    {
      id: "reel-4",
      creator: {
        name: "Devrath Banerjee",
        craft: "CAS Sound Designer",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "3D Spatial Audio: Himalayan Wind & Foley",
      description: "Binaural 96kHz/24-bit field capture at 14,000 ft in Spiti Valley. Put on your headphones to experience spatial immersion.",
      videoUrl: "/reels/reel4.mp4",
      audioUrl: "/reels/audio4.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
      category: "sound",
      soundTrack: "Pure Spatial Mountain Atmos — Devrath B.",
      likes: 1940,
      commentsCount: 112,
      shares: 310,
      isLiked: false,
    },
    {
      id: "reel-5",
      creator: {
        name: "Tara Roy",
        craft: "Steadicam & Camera Operator",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "One-Shot Steadicam Ballroom Sequence",
      description: "A 3-minute continuous Steadicam journey through an elaborate Victorian set following 5 characters without a hidden cut.",
      videoUrl: "/reels/reel2.mp4",
      audioUrl: "/reels/audio2.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop&q=80",
      category: "camera",
      soundTrack: "Orchestral Waltz in D Minor — CineLive",
      likes: 3410,
      commentsCount: 215,
      shares: 530,
      isLiked: false,
    },
    {
      id: "reel-6",
      creator: {
        name: "Ranganathan K.",
        craft: "Indie Director & Showrunner",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: "Period Deccan Western - Director's Cut",
      description: "Teaser scenes from our independent festival western feature. Shot on location in the rocky ravines of Bellary.",
      videoUrl: "/reels/reel1.mp4",
      audioUrl: "/reels/audio1.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=800&auto=format&fit=crop&q=80",
      category: "direction",
      soundTrack: "Deccan Iron Acoustic Score — Ranganathan",
      likes: 2780,
      commentsCount: 168,
      shares: 440,
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
      { id: "c4", user: "Sudeep Chatterjee (ISC)", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80", text: "Exceptional shadow roll-off with those Cooke Anamorphics. Great flare control in the rain! 🎥", time: "1h ago", verified: true },
      { id: "c5", user: "Dharma Productions", avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80", text: "Saved to our camera crew roster for Q3 shoot.", time: "3h ago", verified: true },
    ],
    "reel-3": [
      { id: "c6", user: "Action Directors Guild", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80", text: "The wire transition at the vault jump was seamless. High level stunt rigging! 💥", time: "30m ago", verified: true },
    ],
    "reel-4": [
      { id: "c7", user: "Karan Johar", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80", text: "Brilliant spatial depth! The wind flutter against the rock face sounds uncanny in Atmos.", time: "3h ago", verified: true },
    ],
    "reel-5": [
      { id: "c8", user: "Ananya Roy", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", text: "Operating on that Steadicam rig is buttery smooth! Zero footstep wobble through the doorway.", time: "1h ago", verified: true },
    ],
    "reel-6": [
      { id: "c9", user: "Vikramaditya Motwane", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80", text: "The color palette in that dry Deccan ravine is magnificent. Reminds me of Leone's best work.", time: "45m ago", verified: true },
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
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
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

  // 3-Dots Action Menu & Feedback State for Posts & In-feed Videos
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [activeFeedCommentsItem, setActiveFeedCommentsItem] = useState<{
    id: string;
    author: { name: string; avatar: string; craft?: string; verified?: boolean };
    content: string;
    commentsCount: number;
  } | null>(null);

  // Post & In-feed Comments Data Map
  const [feedPostCommentsMap, setFeedPostCommentsMap] = useState<Record<string, CommentItem[]>>({
    "feed-1": [
      { id: "c1", user: "Zoya Akhtar", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Exceptional concept! Sending this to Excel Entertainment script scouts today.", time: "2h ago", verified: true, likes: 24 },
      { id: "c2", user: "Anurag Kashyap", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80", text: "Raw, gritty, and truthful. This is cinema.", time: "4h ago", verified: true, likes: 45 },
    ],
    "feed-2": [
      { id: "c3", user: "Sudeep Chatterjee (ISC)", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80", text: "Masterful lighting tone! Love how the rain reflections separate the subjects.", time: "1h ago", verified: true, likes: 18 },
      { id: "c4", user: "Vikram Rathore", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80", text: "Pacing is sharp! Let's collaborate on our next project.", time: "3h ago", verified: true, likes: 12 },
    ],
    "feed-3": [
      { id: "c5", user: "Pooja Hegde", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", text: "Such inspiring dedication! Rooting for the entire ensemble. ✨", time: "5h ago", likes: 31 },
    ],
    "feed-4": [
      { id: "c6", user: "Karan Johar", avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=100&auto=format&fit=crop&q=80", text: "Huge congratulations to the entire production unit! Onward to Schedule 2.", time: "6h ago", verified: true, likes: 52 },
    ],
    "feed-5": [
      { id: "c7", user: "Farah Khan", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&auto=format&fit=crop&q=80", text: "That counter-weighted rig looks super safe and solid. Beautiful landing!", time: "7h ago", verified: true, likes: 29 },
    ],
    "feed-6": [
      { id: "c8", user: "Resul Pookutty", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80", text: "Schoeps MK41 clarity is unparalleled for indoor acoustics. Phenomenal spatial mastering.", time: "10h ago", verified: true, likes: 64 },
    ],
    "reel-1": [
      { id: "rc1", user: "Rohan Varma", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80", text: "Incredible emotional range Kabir! That pause at 0:45 gave me literal goosebumps 🔥", time: "2h ago", verified: true, likes: 58 },
      { id: "rc2", user: "Zoya Akhtar Office", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", text: "Please DM your agency representation contact. Casting team is reviewing.", time: "4h ago", verified: true, likes: 82 },
    ],
    "reel-2": [
      { id: "rc3", user: "Sudeep Chatterjee (ISC)", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80", text: "Exceptional shadow roll-off with those Cooke Anamorphics. Great flare control in the rain! 🎥", time: "1h ago", verified: true, likes: 37 },
    ],
    "reel-3": [
      { id: "rc4", user: "Action Directors Guild", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80", text: "The wire transition at the vault jump was seamless. High level stunt rigging! 💥", time: "30m ago", verified: true, likes: 44 },
    ],
    "reel-4": [
      { id: "rc5", user: "Karan Johar", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80", text: "Brilliant spatial depth! The wind flutter against the rock face sounds uncanny in Atmos.", time: "3h ago", verified: true, likes: 31 },
    ],
    "reel-5": [
      { id: "rc6", user: "Ananya Roy", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", text: "Operating on that Steadicam rig is buttery smooth! Zero footstep wobble through the doorway.", time: "1h ago", verified: true, likes: 25 },
    ],
    "reel-6": [
      { id: "rc7", user: "Vikramaditya Motwane", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80", text: "The color palette in that dry Deccan ravine is magnificent. Reminds me of Leone's best work.", time: "45m ago", verified: true, likes: 49 },
    ],
  });

  const [feedPostCommentCounts, setFeedPostCommentCounts] = useState<Record<string, number>>({
    "feed-1": 42,
    "feed-2": 89,
    "feed-3": 28,
    "feed-4": 56,
    "feed-5": 31,
    "feed-6": 26,
    "reel-1": 184,
    "reel-2": 295,
    "reel-3": 420,
    "reel-4": 112,
    "reel-5": 215,
    "reel-6": 168,
  });

  const handlePostInterested = (id: string) => {
    handleShowToast("Marked as Interested! Tuning your feed ✨");
    setOpenMenuPostId(null);
  };

  const handlePostNotInterested = (id: string) => {
    setHiddenPostIds((prev) => [...prev, id]);
    handleShowToast("Post hidden. We'll show fewer posts like this.");
    setOpenMenuPostId(null);
  };

  const handleUndoHidePost = (id: string) => {
    setHiddenPostIds((prev) => prev.filter((item) => item !== id));
    handleShowToast("Post restored to feed ↩️");
  };

  const handlePostReport = (id: string) => {
    handleShowToast("Report submitted for review. Thank you for keeping CineConnect safe! 🛡️");
    setOpenMenuPostId(null);
  };

  const handleOpenFeedComments = (item: {
    id: string;
    author: { name: string; avatar: string; craft?: string; verified?: boolean };
    content: string;
    commentsCount: number;
  }) => {
    setActiveFeedCommentsItem(item);
  };

  const handleAddFeedComment = (itemId: string, text: string) => {
    const newComment: CommentItem = {
      id: "cmt-" + Date.now(),
      user: "Current Creator",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      text: text.trim(),
      time: "Just now",
      verified: true,
      likes: 0,
    };
    setFeedPostCommentsMap((prev) => ({
      ...prev,
      [itemId]: [newComment, ...(prev[itemId] || [])],
    }));
    setFeedPostCommentCounts((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
    handleShowToast("Comment posted! 💬");
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
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        verified: true,
      },
      title: newReelTitle,
      description: newReelDesc || "Exclusive reel submission on CineConnect showcase.",
      videoUrl: newReelVideoUrl || "/reels/reel1.mp4",
      audioUrl: "/reels/audio1.mp3",
      thumbnailUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
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

  // Reorganized Instagram-Style CineConnect Settings State
  // Section 1: How to use CineConnect
  const [showSavedSheet, setShowSavedSheet] = useState(false);
  const [showArchiveSheet, setShowArchiveSheet] = useState(false);
  const [savedCollectionCount, setSavedCollectionCount] = useState(12);

  // Section 2: Subscriptions
  const [currentPlanTier, setCurrentPlanTier] = useState<"TALENT_PRO" | "STUDIO_PASS">("TALENT_PRO");
  const [showSubscriptionSheet, setShowSubscriptionSheet] = useState(false);

  // Section 3: Who can see your account
  const [isPrivateAccount, setIsPrivateAccount] = useState(false);
  const [showCloseFriendsSheet, setShowCloseFriendsSheet] = useState(false);
  const [closeFriendsList, setCloseFriendsList] = useState([
    { id: "cf-1", name: "Aanya Sen", role: "Cinematographer (ISC)" },
    { id: "cf-2", name: "Vikram Rathore", role: "Action Director" },
    { id: "cf-3", name: "Zoya Akhtar Studio", role: "Directing Office" },
  ]);
  const [showBlockedSheet, setShowBlockedSheet] = useState(false);
  const [blockedList, setBlockedList] = useState([
    { id: "blk-1", name: "Rogue Talent Agency", reason: "Unsolicited Cold Calls" },
    { id: "blk-2", name: "Apex Studios Bot", reason: "Spam Submissions" },
  ]);

  // Section 4: How others can interact with you
  const [showMessagingPrivacySheet, setShowMessagingPrivacySheet] = useState(false);
  const [messagePermission, setMessagePermission] = useState<"everyone" | "verified_production" | "connections">("verified_production");
  const [allowStoryReplies, setAllowStoryReplies] = useState(true);
  const [showRestrictedSheet, setShowRestrictedSheet] = useState(false);
  const [restrictedList, setRestrictedList] = useState([
    { id: "rst-1", name: "Metro Line Productions", note: "Comments hidden, DMs moved to message requests" },
  ]);

  // Section 5: Core Account & System Actions
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [showPasswordSheet, setShowPasswordSheet] = useState(false);
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [activeProfileType, setActiveProfileType] = useState<"talent" | "production">("talent");
  const [showSwitchProfileSheet, setShowSwitchProfileSheet] = useState(false);
  const [showLogoutConfirmSheet, setShowLogoutConfirmSheet] = useState(false);

  // Tab Navigation Handler
  const handleSelectTab = (tabId: "stream" | "reels" | "auditions" | "messages" | "notifications" | "profile" | "settings" | "talent" | "pitches" | "pipeline") => {
    setActiveTab(tabId);
    setShowMobileNotifs(false);
    setShowMobileMessages(false);
    setSelectedNotifDetail(null);
    if (tabId === "messages") {
      setSelectedMobileThread(null);
    }
    if (tabId === "auditions") {
      setAuditionsSubView("opportunities");
    }
    if (mobileBodyScrollRef.current) {
      mobileBodyScrollRef.current.scrollTop = 0;
    }
  };

  // Complete Core Navigation Destinations (7 Exact Options)
  const getNavIndexForTab = (tabId: string): number => {
    const idx = ALL_MOBILE_NAV_ITEMS.findIndex((item) => item.id === tabId);
    return idx !== -1 ? idx : 0;
  };

  const mobileNavAngleStep = 360 / ALL_MOBILE_NAV_ITEMS.length;

  // Semi-Circle Rotating Wheel Engine State
  const [wheelRotation, setWheelRotation] = useState(() => -getNavIndexForTab(activeTab) * (360 / ALL_MOBILE_NAV_ITEMS.length));
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
    const targetAngle = -targetIdx * mobileNavAngleStep;
    setWheelRotation((prev) => {
      const diff = (((targetAngle - prev) % 360) + 540) % 360 - 180;
      return prev + diff;
    });
  }, [activeTab, mobileNavAngleStep]);

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

  // Cinema Notification Filters, Options & Preferences
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<
    "all" | "callbacks" | "matches" | "views" | "callsheets" | "pitches"
  >("all");
  const [notifUnreadOnly, setNotifUnreadOnly] = useState(false);
  const [notifUrgentOnly, setNotifUrgentOnly] = useState(false);
  const [showNotifPreferencesModal, setShowNotifPreferencesModal] = useState(false);
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<any | null>(null);
  const [notifPreferences, setNotifPreferences] = useState({
    callbacks: true,
    aiMatches: true,
    showreelViews: true,
    callSheets: true,
    pitchRequests: true,
    soundAlerts: true,
  });

  const [mobileNotifications, setMobileNotifications] = useState([
    {
      id: "mn-1",
      category: "callbacks" as const,
      studio: "Dharma Productions",
      project: "Shadow of Verity",
      title: "Audition Callback Scheduled!",
      desc: "Invited by Karan Johar & casting team to a Director Screen Test on Oct 28 at YRF Studios, Stage 3 (4:00 PM IST). Script sides attached.",
      time: "15m ago",
      urgent: true,
      read: false,
      actionStatus: "pending",
      actionLabel: "Confirm Audition Slot",
      secondaryActionLabel: "Download Sides PDF",
      meta: "Director: Karan Johar • Role: Lead Antagonist",
    },
    {
      id: "mn-2",
      category: "matches" as const,
      studio: "Prime Video Originals",
      project: "Mirzapur Universe (New Spin-off)",
      title: "98% AI Casting Match Found",
      desc: "Prime Video launched an open audition call matching your profile: Male Lead Antagonist (Age 26-34, Hindi/Urdu, Method Acting).",
      time: "1h ago",
      urgent: false,
      read: false,
      actionStatus: "pending",
      actionLabel: "View Role & Apply",
      secondaryActionLabel: "Bookmark",
      meta: "Casting By: Mukesh Chhabra CSA • Compensation: ₹18L–₹25L",
    },
    {
      id: "mn-3",
      category: "views" as const,
      studio: "Roy Kapur Films",
      project: "Dramatic Feature Film",
      title: "Showreel Reviewed (Full 100% Watch)",
      desc: "Head of Casting Shanoo Sharma watched your 'Interrogation Room - Unbroken Monologue' (2m 14s) from your verified talent profile.",
      time: "3h ago",
      urgent: false,
      read: true,
      actionStatus: "pending",
      actionLabel: "View Analytics",
      secondaryActionLabel: "Send Message",
      meta: "Traffic Source: Talent Directory Search • Device: 4K Studio Monitor",
    },
    {
      id: "mn-4",
      category: "callsheets" as const,
      studio: "Netflix India Series",
      project: "Sacred Relics (Unit 2)",
      title: "Day 14 Call Sheet Released 🎬",
      desc: "Production Unit 2 published tomorrow's shoot call sheet for Film City Stage 5. First shot: 07:00 AM. Breakfast & Costume Call: 06:15 AM.",
      time: "5h ago",
      urgent: true,
      read: false,
      actionStatus: "pending",
      actionLabel: "Acknowledge Call Sheet",
      secondaryActionLabel: "View Location Map",
      meta: "AD: Priya Nair • Weather: Indoor Soundstage • Catering: On-Set",
    },
    {
      id: "mn-5",
      category: "pitches" as const,
      studio: "Excel Entertainment",
      project: "The Last Reel",
      title: "Screenplay Pitch Option Request",
      desc: "Creative Development Head Ritesh Sidhwani approved your pitch logline and requested full 110-page shooting screenplay with lookbook.",
      time: "1d ago",
      urgent: false,
      read: true,
      actionStatus: "pending",
      actionLabel: "Sign Digital NDA & Send",
      secondaryActionLabel: "Review Terms",
      meta: "Format: Feature Screenplay • Tier: Studio Option Agreement",
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
    const casting = OPEN_CASTINGS.find((c) => c.id === castingId);
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

    const newOppApp: OpportunityApplicationItem = {
      id: "app-" + Date.now(),
      status: "applied",
      projectTitle: casting ? casting.title : roleName,
      roleTitle: roleName,
      productionHouse,
      projectType: casting ? casting.projectType : "Audition Submission",
      director: casting?.director,
      appliedDate: "Just now",
      stage: "Audition Submitted",
      progressPercent: 25,
      stageNote: "Self-tape received by casting associate. Under shortlisted review.",
      payRange: casting?.payRange || "Standard Rates",
      location: casting?.location || "Mumbai Studios",
      bannerUrl: casting?.bannerUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80",
      matchScore: casting?.matchScore || 95,
      castingId,
    };
    setOpportunityApplications((prev) => [
      newOppApp,
      ...prev.filter((item) => !(item.status === "saved" && item.castingId === castingId)),
    ]);
    setOpportunityAppTab("applied");
    setToastMessage(`Audition submitted for ${roleName}! 🎬`);
    setTimeout(() => setToastMessage(null), 3000);
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
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                />
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Share an audition tape or update...
                </span>
              </div>

              {/* Feed Cards */}
              {feedPosts.map((post, postIndex) => (
                <React.Fragment key={post.id}>
                  {hiddenPostIds.includes(post.id) ? (
                    <div
                      style={{
                        background: "#0c1017",
                        border: "1px dashed rgba(255, 255, 255, 0.15)",
                        borderRadius: "14px",
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: "var(--text-muted)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <EyeOff size={16} color="var(--text-muted)" />
                        <span style={{ fontSize: "0.78rem" }}>
                          Post hidden • You'll see fewer posts like this.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUndoHidePost(post.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#FF9800",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          cursor: "pointer",
                          padding: "4px 8px",
                        }}
                      >
                        Undo
                      </button>
                    </div>
                  ) : (
                    <div
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

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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

                      <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {post.content}
                      </p>

                      {/* Media Preview: Video Player (with Background Autoplay) or Photo */}
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
                            title={post.content.slice(0, 40)}
                            aspectRatio="16 / 9"
                            maxHeight="260px"
                          />
                        ) : (
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
                              src={mediaUrl}
                              alt={post.author.name}
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80";
                              }}
                            />
                          </div>
                        );
                      })()}

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

                          {/* Instagram Comment Button */}
                          <button
                            type="button"
                            id={`post-comment-btn-${post.id}`}
                            onClick={() =>
                              handleOpenFeedComments({
                                id: post.id,
                                author: post.author,
                                content: post.content,
                                commentsCount: feedPostCommentCounts[post.id] || post.commentsCount,
                              })
                            }
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
                            <span>{feedPostCommentCounts[post.id] || post.commentsCount}</span>
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
                  )}

                  {/* Reels Carousel Strip right after Post 0 */}
                  {postIndex === 0 && (
                    <div
                      style={{
                        background: "linear-gradient(180deg, #131722 0%, #0c0f17 100%)",
                        border: "1px solid rgba(255, 152, 0, 0.35)",
                        borderRadius: "14px",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "8px",
                              background: "linear-gradient(135deg, #FF9800 0%, #FF5722 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#08090C",
                            }}
                          >
                            <Film size={15} />
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff" }}>
                                Cinema Reels
                              </span>
                              <span
                                style={{
                                  background: "rgba(255, 152, 0, 0.2)",
                                  color: "#FF9800",
                                  fontSize: "0.62rem",
                                  fontWeight: 700,
                                  padding: "1px 6px",
                                  borderRadius: "9999px",
                                }}
                              >
                                🔥 Hot
                              </span>
                            </div>
                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                              Showreels, auditions & camera tests
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveReelIndex(0);
                            setActiveTab("reels");
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#FF9800",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "2px",
                            cursor: "pointer",
                          }}
                        >
                          <span>Watch All</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          overflowX: "auto",
                          paddingBottom: "4px",
                        }}
                        className="no-scrollbar"
                      >
                        {reelsList.map((reel, rIdx) => (
                          <div
                            key={`carousel-reel-${reel.id}`}
                            onClick={() => {
                              setActiveReelIndex(rIdx);
                              setActiveTab("reels");
                            }}
                            style={{
                              minWidth: "115px",
                              width: "115px",
                              height: "185px",
                              borderRadius: "12px",
                              overflow: "hidden",
                              position: "relative",
                              cursor: "pointer",
                              flexShrink: 0,
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              background: "#08090C",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
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
                                background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)",
                              }}
                            />

                            <div style={{ position: "absolute", top: "6px", left: "6px" }}>
                              <span
                                style={{
                                  background: "rgba(0,0,0,0.7)",
                                  backdropFilter: "blur(4px)",
                                  color: "#FF9800",
                                  fontSize: "0.58rem",
                                  fontWeight: 700,
                                  padding: "2px 5px",
                                  borderRadius: "4px",
                                  textTransform: "capitalize",
                                }}
                              >
                                {reel.category}
                              </span>
                            </div>

                            <div
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                background: "rgba(0,0,0,0.55)",
                                border: "1px solid rgba(255, 152, 0, 0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FF9800",
                              }}
                            >
                              <Play size={14} fill="#FF9800" style={{ marginLeft: "2px" }} />
                            </div>

                            <div
                              style={{
                                position: "absolute",
                                bottom: "6px",
                                left: "6px",
                                right: "6px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  color: "#fff",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {reel.creator.name}
                              </span>
                              <div style={{ display: "flex", alignItems: "center", gap: "3px", color: "#FF9800", fontSize: "0.6rem" }}>
                                <Heart size={9} fill="#FF9800" />
                                <span>{reel.likes}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* In-Feed Spotlight Reel 1 right after Post 1 */}
                  {postIndex === 1 && reelsList[0] && (() => {
                    const reel = reelsList[0];
                    const isSaved = savedReelIds.includes(reel.id);
                    const isFollowing = followedAuthors.includes(reel.creator.name);
                    const isHidden = hiddenPostIds.includes(reel.id);

                    if (isHidden) {
                      return (
                        <div
                          key={`infeed-reel-${reel.id}`}
                          style={{
                            background: "#0c1017",
                            border: "1px dashed rgba(255, 255, 255, 0.15)",
                            borderRadius: "14px",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "var(--text-muted)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <EyeOff size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: "0.78rem" }}>
                              Reel hidden • You'll see fewer reels like this.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUndoHidePost(reel.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#FF9800",
                              fontWeight: 700,
                              fontSize: "0.75rem",
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
                      <div
                        key={`infeed-reel-${reel.id}`}
                        style={{
                          background: "linear-gradient(180deg, #141724 0%, #0d101a 100%)",
                          border: "1px solid rgba(255, 152, 0, 0.4)",
                          borderRadius: "14px",
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          boxShadow: "0 4px 20px rgba(255, 152, 0, 0.12)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img
                              src={reel.creator.avatar}
                              alt={reel.creator.name}
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FF9800" }}
                            />
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                                  {reel.creator.name}
                                </span>
                                {reel.creator.verified && <CheckCircle2 size={12} color="#FF9800" />}
                                <span
                                  style={{
                                    background: "linear-gradient(135deg, #FF9800 0%, #FF5722 100%)",
                                    color: "#08090C",
                                    fontSize: "0.6rem",
                                    fontWeight: 800,
                                    padding: "1px 6px",
                                    borderRadius: "9999px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.03em",
                                  }}
                                >
                                  Reel
                                </span>
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                {reel.creator.craft} • Audition Monologue
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleFollow(reel.creator.name)}
                              style={{
                                background: isFollowing ? "rgba(255, 255, 255, 0.08)" : "#FF9800",
                                color: isFollowing ? "#E2E8F0" : "#08090C",
                                border: isFollowing ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                                padding: "4px 12px",
                                borderRadius: "8px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {isFollowing ? (
                                <>
                                  <Check size={12} strokeWidth={2.8} />
                                  <span>Following</span>
                                </>
                              ) : (
                                <span>Follow</span>
                              )}
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
                          <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#fff", margin: "0 0 3px 0" }}>
                            {reel.title}
                          </p>
                          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.35 }}>
                            {reel.description}
                          </p>
                        </div>

                        {/* Cinematic Video Player with Scroll Autoplay */}
                        <FeedVideoPlayer
                          src={reel.videoUrl}
                          poster={reel.thumbnailUrl}
                          title={reel.title}
                          soundTrack={reel.soundTrack}
                          aspectRatio="16 / 9"
                          maxHeight="260px"
                          onOpenFullscreen={() => {
                            setActiveReelIndex(0);
                            setActiveTab("reels");
                          }}
                        />

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleLikeReel(reel.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: reel.isLiked ? "#f43f5e" : "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.75rem",
                                fontWeight: reel.isLiked ? 700 : 500,
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <Heart size={16} fill={reel.isLiked ? "#f43f5e" : "none"} strokeWidth={reel.isLiked ? 2.5 : 2} />
                              <span>{reel.likes}</span>
                            </button>

                            {/* Instagram Comment Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenFeedComments({
                                  id: reel.id,
                                  author: reel.creator,
                                  content: `${reel.title} — ${reel.description}`,
                                  commentsCount: feedPostCommentCounts[reel.id] || reel.commentsCount,
                                })
                              }
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
                              <span>{feedPostCommentCounts[reel.id] || reel.commentsCount}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShareReel(reel)}
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
                              <Share2 size={15} />
                              <span>{reel.shares}</span>
                            </button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReelIndex(0);
                                setActiveTab("reels");
                              }}
                              style={{
                                background: "linear-gradient(135deg, #FF9800 0%, #FF8500 100%)",
                                color: "#08090C",
                                border: "none",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Play size={11} fill="#08090C" />
                              <span>Play Reel</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSaveReel(reel.id)}
                              style={{
                                background: isSaved ? "rgba(255, 152, 0, 0.18)" : "transparent",
                                border: isSaved ? "1px solid rgba(255, 152, 0, 0.45)" : "none",
                                borderRadius: "8px",
                                padding: "4px 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Bookmark
                                size={16}
                                color={isSaved ? "#FF9800" : "var(--text-muted)"}
                                fill={isSaved ? "#FF9800" : "none"}
                                strokeWidth={isSaved ? 2.5 : 2}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* In-Feed Spotlight Reel 2 right after Post 2 */}
                  {postIndex === 2 && reelsList[2] && (() => {
                    const reel = reelsList[2];
                    const isSaved = savedReelIds.includes(reel.id);
                    const isFollowing = followedAuthors.includes(reel.creator.name);
                    const isHidden = hiddenPostIds.includes(reel.id);

                    if (isHidden) {
                      return (
                        <div
                          key={`infeed-reel-${reel.id}`}
                          style={{
                            background: "#0c1017",
                            border: "1px dashed rgba(255, 255, 255, 0.15)",
                            borderRadius: "14px",
                            padding: "12px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            color: "var(--text-muted)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <EyeOff size={16} color="var(--text-muted)" />
                            <span style={{ fontSize: "0.78rem" }}>
                              Reel hidden • You'll see fewer reels like this.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUndoHidePost(reel.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#FF9800",
                              fontWeight: 700,
                              fontSize: "0.75rem",
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
                      <div
                        key={`infeed-reel-${reel.id}`}
                        style={{
                          background: "linear-gradient(180deg, #141724 0%, #0d101a 100%)",
                          border: "1px solid rgba(255, 152, 0, 0.4)",
                          borderRadius: "14px",
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          boxShadow: "0 4px 20px rgba(255, 152, 0, 0.12)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <img
                              src={reel.creator.avatar}
                              alt={reel.creator.name}
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FF9800" }}
                            />
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                                  {reel.creator.name}
                                </span>
                                {reel.creator.verified && <CheckCircle2 size={12} color="#FF9800" />}
                                <span
                                  style={{
                                    background: "linear-gradient(135deg, #FF9800 0%, #FF5722 100%)",
                                    color: "#08090C",
                                    fontSize: "0.6rem",
                                    fontWeight: 800,
                                    padding: "1px 6px",
                                    borderRadius: "9999px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.03em",
                                  }}
                                >
                                  Stunts
                                </span>
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                {reel.creator.craft} • Action Choreography
                              </span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleFollow(reel.creator.name)}
                              style={{
                                background: isFollowing ? "rgba(255, 255, 255, 0.08)" : "#FF9800",
                                color: isFollowing ? "#E2E8F0" : "#08090C",
                                border: isFollowing ? "1px solid rgba(255, 255, 255, 0.2)" : "none",
                                padding: "4px 12px",
                                borderRadius: "8px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {isFollowing ? (
                                <>
                                  <Check size={12} strokeWidth={2.8} />
                                  <span>Following</span>
                                </>
                              ) : (
                                <span>Follow</span>
                              )}
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
                          <p style={{ fontSize: "0.84rem", fontWeight: 700, color: "#fff", margin: "0 0 3px 0" }}>
                            {reel.title}
                          </p>
                          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.35 }}>
                            {reel.description}
                          </p>
                        </div>

                        {/* Cinematic Video Player with Scroll Autoplay */}
                        <FeedVideoPlayer
                          src={reel.videoUrl}
                          poster={reel.thumbnailUrl}
                          title={reel.title}
                          soundTrack={reel.soundTrack}
                          aspectRatio="16 / 9"
                          maxHeight="260px"
                          onOpenFullscreen={() => {
                            setActiveReelIndex(2);
                            setActiveTab("reels");
                          }}
                        />

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                          <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleLikeReel(reel.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: reel.isLiked ? "#f43f5e" : "var(--text-muted)",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.75rem",
                                fontWeight: reel.isLiked ? 700 : 500,
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              <Heart size={16} fill={reel.isLiked ? "#f43f5e" : "none"} strokeWidth={reel.isLiked ? 2.5 : 2} />
                              <span>{reel.likes}</span>
                            </button>

                            {/* Instagram Comment Button */}
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenFeedComments({
                                  id: reel.id,
                                  author: reel.creator,
                                  content: `${reel.title} — ${reel.description}`,
                                  commentsCount: feedPostCommentCounts[reel.id] || reel.commentsCount,
                                })
                              }
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
                              <span>{feedPostCommentCounts[reel.id] || reel.commentsCount}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleShareReel(reel)}
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
                              <Share2 size={15} />
                              <span>{reel.shares}</span>
                            </button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveReelIndex(2);
                                setActiveTab("reels");
                              }}
                              style={{
                                background: "linear-gradient(135deg, #FF9800 0%, #FF8500 100%)",
                                color: "#08090C",
                                border: "none",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Play size={11} fill="#08090C" />
                              <span>Play Reel</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleSaveReel(reel.id)}
                              style={{
                                background: isSaved ? "rgba(255, 152, 0, 0.18)" : "transparent",
                                border: isSaved ? "1px solid rgba(255, 152, 0, 0.45)" : "none",
                                borderRadius: "8px",
                                padding: "4px 6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Bookmark
                                size={16}
                                color={isSaved ? "#FF9800" : "var(--text-muted)"}
                                fill={isSaved ? "#FF9800" : "none"}
                                strokeWidth={isSaved ? 2.5 : 2}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </React.Fragment>
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
                      src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80"
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
        const mobAppliedCount = opportunityApplications.filter((a) => a.status === "applied").length;
        const mobSavedCount = opportunityApplications.filter((a) => a.status === "saved").length;
        const mobRejectedCount = opportunityApplications.filter((a) => a.status === "rejected").length;
        const mobFilteredApps = opportunityApplications.filter((a) => {
          if (opportunityAppTab === "all") return true;
          return a.status === opportunityAppTab;
        });

        // ========================================================
        // 1. MY APPLICATIONS DEDICATED PAGE VIEW
        // Opened when clicking "My Applications" button in Opportunities
        // ========================================================
        if (auditionsSubView === "my-applications") {
          return (
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Top Navigation & Status Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <button
                  type="button"
                  id="btn-back-to-opportunities"
                  onClick={() => setAuditionsSubView("opportunities")}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>← Back to Opportunities</span>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>⚡ Live System</span>
                  <span
                    style={{
                      background: "rgba(255, 165, 0, 0.2)",
                      color: "#FFA500",
                      border: "1px solid rgba(255, 165, 0, 0.4)",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                    }}
                  >
                    {opportunityApplications.length} Total
                  </span>
                </div>
              </div>

              {/* Page Title & Context */}
              <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: 0, display: "flex", alignItems: "center", gap: "7px" }}>
                  <Film size={20} color="#FFA500" /> My Applications
                </h3>
                <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)" }}>
                  All options: Saved, Applied, Rejected, and Live callbacks
                </span>
              </div>

              {/* All 4 Options Filter Pills */}
              <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
                {/* Option 0: All Applications */}
                <button
                  type="button"
                  onClick={() => setOpportunityAppTab("all")}
                  style={{
                    flex: "0 0 auto",
                    background: opportunityAppTab === "all" ? "rgba(255, 165, 0, 0.22)" : "rgba(255, 255, 255, 0.05)",
                    color: opportunityAppTab === "all" ? "#FFA500" : "#9E9E9E",
                    border: opportunityAppTab === "all" ? "1.5px solid #FFA500" : "1px solid #2E3340",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: opportunityAppTab === "all" ? "0 2px 8px rgba(255, 165, 0, 0.25)" : "none",
                  }}
                >
                  <Film size={11} />
                  <span>All</span>
                  <span
                    style={{
                      background: opportunityAppTab === "all" ? "#FFA500" : "rgba(255, 255, 255, 0.12)",
                      color: opportunityAppTab === "all" ? "#0D0E12" : "#FFFFFF",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                    }}
                  >
                    {opportunityApplications.length}
                  </span>
                </button>

                {/* Option 1: Applied */}
                <button
                  type="button"
                  onClick={() => setOpportunityAppTab("applied")}
                  style={{
                    flex: "0 0 auto",
                    background: opportunityAppTab === "applied" ? "rgba(16, 185, 129, 0.22)" : "rgba(255, 255, 255, 0.05)",
                    color: opportunityAppTab === "applied" ? "#34d399" : "#9E9E9E",
                    border: opportunityAppTab === "applied" ? "1.5px solid #10B981" : "1px solid #2E3340",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: opportunityAppTab === "applied" ? "0 2px 8px rgba(16, 185, 129, 0.25)" : "none",
                  }}
                >
                  <Send size={11} />
                  <span>Applied</span>
                  <span
                    style={{
                      background: opportunityAppTab === "applied" ? "#10B981" : "rgba(255, 255, 255, 0.12)",
                      color: opportunityAppTab === "applied" ? "#0D0E12" : "#FFFFFF",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                    }}
                  >
                    {mobAppliedCount}
                  </span>
                </button>

                {/* Option 2: Saved Applications */}
                <button
                  type="button"
                  onClick={() => setOpportunityAppTab("saved")}
                  style={{
                    flex: "0 0 auto",
                    background: opportunityAppTab === "saved" ? "rgba(56, 189, 248, 0.22)" : "rgba(255, 255, 255, 0.05)",
                    color: opportunityAppTab === "saved" ? "#38BDF8" : "#9E9E9E",
                    border: opportunityAppTab === "saved" ? "1.5px solid #38BDF8" : "1px solid #2E3340",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: opportunityAppTab === "saved" ? "0 2px 8px rgba(56, 189, 248, 0.25)" : "none",
                  }}
                >
                  <Bookmark size={11} />
                  <span>Saved</span>
                  <span
                    style={{
                      background: opportunityAppTab === "saved" ? "#38BDF8" : "rgba(255, 255, 255, 0.12)",
                      color: opportunityAppTab === "saved" ? "#0D0E12" : "#FFFFFF",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                    }}
                  >
                    {mobSavedCount}
                  </span>
                </button>

                {/* Option 3: Rejected */}
                <button
                  type="button"
                  onClick={() => setOpportunityAppTab("rejected")}
                  style={{
                    flex: "0 0 auto",
                    background: opportunityAppTab === "rejected" ? "rgba(244, 63, 94, 0.22)" : "rgba(255, 255, 255, 0.05)",
                    color: opportunityAppTab === "rejected" ? "#FB7185" : "#9E9E9E",
                    border: opportunityAppTab === "rejected" ? "1.5px solid #F43F5E" : "1px solid #2E3340",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: opportunityAppTab === "rejected" ? "0 2px 8px rgba(244, 63, 94, 0.25)" : "none",
                  }}
                >
                  <XCircle size={11} />
                  <span>Rejected</span>
                  <span
                    style={{
                      background: opportunityAppTab === "rejected" ? "#F43F5E" : "rgba(255, 255, 255, 0.12)",
                      color: "#FFFFFF",
                      padding: "1px 5px",
                      borderRadius: "9999px",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                    }}
                  >
                    {mobRejectedCount}
                  </span>
                </button>
              </div>

              {/* Applications List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {mobFilteredApps.map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: "#161922",
                      border:
                        app.status === "applied"
                          ? "1px solid rgba(16, 185, 129, 0.35)"
                          : app.status === "saved"
                            ? "1px solid rgba(56, 189, 248, 0.35)"
                            : "1px solid rgba(244, 63, 94, 0.3)",
                      borderRadius: "12px",
                      padding: "13px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <h5 style={{ fontSize: "0.92rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                          {app.roleTitle}
                        </h5>
                        <span style={{ fontSize: "0.72rem", color: "#FFA500", fontWeight: 600 }}>
                          {app.projectTitle} • {app.productionHouse}
                        </span>
                      </div>
                      <span
                        style={{
                          background:
                            app.status === "applied"
                              ? "rgba(16, 185, 129, 0.2)"
                              : app.status === "saved"
                                ? "rgba(56, 189, 248, 0.2)"
                                : "rgba(244, 63, 94, 0.2)",
                          color:
                            app.status === "applied" ? "#34d399" : app.status === "saved" ? "#38BDF8" : "#FB7185",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.64rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {app.stage}
                      </span>
                    </div>

                    {/* Progress bar for Applied */}
                    {app.status === "applied" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#9E9E9E", marginBottom: "3px" }}>
                          <span>Review Stage</span>
                          <span>{app.progressPercent}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px" }}>
                          <div style={{ width: `${app.progressPercent}%`, height: "100%", background: "#10B981", borderRadius: "9999px" }} />
                        </div>
                      </div>
                    )}

                    {/* Note / Feedback */}
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "7px 9px", borderRadius: "6px", fontSize: "0.7rem", color: "#E2E8F0" }}>
                      <span style={{ color: app.status === "rejected" ? "#F43F5E" : "#FFA500", fontWeight: 700, display: "block" }}>
                        {app.status === "applied" ? "Status:" : app.status === "saved" ? "Preparation Sides:" : "Director Feedback:"}
                      </span>
                      <span>{app.status === "rejected" && app.rejectionReason ? app.rejectionReason : app.stageNote}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      {app.status === "applied" && app.meetingLink && (
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            color: "#fff",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textAlign: "center",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <Video size={12} /> Join Callback Read
                        </a>
                      )}
                      {app.status === "saved" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              const casting =
                                OPEN_CASTINGS.find((c) => c.id === app.castingId) ||
                                OPEN_CASTINGS.find((c) => c.title.toLowerCase().includes(app.roleTitle.toLowerCase())) ||
                                OPEN_CASTINGS[0];
                              setActiveAudition(casting);
                            }}
                            className="btn-primary"
                            style={{ flex: 1, padding: "7px 10px", fontSize: "0.72rem" }}
                          >
                            Instant Audition 🎬
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpportunityApplications((prev) => prev.filter((item) => item.id !== app.id));
                              setToastMessage("Removed from Saved");
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid #2E3340",
                              color: "#9E9E9E",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {app.status === "rejected" && (
                        <span style={{ fontSize: "0.68rem", color: "#FFA500", fontStyle: "italic" }}>
                          ✨ Retained in talent pool for future season roles
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {mobFilteredApps.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px 16px", background: "#0c0e14", borderRadius: "14px", border: "1px dashed #2E3340" }}>
                    <Film size={28} color="#FFA500" style={{ margin: "0 auto 8px", opacity: 0.6 }} />
                    <h5 style={{ fontSize: "0.92rem", color: "#fff", margin: "0 0 4px" }}>No applications found</h5>
                    <p style={{ fontSize: "0.74rem", color: "#9E9E9E", margin: "0 0 12px" }}>
                      Browse verified production opportunities and submit auditions to see them here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAuditionsSubView("opportunities")}
                      className="btn-primary"
                      style={{ padding: "7px 14px", fontSize: "0.74rem" }}
                    >
                      Browse Opportunities 🎬
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Back Button */}
              <button
                type="button"
                onClick={() => setAuditionsSubView("opportunities")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid #2E3340",
                  color: "#FFFFFF",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "6px",
                }}
              >
                <ChevronLeft size={14} />
                <span>Return to Production Opportunities</span>
              </button>
            </div>
          );
        }

        // ========================================================
        // 2. OPPORTUNITIES PAGE VIEW (PURE OPPORTUNITIES)
        // Default screen containing only castings and open calls
        // ========================================================
        return (
          <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                  🎬 Production Opportunities
                </h3>
                <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)" }}>
                  Verified Castings, Open Calls & Auditions
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>⚡ Live System</span>
                <button
                  type="button"
                  id="mobile-top-my-apps-btn"
                  onClick={() => setAuditionsSubView("my-applications")}
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 165, 0, 0.22) 0%, rgba(255, 133, 0, 0.12) 100%)",
                    color: "#FFA500",
                    border: "1.5px solid #FFA500",
                    padding: "5px 11px",
                    borderRadius: "9999px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 10px rgba(255, 165, 0, 0.25)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Film size={12} color="#FFA500" />
                  <span>My Applications</span>
                  <span
                    style={{
                      background: "#FFA500",
                      color: "#0D0E12",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                    }}
                  >
                    {opportunityApplications.length}
                  </span>
                </button>
              </div>
            </div>

            {/* ALL OPEN PRODUCTION CASTINGS (MOBILE BROWSE) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                ⚡ All Open Production Castings
              </h4>
              <span style={{ fontSize: "0.68rem", color: "#FFA500", fontWeight: 700 }}>
                {OPEN_CASTINGS.length} Roles
              </span>
            </div>

            {OPEN_CASTINGS.map((casting) => (
              <div
                key={casting.id}
                style={{
                  background: "#0f131c",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: casting.isUrgent ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
                }}
              >
                {/* Banner image fill */}
                <div style={{ width: "100%", height: "120px", position: "relative", overflow: "hidden", background: "#08090C" }}>
                  <img
                    src={casting.bannerUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80"}
                    alt={casting.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(15, 19, 28, 0.95) 100%)" }} />
                  <div style={{ position: "absolute", top: "8px", left: "8px", right: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span className="badge badge-gold" style={{ fontSize: "0.62rem" }}>{casting.projectType}</span>
                    {casting.matchScore && (
                      <span className="badge badge-emerald" style={{ fontSize: "0.62rem" }}>⚡ {casting.matchScore}% Match</span>
                    )}
                  </div>
                </div>

                <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", margin: 0 }}>{casting.title}</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: 600 }}>{casting.productionHouse}</span>

                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
                    {casting.characterDescription}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px", fontSize: "0.72rem" }}>
                    <span>{casting.location}</span>
                    <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>{casting.payRange}</span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={() => setActiveAudition(casting)}
                      className="btn-primary"
                      style={{ flex: 1, padding: "7px", fontSize: "0.8rem" }}
                    >
                      Instant Audition 🎬
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newSaved: OpportunityApplicationItem = {
                          id: "app-saved-" + Date.now(),
                          status: "saved",
                          roleTitle: casting.characterName || casting.title.split("—")[0].trim(),
                          projectTitle: casting.title,
                          productionHouse: casting.productionHouse,
                          projectType: casting.projectType,
                          director: casting.director,
                          savedDate: "Saved just now",
                          deadline: casting.deadline,
                          stage: "Saved to Watchlist",
                          progressPercent: 0,
                          stageNote: casting.requirements[0] || "Self-tape monologue required",
                          payRange: casting.payRange,
                          location: casting.location,
                          bannerUrl: casting.bannerUrl,
                          matchScore: casting.matchScore,
                          castingId: casting.id,
                        };
                        setOpportunityApplications((prev) => [newSaved, ...prev]);
                        setToastMessage(`Saved to My Applications! 📌`);
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid #2E3340",
                        color: "#E2E8F0",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <Bookmark size={14} />
                    </button>
                  </div>
                </div>
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

      case "notifications": {
        const notifCategories = [
          { id: "all" as const, label: "All", count: mobileNotifications.length, icon: Bell },
          { id: "callbacks" as const, label: "Audition Callbacks", count: mobileNotifications.filter((n) => n.category === "callbacks").length, icon: Clapperboard },
          { id: "matches" as const, label: "AI Matches", count: mobileNotifications.filter((n) => n.category === "matches").length, icon: Sparkles },
          { id: "views" as const, label: "Studio Views", count: mobileNotifications.filter((n) => n.category === "views").length, icon: Eye },
          { id: "callsheets" as const, label: "Call Sheets", count: mobileNotifications.filter((n) => n.category === "callsheets").length, icon: Calendar },
          { id: "pitches" as const, label: "Screenplay Pitches", count: mobileNotifications.filter((n) => n.category === "pitches").length, icon: FileText },
        ];

        const filteredMobileNotifs = mobileNotifications.filter((n) => {
          if (notifCategoryFilter !== "all" && n.category !== notifCategoryFilter) return false;
          if (notifUnreadOnly && n.read) return false;
          if (notifUrgentOnly && !n.urgent) return false;
          return true;
        });

        const handleSimulateCallbackAlert = () => {
          const newAlert = {
            id: `mn-${Date.now()}`,
            category: "callbacks" as const,
            studio: "Anurag Kashyap Films",
            project: "Maximum City Noir",
            title: "🚨 Urgent Director Screen Test!",
            desc: "Anurag Kashyap requested an emergency chemistry read today at 6:30 PM at Versova Studio 2 for the second-lead role.",
            time: "Just now",
            urgent: true,
            read: false,
            actionStatus: "pending",
            actionLabel: "Confirm Emergency Slot",
            secondaryActionLabel: "Download Scene Sides",
            meta: "Director: Anurag Kashyap • Immediate Response Requested",
          };
          setMobileNotifications((prev) => [newAlert, ...prev]);
          setToastMessage("🔔 New Director Callback received from Anurag Kashyap Films!");
          setTimeout(() => setToastMessage(null), 3000);
        };

        const handleNotifAction = (id: string, actionLabel: string, title: string) => {
          setMobileNotifications((prev) =>
            prev.map((item) => (item.id === id ? { ...item, actionStatus: "confirmed", read: true } : item))
          );
          if (actionLabel.includes("Confirm") || actionLabel.includes("Accept")) {
            setToastMessage("✓ Audition slot confirmed! Synced with your CineConnect Calendar 📅");
          } else if (actionLabel.includes("Acknowledge")) {
            setToastMessage("✓ Call Sheet acknowledged! Production Unit notified 🎬");
          } else if (actionLabel.includes("NDA") || actionLabel.includes("Sign")) {
            setToastMessage("✓ Digital NDA signed! Encrypted screenplay sent to studio 🔒");
          } else if (actionLabel.includes("Apply")) {
            handleSelectTab("auditions");
            setToastMessage("Navigated to audition submission page 🎬");
          } else {
            setToastMessage(`✓ Action completed for ${title}`);
          }
          setTimeout(() => setToastMessage(null), 2500);
        };

        const handleNotifSecondaryAction = (label: string, project: string) => {
          if (label.includes("Sides") || label.includes("PDF")) {
            setToastMessage(`📄 Downloading Script Sides PDF for "${project}"...`);
          } else if (label.includes("Map")) {
            setToastMessage("📍 Opening Soundstage Navigation Map...");
          } else if (label.includes("Message")) {
            handleSelectTab("messages");
          } else {
            setToastMessage("Saved to your portfolio bookmarks! 🔖");
          }
          setTimeout(() => setToastMessage(null), 2500);
        };

        return (
          <div style={{ padding: "14px 14px 150px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "100%" }}>
            {/* Top Header without any subtitle clutter */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
                  🔔 Notifications
                </h3>
                {unreadMobileNotifCount > 0 && (
                  <span
                    style={{
                      background: "rgba(239, 68, 68, 0.2)",
                      color: "#EF4444",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {unreadMobileNotifCount} new
                  </span>
                )}
              </div>

              {/* Action Buttons: Preferences Modal & Quick Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  id="mobile-notif-options-btn"
                  onClick={() => setShowNotifPreferencesModal(true)}
                  title="Notification & Alert Options"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    background: "rgba(245, 158, 11, 0.12)",
                    border: "1px solid rgba(245, 158, 11, 0.35)",
                    color: "var(--accent-gold)",
                    padding: "4px 8px",
                    borderRadius: "8px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <SlidersHorizontal size={12} />
                  Options
                </button>

                <button
                  type="button"
                  id="mobile-notif-simulate-btn"
                  onClick={handleSimulateCallbackAlert}
                  title="Simulate Real-Time Director Callback"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "26px",
                    height: "26px",
                    background: "rgba(59, 130, 246, 0.15)",
                    border: "1px solid rgba(59, 130, 246, 0.35)",
                    color: "#60A5FA",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <Sparkles size={13} />
                </button>

                {unreadMobileNotifCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setMobileNotifications((prev) => prev.map((n) => ({ ...n, read: true, urgent: false })))}
                    title="Mark All as Read"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "26px",
                      height: "26px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#94A3B8",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (Horizontal Scrollable Carousel without scrollbar line) */}
            <div
              className="no-scrollbar"
              style={{
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                padding: "4px 2px 8px",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                border: "none",
                outline: "none",
              }}
            >
              {notifCategories.map((cat) => {
                const IconComp = cat.icon;
                const isActive = notifCategoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNotifCategoryFilter(cat.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      borderRadius: "20px",
                      background: isActive ? "linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(245, 158, 11, 0.1) 100%)" : "rgba(255, 255, 255, 0.04)",
                      border: isActive ? "1.5px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#F59E0B" : "#94A3B8",
                      fontSize: "0.72rem",
                      fontWeight: isActive ? 800 : 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <IconComp size={12} />
                    <span>{cat.label}</span>
                    <span
                      style={{
                        background: isActive ? "#F59E0B" : "rgba(255, 255, 255, 0.1)",
                        color: isActive ? "#08090C" : "#CBD5E1",
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        padding: "0 5px",
                        borderRadius: "8px",
                      }}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Option Toggles Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 2px 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  id="mobile-notif-filter-unread"
                  onClick={() => setNotifUnreadOnly(!notifUnreadOnly)}
                  style={{
                    background: notifUnreadOnly ? "rgba(239, 68, 68, 0.22)" : "rgba(255, 255, 255, 0.05)",
                    border: notifUnreadOnly ? "1.5px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.12)",
                    color: notifUnreadOnly ? "#EF4444" : "#CBD5E1",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Unread Only
                </button>
                <button
                  type="button"
                  id="mobile-notif-filter-urgent"
                  onClick={() => setNotifUrgentOnly(!notifUrgentOnly)}
                  style={{
                    background: notifUrgentOnly ? "rgba(245, 158, 11, 0.22)" : "rgba(255, 255, 255, 0.05)",
                    border: notifUrgentOnly ? "1.5px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.12)",
                    color: notifUrgentOnly ? "#F59E0B" : "#CBD5E1",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  Urgent Callbacks
                </button>
              </div>

              {(notifCategoryFilter !== "all" || notifUnreadOnly || notifUrgentOnly) && (
                <button
                  type="button"
                  id="mobile-notif-reset-filters"
                  onClick={() => {
                    setNotifCategoryFilter("all");
                    setNotifUnreadOnly(false);
                    setNotifUrgentOnly(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    fontSize: "0.65rem",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                >
                  Reset filters
                </button>
              )}
            </div>

            {/* Visible & Clear Full-Width Divider Line between Quick Options (Up) and Notifications Feed (Down) */}
            <div
              id="notif-feed-divider-line"
              style={{
                width: "100%",
                height: "1.5px",
                background: "linear-gradient(90deg, rgba(245, 158, 11, 0.6) 0%, rgba(255, 255, 255, 0.35) 50%, rgba(245, 158, 11, 0.6) 100%)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.7)",
                margin: "4px 0 6px",
                borderRadius: "1px",
              }}
            />

            {/* Notifications Cards Feed */}
            {filteredMobileNotifs.length === 0 ? (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  background: "rgba(255, 255, 255, 0.02)",
                  borderRadius: "14px",
                  border: "1px dashed rgba(255, 255, 255, 0.12)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Clapperboard size={32} color="#64748B" />
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                  No notifications match your filter
                </span>
                <span style={{ fontSize: "0.72rem", color: "#94A3B8", maxWidth: "260px" }}>
                  You are all caught up! Switch filters or simulate a live director callback.
                </span>
                <button
                  type="button"
                  onClick={handleSimulateCallbackAlert}
                  style={{
                    marginTop: "6px",
                    background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                    color: "#08090C",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  🎬 Simulate Callback Alert
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {filteredMobileNotifs.map((n) => {
                  const getStudioBadgeStyle = (category: string) => {
                    switch (category) {
                      case "callbacks":
                        return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.35)", text: "#F59E0B" };
                      case "matches":
                        return { bg: "rgba(56, 189, 248, 0.15)", border: "rgba(56, 189, 248, 0.35)", text: "#38BDF8" };
                      case "callsheets":
                        return { bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.35)", text: "#F43F5E" };
                      case "views":
                        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.35)", text: "#10B981" };
                      case "pitches":
                        return { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.35)", text: "#A855F7" };
                      default:
                        return { bg: "rgba(255, 255, 255, 0.08)", border: "rgba(255, 255, 255, 0.15)", text: "#CBD5E1" };
                    }
                  };

                  const badgeStyle = getStudioBadgeStyle(n.category);

                  return (
                    <div
                      key={n.id}
                      id={`notif-card-${n.id}`}
                      onClick={() => setSelectedNotifDetail(n)}
                      style={{
                        padding: "12px",
                        background: n.urgent
                          ? "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, #101420 100%)"
                          : n.read
                            ? "rgba(16, 20, 32, 0.6)"
                            : "#121622",
                        border: n.urgent
                          ? "1px solid rgba(245, 158, 11, 0.45)"
                          : n.read
                            ? "1px solid rgba(255, 255, 255, 0.06)"
                            : "1px solid rgba(245, 158, 11, 0.25)",
                        borderRadius: "14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: n.urgent ? "0 4px 16px rgba(245, 158, 11, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.4)",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                    >
                      {/* Card Header: Studio badge, Category & Time */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span
                            style={{
                              background: badgeStyle.bg,
                              border: `1px solid ${badgeStyle.border}`,
                              color: badgeStyle.text,
                              fontSize: "0.64rem",
                              fontWeight: 800,
                              padding: "2px 7px",
                              borderRadius: "6px",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {n.studio}
                          </span>
                          <span style={{ fontSize: "0.64rem", color: "#64748B" }}>&bull;</span>
                          <span style={{ fontSize: "0.66rem", color: "#94A3B8", fontWeight: 600 }}>
                            {n.project}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "#64748B" }}>{n.time}</span>
                      </div>

                      {/* Card Title & Read Dot */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                        {!n.read && (
                          <div
                            style={{
                              width: "7px",
                              height: "7px",
                              borderRadius: "50%",
                              background: "#EF4444",
                              marginTop: "5px",
                              flexShrink: 0,
                              boxShadow: "0 0 6px #EF4444",
                            }}
                          />
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          {n.urgent && (
                            <span
                              style={{
                                background: "#EF4444",
                                color: "#FFFFFF",
                                fontSize: "0.58rem",
                                fontWeight: 900,
                                padding: "1px 5px",
                                borderRadius: "4px",
                                letterSpacing: "0.04em",
                              }}
                            >
                              URGENT
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.86rem",
                              fontWeight: 800,
                              color: n.urgent ? "#FFB74D" : "#FFFFFF",
                            }}
                          >
                            {n.title}
                          </span>
                        </div>
                      </div>

                      {/* Card Description */}
                      <p style={{ fontSize: "0.75rem", color: "#CBD5E1", margin: 0, lineHeight: 1.45 }}>
                        {n.desc}
                      </p>

                      {/* Card Meta Chip */}
                      {n.meta && (
                        <div
                          style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.66rem",
                            color: "#94A3B8",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Clock size={11} color="#F59E0B" />
                          <span>{n.meta}</span>
                        </div>
                      )}

                      {/* Interactive Actions Row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "6px",
                          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                          marginTop: "2px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          {n.actionStatus === "confirmed" ? (
                            <span
                              style={{
                                background: "rgba(16, 185, 129, 0.15)",
                                border: "1px solid #10B981",
                                color: "#10B981",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                padding: "4px 8px",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <CheckCircle2 size={12} />
                              Confirmed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNotifAction(n.id, n.actionLabel, n.title);
                              }}
                              style={{
                                background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                                color: "#08090C",
                                border: "none",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 2px 6px rgba(255, 152, 0, 0.3)",
                              }}
                            >
                              {n.actionLabel}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotifDetail(n);
                            }}
                            style={{
                              background: "rgba(255, 255, 255, 0.05)",
                              border: "1px solid rgba(255, 255, 255, 0.14)",
                              color: "#CBD5E1",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "0.66rem",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            View Details
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMobileNotifications((prev) =>
                              prev.map((item) => (item.id === n.id ? { ...item, read: !item.read } : item))
                            );
                          }}
                          title={n.read ? "Mark as unread" : "Mark as read"}
                          style={{
                            background: "none",
                            border: "none",
                            color: n.read ? "#64748B" : "#F59E0B",
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: "2px 4px",
                          }}
                        >
                          {n.read ? "Mark Unread" : "Mark Read"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* COMPLETE DETAILS MODAL / SHEET (FOR IMAGE 2: CALL SHEET & CINEMA DETAILS) */}
            {selectedNotifDetail && (
              <div
                className="modal-backdrop"
                onClick={() => setSelectedNotifDetail(null)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.85)",
                  backdropFilter: "blur(8px)",
                  zIndex: 2200,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#0d111a",
                    border: "1.5px solid rgba(255, 152, 0, 0.5)",
                    borderRadius: "24px 24px 0 0",
                    width: "100%",
                    maxWidth: "430px",
                    maxHeight: "88vh",
                    overflowY: "auto",
                    padding: "20px 18px 36px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    boxShadow: "0 -12px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 152, 0, 0.2)",
                  }}
                >
                  {/* Pull Handle */}
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "-6px", marginBottom: "4px" }}>
                    <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "rgba(255, 255, 255, 0.2)" }} />
                  </div>

                  {/* Header with Title and Close Button */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                        <span
                          style={{
                            background: selectedNotifDetail.category === "callsheets" ? "rgba(244, 63, 94, 0.2)" : "rgba(245, 158, 11, 0.2)",
                            color: selectedNotifDetail.category === "callsheets" ? "#F43F5E" : "#F59E0B",
                            border: selectedNotifDetail.category === "callsheets" ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid rgba(245, 158, 11, 0.4)",
                            fontSize: "0.62rem",
                            fontWeight: 900,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {selectedNotifDetail.category === "callsheets"
                            ? "OFFICIAL PRODUCTION CALL SHEET"
                            : selectedNotifDetail.category === "callbacks"
                              ? "DIRECTOR AUDITION CALLBACK"
                              : selectedNotifDetail.category === "matches"
                                ? "AI SMART CASTING MATCH"
                                : "CINEMA DISPATCH DETAILS"}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "#64748B" }}>&bull;</span>
                        <span style={{ fontSize: "0.68rem", color: "#F59E0B", fontWeight: 700 }}>
                          {selectedNotifDetail.studio}
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                        {selectedNotifDetail.title}
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "#94A3B8" }}>
                        Project: <strong style={{ color: "#FFF" }}>{selectedNotifDetail.project}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNotifDetail(null)}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "none",
                        color: "#CBD5E1",
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Call Sheet Key Timings & Soundstage Banner (Specialized for Call Sheets) */}
                  {selectedNotifDetail.category === "callsheets" ? (
                    <>
                      <div
                        style={{
                          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(20, 24, 36, 0.8) 100%)",
                          border: "1px solid rgba(245, 158, 11, 0.35)",
                          borderRadius: "14px",
                          padding: "14px",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "0.65rem", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            ⏰ Talent Call Time
                          </span>
                          <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "#FFFFFF" }}>
                            06:15 AM
                          </span>
                          <span style={{ fontSize: "0.64rem", color: "#94A3B8", display: "block" }}>
                            Vanity Van #4 (Film City)
                          </span>
                        </div>

                        <div>
                          <span style={{ fontSize: "0.65rem", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            🎬 First Shot Roll
                          </span>
                          <span style={{ fontSize: "1.15rem", fontWeight: 900, color: "#FFFFFF" }}>
                            07:00 AM
                          </span>
                          <span style={{ fontSize: "0.64rem", color: "#94A3B8", display: "block" }}>
                            Stage 5 (Sync Sound)
                          </span>
                        </div>

                        <div style={{ gridColumn: "1 / -1", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                          <span style={{ fontSize: "0.65rem", color: "#94A3B8", display: "block" }}>
                            📍 <strong>Location:</strong> Film City Studio, Stage 5, Goregaon East, Mumbai
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "#94A3B8", display: "block", marginTop: "2px" }}>
                            👤 <strong>1st AD:</strong> Priya Nair &bull; <strong>Director:</strong> Vikramaditya Motwane
                          </span>
                        </div>
                      </div>

                      {/* Complete Day 14 Shoot Schedule Timeline */}
                      <div>
                        <h4 style={{ margin: "0 0 8px", fontSize: "0.82rem", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          📋 Day 14 Shoot Schedule &amp; Order of Work
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {[
                            { time: "06:15 AM", title: "Unit Call & Catered Breakfast", note: "On-set catering tent behind Stage 5", color: "#60A5FA" },
                            { time: "06:30 AM", title: "Costume Fitting & Wardrobe Check", note: "Charcoal tailored suit (Tag #A-14)", color: "#A78BFA" },
                            { time: "06:45 AM", title: "Hair & SFX Makeup Continuity", note: "Prosthetic eyebrow scar & sweat shine", color: "#F472B6" },
                            { time: "07:15 AM", title: "Director Walkthrough & Blocking", note: "With Director Vikramaditya Motwane", color: "#F59E0B" },
                            { time: "07:45 AM", title: "First Camera Rehearsal", note: "Arri Alexa 35 Anamorphic / Sync Sound", color: "#10B981" },
                            { time: "08:15 AM", title: "Scene 42 (Interrogation Cell)", note: "Intense 4-page dialogue sequence", color: "#EF4444" },
                            { time: "01:00 PM", title: "Unit Catered Lunch Break", note: "1 Hour (Hot meals & dietary choices)", color: "#F59E0B" },
                            { time: "02:00 PM", title: "Scene 43 (Corridor Grapple Stunt)", note: "With stunt coordinator & stunt double", color: "#EF4444" },
                            { time: "06:30 PM", title: "Estimated Wrap & Next Call Briefing", note: "Day 15 calls announced at wrap", color: "#10B981" },
                          ].map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "8px 10px",
                                background: "rgba(255, 255, 255, 0.02)",
                                border: "1px solid rgba(255, 255, 255, 0.06)",
                                borderRadius: "8px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  color: item.color,
                                  fontFamily: "monospace",
                                  whiteSpace: "nowrap",
                                  minWidth: "62px",
                                }}
                              >
                                {item.time}
                              </span>
                              <div>
                                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                                  {item.title}
                                </span>
                                <span style={{ fontSize: "0.66rem", color: "#94A3B8" }}>
                                  {item.note}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cast on Call Table */}
                      <div>
                        <h4 style={{ margin: "0 0 8px", fontSize: "0.82rem", fontWeight: 800, color: "#FFFFFF", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          🎭 Cast on Call for Day 14
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {[
                            { name: "Kabir Mehra", role: "Lead Antagonist (Kabir)", call: "06:15 AM", set: "07:15 AM", van: "Van 4", you: true },
                            { name: "Radhika Apte", role: "Senior Inspector Tara", call: "06:30 AM", set: "07:30 AM", van: "Van 2", you: false },
                            { name: "Nawazuddin Siddiqui", role: "Special Counsel (Guest)", call: "08:00 AM", set: "09:00 AM", van: "Van 1", you: false },
                          ].map((cast, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: "8px 10px",
                                background: cast.you ? "rgba(245, 158, 11, 0.08)" : "rgba(255, 255, 255, 0.02)",
                                border: cast.you ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                                borderRadius: "8px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "0.78rem", fontWeight: 800, color: cast.you ? "#F59E0B" : "#FFFFFF" }}>
                                    {cast.name}
                                  </span>
                                  {cast.you && (
                                    <span style={{ background: "#F59E0B", color: "#000", fontSize: "0.58rem", fontWeight: 900, padding: "1px 4px", borderRadius: "4px" }}>
                                      YOU
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: "0.66rem", color: "#94A3B8" }}>{cast.role} &bull; {cast.van}</span>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#60A5FA", display: "block" }}>
                                  Call: {cast.call}
                                </span>
                                <span style={{ fontSize: "0.64rem", color: "#94A3B8" }}>
                                  Set: {cast.set}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Production & Wardrobe Instructions */}
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "10px",
                          padding: "10px 12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px",
                        }}
                      >
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#F59E0B" }}>
                          ⚠️ Safety &amp; Production Notes:
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "#CBD5E1", lineHeight: 1.4 }}>
                          &bull; Stage 5 is closed for closed-set intense drama recording. Personal mobile phones must remain on airplane mode.
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "#CBD5E1", lineHeight: 1.4 }}>
                          &bull; Armorer on set for Scene 43 props. Rehearsal mandatory with stunt coordinator at 02:00 PM.
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Generic Details for Callbacks, AI Matches, etc. */
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "12px",
                          padding: "12px",
                        }}
                      >
                        <span style={{ fontSize: "0.68rem", color: "#F59E0B", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                          Full Announcement / Dispatch Details
                        </span>
                        <p style={{ fontSize: "0.78rem", color: "#E2E8F0", lineHeight: 1.5, margin: 0 }}>
                          {selectedNotifDetail.desc}
                        </p>
                        {selectedNotifDetail.meta && (
                          <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.72rem", color: "#94A3B8" }}>
                            {selectedNotifDetail.meta}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons in Details Sheet */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        handleNotifAction(selectedNotifDetail.id, selectedNotifDetail.actionLabel, selectedNotifDetail.title);
                        setSelectedNotifDetail(null);
                      }}
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                        color: "#08090C",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(255, 152, 0, 0.4)",
                      }}
                    >
                      {selectedNotifDetail.actionStatus === "confirmed" ? "✓ Already Confirmed" : selectedNotifDetail.actionLabel}
                    </button>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage("📍 Opening Stage 5 GPS navigation map pin...");
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        style={{
                          padding: "9px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#FFF",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        📍 Stage 5 Map
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setToastMessage("📄 Downloading Sacred_Relics_Day14_CallSheet.pdf...");
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                        style={{
                          padding: "9px",
                          borderRadius: "8px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          color: "#FFF",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        📄 Download PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification & Alert Options Modal Sheet */}
            {showNotifPreferencesModal && (
              <div
                className="modal-backdrop"
                onClick={() => setShowNotifPreferencesModal(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(6px)",
                  zIndex: 2000,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                }}
              >
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#0F131C",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    borderRadius: "20px 20px 0 0",
                    width: "100%",
                    maxWidth: "430px",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    padding: "20px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.9)",
                  }}
                >
                  {/* Sheet Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "rgba(245, 158, 11, 0.15)",
                          border: "1px solid #F59E0B",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <SlidersHorizontal size={16} color="#F59E0B" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF" }}>
                          Notification &amp; Alert Options
                        </h4>
                        <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                          CineConnect Cinema Dispatch Triggers
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowNotifPreferencesModal(false)}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
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
                      <X size={15} />
                    </button>
                  </div>

                  {/* Options List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      {
                        key: "callbacks" as const,
                        title: "Director Callbacks & Screen Tests",
                        desc: "Instant priority push & chime when a director books you for a callback or audition test.",
                        icon: Clapperboard,
                        color: "#F59E0B",
                      },
                      {
                        key: "aiMatches" as const,
                        title: "90%+ AI Smart Role Matches",
                        desc: "Alerts when casting directors drop open roles with >90% match to your acting resume & skills.",
                        icon: Sparkles,
                        color: "#38BDF8",
                      },
                      {
                        key: "showreelViews" as const,
                        title: "Casting Director Showreel Views",
                        desc: "Real-time alerts when verified production houses inspect your showreels or monologue tapes.",
                        icon: Eye,
                        color: "#10B981",
                      },
                      {
                        key: "callSheets" as const,
                        title: "Call Sheets & Shoot Schedules",
                        desc: "Urgent day-of notifications for soundstage call times, breakfast, and costume change schedules.",
                        icon: Calendar,
                        color: "#F43F5E",
                      },
                      {
                        key: "pitchRequests" as const,
                        title: "Screenplay Option & NDA Requests",
                        desc: "Alerts when studio development executives request shooting scripts, lookbooks, or NDAs.",
                        icon: FileText,
                        color: "#A855F7",
                      },
                      {
                        key: "soundAlerts" as const,
                        title: "Cinematic In-App Sound Chimes",
                        desc: "Play subtle audio chime when new high-priority director callbacks are delivered.",
                        icon: Bell,
                        color: "#F59E0B",
                      },
                    ].map((opt) => {
                      const IconComp = opt.icon;
                      const isEnabled = notifPreferences[opt.key];

                      return (
                        <div
                          key={opt.key}
                          style={{
                            padding: "10px 12px",
                            background: "rgba(255, 255, 255, 0.02)",
                            border: "1px solid rgba(255, 255, 255, 0.07)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "10px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                            <div
                              style={{
                                width: "26px",
                                height: "26px",
                                borderRadius: "6px",
                                background: `${opt.color}20`,
                                border: `1px solid ${opt.color}40`,
                                display: "flex",
                                alignItems: "center",
                                justifyItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: "2px",
                              }}
                            >
                              <IconComp size={13} color={opt.color} />
                            </div>
                            <div>
                              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                                {opt.title}
                              </span>
                              <span style={{ fontSize: "0.66rem", color: "#94A3B8", lineHeight: 1.35, display: "block" }}>
                                {opt.desc}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <div
                            onClick={() =>
                              setNotifPreferences((prev) => ({ ...prev, [opt.key]: !prev[opt.key] }))
                            }
                            style={{
                              width: "36px",
                              height: "20px",
                              borderRadius: "10px",
                              background: isEnabled ? "#F59E0B" : "rgba(255, 255, 255, 0.16)",
                              position: "relative",
                              cursor: "pointer",
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

                  {/* Save Preferences Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifPreferencesModal(false);
                      setToastMessage("✓ Notification options saved! Alert preferences updated.");
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                    style={{
                      marginTop: "6px",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                      color: "#08090C",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(255, 152, 0, 0.35)",
                    }}
                  >
                    Save &amp; Apply Alert Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      case "talent": {
        const qClean = searchQuery.toLowerCase().trim();

        const searchResultsReels = reelsList.filter((reel) => {
          if (!qClean) return true;
          return (
            reel.title.toLowerCase().includes(qClean) ||
            reel.description.toLowerCase().includes(qClean) ||
            reel.creator.name.toLowerCase().includes(qClean) ||
            reel.creator.craft.toLowerCase().includes(qClean) ||
            reel.category.toLowerCase().includes(qClean) ||
            reel.soundTrack.toLowerCase().includes(qClean)
          );
        });

        const searchResultsPosts = feedPosts.filter((post) => {
          if (!qClean) return true;
          return (
            post.content.toLowerCase().includes(qClean) ||
            post.author.name.toLowerCase().includes(qClean) ||
            post.author.craft.toLowerCase().includes(qClean) ||
            (post.tags && post.tags.some((t) => t.toLowerCase().includes(qClean))) ||
            (post.type && post.type.toLowerCase().includes(qClean))
          );
        });

        const searchResultsOpportunities = OPEN_CASTINGS.filter((casting) => {
          if (!qClean) return true;
          return (
            casting.title.toLowerCase().includes(qClean) ||
            casting.productionHouse.toLowerCase().includes(qClean) ||
            (casting.characterName && casting.characterName.toLowerCase().includes(qClean)) ||
            casting.characterDescription.toLowerCase().includes(qClean) ||
            casting.location.toLowerCase().includes(qClean) ||
            casting.craft.toLowerCase().includes(qClean) ||
            casting.projectType.toLowerCase().includes(qClean) ||
            (casting.director && casting.director.toLowerCase().includes(qClean)) ||
            (casting.requirements && casting.requirements.some((r) => r.toLowerCase().includes(qClean)))
          );
        });

        const searchResultsTalent = FEATURED_TALENT.filter((talent) => {
          if (!qClean) return true;
          return (
            talent.name.toLowerCase().includes(qClean) ||
            talent.craft.toLowerCase().includes(qClean) ||
            talent.city.toLowerCase().includes(qClean) ||
            talent.country.toLowerCase().includes(qClean) ||
            talent.bio.toLowerCase().includes(qClean) ||
            (talent.skills && talent.skills.some((s) => s.toLowerCase().includes(qClean))) ||
            (talent.category && talent.category.toLowerCase().includes(qClean))
          );
        });

        const searchResultsPitches = PITCH_DECKS.filter((pitch) => {
          if (!qClean) return true;
          return (
            pitch.title.toLowerCase().includes(qClean) ||
            pitch.writer.toLowerCase().includes(qClean) ||
            (pitch.genre && pitch.genre.some((g) => g.toLowerCase().includes(qClean))) ||
            pitch.logline.toLowerCase().includes(qClean) ||
            pitch.synopsis.toLowerCase().includes(qClean) ||
            pitch.format.toLowerCase().includes(qClean)
          );
        });

        const totalResultsCount =
          searchResultsReels.length +
          searchResultsPosts.length +
          searchResultsOpportunities.length +
          searchResultsTalent.length +
          searchResultsPitches.length;

        const categoriesList = [
          { id: "all" as const, label: "All", count: totalResultsCount, icon: Sparkles },
          { id: "reels" as const, label: "Reels", count: searchResultsReels.length, icon: Film },
          { id: "posts" as const, label: "Posts", count: searchResultsPosts.length, icon: FileText },
          { id: "opportunities" as const, label: "Opportunities", count: searchResultsOpportunities.length, icon: Clapperboard },
          { id: "talent" as const, label: "Talent", count: searchResultsTalent.length, icon: UserRound },
          { id: "pitches" as const, label: "Pitches", count: searchResultsPitches.length, icon: Bookmark },
        ];

        const popularKeywords = [
          "Actor",
          "Director",
          "Cinematography",
          "Auditions",
          "Music Video",
          "Thriller",
          "Sound",
          "Stunts",
        ];

        return (
          <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Top Search Input Bar */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                background: "rgba(8, 10, 15, 0.95)",
                backdropFilter: "blur(16px)",
                paddingBottom: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: searchQuery ? "1.5px solid var(--accent-gold)" : "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "14px",
                  padding: "8px 12px",
                  gap: "10px",
                  boxShadow: searchQuery ? "0 0 16px rgba(255, 152, 0, 0.2)" : "inset 0 1px 3px rgba(0,0,0,0.4)",
                  transition: "all 0.2s ease",
                }}
              >
                <Search size={18} color={searchQuery ? "var(--accent-gold)" : "var(--text-muted)"} />
                <input
                  id="mobile-global-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reels, posts, opportunities, talent..."
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#fff",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                  autoFocus={false}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "none",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Filter Pills (Horizontal Scrollable) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  overflowX: "auto",
                  paddingBottom: "2px",
                  scrollbarWidth: "none",
                }}
              >
                {categoriesList.map((cat) => {
                  const isActive = searchCategory === cat.id;
                  const CatIcon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      id={`search-cat-${cat.id}`}
                      onClick={() => setSearchCategory(cat.id)}
                      style={{
                        background: isActive
                          ? "linear-gradient(135deg, #FF9800 0%, #E65100 100%)"
                          : "rgba(255, 255, 255, 0.06)",
                        color: isActive ? "#000" : "#cbd5e1",
                        border: isActive ? "1px solid #FFB74D" : "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "20px",
                        padding: "5px 11px",
                        fontSize: "0.72rem",
                        fontWeight: isActive ? 800 : 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        whiteSpace: "nowrap",
                        transition: "all 0.18s ease",
                        boxShadow: isActive ? "0 2px 8px rgba(255, 152, 0, 0.4)" : "none",
                      }}
                    >
                      <CatIcon size={12} color={isActive ? "#000" : "var(--accent-gold)"} />
                      <span>{cat.label}</span>
                      <span
                        style={{
                          background: isActive ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.12)",
                          color: isActive ? "#000" : "var(--text-muted)",
                          borderRadius: "10px",
                          padding: "1px 6px",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                        }}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Trending Suggestions when search query is empty */}
              {!searchQuery && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto", scrollbarWidth: "none", paddingTop: "2px" }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--accent-gold)", fontWeight: 700, whiteSpace: "nowrap" }}>
                    🔥 Trending:
                  </span>
                  {popularKeywords.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setSearchQuery(kw)}
                      style={{
                        background: "rgba(255, 255, 255, 0.04)",
                        border: "1px dashed rgba(255, 255, 255, 0.15)",
                        borderRadius: "14px",
                        padding: "3px 8px",
                        fontSize: "0.66rem",
                        color: "#94a3b8",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      #{kw}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Result Summary when query active */}
              {searchQuery && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    Found <strong style={{ color: "var(--accent-gold)" }}>{searchCategory === "all" ? totalResultsCount : categoriesList.find(c => c.id === searchCategory)?.count || 0}</strong> matches for "{searchQuery}"
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchCategory("all");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#FF9800",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            {/* Zero State if nothing matched */}
            {totalResultsCount === 0 && (
              <div
                style={{
                  background: "#0f131c",
                  borderRadius: "16px",
                  padding: "36px 20px",
                  textAlign: "center",
                  border: "1px dashed rgba(255, 255, 255, 0.15)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(255, 152, 0, 0.12)",
                    border: "1px solid rgba(255, 152, 0, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Search size={26} color="var(--accent-gold)" />
                </div>
                <div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", color: "#fff", fontWeight: 700 }}>
                    No results found for "{searchQuery}"
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: 1.4, maxWidth: "260px" }}>
                    Try searching by talent name, craft (e.g. Actor, Director), genre, or reel title.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchCategory("all");
                  }}
                  className="btn-primary"
                  style={{ fontSize: "0.75rem", padding: "8px 18px", borderRadius: "10px" }}
                >
                  Explore Everything
                </button>
              </div>
            )}

            {/* SECTION: REELS (Shown in "all" or "reels") */}
            {(searchCategory === "all" || searchCategory === "reels") && searchResultsReels.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Film size={15} color="var(--accent-gold)" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff" }}>
                      CineReels ({searchResultsReels.length})
                    </span>
                  </div>
                  {searchCategory === "all" && searchResultsReels.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSearchCategory("reels")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                {/* 2-Column Grid for Reels */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {(searchCategory === "all" ? searchResultsReels.slice(0, 4) : searchResultsReels).map((reel) => {
                    const originalReelIndex = reelsList.findIndex((r) => r.id === reel.id);
                    return (
                      <div
                        key={reel.id}
                        id={`search-reel-card-${reel.id}`}
                        onClick={() => {
                          setReelsCategoryFilter("all");
                          if (originalReelIndex !== -1) {
                            setActiveReelIndex(originalReelIndex);
                          }
                          handleSelectTab("reels");
                        }}
                        style={{
                          background: "#0f131c",
                          borderRadius: "14px",
                          overflow: "hidden",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          transition: "all 0.2s ease",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                          position: "relative",
                        }}
                      >
                        {/* Thumbnail Container */}
                        <div style={{ position: "relative", width: "100%", height: "130px", background: "#05070a" }}>
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background: "rgba(0, 0, 0, 0.65)",
                              backdropFilter: "blur(4px)",
                              borderRadius: "8px",
                              padding: "2px 6px",
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              color: "var(--accent-gold)",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                            }}
                          >
                            <Play size={8} fill="var(--accent-gold)" color="var(--accent-gold)" /> Reel
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              bottom: "8px",
                              left: "8px",
                              right: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <img
                              src={reel.creator.avatar}
                              alt={reel.creator.name}
                              style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover", border: "1px solid var(--accent-gold)" }}
                            />
                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {reel.creator.name}
                            </span>
                          </div>
                        </div>

                        {/* Info Snippet */}
                        <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {reel.title}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--accent-gold)" }}>
                            {reel.category} • {reel.soundTrack.split("•")[0]}
                          </span>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px", fontSize: "0.65rem", color: "var(--text-muted)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                              <Heart size={10} color="#f43f5e" fill="#f43f5e" /> {reel.likes}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                              <MessageSquare size={10} /> {reel.commentsCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION: OPPORTUNITIES & AUDITIONS */}
            {(searchCategory === "all" || searchCategory === "opportunities") && searchResultsOpportunities.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Clapperboard size={15} color="var(--accent-gold)" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff" }}>
                      Opportunities & Roles ({searchResultsOpportunities.length})
                    </span>
                  </div>
                  {searchCategory === "all" && searchResultsOpportunities.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSearchCategory("opportunities")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(searchCategory === "all" ? searchResultsOpportunities.slice(0, 3) : searchResultsOpportunities).map((casting) => (
                    <div
                      key={casting.id}
                      style={{
                        background: "#0f131c",
                        borderRadius: "14px",
                        padding: "12px",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.86rem", fontWeight: 700, color: "#fff" }}>
                              {casting.title}
                            </span>
                            {casting.isUrgent && (
                              <span style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", fontSize: "0.6rem", fontWeight: 800, padding: "2px 6px", borderRadius: "6px" }}>
                                URGENT
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.7rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                            {casting.productionHouse} • {casting.projectType}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "#10b981", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {casting.payRange}
                        </span>
                      </div>

                      {casting.characterName && (
                        <div style={{ background: "rgba(255, 255, 255, 0.03)", borderRadius: "8px", padding: "6px 10px" }}>
                          <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#fff" }}>
                            Role: {casting.characterName}
                          </span>
                          <p style={{ margin: "2px 0 0 0", fontSize: "0.68rem", color: "var(--text-muted)", lineHeight: 1.3 }}>
                            {casting.characterDescription.slice(0, 100)}...
                          </p>
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                          <MapPin size={11} color="var(--accent-gold)" /> {casting.location} • Due: {casting.deadline}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveAudition(casting)}
                          className="btn-primary"
                          style={{ padding: "5px 12px", fontSize: "0.72rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Clapperboard size={12} /> Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: TALENT & CREW */}
            {(searchCategory === "all" || searchCategory === "talent") && searchResultsTalent.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <UserRound size={15} color="var(--accent-gold)" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff" }}>
                      Featured Creators & Crew ({searchResultsTalent.length})
                    </span>
                  </div>
                  {searchCategory === "all" && searchResultsTalent.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setSearchCategory("talent")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(searchCategory === "all" ? searchResultsTalent.slice(0, 4) : searchResultsTalent).map((talent) => (
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
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                        <img
                          src={talent.avatar}
                          alt={talent.name}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid var(--accent-gold)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {talent.name}
                            </span>
                            {talent.verified && <CheckCircle2 size={12} color="var(--accent-gold)" />}
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {talent.craft}
                          </span>
                          <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}>
                            {talent.creditsCount} Credits • {talent.city}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveShowreel(talent)}
                        className="btn-secondary"
                        style={{ padding: "6px 10px", fontSize: "0.72rem", flexShrink: 0, display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Play size={12} fill="var(--accent-gold)" color="var(--accent-gold)" /> Reel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: POSTS & UPDATES */}
            {(searchCategory === "all" || searchCategory === "posts") && searchResultsPosts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={15} color="var(--accent-gold)" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff" }}>
                      Feed Posts & Studio Updates ({searchResultsPosts.length})
                    </span>
                  </div>
                  {searchCategory === "all" && searchResultsPosts.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSearchCategory("posts")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-gold)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(searchCategory === "all" ? searchResultsPosts.slice(0, 3) : searchResultsPosts).map((post) => (
                    <div
                      key={post.id}
                      style={{
                        background: "#0f131c",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "14px",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {/* Post Header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                          />
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#fff" }}>
                                {post.author.name}
                              </span>
                              {post.author.verified && <CheckCircle2 size={11} color="var(--accent-gold)" />}
                            </div>
                            <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                              {post.author.craft} • {post.timestamp}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            background: "rgba(255, 255, 255, 0.06)",
                            color: "var(--accent-gold)",
                            padding: "2px 7px",
                            borderRadius: "6px",
                            fontSize: "0.64rem",
                            textTransform: "capitalize",
                            fontWeight: 700,
                          }}
                        >
                          {post.type}
                        </span>
                      </div>

                      {/* Content snippet */}
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-primary)", lineHeight: 1.4 }}>
                        {post.content}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {post.tags.map((tag) => (
                            <span key={tag} style={{ fontSize: "0.65rem", color: "#60a5fa" }}>
                              {tag.startsWith("#") ? tag : `#${tag}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Actions */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <button
                            type="button"
                            onClick={() => handleToggleLike(post.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: post.isLiked ? "#f43f5e" : "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <Heart size={14} fill={post.isLiked ? "#f43f5e" : "none"} />
                            <span>{post.likes}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFeedComments({
                                id: post.id,
                                author: post.author,
                                content: post.content,
                                commentsCount: feedPostCommentCounts[post.id] || post.commentsCount,
                              })
                            }
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <MessageSquare size={14} />
                            <span>{feedPostCommentCounts[post.id] || post.commentsCount}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSharePost(post)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              padding: 0,
                            }}
                          >
                            <Share2 size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleSavePost(post.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: savedPostIds.includes(post.id) ? "var(--accent-gold)" : "var(--text-muted)",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <Bookmark size={14} fill={savedPostIds.includes(post.id) ? "var(--accent-gold)" : "none"} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION: SCREENPLAYS & PITCH DECKS */}
            {(searchCategory === "all" || searchCategory === "pitches") && searchResultsPitches.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Bookmark size={15} color="#FFA500" />
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#fff" }}>
                      Screenplays & Pitch Vault ({searchResultsPitches.length})
                    </span>
                  </div>
                  {searchCategory === "all" && searchResultsPitches.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setSearchCategory("pitches")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#FFA500",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      View all <ChevronRight size={12} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {(searchCategory === "all" ? searchResultsPitches.slice(0, 3) : searchResultsPitches).map((pitch) => (
                    <div
                      key={pitch.id}
                      style={{
                        background: "#0f131c",
                        borderRadius: "14px",
                        padding: "12px",
                        border: "1px solid var(--border-subtle)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div>
                          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>
                            {pitch.title}
                          </span>
                          <span style={{ display: "block", fontSize: "0.7rem", color: "#FFA500", fontWeight: 600 }}>
                            By {pitch.writer} • {pitch.format}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.68rem", color: "#10b981", fontWeight: 700 }}>
                          Est. {pitch.estimatedBudget}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-muted)", lineHeight: 1.35 }}>
                        "{pitch.logline}"
                      </p>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {pitch.genre.map((g) => (
                            <span key={g} style={{ background: "rgba(255, 165, 0, 0.12)", color: "#FFA500", fontSize: "0.62rem", padding: "2px 6px", borderRadius: "4px" }}>
                              {g}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActivePitch(pitch)}
                          className="btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Lock size={11} color="var(--accent-gold)" /> Pitch Deck
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

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
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80"
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
          <div style={{ padding: "14px 14px 90px", display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
            {/* Top User Header Card */}
            <div
              style={{
                background: "#121620",
                borderRadius: "14px",
                border: "1px solid #232938",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                  }}
                >
                  KM
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>
                      {activeProfileType === "talent" ? "Kabir Mehra" : "Shadow Reel Studios"}
                    </span>
                    <span
                      style={{
                        background: "rgba(255, 165, 0, 0.18)",
                        color: "#FFA500",
                        fontSize: "0.62rem",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        fontWeight: 700,
                        border: "1px solid rgba(255, 165, 0, 0.4)",
                      }}
                    >
                      {activeProfileType === "talent" ? "Talent Pro" : "Studio Hub"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                    {activeProfileType === "talent" ? "Method Actor • Mumbai" : "Production House • Mumbai"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchProfileSheet(true)}
                style={{
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid #2A3142",
                  borderRadius: "8px",
                  padding: "5px 9px",
                  color: "#FFA500",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Switch
              </button>
            </div>

            {/* SECTION 1: HOW TO USE CINECONNECT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#FFA500", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "4px" }}>
                How to use CineConnect
              </span>
              <div
                style={{
                  background: "#121620",
                  borderRadius: "14px",
                  border: "1px solid #232938",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Saved Tile */}
                <div
                  onClick={() => setShowSavedSheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <Bookmark size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Saved
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Casting calls, project notices, showreels &amp; posts
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#9E9E9E", fontWeight: 600 }}>{savedCollectionCount}</span>
                    <ChevronRight size={16} color="#6B7280" />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#1C212E", margin: "0 14px" }} />

                {/* Archive Tile */}
                <div
                  onClick={() => setShowArchiveSheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <Clock size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Archive
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Archived posts, stories, audition tapes &amp; expired jobs
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#6B7280" />
                </div>
              </div>
            </div>

            {/* SECTION 2: SUBSCRIPTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#FFA500", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "4px" }}>
                Subscriptions
              </span>
              <div
                style={{
                  background: "#121620",
                  borderRadius: "14px",
                  border: "1px solid #232938",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(245, 158, 11, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F59E0B",
                      }}
                    >
                      <CreditCard size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        {currentPlanTier === "TALENT_PRO" ? "Talent Pro Membership" : "Recruiter Studio Pass"}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: 600 }}>
                        Active &bull; Renews Nov 15, 2026 ($19/mo)
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      color: "#10B981",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "6px",
                    }}
                  >
                    PRO
                  </span>
                </div>

                <div style={{ height: "1px", background: "#1C212E" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.72rem", color: "#9E9E9E" }}>
                    Unlimited auditions, 4K reel uploads, verified badge
                  </span>
                  <button
                    onClick={() => setShowSubscriptionSheet(true)}
                    style={{
                      background: "#FFA500",
                      border: "none",
                      color: "#000",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      minHeight: "36px",
                    }}
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: WHO CAN SEE YOUR ACCOUNT */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#FFA500", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "4px" }}>
                Who can see your account
              </span>
              <div
                style={{
                  background: "#121620",
                  borderRadius: "14px",
                  border: "1px solid #232938",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Account Privacy Toggle */}
                <div
                  onClick={() => {
                    setIsPrivateAccount((prev) => {
                      const next = !prev;
                      setToastMessage(next ? "Account is now Private 🔒" : "Account is now Public 🌐");
                      setTimeout(() => setToastMessage(null), 2000);
                      return next;
                    });
                  }}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingRight: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <Lock size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Account Privacy
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        {isPrivateAccount ? "Private (Only connections see posts)" : "Public (Discoverable in crew searches)"}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "20px",
                      borderRadius: "10px",
                      background: isPrivateAccount ? "#FFA500" : "rgba(255,255,255,0.15)",
                      position: "relative",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: isPrivateAccount ? "#0D0E12" : "#FFFFFF",
                        position: "absolute",
                        left: isPrivateAccount ? "18px" : "2px",
                        top: "2px",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#1C212E", margin: "0 14px" }} />

                {/* Close Friends */}
                <div
                  onClick={() => setShowCloseFriendsSheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(16, 185, 129, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#10B981",
                      }}
                    >
                      <UserCheck size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Close Friends
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Trusted circle for exclusive BTS &amp; reels
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#10B981", fontWeight: 700 }}>
                      {closeFriendsList.length} members
                    </span>
                    <ChevronRight size={16} color="#6B7280" />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#1C212E", margin: "0 14px" }} />

                {/* Blocked */}
                <div
                  onClick={() => setShowBlockedSheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(244, 63, 94, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F43F5E",
                      }}
                    >
                      <EyeOff size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Blocked
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Manage blocked users and agencies
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#9E9E9E", fontWeight: 600 }}>
                      {blockedList.length}
                    </span>
                    <ChevronRight size={16} color="#6B7280" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: HOW OTHERS CAN INTERACT WITH YOU */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#FFA500", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "4px" }}>
                How others can interact with you
              </span>
              <div
                style={{
                  background: "#121620",
                  borderRadius: "14px",
                  border: "1px solid #232938",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Messages & Story Replies */}
                <div
                  onClick={() => setShowMessagingPrivacySheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <MessageSquare size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Messages &amp; Story Replies
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Who can DM you and reply to reels
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.68rem", color: "#FFA500", fontWeight: 600 }}>
                      {messagePermission === "verified_production" ? "Verified Only" : messagePermission === "everyone" ? "Everyone" : "Connections"}
                    </span>
                    <ChevronRight size={16} color="#6B7280" />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#1C212E", margin: "0 14px" }} />

                {/* Restricted */}
                <div
                  onClick={() => setShowRestrictedSheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <Shield size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Restricted
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Limit interactions without alerting them
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.7rem", color: "#9E9E9E", fontWeight: 600 }}>
                      {restrictedList.length}
                    </span>
                    <ChevronRight size={16} color="#6B7280" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: CORE ACCOUNT & SYSTEM ACTIONS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#FFA500", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: "4px" }}>
                Account &amp; System Actions
              </span>
              <div
                style={{
                  background: "#121620",
                  borderRadius: "14px",
                  border: "1px solid #232938",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Notifications Tile (Consolidated) */}
                <div
                  onClick={() => {
                    setJobAlertsEnabled((prev) => {
                      const next = !prev;
                      setToastMessage(next ? "Job & Audition Alerts Enabled 🔔" : "Notifications Paused 🔕");
                      setTimeout(() => setToastMessage(null), 2000);
                      return next;
                    });
                  }}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingRight: "8px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <Bell size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Notifications
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Job alerts, casting callbacks &amp; audition updates
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "20px",
                      borderRadius: "10px",
                      background: jobAlertsEnabled ? "#FFA500" : "rgba(255,255,255,0.15)",
                      position: "relative",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: jobAlertsEnabled ? "#0D0E12" : "#FFFFFF",
                        position: "absolute",
                        left: jobAlertsEnabled ? "18px" : "2px",
                        top: "2px",
                        transition: "all 0.2s ease",
                      }}
                    />
                  </div>
                </div>

                <div style={{ height: "1px", background: "#1C212E", margin: "0 14px" }} />

                {/* Security (Change Password) Tile */}
                <div
                  onClick={() => setShowPasswordSheet(true)}
                  style={{
                    padding: "13px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    minHeight: "48px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(255, 165, 0, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFA500",
                      }}
                    >
                      <Lock size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", display: "block" }}>
                        Security
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>
                        Change password &amp; cryptographic credentials
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="#6B7280" />
                </div>
              </div>

              {/* Action Buttons: Add Profile & Log Out */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                {/* Add Profile / Switch Account Button */}
                <button
                  onClick={() => setShowSwitchProfileSheet(true)}
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    background: "rgba(255, 165, 0, 0.08)",
                    border: "1.5px solid rgba(255, 165, 0, 0.4)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#FFA500",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Users size={16} />
                  Add Profile / Switch Account
                </button>

                {/* Log Out Button */}
                <button
                  onClick={() => setShowLogoutConfirmSheet(true)}
                  style={{
                    width: "100%",
                    minHeight: "48px",
                    background: "rgba(244, 63, 94, 0.08)",
                    border: "1.5px solid rgba(244, 63, 94, 0.3)",
                    borderRadius: "12px",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    color: "#F43F5E",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>

            {/* Version & Verification Info */}
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <span style={{ fontSize: "0.68rem", color: "#6B7280", display: "block" }}>
                CineConnect v2.4 (Studio Build) &bull; CineStream Engine
              </span>
              <span style={{ fontSize: "0.64rem", color: "#4B5563" }}>
                FastAPI &bull; PostgreSQL &bull; Redis Connected
              </span>
            </div>

            {/* MODAL SHEET 1: SAVED COLLECTIONS */}
            {showSavedSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Bookmark size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Saved Items ({savedCollectionCount})</span>
                    </div>
                    <button onClick={() => setShowSavedSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { title: "Lead Protagonist — Netflix Psychological Thriller", tag: "Casting Call", org: "Dharma Productions" },
                      { title: "2.39:1 Anamorphic Neon Rain Sequence", tag: "Showreel", org: "Aanya Sen (ISC)" },
                      { title: "Action Sequence 2nd Unit Director Call", tag: "Opportunity", org: "Excel Entertainment" },
                      { title: "Gaffer & Colorist Lookbook Archive", tag: "Project Post", org: "Mumbai Cine Club" },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: "#0D1017", padding: "10px", borderRadius: "10px", border: "1px solid #232938", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFF", display: "block" }}>{item.title}</span>
                          <span style={{ fontSize: "0.65rem", color: "#9E9E9E" }}>{item.org} &bull; <span style={{ color: "#FFA500" }}>{item.tag}</span></span>
                        </div>
                        <button
                          onClick={() => {
                            setSavedCollectionCount((c) => Math.max(0, c - 1));
                            setToastMessage("Removed from saved items");
                            setTimeout(() => setToastMessage(null), 1800);
                          }}
                          style={{ background: "none", border: "none", color: "#F43F5E", fontSize: "0.68rem", cursor: "pointer", fontWeight: 700 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 2: ARCHIVE VAULT */}
            {showArchiveSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Clock size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Archive Vault</span>
                    </div>
                    <button onClick={() => setShowArchiveSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {[
                      { title: "Monologue Screen Test — Take 1 (Draft)", date: "Submitted Aug 14, 2026", status: "Expired Audition" },
                      { title: "Behind-the-Scenes Film City Night Shoot", date: "Story Archive", status: "24h Reel" },
                      { title: "Assistant Director Call (Filled)", date: "Closed Sept 2, 2026", status: "Expired Job Post" },
                    ].map((item, idx) => (
                      <div key={idx} style={{ background: "#0D1017", padding: "10px", borderRadius: "10px", border: "1px solid #232938", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFF", display: "block" }}>{item.title}</span>
                          <span style={{ fontSize: "0.65rem", color: "#9E9E9E" }}>{item.date} &bull; {item.status}</span>
                        </div>
                        <button
                          onClick={() => {
                            setToastMessage("Restored to active profile! ✨");
                            setTimeout(() => setToastMessage(null), 1800);
                          }}
                          style={{ background: "rgba(255,165,0,0.12)", border: "1px solid rgba(255,165,0,0.3)", color: "#FFA500", fontSize: "0.68rem", cursor: "pointer", fontWeight: 700, borderRadius: "6px", padding: "4px 8px" }}
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 3: SUBSCRIPTIONS & BILLING */}
            {showSubscriptionSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <CreditCard size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Subscription Options</span>
                    </div>
                    <button onClick={() => setShowSubscriptionSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>

                  {/* Talent Pro Option */}
                  <div
                    onClick={() => {
                      setCurrentPlanTier("TALENT_PRO");
                      setToastMessage("Active plan: Talent Pro ($19/mo)");
                      setTimeout(() => setToastMessage(null), 1800);
                    }}
                    style={{
                      background: currentPlanTier === "TALENT_PRO" ? "rgba(255, 165, 0, 0.1)" : "#0D1017",
                      border: `1.5px solid ${currentPlanTier === "TALENT_PRO" ? "#FFA500" : "#232938"}`,
                      borderRadius: "12px",
                      padding: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FFF" }}>Talent Pro Membership</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FFA500" }}>$19 / mo</span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#9E9E9E", display: "block", marginTop: "4px" }}>
                      Unlimited audition tapes, priority recruiter search badge, 4K showreel uploads, instant callback alerts.
                    </span>
                    {currentPlanTier === "TALENT_PRO" && (
                      <span style={{ fontSize: "0.65rem", color: "#10B981", fontWeight: 800, display: "inline-block", marginTop: "6px" }}>
                        CURRENT ACTIVE PLAN
                      </span>
                    )}
                  </div>

                  {/* Recruiter Studio Pass Option */}
                  <div
                    onClick={() => {
                      setCurrentPlanTier("STUDIO_PASS");
                      setToastMessage("Upgraded to Recruiter Studio Pass ($49/mo) 🎬");
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    style={{
                      background: currentPlanTier === "STUDIO_PASS" ? "rgba(255, 165, 0, 0.1)" : "#0D1017",
                      border: `1.5px solid ${currentPlanTier === "STUDIO_PASS" ? "#FFA500" : "#232938"}`,
                      borderRadius: "12px",
                      padding: "12px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FFF" }}>Recruiter Studio Pass</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#FFA500" }}>$49 / mo</span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: "#9E9E9E", display: "block", marginTop: "4px" }}>
                      Verified production badge, unlimited audition call postings, direct talent DM outreach, multi-seat hiring.
                    </span>
                    {currentPlanTier === "STUDIO_PASS" && (
                      <span style={{ fontSize: "0.65rem", color: "#10B981", fontWeight: 800, display: "inline-block", marginTop: "6px" }}>
                        CURRENT ACTIVE PLAN
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowSubscriptionSheet(false);
                      setToastMessage("Billing details synchronized with Stripe 💳");
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    style={{
                      background: "#FFA500",
                      border: "none",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: "0.8rem",
                      padding: "12px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      marginTop: "6px",
                    }}
                  >
                    Manage Billing &amp; Payment Method
                  </button>
                </div>
              </div>
            )}

            {/* MODAL SHEET 4: CLOSE FRIENDS */}
            {showCloseFriendsSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <UserCheck size={18} color="#10B981" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Close Friends Circle ({closeFriendsList.length})</span>
                    </div>
                    <button onClick={() => setShowCloseFriendsSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
                    Only people on this list see stories and showreels shared to Close Friends.
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {closeFriendsList.map((friend) => (
                      <div key={friend.id} style={{ background: "#0D1017", padding: "10px", borderRadius: "10px", border: "1px solid #232938", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFF", display: "block" }}>{friend.name}</span>
                          <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>{friend.role}</span>
                        </div>
                        <button
                          onClick={() => {
                            setCloseFriendsList((list) => list.filter((f) => f.id !== friend.id));
                            setToastMessage(`Removed ${friend.name} from Close Friends`);
                            setTimeout(() => setToastMessage(null), 1800);
                          }}
                          style={{ background: "none", border: "1px solid rgba(244,63,94,0.3)", color: "#F43F5E", borderRadius: "6px", padding: "4px 8px", fontSize: "0.68rem", cursor: "pointer", fontWeight: 700 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 5: BLOCKED ACCOUNTS */}
            {showBlockedSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <EyeOff size={18} color="#F43F5E" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Blocked Accounts ({blockedList.length})</span>
                    </div>
                    <button onClick={() => setShowBlockedSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
                    Blocked accounts cannot find your profile, watch your reels, or send you casting calls.
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {blockedList.map((item) => (
                      <div key={item.id} style={{ background: "#0D1017", padding: "10px", borderRadius: "10px", border: "1px solid #232938", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFF", display: "block" }}>{item.name}</span>
                          <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>{item.reason}</span>
                        </div>
                        <button
                          onClick={() => {
                            setBlockedList((list) => list.filter((b) => b.id !== item.id));
                            setToastMessage(`Unblocked ${item.name}`);
                            setTimeout(() => setToastMessage(null), 1800);
                          }}
                          style={{ background: "#FFA500", border: "none", color: "#000", borderRadius: "6px", padding: "5px 10px", fontSize: "0.7rem", cursor: "pointer", fontWeight: 800 }}
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 6: MESSAGES & STORY REPLIES */}
            {showMessagingPrivacySheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <MessageSquare size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Messages &amp; Story Replies</span>
                    </div>
                    <button onClick={() => setShowMessagingPrivacySheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFF", display: "block", marginBottom: "8px" }}>
                      Who can send you direct production messages:
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {[
                        { id: "verified_production", label: "Verified Production Houses Only", desc: "Recommended for talent privacy" },
                        { id: "everyone", label: "Everyone", desc: "Open to all users and agents" },
                        { id: "connections", label: "Mutual Connections Only", desc: "Only accepted crew contacts" },
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => {
                            setMessagePermission(opt.id as any);
                            setToastMessage(`Messaging set to: ${opt.label}`);
                            setTimeout(() => setToastMessage(null), 1800);
                          }}
                          style={{
                            background: messagePermission === opt.id ? "rgba(255,165,0,0.1)" : "#0D1017",
                            border: `1.5px solid ${messagePermission === opt.id ? "#FFA500" : "#232938"}`,
                            borderRadius: "10px",
                            padding: "10px",
                            cursor: "pointer",
                          }}
                        >
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFF", display: "block" }}>{opt.label}</span>
                          <span style={{ fontSize: "0.65rem", color: "#9E9E9E" }}>{opt.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "#1C212E" }} />

                  {/* Story Replies Toggle */}
                  <div
                    onClick={() => {
                      setAllowStoryReplies((prev) => {
                        const next = !prev;
                        setToastMessage(next ? "Story replies open to everyone" : "Story replies restricted");
                        setTimeout(() => setToastMessage(null), 1800);
                        return next;
                      });
                    }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  >
                    <div>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFF", display: "block" }}>Allow Story &amp; Reel Replies</span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>Allow viewers to reply directly to stories</span>
                    </div>
                    <div
                      style={{
                        width: "36px",
                        height: "20px",
                        borderRadius: "10px",
                        background: allowStoryReplies ? "#FFA500" : "rgba(255,255,255,0.15)",
                        position: "relative",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: allowStoryReplies ? "#0D0E12" : "#FFFFFF",
                          position: "absolute",
                          left: allowStoryReplies ? "18px" : "2px",
                          top: "2px",
                          transition: "all 0.2s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 7: RESTRICTED ACCOUNTS */}
            {showRestrictedSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Shield size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Restricted Accounts</span>
                    </div>
                    <button onClick={() => setShowRestrictedSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
                    Protect yourself from unwanted interactions without blocking them. They won&apos;t know they are restricted.
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {restrictedList.map((item) => (
                      <div key={item.id} style={{ background: "#0D1017", padding: "10px", borderRadius: "10px", border: "1px solid #232938", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFF", display: "block" }}>{item.name}</span>
                          <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>{item.note}</span>
                        </div>
                        <button
                          onClick={() => {
                            setRestrictedList((list) => list.filter((r) => r.id !== item.id));
                            setToastMessage(`Unrestricted ${item.name}`);
                            setTimeout(() => setToastMessage(null), 1800);
                          }}
                          style={{ background: "#FFA500", border: "none", color: "#000", borderRadius: "6px", padding: "5px 10px", fontSize: "0.7rem", cursor: "pointer", fontWeight: 800 }}
                        >
                          Unrestrict
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 8: SECURITY (CHANGE PASSWORD) */}
            {showPasswordSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.8)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Lock size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>
                        Security: Change Password
                      </span>
                    </div>
                    <button onClick={() => setShowPasswordSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E", display: "block", marginBottom: "4px" }}>
                        Current Password
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordCurrent}
                        onChange={(e) => setPasswordCurrent(e.target.value)}
                        style={{ width: "100%", background: "#0D1017", border: "1px solid #232938", borderRadius: "8px", padding: "8px 10px", color: "#FFF", fontSize: "0.78rem", outline: "none" }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E", display: "block", marginBottom: "4px" }}>
                        New Password (min 8 chars)
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordNew}
                        onChange={(e) => setPasswordNew(e.target.value)}
                        style={{ width: "100%", background: "#0D1017", border: "1px solid #232938", borderRadius: "8px", padding: "8px 10px", color: "#FFF", fontSize: "0.78rem", outline: "none" }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E", display: "block", marginBottom: "4px" }}>
                        Confirm New Password
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        style={{ width: "100%", background: "#0D1017", border: "1px solid #232938", borderRadius: "8px", padding: "8px 10px", color: "#FFF", fontSize: "0.78rem", outline: "none" }}
                      />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <button
                      onClick={() => setShowPasswordSheet(false)}
                      style={{ flex: 1, background: "#0D1017", border: "1px solid #232938", borderRadius: "8px", padding: "10px", color: "#9E9E9E", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!passwordCurrent || !passwordNew || !passwordConfirm) {
                          setToastMessage("Please fill all password fields ⚠️");
                          setTimeout(() => setToastMessage(null), 2000);
                          return;
                        }
                        if (passwordNew !== passwordConfirm) {
                          setToastMessage("Passwords do not match ❌");
                          setTimeout(() => setToastMessage(null), 2000);
                          return;
                        }
                        setShowPasswordSheet(false);
                        setPasswordCurrent("");
                        setPasswordNew("");
                        setPasswordConfirm("");
                        setToastMessage("Password updated successfully! 🔐");
                        setTimeout(() => setToastMessage(null), 2200);
                      }}
                      style={{ flex: 2, background: "#FFA500", border: "none", borderRadius: "8px", padding: "10px", color: "#000", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL SHEET 9: SWITCH PROFILE / ADD ACCOUNT */}
            {showSwitchProfileSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    maxHeight: "85%",
                    overflowY: "auto",
                    background: "#121620",
                    borderTop: "1.5px solid #2A3142",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Users size={18} color="#FFA500" />
                      <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#FFF" }}>Switch Account</span>
                    </div>
                    <button onClick={() => setShowSwitchProfileSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={18} />
                    </button>
                  </div>

                  {/* Profile 1: Kabir Mehra */}
                  <div
                    onClick={() => {
                      setActiveProfileType("talent");
                      setShowSwitchProfileSheet(false);
                      setToastMessage("Switched to Kabir Mehra (Talent Pro) 🎭");
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    style={{
                      background: activeProfileType === "talent" ? "rgba(255,165,0,0.12)" : "#0D1017",
                      border: `1.5px solid ${activeProfileType === "talent" ? "#FFA500" : "#232938"}`,
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFF", display: "block" }}>Kabir Mehra</span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>Primary Actor &bull; Talent Pro Profile</span>
                    </div>
                    {activeProfileType === "talent" && (
                      <span style={{ color: "#10B981", fontSize: "0.7rem", fontWeight: 800 }}>ACTIVE</span>
                    )}
                  </div>

                  {/* Profile 2: Shadow Reel Studios */}
                  <div
                    onClick={() => {
                      setActiveProfileType("production");
                      setShowSwitchProfileSheet(false);
                      setToastMessage("Switched to Shadow Reel Studios (Director/Producer) 🎬");
                      setTimeout(() => setToastMessage(null), 2000);
                    }}
                    style={{
                      background: activeProfileType === "production" ? "rgba(255,165,0,0.12)" : "#0D1017",
                      border: `1.5px solid ${activeProfileType === "production" ? "#FFA500" : "#232938"}`,
                      borderRadius: "10px",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFF", display: "block" }}>Shadow Reel Studios</span>
                      <span style={{ fontSize: "0.68rem", color: "#9E9E9E" }}>Production House &bull; Casting &amp; Director Hub</span>
                    </div>
                    {activeProfileType === "production" && (
                      <span style={{ color: "#10B981", fontSize: "0.7rem", fontWeight: 800 }}>ACTIVE</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowSwitchProfileSheet(false);
                      setToastMessage("Link secondary account dialog opened");
                      setTimeout(() => setToastMessage(null), 1800);
                    }}
                    style={{
                      background: "transparent",
                      border: "1.5px dashed #FFA500",
                      borderRadius: "10px",
                      padding: "10px",
                      color: "#FFA500",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      marginTop: "4px",
                    }}
                  >
                    + Add or Link Another Professional Profile
                  </button>
                </div>
              </div>
            )}

            {/* MODAL SHEET 10: LOG OUT CONFIRMATION */}
            {showLogoutConfirmSheet && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(4px)",
                  zIndex: 80,
                  display: "flex",
                  alignItems: "flex-end",
                  borderRadius: "20px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    background: "#131722",
                    borderTop: "1.5px solid rgba(244, 63, 94, 0.4)",
                    borderRadius: "20px 20px 0 0",
                    padding: "18px 16px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <LogOut size={18} color="#F43F5E" />
                      <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>
                        Log Out of CineConnect?
                      </span>
                    </div>
                    <button onClick={() => setShowLogoutConfirmSheet(false)} style={{ background: "none", border: "none", color: "#9E9E9E", cursor: "pointer" }}>
                      <X size={16} />
                    </button>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#9E9E9E", lineHeight: 1.4, margin: 0 }}>
                    You will be signed out of Kabir Mehra on this device. You will need to re-authenticate with your credentials or biometric passkey to log back in.
                  </p>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <button
                      onClick={() => setShowLogoutConfirmSheet(false)}
                      style={{ flex: 1, background: "#0D1017", border: "1px solid #232938", borderRadius: "8px", padding: "10px", color: "#9E9E9E", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setShowLogoutConfirmSheet(false);
                        setToastMessage("Tokens cleared. Signed out successfully 🚪");
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                      style={{ flex: 2, background: "#F43F5E", border: "none", borderRadius: "8px", padding: "10px", color: "#FFF", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
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
            {/* Search Button */}
            <button
              id="mobile-search-top-btn"
              title="Search Everything"
              onClick={() => handleSelectTab("talent")}
              style={{
                background: activeTab === "talent" ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.08)",
                border: activeTab === "talent" ? "1.5px solid #FF9800" : "1px solid var(--border-subtle)",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: activeTab === "talent" ? "var(--accent-gold)" : "#fff",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Search size={14} />
            </button>

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
            paddingBottom: activeTab === "reels" ? "0" : "84px",
          }}
        >
          {renderMobileScreen()}
        </div>

        {/* Prominent Semi-Circle Rotating Wheel Navigation Bar with All 7 Icons Fully Visible */}
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
            height: "86px",
            background: "linear-gradient(180deg, rgba(16, 20, 32, 0.96) 0%, rgba(8, 10, 16, 0.99) 100%)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderRadius: "50% 50% 0 0 / 42px 42px 0 0",
            border: "none",
            outline: "none",
            overflow: "hidden",
            zIndex: 40,
            boxShadow: "0 -8px 30px rgba(0, 0, 0, 0.95)",
            userSelect: "none",
            touchAction: "pan-y",
          }}
        >
          {/* Inner 3-Icon Menu Bar: 1st Middle, 2nd Right, Last Left */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              zIndex: 25,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "7px 14px 6px",
              boxSizing: "border-box",
            }}
          >
            {/* Top Amber Glare Line along upper curve */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "25%",
                right: "25%",
                height: "2px",
                borderRadius: "1px",
                background: "linear-gradient(90deg, transparent 0%, #FF9800 50%, transparent 100%)",
                boxShadow: "0 0 10px #FF9800",
                pointerEvents: "none",
              }}
            />

            {/* 3 Icons Menu Bar: 1st icon in middle, 2nd on right, last on left */}
            {(() => {
              const activeIndex = Math.max(0, ALL_MOBILE_NAV_ITEMS.findIndex((item) => item.id === activeTab));
              const centerItem = ALL_MOBILE_NAV_ITEMS[activeIndex] || ALL_MOBILE_NAV_ITEMS[0];
              const nextIndex = (activeIndex + 1) % ALL_MOBILE_NAV_ITEMS.length;
              const rightItem = ALL_MOBILE_NAV_ITEMS[nextIndex];
              const prevIndex = (activeIndex - 1 + ALL_MOBILE_NAV_ITEMS.length) % ALL_MOBILE_NAV_ITEMS.length;
              const leftItem = ALL_MOBILE_NAV_ITEMS[prevIndex];

              const getBadge = (id: string) => {
                if (id === "messages") return unreadMobileMsgCount;
                if (id === "notifications") return unreadMobileNotifCount;
                return 0;
              };

              const leftBadge = getBadge(leftItem.id);
              const centerBadge = getBadge(centerItem.id);
              const rightBadge = getBadge(rightItem.id);

              const LeftIconComp = leftItem.icon;
              const CenterIconComp = centerItem.icon;
              const RightIconComp = rightItem.icon;

              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    flex: 1,
                    padding: "0 18px",
                    zIndex: 20,
                  }}
                >
                  {/* Last Icon (Left Side) */}
                  <button
                    type="button"
                    id={`three-nav-left-${leftItem.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTab(leftItem.id);
                    }}
                    title={`${leftItem.label} (Previous)`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                      width: "64px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: "rgba(20, 24, 36, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <LeftIconComp size={19} color="#94A3B8" strokeWidth={2} />
                      {leftBadge > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            minWidth: "16px",
                            height: "16px",
                            padding: "0 4px",
                            borderRadius: "8px",
                            background: leftItem.id === "messages" ? "#10b981" : "#ef4444",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1.5px solid #080a0f",
                          }}
                        >
                          {leftBadge}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 600,
                        color: "#94A3B8",
                        marginTop: "3px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {leftItem.label}
                    </span>
                  </button>

                  {/* 1st Icon (In The Middle - Hero / Active) */}
                  <button
                    type="button"
                    id={`three-nav-center-${centerItem.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTab(centerItem.id);
                    }}
                    title={`${centerItem.label} (Active)`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      outline: "none",
                      transition: "transform 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                      transform: "translateY(-5px) scale(1.08)",
                      width: "76px",
                      position: "relative",
                    }}
                  >
                    {/* Glowing Ambient Aura Ring */}
                    <div
                      style={{
                        position: "absolute",
                        top: "38%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(255, 152, 0, 0.3)",
                        filter: "blur(8px)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Circle Hero Icon Container */}
                    <div
                      style={{
                        position: "relative",
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                        border: "2.5px solid #FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(255, 152, 0, 0.85), 0 0 14px rgba(255, 152, 0, 0.5)",
                        transition: "all 0.2s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                      }}
                    >
                      <CenterIconComp size={24} color="#08090C" strokeWidth={2.6} />
                      {centerBadge > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            minWidth: "16px",
                            height: "16px",
                            padding: "0 4px",
                            borderRadius: "8px",
                            background: centerItem.id === "messages" ? "#10b981" : "#ef4444",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1.5px solid #080a0f",
                          }}
                        >
                          {centerBadge}
                        </span>
                      )}
                    </div>

                    {/* Active Highlighted Label */}
                    <div
                      style={{
                        marginTop: "3px",
                        background: "#101219",
                        border: "1px solid #FF9800",
                        padding: "1px 8px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 6px rgba(255, 152, 0, 0.35)",
                        transition: "all 0.18s ease",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 800,
                          color: "#F5F5F5",
                          letterSpacing: "0.02em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {centerItem.label}
                      </span>
                    </div>
                  </button>

                  {/* 2nd Icon (In The Right Side) */}
                  <button
                    type="button"
                    id={`three-nav-right-${rightItem.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTab(rightItem.id);
                    }}
                    title={`${rightItem.label} (Next)`}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      outline: "none",
                      transition: "all 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                      width: "64px",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        background: "rgba(20, 24, 36, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <RightIconComp size={19} color="#94A3B8" strokeWidth={2} />
                      {rightBadge > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: "-2px",
                            right: "-2px",
                            minWidth: "16px",
                            height: "16px",
                            padding: "0 4px",
                            borderRadius: "8px",
                            background: rightItem.id === "messages" ? "#10b981" : "#ef4444",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: 800,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1.5px solid #080a0f",
                          }}
                        >
                          {rightBadge}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "9.5px",
                        fontWeight: 600,
                        color: "#94A3B8",
                        marginTop: "3px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {rightItem.label}
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* Bottom Notch Indicator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                paddingBottom: "1px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "rgba(255, 152, 0, 0.4)",
                  boxShadow: "0 0 6px rgba(255, 152, 0, 0.6)",
                }}
              />
            </div>
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

      {/* My Applications Full Management Modal Sheet */}
      {showMobileMyAppsModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowMobileMyAppsModal(false)}
        >
          <div
            style={{
              background: "linear-gradient(180deg, #161922 0%, #0E1017 100%)",
              border: "1.5px solid rgba(255, 165, 0, 0.4)",
              borderBottom: "none",
              borderRadius: "22px 22px 0 0",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.7)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Bar */}
            <div style={{ width: "40px", height: "4px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "2px", margin: "10px auto 4px" }} />

            {/* Modal Header */}
            <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "7px" }}>
                    <Film size={18} color="#FFA500" /> My Applications
                  </h3>
                  <span
                    style={{
                      background: "rgba(255, 165, 0, 0.2)",
                      color: "#FFA500",
                      border: "1px solid rgba(255, 165, 0, 0.4)",
                      padding: "1px 7px",
                      borderRadius: "9999px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                    }}
                  >
                    {opportunityApplications.length} Total
                  </span>
                </div>
                <p style={{ margin: "3px 0 0", fontSize: "0.72rem", color: "#9E9E9E" }}>
                  All options: Saved Applications, Applied, Rejected, and Live callbacks
                </p>
              </div>
              <button
                type="button"
                id="close-my-apps-modal-btn"
                onClick={() => setShowMobileMyAppsModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  color: "#CBD5E1",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* All Options Filter Pills */}
            <div style={{ display: "flex", gap: "6px", padding: "10px 16px", overflowX: "auto", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
              {/* Option: All */}
              <button
                type="button"
                onClick={() => setOpportunityAppTab("all")}
                style={{
                  flex: "0 0 auto",
                  background: opportunityAppTab === "all" ? "rgba(255, 165, 0, 0.22)" : "rgba(255, 255, 255, 0.05)",
                  color: opportunityAppTab === "all" ? "#FFA500" : "#9E9E9E",
                  border: opportunityAppTab === "all" ? "1.5px solid #FFA500" : "1px solid #2E3340",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Film size={11} />
                <span>All</span>
                <span
                  style={{
                    background: opportunityAppTab === "all" ? "#FFA500" : "rgba(255, 255, 255, 0.12)",
                    color: opportunityAppTab === "all" ? "#0D0E12" : "#FFFFFF",
                    padding: "1px 5px",
                    borderRadius: "9999px",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                  }}
                >
                  {opportunityApplications.length}
                </span>
              </button>

              {/* Option: Applied */}
              <button
                type="button"
                onClick={() => setOpportunityAppTab("applied")}
                style={{
                  flex: "0 0 auto",
                  background: opportunityAppTab === "applied" ? "rgba(16, 185, 129, 0.22)" : "rgba(255, 255, 255, 0.05)",
                  color: opportunityAppTab === "applied" ? "#34d399" : "#9E9E9E",
                  border: opportunityAppTab === "applied" ? "1.5px solid #10B981" : "1px solid #2E3340",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Send size={11} />
                <span>Applied</span>
                <span
                  style={{
                    background: opportunityAppTab === "applied" ? "#10B981" : "rgba(255, 255, 255, 0.12)",
                    color: opportunityAppTab === "applied" ? "#0D0E12" : "#FFFFFF",
                    padding: "1px 5px",
                    borderRadius: "9999px",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                  }}
                >
                  {opportunityApplications.filter((a) => a.status === "applied").length}
                </span>
              </button>

              {/* Option: Saved Applications */}
              <button
                type="button"
                onClick={() => setOpportunityAppTab("saved")}
                style={{
                  flex: "0 0 auto",
                  background: opportunityAppTab === "saved" ? "rgba(56, 189, 248, 0.22)" : "rgba(255, 255, 255, 0.05)",
                  color: opportunityAppTab === "saved" ? "#38BDF8" : "#9E9E9E",
                  border: opportunityAppTab === "saved" ? "1.5px solid #38BDF8" : "1px solid #2E3340",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Bookmark size={11} />
                <span>Saved Applications</span>
                <span
                  style={{
                    background: opportunityAppTab === "saved" ? "#38BDF8" : "rgba(255, 255, 255, 0.12)",
                    color: opportunityAppTab === "saved" ? "#0D0E12" : "#FFFFFF",
                    padding: "1px 5px",
                    borderRadius: "9999px",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                  }}
                >
                  {opportunityApplications.filter((a) => a.status === "saved").length}
                </span>
              </button>

              {/* Option: Rejected */}
              <button
                type="button"
                onClick={() => setOpportunityAppTab("rejected")}
                style={{
                  flex: "0 0 auto",
                  background: opportunityAppTab === "rejected" ? "rgba(244, 63, 94, 0.22)" : "rgba(255, 255, 255, 0.05)",
                  color: opportunityAppTab === "rejected" ? "#FB7185" : "#9E9E9E",
                  border: opportunityAppTab === "rejected" ? "1.5px solid #F43F5E" : "1px solid #2E3340",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <XCircle size={11} />
                <span>Rejected</span>
                <span
                  style={{
                    background: opportunityAppTab === "rejected" ? "#F43F5E" : "rgba(255, 255, 255, 0.12)",
                    color: "#FFFFFF",
                    padding: "1px 5px",
                    borderRadius: "9999px",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                  }}
                >
                  {opportunityApplications.filter((a) => a.status === "rejected").length}
                </span>
              </button>
            </div>

            {/* Applications List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {opportunityApplications
                .filter((a) => (opportunityAppTab === "all" ? true : a.status === opportunityAppTab))
                .map((app) => (
                  <div
                    key={app.id}
                    style={{
                      background: "#181B24",
                      border:
                        app.status === "applied"
                          ? "1px solid rgba(16, 185, 129, 0.35)"
                          : app.status === "saved"
                            ? "1px solid rgba(56, 189, 248, 0.35)"
                            : "1px solid rgba(244, 63, 94, 0.3)",
                      borderRadius: "12px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                      <div>
                        <h5 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                          {app.roleTitle}
                        </h5>
                        <span style={{ fontSize: "0.72rem", color: "#FFA500", fontWeight: 600 }}>
                          {app.projectTitle} • {app.productionHouse}
                        </span>
                      </div>
                      <span
                        style={{
                          background:
                            app.status === "applied"
                              ? "rgba(16, 185, 129, 0.2)"
                              : app.status === "saved"
                                ? "rgba(56, 189, 248, 0.2)"
                                : "rgba(244, 63, 94, 0.2)",
                          color:
                            app.status === "applied" ? "#34d399" : app.status === "saved" ? "#38BDF8" : "#FB7185",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "0.64rem",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {app.stage}
                      </span>
                    </div>

                    {/* Progress bar for Applied */}
                    {app.status === "applied" && (
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#9E9E9E", marginBottom: "3px" }}>
                          <span>Review Stage</span>
                          <span>{app.progressPercent}%</span>
                        </div>
                        <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "9999px" }}>
                          <div style={{ width: `${app.progressPercent}%`, height: "100%", background: "#10B981", borderRadius: "9999px" }} />
                        </div>
                      </div>
                    )}

                    {/* Note / Feedback */}
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "7px 9px", borderRadius: "6px", fontSize: "0.7rem", color: "#E2E8F0" }}>
                      <span style={{ color: app.status === "rejected" ? "#F43F5E" : "#FFA500", fontWeight: 700, display: "block" }}>
                        {app.status === "applied" ? "Status:" : app.status === "saved" ? "Preparation Sides:" : "Director Feedback:"}
                      </span>
                      <span>{app.status === "rejected" && app.rejectionReason ? app.rejectionReason : app.stageNote}</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                      {app.status === "applied" && app.meetingLink && (
                        <a
                          href={app.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            flex: 1,
                            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                            color: "#fff",
                            padding: "7px 10px",
                            borderRadius: "6px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textAlign: "center",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "4px",
                          }}
                        >
                          <Video size={12} /> Join Callback Read
                        </a>
                      )}
                      {app.status === "saved" && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowMobileMyAppsModal(false);
                              const casting =
                                OPEN_CASTINGS.find((c) => c.id === app.castingId) ||
                                OPEN_CASTINGS.find((c) => c.title.toLowerCase().includes(app.roleTitle.toLowerCase())) ||
                                OPEN_CASTINGS[0];
                              setActiveAudition(casting);
                            }}
                            className="btn-primary"
                            style={{ flex: 1, padding: "7px 10px", fontSize: "0.72rem" }}
                          >
                            Instant Audition 🎬
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpportunityApplications((prev) => prev.filter((item) => item.id !== app.id));
                              setToastMessage("Removed from Saved");
                              setTimeout(() => setToastMessage(null), 2000);
                            }}
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid #2E3340",
                              color: "#9E9E9E",
                              padding: "7px 10px",
                              borderRadius: "6px",
                              fontSize: "0.72rem",
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </>
                      )}
                      {app.status === "rejected" && (
                        <span style={{ fontSize: "0.68rem", color: "#FFA500", fontStyle: "italic" }}>
                          ✨ Retained in talent pool for future season roles
                        </span>
                      )}
                    </div>
                  </div>
                ))}

              {opportunityApplications.filter((a) => (opportunityAppTab === "all" ? true : a.status === opportunityAppTab)).length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#9E9E9E" }}>
                  <p style={{ margin: 0, fontSize: "0.82rem" }}>No applications found in this category.</p>
                </div>
              )}
            </div>

            {/* Modal Bottom Close */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", background: "#0D0E14" }}>
              <button
                type="button"
                onClick={() => setShowMobileMyAppsModal(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close Applications View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-Style Comments Modal Sheet for Home Feed Posts & In-Feed Videos */}
      <InstagramCommentsModal
        isOpen={activeFeedCommentsItem !== null}
        onClose={() => setActiveFeedCommentsItem(null)}
        targetItem={activeFeedCommentsItem}
        comments={activeFeedCommentsItem ? feedPostCommentsMap[activeFeedCommentsItem.id] || [] : []}
        onAddComment={handleAddFeedComment}
      />
    </div>
  );
}
