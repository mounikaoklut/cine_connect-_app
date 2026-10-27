"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import ShowreelModal from "@/components/ShowreelModal";
import { FEATURED_TALENT, TalentItem } from "@/lib/mockData";
import { UserProfile, CompletenessData } from "@/lib/api";
import {
  FolderHeart,
  Video,
  Image as ImageIcon,
  Mic,
  Play,
  Upload,
  Shield,
  Sparkles,
  ExternalLink,
  Eye,
  Camera,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function PortfolioPage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "reels" | "headshots" | "voice">("all");
  const [activeShowreel, setActiveShowreel] = useState<TalentItem | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const mediaItems = [
    {
      id: "media-1",
      type: "reels",
      title: "Dramatic Lead Monologue 2025 (4K Alexa 35)",
      format: "2.39:1 Anamorphic",
      duration: "2m 14s",
      camera: "ARRI Alexa 35 • Cooke Anamorphic /i 40mm",
      thumbnail: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&auto=format&fit=crop&q=80",
      description: "Intense emotional scene from crime thriller series. Directed by Vikramaditya Motwane.",
      views: 1420,
    },
    {
      id: "media-2",
      type: "reels",
      title: "Action & Hand-to-Hand Combat Reel",
      format: "16:9 4K 120fps",
      duration: "1m 45s",
      camera: "RED V-Raptor 8K VV",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
      description: "Stunt choreography, weapon handling, and tactical room-clearing sequences.",
      views: 980,
    },
    {
      id: "media-3",
      type: "headshots",
      title: "Theatrical Headshot — Gritty Noir",
      format: "RAW / 50MP",
      duration: "High-Res Still",
      camera: "Hasselblad H6D-100c",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      description: "Key dramatic headshot approved for OTT casting calls and studio profiles.",
      views: 3120,
    },
    {
      id: "media-4",
      type: "headshots",
      title: "Commercial Headshot — Clean Casual",
      format: "RAW / 50MP",
      duration: "High-Res Still",
      camera: "Sony A1 • 85mm f/1.4 GM",
      thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      description: "Warm, relatable character look for brand campaigns and television commercials.",
      views: 1840,
    },
    {
      id: "media-5",
      type: "voice",
      title: "Voice Modulation & Dialect Reel (Hindi / Urdu / English)",
      format: "24-bit / 96kHz WAV",
      duration: "1m 10s",
      camera: "Neumann U87 Studio Mic",
      thumbnail: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop&q=80",
      description: "Voiceover range spanning gritty narrator, commercial energetic, and emotional character voices.",
      views: 740,
    },
  ];

  const filteredMedia = mediaItems.filter((m) => selectedFilter === "all" || m.type === selectedFilter);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex" }}>
      {/* Curved Navigation Arc (Left) */}
      <CurvedWheelNav currentActivePath="/portfolio" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="portfolio"
          onSelectView={(view) => {
            if (view === "landing") window.location.href = "/";
            else if (view === "home") window.location.href = "/home";
            else if (view === "profile") window.location.href = "/profile";
          }}
          userData={mockUser}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => {}}
        />

        <main style={{ flex: 1, padding: "28px 24px 80px", maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #1A1C23 0%, #222530 100%)",
              border: "1px solid #2E3340",
              borderRadius: "16px",
              padding: "24px 28px",
              marginBottom: "28px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(255, 165, 0, 0.18)",
                    color: "#FFA500",
                    border: "1px solid rgba(255, 165, 0, 0.38)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FolderHeart size={11} /> Verified Media Vault
                </span>
                <span style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Forensically Watermarked</span>
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                Portfolio & Showreel Vault
              </h1>
              <p style={{ color: "#9E9E9E", fontSize: "0.88rem", maxWidth: "560px", marginTop: "4px" }}>
                High-fidelity 4K showreels, dramatic monologue self-tapes, 50MP theatrical headshots, and voice samples.
              </p>
            </div>

            <button
              onClick={() => {
                setUploadSuccess(true);
                setTimeout(() => setUploadSuccess(false), 3000);
              }}
              style={{
                background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                color: "#0D0E12",
                border: "none",
                borderRadius: "10px",
                padding: "12px 20px",
                fontSize: "0.86rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 18px rgba(255, 165, 0, 0.35)",
              }}
            >
              <Upload size={16} />
              <span>Upload New Media</span>
            </button>
          </div>

          {uploadSuccess && (
            <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Media uploaded successfully and encoded with CineConnect forensic watermark!</span>
            </div>
          )}

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "24px", overflowX: "auto" }}>
            {[
              { id: "all" as const, label: "All Media", icon: Layers },
              { id: "reels" as const, label: "🎬 4K Showreels", icon: Video },
              { id: "headshots" as const, label: "📸 Headshots", icon: ImageIcon },
              { id: "voice" as const, label: "🎙️ Voice Samples", icon: Mic },
            ].map((f) => {
              const isSelected = selectedFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  style={{
                    background: isSelected ? "rgba(255, 165, 0, 0.18)" : "#1A1C23",
                    color: isSelected ? "#FFA500" : "#9E9E9E",
                    border: isSelected ? "1px solid #FFA500" : "1px solid #2E3340",
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>

          {/* Media Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "22px" }}>
            {filteredMedia.map((m) => (
              <div
                key={m.id}
                style={{
                  background: "#1A1C23",
                  border: "1px solid #2E3340",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Thumbnail / Video Preview */}
                <div style={{ position: "relative", width: "100%", height: "200px", background: "#0D0E12" }}>
                  <img src={m.thumbnail} alt={m.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(13, 14, 18, 0.9) 100%)" }} />

                  {/* Play Button Overlay */}
                  <div
                    onClick={() => setActiveShowreel(FEATURED_TALENT[0])}
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                        color: "#0D0E12",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 20px rgba(255, 165, 0, 0.45)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <Play size={22} fill="#0D0E12" style={{ marginLeft: "3px" }} />
                    </div>
                  </div>

                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      left: "12px",
                      background: "rgba(13, 14, 18, 0.85)",
                      color: "#FFA500",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      border: "1px solid rgba(255, 165, 0, 0.35)",
                    }}
                  >
                    {m.format}
                  </span>

                  <span
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      right: "12px",
                      background: "rgba(13, 14, 18, 0.85)",
                      color: "#FFFFFF",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      border: "1px solid #2E3340",
                    }}
                  >
                    {m.duration}
                  </span>
                </div>

                {/* Details */}
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", lineHeight: 1.3 }}>
                    {m.title}
                  </h3>
                  <span style={{ fontSize: "0.74rem", color: "#FFA500", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Camera size={13} /> {m.camera}
                  </span>
                  <p style={{ fontSize: "0.82rem", color: "#9E9E9E", lineHeight: 1.45 }}>
                    {m.description}
                  </p>

                  <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #2E3340", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "#9E9E9E", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Eye size={13} /> {m.views} casting views
                    </span>
                    <button
                      onClick={() => setActiveShowreel(FEATURED_TALENT[0])}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#FFA500",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Open in 2.39:1 Cinema Player →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <ShowreelModal talent={activeShowreel} onClose={() => setActiveShowreel(null)} />
    </div>
  );
}
