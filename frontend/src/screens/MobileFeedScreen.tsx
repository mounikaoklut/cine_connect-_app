"use client";

import React, { useState } from "react";
import { Search, Bell, Film, MessageSquare } from "lucide-react";
import CinematicFeedCard from "@/components/feed/CinematicFeedCard";
import CurvedDualWheelNav, { RouteKey } from "@/components/navigation/CurvedDualWheelNav";
import { HOME_FEED_POSTS, FeedPost } from "@/lib/mockData";

export interface MobileFeedScreenProps {
  activeRoute?: RouteKey;
  onRouteChange?: (route: RouteKey) => void;
  showNavDock?: boolean;
}

const CATEGORY_CHIPS = [
  "All Studio Feeds",
  "Exclusive Pitches",
  "Priority Castings",
  "Post-Production",
  "Wrap Milestones",
];

export default function MobileFeedScreen({
  activeRoute = "Home",
  onRouteChange = () => {},
  showNavDock = true,
}: MobileFeedScreenProps) {
  const [posts, setPosts] = useState<FeedPost[]>(HOME_FEED_POSTS);
  const [selectedChip, setSelectedChip] = useState("All Studio Feeds");

  const handleLikeToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedChip === "Exclusive Pitches") return post.type === "pitch";
    if (selectedChip === "Priority Castings") return post.type === "casting";
    if (selectedChip === "Post-Production") return post.type === "showreel" || post.type === "announcement";
    if (selectedChip === "Wrap Milestones") return post.type === "bts";
    return true;
  });

  return (
    <div className="relative min-h-screen bg-[#08090C] text-[#F5F5F5] font-sans antialiased pb-44">
      {/* Studio Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#101219] bg-[#08090C]/95 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#FF9800]/30 bg-[#FF9800]/10 text-[#FF9800]">
            <Film className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wide text-[#F5F5F5]">
              CINE<span className="text-[#FF9800]">CONNECT</span>
            </h1>
            <p className="text-[10px] font-semibold text-[#858995]">
              Industry Creative Feed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => onRouteChange("Notifications")}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#1E222D] bg-[#101219] text-[#858995] transition-colors hover:text-[#F5F5F5]"
            aria-label="Studio notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-[#FF9800]" />
          </button>

          {/* Messages Button */}
          <button
            type="button"
            onClick={() => onRouteChange("Messages")}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#1E222D] bg-[#101219] text-[#858995] transition-colors hover:text-[#F5F5F5]"
            aria-label="Messages"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Feed Content Area */}
      <main className="mx-auto max-w-md px-3.5 pt-3">
        {/* Feed Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <CinematicFeedCard
              key={post.id}
              post={post}
              onLikeToggle={handleLikeToggle}
              onActionPress={() => {
                alert(`Action triggered for post ID: ${post.id}`);
              }}
            />
          ))}
        </div>
      </main>

      {/* Fixed Rotary Bottom Navigation Wheel */}
      {showNavDock && (
        <CurvedDualWheelNav
          activeRoute={activeRoute}
          onRouteSelect={onRouteChange}
        />
      )}
    </div>
  );
}
