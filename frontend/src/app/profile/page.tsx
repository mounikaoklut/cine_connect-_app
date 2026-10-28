"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import ProfilePortal from "@/components/ProfilePortal";
import { UserProfile, CompletenessData } from "@/lib/api";

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserProfile>({
    id: "d3b07384-d113-4a44-9c81-c30089f23d88",
    email: "kabir.mehra@cineconnect.com",
    phone: "+91 98200 12345",
    auth_provider: "email",
    email_verified: true,
    phone_verified: true,
    identity_verified: true,
    profile: {
      name: "Kabir Mehra",
      bio: "Method actor and theater artist with 8+ years across independent cinema, OTT thrillers, and commercial campaigns. Trained at the National School of Drama.",
      photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
      primary_craft: "Actor",
      secondary_crafts: ["Voice Over Artist", "Action / Stunts"],
      city: "Mumbai",
      state: "Maharashtra",
      travel_radius_km: 500,
      completeness_score: 85,
      languages: [
        { lang: "Hindi", fluency: "Native" },
        { lang: "English", fluency: "Fluent" },
        { lang: "Urdu", fluency: "Professional" },
        { lang: "Punjabi", fluency: "Conversational" },
      ],
      availability: {
        status: "Available for Shoots",
        note: "Available for feature films and web-series starting November 2026",
      },
    },
    skills: [
      { skill_id: 1, skill_name: "Method Acting", category: "Performance", proficiency: "Expert" },
      { skill_id: 2, skill_name: "Stage Combat", category: "Action", proficiency: "Advanced" },
      { skill_id: 3, skill_name: "Dialect Modulation", category: "Voice", proficiency: "Expert" },
      { skill_id: 4, skill_name: "Horseback Riding", category: "Skills", proficiency: "Intermediate" },
      { skill_id: 5, skill_name: "Urdu Diction & Poetry", category: "Voice", proficiency: "Expert" },
    ],
    experiences: [
      {
        id: "exp-1",
        title: "Inspector Vikram Rathore (Lead)",
        company: "Mumbai Shadows (8 Episodes) / Netflix",
        role_type: "Series",
        start_date: "2024-03-01",
        end_date: "2025-01-15",
        description: "Played the protagonist in a gritty noir series following a homicide investigation across South Mumbai.",
      },
      {
        id: "exp-2",
        title: "Aman Kapoor (Supporting Lead)",
        company: "The Autumn Chronicle / Excel Entertainment",
        role_type: "Feature",
        start_date: "2023-05-10",
        end_date: "2024-02-20",
        description: "Emotional drama screened at MAMI and Berlin International Film Festival.",
      },
      {
        id: "exp-3",
        title: "Devdutt (Theater Lead)",
        company: "Hayavadana / Girish Karnad Foundation",
        role_type: "Theater",
        start_date: "2022-01-10",
        end_date: "2023-04-15",
        description: "Classical Indian contemporary theater performed across 18 cities.",
      },
    ],
    portfolio: [
      {
        id: "port-1",
        type: "showreel",
        title: "Dramatic Reel 2025 (4K)",
        s3_url: "https://assets.mixkit.co/videos/preview/mixkit-dramatic-close-up-of-an-actor-speaking-41221-large.mp4",
        description: "Intense monologue and action sequences captured on Arri Alexa 35.",
        is_public: true,
        sort_order: 1,
      },
    ],
  });

  const completeness: CompletenessData = {
    score: 85,
    max_score: 100,
    suggestions: ["Upload updated passport scan for international festival travel"],
  };

  const handleUpdateProfile = (updated: { name: string; bio: string; primary_craft: string; city: string }) => {
    setUserData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: updated.name,
        bio: updated.bio,
        primary_craft: updated.primary_craft,
        city: updated.city,
      },
    }));
  };

  const handleDeletePortfolio = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((p) => p.id !== id),
    }));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex" }}>
      {/* Curved Navigation Arc (Left) */}
      <CurvedWheelNav currentActivePath="/profile" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="profile"
          onSelectView={(view) => {
            if (view === "landing") window.location.href = "/";
            else if (view === "home") window.location.href = "/home";
          }}
          userData={userData}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => { window.location.href = "/portfolio"; }}
        />

        <main style={{ flex: 1, padding: "28px 24px 80px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          <ProfilePortal
            userData={userData}
            completeness={completeness}
            onUpdateProfile={handleUpdateProfile}
            onAddPortfolio={() => { window.location.href = "/portfolio"; }}
            onDeletePortfolio={handleDeletePortfolio}
            onOpenUploadModal={() => { window.location.href = "/portfolio"; }}
          />
        </main>
      </div>
    </div>
  );
}
