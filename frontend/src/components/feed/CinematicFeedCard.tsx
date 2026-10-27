"use client";

import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  CheckCircle2,
  ArrowUpRight,
  Film,
  Check,
} from "lucide-react";
import { FeedPost } from "@/lib/mockData";

export interface CinematicFeedCardProps {
  post: FeedPost;
  onLikeToggle?: (id: string) => void;
  onActionPress?: (post: FeedPost) => void;
  onCommentPress?: (post: FeedPost) => void;
  onSharePress?: (post: FeedPost) => void;
}

export default function CinematicFeedCard({
  post,
  onLikeToggle,
  onActionPress,
  onCommentPress,
  onSharePress,
}: CinematicFeedCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const studioSubtitle = post.author.company
    ? `${post.author.company} • ${post.timestamp}`
    : `${post.author.craft} • ${post.timestamp}`;

  return (
    <article className="rounded-2xl border border-[#1E222D] bg-[#101219] p-4 text-[#F5F5F5] shadow-lg transition-all duration-200 hover:border-[#2D3342]">
      {/* Creator Header */}
      <header className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[#262A36]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.author.avatar}
              alt={post.author.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#F5F5F5] tracking-tight text-sm">
                {post.author.name}
              </span>
              {post.author.verified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-[#FF9800]" />
              )}
            </div>
            <p className="text-xs text-[#858995]">{studioSubtitle}</p>
          </div>
        </div>

        {/* Instagram-style Follow / Following Button */}
        <button
          type="button"
          onClick={() => setIsFollowing(!isFollowing)}
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
            transition: "all 0.18s ease",
            boxShadow: isFollowing ? "none" : "0 2px 6px rgba(255, 152, 0, 0.3)",
          }}
        >
          {isFollowing ? (
            <>
              <Check className="h-3 w-3 stroke-[2.8]" />
              <span>Following</span>
            </>
          ) : (
            <span>Follow</span>
          )}
        </button>
      </header>

      {/* Post Content */}
      <div className="mb-3 space-y-1.5">
        <p className="text-xs leading-relaxed text-[#D1D5DB]">
          {post.content}
        </p>
      </div>

      {/* Cinematic Media Thumbnail */}
      {post.mediaUrl && (
        <div className="relative mb-3.5 h-44 w-full overflow-hidden rounded-xl border border-[#1E222D] bg-[#08090C]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.mediaUrl}
            alt={post.content.slice(0, 40)}
            className="h-full w-full object-cover"
          />
          {post.tags?.[1] && (
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 rounded-full border border-[#FFC247]/30 bg-[#08090C]/85 px-2.5 py-1 text-[11px] font-bold text-[#FFC247] backdrop-blur-sm">
              <Film className="h-3 w-3 text-[#FFC247]" />
              <span>{post.tags[1]}</span>
            </div>
          )}
        </div>
      )}

      {/* Post Actions: Muted Gray Icons + Amber-Orange Pill Button */}
      <footer className="flex items-center justify-between border-t border-[#171A23] pt-2.5">
        <div className="flex items-center gap-4 text-[#858995]">
          <button
            type="button"
            onClick={() => onLikeToggle?.(post.id)}
            className={`flex items-center gap-1.5 text-xs transition-colors hover:text-[#FF9800] ${
              post.isLiked ? "font-bold text-[#FF9800]" : "text-[#858995]"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${post.isLiked ? "fill-[#FF9800] text-[#FF9800]" : ""}`}
            />
            <span>{post.likes}</span>
          </button>

          <button
            type="button"
            onClick={() => onCommentPress?.(post)}
            className="flex items-center gap-1.5 text-xs transition-colors hover:text-[#F5F5F5]"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{post.commentsCount}</span>
          </button>

          <button
            type="button"
            onClick={() => onSharePress?.(post)}
            className="transition-colors hover:text-[#F5F5F5]"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {post.actionButton && (
          <button
            type="button"
            onClick={() => onActionPress?.(post)}
            className="flex items-center gap-1 rounded-full bg-[#FF9800] px-3.5 py-1.5 text-xs font-extrabold text-[#08090C] shadow-md shadow-[#FF9800]/25 transition-transform hover:scale-105 active:scale-95"
          >
            <span>{post.actionButton.label}</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        )}
      </footer>
    </article>
  );
}
