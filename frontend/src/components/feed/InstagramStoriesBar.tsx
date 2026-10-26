"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Heart,
  Flame,
  Clapperboard,
  Send,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Check,
  PlusSquare,
} from "lucide-react";

export interface StorySegment {
  id: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  tag?: string;
}

export interface CineStory {
  id: string;
  userId: string;
  userName: string;
  userCraft: string;
  avatar: string;
  verified?: boolean;
  isLive?: boolean;
  isViewed?: boolean;
  isUserStory?: boolean;
  segments: StorySegment[];
}

export const INITIAL_CINE_STORIES: CineStory[] = [
  {
    id: "story-dharma",
    userId: "dharma-prods",
    userName: "Dharma Prods",
    userCraft: "Studio Banner",
    avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80",
    verified: true,
    isLive: true,
    isViewed: false,
    segments: [
      {
        id: "seg-dharma-1",
        mediaUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=900&auto=format&fit=crop&q=80",
        caption: "🔴 LIVE from Studio 4: Final Screen Tests for 'Shadow of Verity' 🎬",
        timestamp: "10m ago",
        tag: "Director Callback",
      },
      {
        id: "seg-dharma-2",
        mediaUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&auto=format&fit=crop&q=80",
        caption: "Reviewing dramatic monologues submitted via CineConnect self-tape portal ✨",
        timestamp: "5m ago",
        tag: "Casting Room",
      },
    ],
  },
  {
    id: "story-kabir",
    userId: "kabir-mehra",
    userName: "Kabir M.",
    userCraft: "Lead Actor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-kabir-1",
        mediaUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=900&auto=format&fit=crop&q=80",
        caption: "Table read with Anurag Kashyap. 18-page unbroken sequence locked in 📖🎬",
        timestamp: "45m ago",
        tag: "Table Read",
      },
      {
        id: "seg-kabir-2",
        mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
        caption: "Night shoot wrapped! 24 hours non-stop in the rain. Grateful for this crew 🌧️✨",
        timestamp: "20m ago",
        tag: "Set Life",
      },
    ],
  },
  {
    id: "story-ananya",
    userId: "ananya-sen",
    userName: "Ananya DP",
    userCraft: "Cinematographer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-ananya-1",
        mediaUrl: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&auto=format&fit=crop&q=80",
        caption: "Testing ARRI Alexa 35 paired with Cooke Anamorphic/i Full Frame lenses 🎥✨",
        timestamp: "2h ago",
        tag: "Camera Tech",
      },
    ],
  },
  {
    id: "story-vikram",
    userId: "vikram-director",
    userName: "Vikramaditya",
    userCraft: "Film Director",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-vikram-1",
        mediaUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=80",
        caption: "Location scouting in Spiti Valley. Golden hour light here is pure cinematic poetry 🏔️🌅",
        timestamp: "4h ago",
        tag: "Recce Day",
      },
    ],
  },
  {
    id: "story-redchillies",
    userId: "red-chillies",
    userName: "Red Chillies",
    userCraft: "VFX Studio",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-rc-1",
        mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80",
        caption: "Pre-vis breakdown: 420 digital matte layers for the cyberpunk sequence 💻🔥",
        timestamp: "6h ago",
        tag: "CGI Pipeline",
      },
    ],
  },
  {
    id: "story-pooja",
    userId: "pooja-h",
    userName: "Pooja H.",
    userCraft: "Method Actor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    isViewed: false,
    segments: [
      {
        id: "seg-pooja-1",
        mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=900&auto=format&fit=crop&q=80",
        caption: "Costume and prosthetic makeup test for period drama 'The Rajkumari' 👑✨",
        timestamp: "7h ago",
        tag: "Look Test",
      },
    ],
  },
  {
    id: "story-rohan",
    userId: "rohan-sound",
    userName: "Rohan S.",
    userCraft: "Sound Designer",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    isViewed: false,
    segments: [
      {
        id: "seg-rohan-1",
        mediaUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
        caption: "Foley mixing stage in Dolby Atmos 7.1.4. Hearing footsteps in 3D audio 🎧🔊",
        timestamp: "9h ago",
        tag: "Sound Stage",
      },
    ],
  },
];

export interface InstagramStoriesBarProps {
  onStoryReact?: (storyId: string, reaction: string) => void;
  onSendMessage?: (storyId: string, message: string) => void;
  hideBar?: boolean;
}

export default function InstagramStoriesBar({
  onStoryReact,
  onSendMessage,
  hideBar = false,
}: InstagramStoriesBarProps) {
  const [stories, setStories] = useState<CineStory[]>(INITIAL_CINE_STORIES);
  const [userStorySegments, setUserStorySegments] = useState<StorySegment[]>([]);

  // Active Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reactionToast, setReactionToast] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Create Story Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [selectedTag, setSelectedTag] = useState("BTS On Set");
  const [selectedMediaPreset, setSelectedMediaPreset] = useState(0);

  const MEDIA_PRESETS = [
    {
      label: "Director's Monitor",
      url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=900&auto=format&fit=crop&q=80",
    },
    {
      label: "Camera Rig",
      url: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&auto=format&fit=crop&q=80",
    },
    {
      label: "Script & Coffee",
      url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=900&auto=format&fit=crop&q=80",
    },
    {
      label: "Stage Light",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
    },
  ];

  // Build the complete story list (including "Your Story" first)
  const fullStoriesList: CineStory[] = [
    {
      id: "story-me",
      userId: "user-me",
      userName: "Your Story",
      userCraft: "Actor & Creator",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      isUserStory: true,
      isViewed: userStorySegments.length > 0 ? false : true,
      segments: userStorySegments,
    },
    ...stories,
  ];

  // Story Viewer Auto-Advance Timer (5 seconds per segment)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const currentStory = fullStoriesList[activeStoryIndex];
    if (!currentStory || currentStory.segments.length === 0) return;

    const stepMs = 50;
    const totalDurationMs = 5000;
    const increment = (stepMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next segment or next story
          if (activeSegmentIndex < currentStory.segments.length - 1) {
            setActiveSegmentIndex((s) => s + 1);
            return 0;
          } else if (activeStoryIndex < fullStoriesList.length - 1) {
            // Find next story with segments
            const nextIdx = activeStoryIndex + 1;
            if (fullStoriesList[nextIdx].segments.length > 0) {
              setActiveStoryIndex(nextIdx);
              setActiveSegmentIndex(0);
              return 0;
            }
          }
          // End of stories
          handleCloseViewer();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [activeStoryIndex, activeSegmentIndex, isPaused, fullStoriesList]);

  const handleOpenStory = (index: number) => {
    const story = fullStoriesList[index];
    if (story.isUserStory && story.segments.length === 0) {
      setShowCreateModal(true);
      return;
    }
    setActiveStoryIndex(index);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);

    // Mark story as viewed
    if (!story.isUserStory) {
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, isViewed: true } : s))
      );
    }
  };

  const handleCloseViewer = () => {
    setActiveStoryIndex(null);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handlePrevSegment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex === null) return;
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((s) => s - 1);
      setProgress(0);
    } else if (activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      const prevStory = fullStoriesList[prevIdx];
      if (prevStory.segments.length > 0) {
        setActiveStoryIndex(prevIdx);
        setActiveSegmentIndex(prevStory.segments.length - 1);
        setProgress(0);
      }
    }
  };

  const handleNextSegment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    if (activeSegmentIndex < currentStory.segments.length - 1) {
      setActiveSegmentIndex((s) => s + 1);
      setProgress(0);
    } else if (activeStoryIndex < fullStoriesList.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      if (fullStoriesList[nextIdx].segments.length > 0) {
        setActiveStoryIndex(nextIdx);
        setActiveSegmentIndex(0);
        setProgress(0);
      } else {
        handleCloseViewer();
      }
    } else {
      handleCloseViewer();
    }
  };

  const handleReaction = (emoji: string) => {
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setReactionToast(`Sent ${emoji} to ${currentStory.userName}!`);
    setTimeout(() => setReactionToast(null), 2000);
    if (onStoryReact) {
      onStoryReact(currentStory.id, emoji);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setReactionToast(`Message sent to ${currentStory.userName} 📩`);
    setTimeout(() => setReactionToast(null), 2000);
    if (onSendMessage) {
      onSendMessage(currentStory.id, replyText);
    }
    setReplyText("");
  };

  const handleCreateStory = () => {
    const newSeg: StorySegment = {
      id: "seg-my-" + Date.now(),
      mediaUrl: MEDIA_PRESETS[selectedMediaPreset].url,
      caption: newCaption.trim() || "Just wrapped rehearsals for CineConnect project 🎬",
      timestamp: "Just now",
      tag: selectedTag,
    };
    setUserStorySegments((prev) => [newSeg, ...prev]);
    setShowCreateModal(false);
    setNewCaption("");
    setReactionToast("Your Story posted! 🚀🎬");
    setTimeout(() => setReactionToast(null), 2400);
  };

  const activeStory = activeStoryIndex !== null ? fullStoriesList[activeStoryIndex] : null;
  const activeSegment = activeStory && activeStory.segments[activeSegmentIndex];

  return (
    <>
      {/* ================= Instagram-Style Stories Bar Tray ================= */}
      {!hideBar && (
        <div
          className="relative w-full border-b border-white/10 bg-[#08090C]/80 backdrop-blur-xl select-none"
          style={{
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.45)",
          }}
        >
          <div
            className="flex items-center gap-3 overflow-x-auto px-3.5 py-2.5 no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {fullStoriesList.map((story, idx) => {
              const hasStory = story.segments.length > 0;
              const isUser = story.isUserStory;

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => handleOpenStory(idx)}
                  className="group flex flex-col items-center gap-1.5 focus:outline-none flex-shrink-0"
                  style={{ width: "66px" }}
                >
                  {/* Avatar with Instagram-Style Story Ring */}
                  <div className="relative flex items-center justify-center">
                    {/* Glowing Animated Ring */}
                    {story.isLive ? (
                      // Live Story Pulsing Red-Gold Ring
                      <div
                        className="absolute -inset-1 rounded-full animate-pulse"
                        style={{
                          background: "linear-gradient(45deg, #EF4444 0%, #FF9800 100%)",
                          padding: "2.5px",
                        }}
                      />
                    ) : !story.isViewed && hasStory ? (
                      // Unviewed Story: Vibrant Cinematic Amber-Rose Gradient Ring
                      <div
                        className="absolute -inset-1 rounded-full transition-transform group-hover:scale-105"
                        style={{
                          background: "linear-gradient(45deg, #FF9800 0%, #E11D48 50%, #FFC247 100%)",
                          padding: "2.5px",
                          boxShadow: "0 0 10px rgba(255, 152, 0, 0.4)",
                        }}
                      />
                    ) : hasStory ? (
                      // Viewed Story: Subtle Muted Ring
                      <div
                        className="absolute -inset-1 rounded-full"
                        style={{
                          background: "rgba(255, 255, 255, 0.18)",
                          padding: "1.5px",
                        }}
                      />
                    ) : null}

                    {/* Dark Gap Ring */}
                    <div className="relative rounded-full bg-[#08090C] p-[2.5px]">
                      <img
                        src={story.avatar}
                        alt={story.userName}
                        className="h-14 w-14 rounded-full object-cover transition-transform group-active:scale-95"
                      />
                    </div>

                    {/* "Your Story" Plus Badge */}
                    {isUser && !hasStory && (
                      <div
                        className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#08090C] bg-[#FF9800] text-[#08090C] shadow-md shadow-[#FF9800]/50"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}

                    {/* LIVE Pill Tag */}
                    {story.isLive && (
                      <span
                        className="absolute -bottom-1 rounded-full bg-[#EF4444] px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider text-white border border-[#08090C] shadow-sm"
                      >
                        LIVE
                      </span>
                    )}
                  </div>

                  {/* Creator Label */}
                  <span
                    className="w-full text-center text-[10.5px] font-semibold text-[#E2E8F0] truncate group-hover:text-[#FF9800] transition-colors"
                    style={{
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {isUser ? "Your Story" : story.userName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= Full-Screen Instagram-Style Story Viewer Modal ================= */}
      {activeStory && activeSegment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 select-none"
          onClick={() => setIsPaused((p) => !p)}
        >
          {/* Reaction Float Toast */}
          {reactionToast && (
            <div className="absolute top-20 z-50 rounded-full border border-[#FF9800]/40 bg-[#101219]/90 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md animate-bounce">
              {reactionToast}
            </div>
          )}

          {/* Story Container (Phone Dimensions 9:16) */}
          <div
            className="relative flex h-full max-h-[840px] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl bg-[#08090C] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Story Background Media Image */}
            <img
              src={activeSegment.mediaUrl}
              alt="Story"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
            />

            {/* Gradient Overlays for Top and Bottom Text Readability */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

            {/* Top Interactive Controls Area */}
            <div className="relative z-20 flex flex-col gap-2 p-3.5">
              {/* Segmented Progress Bars (Instagram style) */}
              <div className="flex w-full items-center gap-1.5">
                {activeStory.segments.map((seg, sIdx) => {
                  let barFill = 0;
                  if (sIdx < activeSegmentIndex) barFill = 100;
                  else if (sIdx === activeSegmentIndex) barFill = progress;

                  return (
                    <div
                      key={seg.id}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#FFC247] to-[#FF9800] transition-all"
                        style={{
                          width: `${barFill}%`,
                          transitionDuration: sIdx === activeSegmentIndex ? "50ms" : "0ms",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Author Info Bar */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.userName}
                    className="h-8 w-8 rounded-full border border-white/40 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">
                        {activeStory.userName}
                      </span>
                      {activeStory.verified && (
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF9800] text-[9px] font-black text-black">
                          ✓
                        </span>
                      )}
                      <span className="text-[10px] text-white/60">
                        {activeSegment.timestamp}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-semibold text-[#FF9800]">
                      {activeStory.userCraft}
                    </span>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2 text-white">
                  {/* Pause / Play */}
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    className="p-1 hover:text-[#FF9800] transition-colors"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>

                  {/* Close Story */}
                  <button
                    type="button"
                    onClick={handleCloseViewer}
                    className="rounded-full bg-black/40 p-1 hover:bg-black/70 hover:text-[#FF9800] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Left / Right Invisible Tap Zones (Instagram Navigation) */}
            <div className="absolute inset-y-24 inset-x-0 z-10 flex">
              {/* Tap Left: Previous Segment */}
              <div
                className="h-full w-1/3 cursor-pointer"
                onClick={handlePrevSegment}
                title="Previous"
              />
              {/* Tap Right: Next Segment */}
              <div
                className="h-full w-2/3 cursor-pointer"
                onClick={handleNextSegment}
                title="Next"
              />
            </div>

            {/* Bottom Caption & Interactive Engagement Bar */}
            <div className="relative z-20 flex flex-col gap-2.5 p-3.5 pb-4">
              {/* Story Tag & Caption */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-3 backdrop-blur-md">
                {activeSegment.tag && (
                  <span className="mb-1 inline-block rounded-md bg-[#FF9800]/20 border border-[#FF9800]/40 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#FF9800]">
                    {activeSegment.tag}
                  </span>
                )}
                <p className="text-xs font-semibold text-[#F5F5F5] leading-relaxed">
                  {activeSegment.caption}
                </p>
              </div>

              {/* Direct Reply & Quick Reactions */}
              <div className="flex items-center gap-2">
                <form onSubmit={handleSendReply} className="flex flex-1 items-center gap-1.5">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${activeStory.userName}...`}
                    className="w-full rounded-full border border-white/20 bg-black/50 px-3.5 py-2 text-xs text-white placeholder-white/50 focus:border-[#FF9800] focus:outline-none backdrop-blur-sm"
                  />
                  {replyText.trim() && (
                    <button
                      type="submit"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9800] text-black"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                </form>

                {/* Quick Emoji Reaction Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleReaction("❤️")}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm hover:scale-110 active:scale-95 transition-transform"
                    title="Send Heart"
                  >
                    ❤️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReaction("🔥")}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm hover:scale-110 active:scale-95 transition-transform"
                    title="Send Fire"
                  >
                    🔥
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReaction("🎬")}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm hover:scale-110 active:scale-95 transition-transform"
                    title="Send Clapper"
                  >
                    🎬
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= Create / Add Story Modal ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0F131C] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#FF9800]" />
                <h3 className="text-sm font-black text-white">Share Behind-The-Scenes Story</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* Media Preset Selection */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1.5">
                  Choose Story Visual:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MEDIA_PRESETS.map((preset, pIdx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedMediaPreset(pIdx)}
                      className={`relative flex flex-col items-center overflow-hidden rounded-lg border p-1 text-left transition-all ${
                        selectedMediaPreset === pIdx
                          ? "border-[#FF9800] ring-2 ring-[#FF9800]/40"
                          : "border-white/10 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="h-16 w-full rounded object-cover"
                      />
                      <span className="mt-1 text-[10px] font-bold text-white truncate w-full text-center">
                        {preset.label}
                      </span>
                      {selectedMediaPreset === pIdx && (
                        <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9800] text-black">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Tag */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1.5">
                  Industry Story Tag:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["BTS On Set", "Rehearsal Take", "Camera Test", "Wrap Milestone", "Audition Snippet"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                          selectedTag === tag
                            ? "bg-[#FF9800] text-black"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Story Caption Input */}
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Story Caption:
                </label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="What's happening on set today? 🎬"
                  className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs text-white placeholder-white/40 focus:border-[#FF9800] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-white/15 py-2 text-xs font-bold text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateStory}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#FFC247] to-[#FF9800] py-2 text-xs font-black text-black shadow-lg shadow-[#FF9800]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Share to Story 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * InstagramStoriesHeaderButton
 * Rendered in the top app header, to the left of Notifications and Messages,
 * exactly like Instagram! Clicking it reveals the stories popover hub and
 * allows viewing or creating stories.
 */
export function InstagramStoriesHeaderButton({
  onStoryReact,
  onSendMessage,
}: InstagramStoriesBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [stories, setStories] = useState<CineStory[]>(INITIAL_CINE_STORIES);
  const [userStorySegments, setUserStorySegments] = useState<StorySegment[]>([]);

  // Active Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reactionToast, setReactionToast] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Create Story Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [selectedTag, setSelectedTag] = useState("BTS On Set");
  const [selectedMediaPreset, setSelectedMediaPreset] = useState(0);

  const MEDIA_PRESETS = [
    {
      label: "Director's Monitor",
      url: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=900&auto=format&fit=crop&q=80",
    },
    {
      label: "Camera Rig",
      url: "https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&auto=format&fit=crop&q=80",
    },
    {
      label: "Script & Coffee",
      url: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=900&auto=format&fit=crop&q=80",
    },
    {
      label: "Stage Light",
      url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=900&auto=format&fit=crop&q=80",
    },
  ];

  const fullStoriesList: CineStory[] = [
    {
      id: "story-me-header",
      userId: "user-me",
      userName: "Your Story",
      userCraft: "Actor & Creator",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      isUserStory: true,
      isViewed: userStorySegments.length > 0 ? false : true,
      segments: userStorySegments,
    },
    ...stories,
  ];

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Story Viewer Timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const currentStory = fullStoriesList[activeStoryIndex];
    if (!currentStory || currentStory.segments.length === 0) return;

    const stepMs = 50;
    const totalDurationMs = 5000;
    const increment = (stepMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeSegmentIndex < currentStory.segments.length - 1) {
            setActiveSegmentIndex((s) => s + 1);
            return 0;
          } else if (activeStoryIndex < fullStoriesList.length - 1) {
            const nextIdx = activeStoryIndex + 1;
            if (fullStoriesList[nextIdx].segments.length > 0) {
              setActiveStoryIndex(nextIdx);
              setActiveSegmentIndex(0);
              return 0;
            }
          }
          handleCloseViewer();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [activeStoryIndex, activeSegmentIndex, isPaused, fullStoriesList]);

  const handleOpenStory = (index: number) => {
    const story = fullStoriesList[index];
    if (story.isUserStory && story.segments.length === 0) {
      setShowMenu(false);
      setShowCreateModal(true);
      return;
    }
    setShowMenu(false);
    setActiveStoryIndex(index);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);

    if (!story.isUserStory) {
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, isViewed: true } : s))
      );
    }
  };

  const handleCloseViewer = () => {
    setActiveStoryIndex(null);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handlePrevSegment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((s) => s - 1);
      setProgress(0);
    } else if (activeStoryIndex !== null && activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevIdx);
      setActiveSegmentIndex(fullStoriesList[prevIdx].segments.length - 1);
      setProgress(0);
    }
  };

  const handleNextSegment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    if (activeSegmentIndex < currentStory.segments.length - 1) {
      setActiveSegmentIndex((s) => s + 1);
      setProgress(0);
    } else if (activeStoryIndex < fullStoriesList.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      if (fullStoriesList[nextIdx].segments.length > 0) {
        setActiveStoryIndex(nextIdx);
        setActiveSegmentIndex(0);
        setProgress(0);
      } else {
        handleCloseViewer();
      }
    } else {
      handleCloseViewer();
    }
  };

  const handleReaction = (emoji: string) => {
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setReactionToast(`Sent ${emoji} to ${currentStory.userName}!`);
    setTimeout(() => setReactionToast(null), 2000);
    if (onStoryReact) {
      onStoryReact(currentStory.id, emoji);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setReactionToast(`Message sent to ${currentStory.userName} 📩`);
    setTimeout(() => setReactionToast(null), 2000);
    if (onSendMessage) {
      onSendMessage(currentStory.id, replyText);
    }
    setReplyText("");
  };

  const handleCreateStory = () => {
    const newSeg: StorySegment = {
      id: "seg-my-" + Date.now(),
      mediaUrl: MEDIA_PRESETS[selectedMediaPreset].url,
      caption: newCaption.trim() || "Just wrapped rehearsals for CineConnect project 🎬",
      timestamp: "Just now",
      tag: selectedTag,
    };
    setUserStorySegments((prev) => [newSeg, ...prev]);
    setShowCreateModal(false);
    setNewCaption("");
    setReactionToast("Your Story posted! 🚀🎬");
    setTimeout(() => setReactionToast(null), 2400);
  };

  const activeStory = activeStoryIndex !== null ? fullStoriesList[activeStoryIndex] : null;
  const activeSegment = activeStory && activeStory.segments[activeSegmentIndex];

  return (
    <div className="relative" ref={menuRef}>
      {/* Top Header Stories Button (Positioned left of notifications and messages) */}
      <button
        id="mobile-stories-top-btn"
        type="button"
        title="Stories & Updates"
        onClick={() => setShowMenu((prev) => !prev)}
        style={{
          background: showMenu ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.08)",
          border: showMenu ? "1.5px solid #FF9800" : "1px solid var(--border-subtle, rgba(255, 255, 255, 0.15))",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: showMenu ? "var(--accent-gold, #FF9800)" : "#fff",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.15s ease",
        }}
        aria-label="Instagram-style Stories"
      >
        <PlusSquare size={14} />
        {/* Unread Stories Indicator Badge */}
        <span
          style={{
            position: "absolute",
            top: "-2px",
            right: "-2px",
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            background: "linear-gradient(45deg, #FF9800 0%, #E11D48 100%)",
            color: "#fff",
            fontSize: "0.58rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid #080a0f",
            boxShadow: "0 0 6px rgba(255, 152, 0, 0.6)",
          }}
        >
          6
        </span>
      </button>

      {/* Stories Popover Menu (Instagram Style Dropdown) */}
      {showMenu && (
        <div
          className="absolute top-10 right-0 z-[100] w-[310px] rounded-2xl border border-white/15 bg-[#0a0d14]/95 p-3.5 shadow-2xl backdrop-blur-2xl"
          style={{
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 152, 0, 0.15)",
          }}
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#FF9800]" />
              <span className="text-xs font-black tracking-wide text-white">
                CINE<span className="text-[#FF9800]">STORIES</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-gradient-to-r from-[#FF9800] to-[#E11D48] px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                6 ACTIVE
              </span>
              <button
                type="button"
                onClick={() => setShowMenu(false)}
                className="text-white/50 hover:text-white p-0.5 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Mini Horizontal Stories Avatars Tray */}
          <div
            className="flex items-center gap-2.5 overflow-x-auto pb-3 no-scrollbar"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {fullStoriesList.map((story, idx) => {
              const hasStory = story.segments.length > 0;
              const isUser = story.isUserStory;

              return (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => {
                    if (isUser && !hasStory) {
                      setShowMenu(false);
                      setShowCreateModal(true);
                    } else {
                      handleOpenStory(idx);
                    }
                  }}
                  className="group flex flex-col items-center gap-1 focus:outline-none flex-shrink-0"
                  style={{ width: "52px" }}
                >
                  <div className="relative flex items-center justify-center">
                    {story.isLive ? (
                      <div
                        className="absolute -inset-1 rounded-full animate-pulse"
                        style={{
                          background: "linear-gradient(45deg, #EF4444 0%, #FF9800 100%)",
                          padding: "2px",
                        }}
                      />
                    ) : !story.isViewed && hasStory ? (
                      <div
                        className="absolute -inset-1 rounded-full transition-transform group-hover:scale-105"
                        style={{
                          background: "linear-gradient(45deg, #FF9800 0%, #E11D48 50%, #FFC247 100%)",
                          padding: "2px",
                          boxShadow: "0 0 8px rgba(255, 152, 0, 0.4)",
                        }}
                      />
                    ) : hasStory ? (
                      <div
                        className="absolute -inset-1 rounded-full"
                        style={{
                          background: "rgba(255, 255, 255, 0.2)",
                          padding: "1.5px",
                        }}
                      />
                    ) : null}

                    <div className="relative rounded-full bg-[#08090C] p-[2px]">
                      <img
                        src={story.avatar}
                        alt={story.userName}
                        className="h-10 w-10 rounded-full object-cover transition-transform group-active:scale-95"
                      />
                    </div>

                    {isUser && !hasStory && (
                      <div className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#08090C] bg-[#FF9800] text-[#08090C] shadow-sm">
                        <Plus className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}

                    {story.isLive && (
                      <span className="absolute -bottom-1 rounded-full bg-[#EF4444] px-1 py-0.1 text-[7px] font-black uppercase text-white border border-[#08090C]">
                        LIVE
                      </span>
                    )}
                  </div>

                  <span className="w-full text-center text-[9.5px] font-semibold text-[#E2E8F0] truncate group-hover:text-[#FF9800] transition-colors">
                    {isUser ? "You" : story.userName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleOpenStory(1)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FFC247] to-[#FF9800] py-2 text-xs font-black text-black shadow-md shadow-[#FF9800]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              Watch Stories
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false);
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-[#FF9800]" />
              Add Story
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Instagram-Style Story Viewer Modal */}
      {activeStory && activeSegment && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 select-none"
          onClick={() => setIsPaused((p) => !p)}
        >
          {reactionToast && (
            <div className="absolute top-20 z-50 rounded-full border border-[#FF9800]/40 bg-[#101219]/90 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md animate-bounce">
              {reactionToast}
            </div>
          )}

          <div
            className="relative flex h-full max-h-[840px] w-full max-w-[420px] flex-col justify-between overflow-hidden rounded-2xl bg-[#08090C] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeSegment.mediaUrl}
              alt="Story"
              className="absolute inset-0 h-full w-full object-cover transition-all duration-300"
            />

            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

            <div className="relative z-20 flex flex-col gap-2 p-3.5">
              <div className="flex w-full items-center gap-1.5">
                {activeStory.segments.map((seg, sIdx) => {
                  let barFill = 0;
                  if (sIdx < activeSegmentIndex) barFill = 100;
                  else if (sIdx === activeSegmentIndex) barFill = progress;

                  return (
                    <div
                      key={seg.id}
                      className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-[#FFC247] to-[#FF9800] transition-all"
                        style={{
                          width: `${barFill}%`,
                          transitionDuration: sIdx === activeSegmentIndex ? "50ms" : "0ms",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.avatar}
                    alt={activeStory.userName}
                    className="h-8 w-8 rounded-full border border-white/40 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">
                        {activeStory.userName}
                      </span>
                      {activeStory.verified && (
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF9800] text-[9px] font-black text-black">
                          ✓
                        </span>
                      )}
                      <span className="text-[10px] text-white/60">
                        {activeSegment.timestamp}
                      </span>
                    </div>
                    <span className="text-[9.5px] font-semibold text-[#FF9800]">
                      {activeStory.userCraft}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-white">
                  <button
                    type="button"
                    onClick={() => setIsPaused((p) => !p)}
                    className="p-1 hover:text-[#FF9800] transition-colors"
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseViewer}
                    className="p-1 hover:text-[#FF9800] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-1 items-center justify-between px-2">
              <button
                type="button"
                onClick={handlePrevSegment}
                className="flex h-full w-1/3 items-center justify-start opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                  <ChevronLeft className="h-5 w-5" />
                </div>
              </button>
              <button
                type="button"
                onClick={handleNextSegment}
                className="flex h-full w-1/3 items-center justify-end opacity-0 hover:opacity-100 transition-opacity"
              >
                <div className="rounded-full bg-black/40 p-2 text-white backdrop-blur-sm">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            </div>

            <div className="relative z-20 flex flex-col gap-3 p-4">
              <div className="space-y-1">
                {activeSegment.tag && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#FF9800]/40 bg-[#FF9800]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#FF9800] backdrop-blur-md">
                    <Sparkles className="h-3 w-3" />
                    {activeSegment.tag}
                  </span>
                )}
                <p className="text-sm font-medium leading-relaxed text-white drop-shadow-md">
                  {activeSegment.caption}
                </p>
              </div>

              <div className="flex items-center justify-between gap-1.5 py-1">
                {["❤️", "🔥", "🎬", "👏"].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleReaction(emoji)}
                    className="flex h-9 flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-base backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendReply} className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Send reply to ${activeStory.userName}...`}
                  className="flex-1 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs text-white placeholder-white/50 backdrop-blur-md focus:border-[#FF9800] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF9800] text-black disabled:opacity-40 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0e121b] p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-[#FF9800]" />
                <h3 className="text-sm font-black text-white">Create CineStory</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1.5">
                  Select Visual Preset:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MEDIA_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedMediaPreset(idx)}
                      className={`relative flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-all ${
                        selectedMediaPreset === idx
                          ? "border-[#FF9800] bg-[#FF9800]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="h-14 w-full rounded-lg object-cover"
                      />
                      <span className="text-[10px] font-bold text-white truncate w-full text-center">
                        {preset.label}
                      </span>
                      {selectedMediaPreset === idx && (
                        <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF9800] text-black">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1.5">
                  Production Tag:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["BTS On Set", "Audition Tape", "Table Read", "Look Test", "Director Callback"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                          selectedTag === tag
                            ? "bg-[#FF9800] text-black"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white/70 block mb-1">
                  Story Caption:
                </label>
                <textarea
                  rows={2}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="What's happening on set today? 🎬"
                  className="w-full rounded-xl border border-white/15 bg-black/40 p-2.5 text-xs text-white placeholder-white/40 focus:border-[#FF9800] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-white/15 py-2 text-xs font-bold text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateStory}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#FFC247] to-[#FF9800] py-2 text-xs font-black text-black shadow-lg shadow-[#FF9800]/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Share to Story 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
