"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import AuditionModal from "@/components/AuditionModal";
import ShowreelModal from "@/components/ShowreelModal";
import PitchModal from "@/components/PitchModal";
import {
  OPEN_CASTINGS,
  FEATURED_TALENT,
  PITCH_DECKS,
  CINE_REELS,
  CastingCall,
  TalentItem,
  PitchDeck,
} from "@/lib/mockData";
import { UserProfile, CompletenessData } from "@/lib/api";
import {
  Search,
  Clapperboard,
  UserRound,
  FileText,
  Film,
  Sparkles,
  MapPin,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "talent" | "castings" | "reels" | "pitches">("all");
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

  const q = query.toLowerCase().trim();

  // Filtered Talent
  const filteredTalent = FEATURED_TALENT.filter(
    (t) =>
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.craft.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.bio.toLowerCase().includes(q)
  );

  // Filtered Castings
  const filteredCastings = OPEN_CASTINGS.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.productionHouse.toLowerCase().includes(q) ||
      c.craft.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q)
  );

  // Filtered Reels
  const filteredReels = CINE_REELS.filter(
    (r) =>
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.creator.name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
  );

  // Filtered Pitches
  const filteredPitches = PITCH_DECKS.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.writer.toLowerCase().includes(q) ||
      p.logline.toLowerCase().includes(q)
  );

  const totalResults =
    (activeCategory === "all" || activeCategory === "talent" ? filteredTalent.length : 0) +
    (activeCategory === "all" || activeCategory === "castings" ? filteredCastings.length : 0) +
    (activeCategory === "all" || activeCategory === "reels" ? filteredReels.length : 0) +
    (activeCategory === "all" || activeCategory === "pitches" ? filteredPitches.length : 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex", flexDirection: "column" }}>
      {/* Top Navigation Bar with Curved Semi-Circle Rotation Wheel */}
      <Navigation
        currentView="search"
        onSelectView={(view) => {
          if (view === "landing") window.location.href = "/";
          else if (view === "home") window.location.href = "/home";
          else if (view === "profile") window.location.href = "/profile";
          else window.location.href = `/${view}`;
        }}
        userData={mockUser}
        completeness={completeness}
        onOpenAuthModal={() => {}}
        onOpenUploadModal={() => {
          window.location.href = "/portfolio";
        }}
      />

      {/* Main Search View */}
      <main style={{ flex: 1, padding: "28px 20px 140px", maxWidth: "1240px", margin: "0 auto", width: "100%" }}>
        {/* Search Header Hero */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 14px",
              borderRadius: "9999px",
              background: "rgba(255, 152, 0, 0.12)",
              border: "1px solid rgba(255, 152, 0, 0.3)",
              color: "#FF9800",
              fontSize: "0.8rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            <Sparkles size={14} /> Universal Cinema Search
          </div>
          <h1
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            Find Talent, Roles, Reels & Screenplays
          </h1>
          <p style={{ color: "#9E9E9E", fontSize: "1rem", maxWidth: "600px", margin: "0 auto" }}>
            Search verified actors, cinematographers, open auditions, high-definition showreels, and encrypted screenplay pitches.
          </p>

          {/* Search Input Bar */}
          <div
            style={{
              position: "relative",
              maxWidth: "680px",
              margin: "24px auto 0",
            }}
          >
            <Search
              size={20}
              color="#FF9800"
              style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, craft, dialect, city, or keywords..."
              style={{
                width: "100%",
                padding: "16px 48px 16px 52px",
                borderRadius: "16px",
                background: "#181A22",
                border: "2px solid rgba(255, 152, 0, 0.45)",
                color: "#FFFFFF",
                fontSize: "1.05rem",
                outline: "none",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 152, 0, 0.2)",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: "#9E9E9E",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {[
              { id: "all" as const, label: "All Results", icon: <SlidersHorizontal size={14} /> },
              { id: "talent" as const, label: `Talent (${filteredTalent.length})`, icon: <UserRound size={14} /> },
              { id: "castings" as const, label: `Auditions (${filteredCastings.length})`, icon: <Clapperboard size={14} /> },
              { id: "reels" as const, label: `Reels (${filteredReels.length})`, icon: <Film size={14} /> },
              { id: "pitches" as const, label: `Pitches (${filteredPitches.length})`, icon: <FileText size={14} /> },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  background: activeCategory === cat.id ? "#FF9800" : "rgba(255, 255, 255, 0.05)",
                  color: activeCategory === cat.id ? "#0D0E12" : "#CBD5E1",
                  border: activeCategory === cat.id ? "1px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.12)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ marginBottom: "20px", color: "#9E9E9E", fontSize: "0.9rem" }}>
          Showing <strong style={{ color: "#FF9800" }}>{totalResults}</strong> matches
          {query && <> for &quot;{query}&quot;</>}
        </div>

        {/* ==================== 1. TALENT RESULTS ==================== */}
        {(activeCategory === "all" || activeCategory === "talent") && filteredTalent.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <UserRound size={18} color="#FF9800" /> Featured Talent & Artists
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {filteredTalent.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveShowreel(t)}
                  style={{
                    background: "#181A22",
                    border: "1px solid #2E3340",
                    borderRadius: "16px",
                    padding: "18px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img
                      src={t.avatar}
                      alt={t.name}
                      style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid #FF9800" }}
                    />
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF" }}>{t.name}</h3>
                      <span style={{ fontSize: "0.82rem", color: "#FF9800", fontWeight: 700 }}>{t.craft}</span>
                      <span style={{ display: "block", fontSize: "0.75rem", color: "#9E9E9E" }}>
                        <MapPin size={11} style={{ display: "inline" }} /> {t.city}, {t.country}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#CBD5E1", margin: 0, lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {t.bio}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>{t.experienceYears} yrs experience</span>
                    <span style={{ fontSize: "0.8rem", color: "#FF9800", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                      View Reel <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 2. OPEN CASTINGS RESULTS ==================== */}
        {(activeCategory === "all" || activeCategory === "castings") && filteredCastings.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clapperboard size={18} color="#FF9800" /> Open Casting Calls & Roles
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {filteredCastings.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setActiveAudition(c)}
                  style={{
                    background: "#181A22",
                    border: "1px solid #2E3340",
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: "#FF9800" }}>
                        {c.projectType} • {c.craft}
                      </span>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
                        {c.title}
                      </h3>
                      <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>{c.productionHouse}</span>
                    </div>
                    {c.isUrgent && (
                      <span style={{ background: "#EF4444", color: "#FFF", padding: "2px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>
                        URGENT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.82rem", color: "#CBD5E1", margin: 0, lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {c.characterDescription}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem" }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>{c.payRange}</span>
                    <span style={{ color: "#FF9800", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                      Audition Details <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 3. REELS RESULTS ==================== */}
        {(activeCategory === "all" || activeCategory === "reels") && filteredReels.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Film size={18} color="#FF9800" /> Trending Cinema Reels
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
              {filteredReels.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "#181A22",
                    border: "1px solid #2E3340",
                    borderRadius: "16px",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "280px" }}>
                    <video
                      src={r.videoUrl}
                      poster={r.thumbnailUrl}
                      controls
                      playsInline
                      preload="metadata"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "14px" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
                      {r.title}
                    </h3>
                    <span style={{ fontSize: "0.78rem", color: "#FF9800", fontWeight: 700 }}>
                      {r.creator.name} • {r.creator.craft}
                    </span>
                    <p style={{ fontSize: "0.75rem", color: "#9E9E9E", margin: "6px 0 0", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {r.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ==================== 4. PITCH DECKS RESULTS ==================== */}
        {(activeCategory === "all" || activeCategory === "pitches") && filteredPitches.length > 0 && (
          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} color="#FF9800" /> Screenplay & Pitch Decks
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
              {filteredPitches.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setActivePitch(p)}
                  style={{
                    background: "#181A22",
                    border: "1px solid #2E3340",
                    borderRadius: "16px",
                    padding: "20px",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 800, color: "#FF9800" }}>
                    {p.format} • {p.status}
                  </span>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", margin: "4px 0" }}>
                    {p.title}
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>By {p.writer}</span>
                  <p style={{ fontSize: "0.82rem", color: "#CBD5E1", margin: "10px 0", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    &quot;{p.logline}&quot;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.78rem" }}>
                    <span style={{ color: "#9E9E9E" }}>Budget: {p.estimatedBudget}</span>
                    <span style={{ color: "#FF9800", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                      Review Deck <ArrowUpRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      {activeAudition && <AuditionModal casting={activeAudition} onClose={() => setActiveAudition(null)} />}
      {activeShowreel && <ShowreelModal talent={activeShowreel} onClose={() => setActiveShowreel(null)} />}
      {activePitch && <PitchModal pitch={activePitch} onClose={() => setActivePitch(null)} />}

      {/* Bottom Curved Semi-Circle Rotation Wheel Navigation Bar */}
      <CurvedWheelNav currentActivePath="/search" />
    </div>
  );
}
