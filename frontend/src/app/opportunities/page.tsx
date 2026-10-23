"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import AuditionModal from "@/components/AuditionModal";
import { OPEN_CASTINGS, CastingCall, ApplicationPipelineItem, MY_APPLICATIONS } from "@/lib/mockData";
import { UserProfile, CompletenessData } from "@/lib/api";
import {
  Clapperboard,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [activeAudition, setActiveAudition] = useState<CastingCall | null>(null);
  const [selectedCraft, setSelectedCraft] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredCastings = OPEN_CASTINGS.filter((casting) => {
    if (selectedCraft !== "all" && casting.craft.toLowerCase() !== selectedCraft.toLowerCase() && casting.projectType.toLowerCase() !== selectedCraft.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        casting.title.toLowerCase().includes(q) ||
        casting.productionHouse.toLowerCase().includes(q) ||
        (casting.director ? casting.director.toLowerCase().includes(q) : false) ||
        casting.characterDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAuditionSubmitted = (castingId: string, roleName: string, productionHouse: string) => {
    const newItem: ApplicationPipelineItem = {
      id: "app-" + Date.now(),
      projectTitle: roleName,
      roleTitle: roleName,
      productionHouse,
      appliedDate: "Just now",
      stage: "Applied",
      progressPercent: 25,
      nextStepNote: "Application submitted. Casting team reviewing self-tape.",
    };
    setPipelineItems([newItem, ...pipelineItems]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex" }}>
      {/* Curved Navigation Arc (Left) */}
      <CurvedWheelNav currentActivePath="/opportunities" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="opportunities"
          onSelectView={(view) => {
            if (view === "landing") window.location.href = "/";
            else if (view === "home") window.location.href = "/home";
            else if (view === "profile") window.location.href = "/profile";
          }}
          userData={mockUser}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => { window.location.href = "/portfolio"; }}
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
                  <Sparkles size={11} /> Verified Casting Calls
                </span>
                <span style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>Updated 14 mins ago</span>
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                Production Opportunities
              </h1>
              <p style={{ color: "#9E9E9E", fontSize: "0.88rem", maxWidth: "560px", marginTop: "4px" }}>
                Browse verified feature film, OTT thriller, and commercial casting calls matched to your physical attributes and craft.
              </p>
            </div>

            <div style={{ display: "flex", gap: "14px" }}>
              <div style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center" }}>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFA500", display: "block" }}>4</span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Open Castings</span>
              </div>
              <div style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center" }}>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFA500", display: "block" }}>98%</span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Highest AI Match</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <Search size={17} color="#9E9E9E" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search by role, director, or production house..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  background: "#1A1C23",
                  border: "1px solid #2E3340",
                  borderRadius: "12px",
                  padding: "10px 14px 10px 40px",
                  color: "#FFFFFF",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
              {[
                { id: "all", label: "All Crafts" },
                { id: "lead", label: "🎭 Lead Roles" },
                { id: "supporting", label: "🎬 Supporting" },
                { id: "voice", label: "🎙️ Voice Over" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedCraft(f.id)}
                  style={{
                    background: selectedCraft === f.id ? "rgba(255, 165, 0, 0.18)" : "#1A1C23",
                    color: selectedCraft === f.id ? "#FFA500" : "#9E9E9E",
                    border: selectedCraft === f.id ? "1px solid #FFA500" : "1px solid #2E3340",
                    padding: "8px 14px",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Castings Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {filteredCastings.map((casting) => (
              <div
                key={casting.id}
                style={{
                  background: "#1A1C23",
                  border: "1px solid #2E3340",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <span
                      style={{
                        background: "rgba(255, 165, 0, 0.18)",
                        color: "#FFA500",
                        border: "1px solid rgba(255, 165, 0, 0.38)",
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                      }}
                    >
                      {casting.matchScore}% Match
                    </span>
                    <span style={{ fontSize: "0.74rem", color: "#9E9E9E", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} /> Apply by {casting.deadline}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
                    {casting.title}
                  </h3>
                  <span style={{ fontSize: "0.82rem", color: "#FFA500", fontWeight: 600, display: "block", marginBottom: "10px" }}>
                    {casting.craft} • {casting.productionHouse}
                  </span>

                  <p style={{ fontSize: "0.84rem", color: "#FFFFFF", lineHeight: 1.5, marginBottom: "14px" }}>
                    {casting.characterDescription}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                    <span style={{ background: "#0D0E12", border: "1px solid #2E3340", padding: "3px 8px", borderRadius: "6px", fontSize: "0.72rem", color: "#9E9E9E" }}>
                      Shoot: {casting.shootDates}
                    </span>
                    <span style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "3px 8px", borderRadius: "6px", fontSize: "0.72rem", color: "#34d399", fontWeight: 600 }}>
                      {casting.payRange}
                    </span>
                    <span style={{ background: "#0D0E12", border: "1px solid #2E3340", padding: "3px 8px", borderRadius: "6px", fontSize: "0.72rem", color: "#9E9E9E", display: "flex", alignItems: "center", gap: "3px" }}>
                      <MapPin size={11} /> {casting.location}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => setActiveAudition(casting)}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                      color: "#0D0E12",
                      border: "none",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      fontWeight: 800,
                      fontSize: "0.82rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 14px rgba(255, 165, 0, 0.3)",
                    }}
                  >
                    <span>Apply with Self-Tape</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <AuditionModal
        casting={activeAudition}
        onClose={() => setActiveAudition(null)}
        onSubmitSuccess={handleAuditionSubmitted}
      />
    </div>
  );
}
