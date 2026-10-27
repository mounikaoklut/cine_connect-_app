"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import AuditionModal from "@/components/AuditionModal";
import ShowreelModal from "@/components/ShowreelModal";
import PitchModal from "@/components/PitchModal";
import CreatePostModal from "@/components/CreatePostModal";
import { CastingCall, TalentItem, PitchDeck, FeedPost, ApplicationPipelineItem, HOME_FEED_POSTS, MY_APPLICATIONS } from "@/lib/mockData";
import { UserProfile, CompletenessData } from "@/lib/api";
import CurvedWheelNav from "@/components/CurvedWheelNav";

export default function DedicatedHomePage() {
  const [activeAudition, setActiveAudition] = useState<CastingCall | null>(null);
  const [activeShowreel, setActiveShowreel] = useState<TalentItem | null>(null);
  const [activePitch, setActivePitch] = useState<PitchDeck | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(HOME_FEED_POSTS);
  const [pipelineItems, setPipelineItems] = useState<ApplicationPipelineItem[]>(MY_APPLICATIONS);

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

  const handleToggleLikePost = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const handlePostCreated = (post: FeedPost) => {
    setFeedPosts([post, ...feedPosts]);
  };

  const handleAuditionSubmitted = (castingId: string, roleName: string, productionHouse: string) => {
    const newPipelineItem: ApplicationPipelineItem = {
      id: "app-" + Date.now(),
      projectTitle: roleName,
      roleTitle: roleName,
      productionHouse,
      appliedDate: "Just now",
      stage: "Applied",
      progressPercent: 25,
      nextStepNote: "Application received by casting team. Video self-tape under review.",
    };
    setPipelineItems([newPipelineItem, ...pipelineItems]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex" }}>
      {/* 4. Curved Navigation Arc (Left): sleek curved arc in subtle amber-gold with exactly 6 items */}
      <CurvedWheelNav currentActivePath="/home" />

      {/* 5. Content Feed (Right) */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="home"
          onSelectView={(view) => {
            if (view === "landing") window.location.href = "/";
            else if (view === "profile") window.location.href = "/profile";
          }}
          userData={mockUser}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => { window.location.href = "/portfolio"; }}
        />

        <main style={{ flex: 1, minHeight: "calc(100vh - 72px)" }}>
          <HomePage
            onSwitchToLanding={() => { window.location.href = "/"; }}
            onSwitchToProfile={() => { window.location.href = "/profile"; }}
            onOpenAuditionModal={(c) => setActiveAudition(c)}
            onOpenShowreelModal={(t) => setActiveShowreel(t)}
            onOpenPitchModal={(p) => setActivePitch(p)}
            onOpenCreatePost={() => setShowCreatePost(true)}
            feedPosts={feedPosts}
            onToggleLikePost={handleToggleLikePost}
            pipelineItems={pipelineItems}
          />
        </main>
      </div>

      <AuditionModal
        casting={activeAudition}
        onClose={() => setActiveAudition(null)}
        onSubmitSuccess={handleAuditionSubmitted}
      />

      <ShowreelModal
        talent={activeShowreel}
        onClose={() => setActiveShowreel(null)}
      />

      <PitchModal
        pitch={activePitch}
        onClose={() => setActivePitch(null)}
      />

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
          userName="Kabir Mehra"
          userCraft="Actor"
        />
      )}
    </div>
  );
}
