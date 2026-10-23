"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import LandingPage from "@/components/LandingPage";
import AuditionModal from "@/components/AuditionModal";
import ShowreelModal from "@/components/ShowreelModal";
import PitchModal from "@/components/PitchModal";
import { CastingCall, TalentItem, PitchDeck } from "@/lib/mockData";
import { UserProfile, CompletenessData } from "@/lib/api";

export default function DedicatedLandingPage() {
  const [activeAudition, setActiveAudition] = useState<CastingCall | null>(null);
  const [activeShowreel, setActiveShowreel] = useState<TalentItem | null>(null);
  const [activePitch, setActivePitch] = useState<PitchDeck | null>(null);

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
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navigation
        currentView="landing"
        onSelectView={(view) => {
          if (view === "home") window.location.href = "/home";
          else if (view === "profile") window.location.href = "/?view=profile";
        }}
        userData={mockUser}
        completeness={completeness}
        onOpenAuthModal={() => { window.location.href = "/?view=home"; }}
        onOpenUploadModal={() => { window.location.href = "/?view=profile"; }}
      />

      <LandingPage
        onEnterStudioHub={() => { window.location.href = "/home"; }}
        onOpenAuditionModal={(c) => setActiveAudition(c)}
        onOpenShowreelModal={(t) => setActiveShowreel(t)}
        onOpenPitchModal={(p) => setActivePitch(p)}
        onOpenAuthModal={() => { window.location.href = "/?view=home"; }}
      />

      <AuditionModal
        casting={activeAudition}
        onClose={() => setActiveAudition(null)}
        onSubmitSuccess={() => {}}
      />

      <ShowreelModal
        talent={activeShowreel}
        onClose={() => setActiveShowreel(null)}
      />

      <PitchModal
        pitch={activePitch}
        onClose={() => setActivePitch(null)}
      />
    </div>
  );
}
