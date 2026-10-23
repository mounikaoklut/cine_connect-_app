"use client";

import React, { useState } from "react";
import {
  Clapperboard,
  Sparkles,
  Play,
  Search,
  CheckCircle2,
  MapPin,
  Calendar,
  Lock,
  ArrowRight,
  ChevronRight,
  Award,
  Video,
  Camera,
  Layers,
  ShieldCheck,
  Zap,
  Film,
  Users,
  ChevronDown,
  Star,
  ExternalLink,
} from "lucide-react";
import {
  FEATURED_TALENT,
  OPEN_CASTINGS,
  PITCH_DECKS,
  TESTIMONIALS,
  FAQS,
  TalentItem,
  CastingCall,
  PitchDeck,
} from "@/lib/mockData";

interface LandingPageProps {
  onEnterStudioHub: () => void;
  onOpenAuditionModal: (casting: CastingCall) => void;
  onOpenShowreelModal: (talent: TalentItem) => void;
  onOpenPitchModal: (pitch: PitchDeck) => void;
  onOpenAuthModal: () => void;
}

export default function LandingPage({
  onEnterStudioHub,
  onOpenAuditionModal,
  onOpenShowreelModal,
  onOpenPitchModal,
  onOpenAuthModal,
}: LandingPageProps) {
  const [selectedCraftTab, setSelectedCraftTab] = useState<"actors" | "crew" | "directors" | "studios">("actors");
  const [talentFilter, setTalentFilter] = useState<string>("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const filteredTalent = talentFilter === "all"
    ? FEATURED_TALENT
    : FEATURED_TALENT.filter((t) => t.category === talentFilter);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* ===================== HERO SECTION ===================== */}
      <section
        style={{
          position: "relative",
          paddingTop: "60px",
          paddingBottom: "100px",
          overflow: "hidden",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Ambient Gradient Glows */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 80%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", marginBottom: "48px" }}>
            {/* Live Indicator Pill */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                padding: "6px 16px",
                borderRadius: "var(--radius-full)",
                marginBottom: "24px",
              }}
            >
              <span className="live-dot" />
              <span style={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--accent-gold)", textTransform: "uppercase" }}>
                Active Audition Season 2026 – 2027
              </span>
              <span style={{ color: "var(--border-subtle)" }}>|</span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                480+ Productions Live
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5.5vw, 4.4rem)",
                fontWeight: 800,
                lineHeight: 1.12,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.03em",
                marginBottom: "24px",
              }}
            >
              Where Cinematic Vision <br />
              <span className="text-gold-gradient">Meets World-Class Talent.</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1.05rem, 2vw, 1.25rem)",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "760px",
                margin: "0 auto 36px",
              }}
            >
              The premier digital ecosystem connecting actors, cinematographers, sound designers, writers, and directors with top-tier production houses, OTT networks, and independent producers.
            </p>

            {/* Call To Action Buttons */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "48px",
              }}
            >
              <button
                onClick={onEnterStudioHub}
                className="btn-primary glow-gold"
                style={{ fontSize: "1.05rem", padding: "14px 28px", borderRadius: "var(--radius-md)" }}
              >
                <Zap size={18} fill="#000" /> Enter Live Studio Hub & Feed
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById("castings-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-secondary"
                style={{ fontSize: "1.05rem", padding: "14px 28px", borderRadius: "var(--radius-md)" }}
              >
                <Clapperboard size={18} color="var(--accent-gold)" /> Explore Open Castings
              </button>

              <button
                onClick={onOpenAuthModal}
                className="btn-ghost"
                style={{ fontSize: "0.95rem", color: "var(--accent-neon-cyan)" }}
              >
                Join as Artist / Studio →
              </button>
            </div>

            {/* Metrics Counter Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                background: "rgba(15, 19, 28, 0.7)",
                backdropFilter: "blur(16px)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)",
                padding: "20px 24px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", display: "block", fontFamily: "var(--font-display)" }}>
                  15,400+
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Verified Film Artists
                </span>
              </div>
              <div>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-gold)", display: "block", fontFamily: "var(--font-display)" }}>
                  480+
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Feature & OTT Projects
                </span>
              </div>
              <div>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-neon-cyan)", display: "block", fontFamily: "var(--font-display)" }}>
                  ₹45 Cr+
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Production Budgets Cast
                </span>
              </div>
              <div>
                <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--accent-emerald)", display: "block", fontFamily: "var(--font-display)" }}>
                  98.4%
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Audition Response Rate
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Hero Showreel Showcase Banner */}
          <div
            className="glass-card hover-lift"
            style={{
              maxWidth: "1040px",
              margin: "0 auto",
              overflow: "hidden",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.8)",
            }}
          >
            <div
              style={{
                position: "relative",
                height: "440px",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80"
                alt="Cinema Showreel"
                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }}
              />

              {/* Cinematic Vignette */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(ellipse at center, transparent 30%, rgba(8, 10, 15, 0.85) 90%)",
                }}
              />

              {/* Floating Center Reel Trigger */}
              <div
                onClick={() => onOpenShowreelModal(FEATURED_TALENT[0])}
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    width: "84px",
                    height: "84px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 40px rgba(245, 158, 11, 0.7)",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Play size={36} fill="#000" color="#000" style={{ marginLeft: "5px" }} />
                </div>
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "#fff",
                    textTransform: "uppercase",
                    background: "rgba(0, 0, 0, 0.7)",
                    padding: "6px 16px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  Watch Featured 4K Showreel Reel
                </span>
              </div>

              {/* Bottom Card Strip */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "20px 24px",
                  background: "linear-gradient(to top, rgba(8, 10, 15, 0.95) 0%, transparent 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                    alt="Kabir Mehra"
                    style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid var(--accent-gold)" }}
                  />
                  <div>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>
                      Kabir Mehra • Lead Dramatic Reel (2025-2026)
                    </span>
                    <span style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Cast via CineConnect for Netflix Original 'Shadow of Verity'
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge badge-gold">2.39:1 Anamorphic</span>
                  <span className="badge badge-cyan">Cooke Optics</span>
                  <span className="badge badge-emerald">Dolby Atmos Audio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CRAFT & PERSONA SECTION ===================== */}
      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px" }}>
            <span className="badge badge-gold" style={{ marginBottom: "12px" }}>
              BUILT FOR THE ENTIRE PRODUCTION PIPELINE
            </span>
            <h2
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Architected for Every Cinema Discipline
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
              Whether you are in front of the lens, commanding the camera department, pitching screenplays, or assembling a multi-crore cast.
            </p>
          </div>

          {/* Interactive Persona Tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "36px",
              flexWrap: "wrap",
            }}
          >
            {[
              { id: "actors" as const, label: "🎭 Actors & Performers" },
              { id: "crew" as const, label: "🎥 Cinematographers & Crew" },
              { id: "directors" as const, label: "📜 Writers & Directors" },
              { id: "studios" as const, label: "🏢 Producers & Casting Studios" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCraftTab(tab.id)}
                style={{
                  background: selectedCraftTab === tab.id ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.05)",
                  color: selectedCraftTab === tab.id ? "#000" : "var(--text-secondary)",
                  border: selectedCraftTab === tab.id ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                  padding: "10px 22px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Persona Showcase Card */}
          <div
            className="glass-panel"
            style={{
              padding: "40px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "36px",
              alignItems: "center",
            }}
          >
            <div>
              {selectedCraftTab === "actors" && (
                <>
                  <span className="badge badge-gold" style={{ marginBottom: "14px" }}>
                    TALENT WORKSPACE
                  </span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px", color: "#fff" }}>
                    Get Cast in Feature Films & OTT Series Without Gatekeepers
                  </h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                    Showcase multi-angle headshots, verified theater credits, and streaming showreels directly to certified casting directors. Receive automated script sides and submit encrypted self-tapes in one click.
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {[
                      "AI dialect and age-bracket matching for major production calls",
                      "Automated self-tape transcoding and cloud watermark protection",
                      "Real-time audition status tracker: Shortlisted → Callback → Screen Test",
                    ].map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                        <CheckCircle2 size={16} color="var(--accent-gold)" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onEnterStudioHub} className="btn-primary">
                    Build Your Talent Profile 🎬
                  </button>
                </>
              )}

              {selectedCraftTab === "crew" && (
                <>
                  <span className="badge badge-cyan" style={{ marginBottom: "14px" }}>
                    CAMERA & POST-PRODUCTION
                  </span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px", color: "#fff" }}>
                    Showcase Gear Packages, Anamorphic Reels & Audio Masters
                  </h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                    For Directors of Photography, Gaffers, Sound Recordists, and Editors. List your camera kits, lenses, and specialized sound rigs so producers know exactly what equipment you bring to set.
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {[
                      "Gear manifest verification: Arri, RED, Cooke, Sound Devices",
                      "Lossless multi-bitrate 4K showreel hosting with aspect ratio toggles",
                      "Availability calendar for location shoots across domestic and overseas zones",
                    ].map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                        <CheckCircle2 size={16} color="var(--accent-neon-cyan)" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onEnterStudioHub} className="btn-primary">
                    List Your Crew Portfolio 🎥
                  </button>
                </>
              )}

              {selectedCraftTab === "directors" && (
                <>
                  <span className="badge badge-purple" style={{ marginBottom: "14px" }}>
                    PITCH & SCRIPT VAULT
                  </span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px", color: "#fff" }}>
                    Secure Screenplay Marketplace with Forensic Dynamic Watermarking
                  </h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                    Pitch your feature film or episodic series to vetted executive producers, studio heads, and sales agents. Enjoy automated digital NDA signing before anyone views your screenplay or treatment.
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {[
                      "Dynamic per-page watermarking with viewer identity & timestamp",
                      "Logline and lookbook showcases with budget tier tagging",
                      "Track pitch deck engagement, reading time, and executive inquiries",
                    ].map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                        <CheckCircle2 size={16} color="var(--accent-gold)" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onEnterStudioHub} className="btn-primary">
                    Submit Screenplay to Vault 📜
                  </button>
                </>
              )}

              {selectedCraftTab === "studios" && (
                <>
                  <span className="badge badge-emerald" style={{ marginBottom: "14px" }}>
                    PRODUCTION STUDIOS
                  </span>
                  <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "16px", color: "#fff" }}>
                    Cast Entire Feature Productions & Hire Department Heads in Days
                  </h3>
                  <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: "20px" }}>
                    Post casting calls and crew job notices with precision role requirements. Screen hundreds of self-tapes side-by-side, collaborate with directors on shortlisted picks, and automate callback schedules.
                  </p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                    {[
                      "pgvector AI candidate ranking based on craft, look, and prior credits",
                      "Multi-user casting room with synchronized ratings and notes",
                      "Automated callback invitations and video audition links",
                    ].map((item, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.92rem", color: "var(--text-primary)" }}>
                        <CheckCircle2 size={16} color="var(--accent-emerald)" /> {item}
                      </li>
                    ))}
                  </ul>
                  <button onClick={onEnterStudioHub} className="btn-primary">
                    Launch Studio Casting Suite 🏢
                  </button>
                </>
              )}
            </div>

            {/* Illustrative Preview */}
            <div
              style={{
                background: "rgba(8, 10, 15, 0.9)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Live Studio Dashboard Preview
                </span>
                <span className="badge badge-gold">Active Session</span>
              </div>

              {/* Sample Mini Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(245, 158, 11, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Video size={18} color="var(--accent-gold)" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff", display: "block" }}>
                        Self-Tape Monologue (Vikram)
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        High-Definition 1080p • 2m 14s • Watermarked
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-emerald">Ready</span>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(6, 182, 212, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Camera size={18} color="var(--accent-neon-cyan)" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff", display: "block" }}>
                        Arri Alexa 35 Camera Package
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        Cooke Anamorphic Lenses • Certified Insurance
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-cyan">Verified</span>
                </div>

                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    padding: "14px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: "rgba(255, 165, 0, 0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Lock size={18} color="var(--accent-gold)" />
                    </div>
                    <div>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff", display: "block" }}>
                        Digital NDA Clearance
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        SWA Registered • Dynamic Per-Page Stamp
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-purple">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TALENT DISCOVERY SHOWCASE ===================== */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>
                CURATED TALENT VAULT
              </span>
              <h2
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                Discover Verified Creators & Crew
              </h2>
            </div>

            {/* Filter Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: "All Crafts" },
                { id: "acting", label: "Actors" },
                { id: "camera", label: "Cinematography" },
                { id: "sound", label: "Sound Designers" },
                { id: "editorial", label: "Editors" },
                { id: "writing", label: "Writers" },
                { id: "stunts", label: "Stunts" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTalentFilter(f.id)}
                  style={{
                    background: talentFilter === f.id ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.04)",
                    color: talentFilter === f.id ? "var(--accent-gold)" : "var(--text-secondary)",
                    border: talentFilter === f.id ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Talent Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))",
              gap: "24px",
            }}
          >
            {filteredTalent.map((talent) => (
              <div
                key={talent.id}
                className="glass-card hover-lift"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Top strip */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid var(--accent-gold)",
                        }}
                      />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>{talent.name}</h4>
                          {talent.verified && (
                            <CheckCircle2 size={15} color="var(--accent-gold)" />
                          )}
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "var(--accent-gold)" }}>{talent.craft}</span>
                        <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          <MapPin size={11} style={{ display: "inline", marginRight: "3px" }} />
                          {talent.city}, {talent.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      marginBottom: "16px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {talent.bio}
                  </p>

                  {/* Skills Chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                    {talent.skills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "0.72rem",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid var(--border-subtle)",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          color: "#cbd5e1",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {talent.creditsCount} Verified Credits
                  </span>
                  <button
                    onClick={() => onOpenShowreelModal(talent)}
                    className="btn-secondary"
                    style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                  >
                    <Play size={12} fill="var(--accent-gold)" color="var(--accent-gold)" /> Showreel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== ACTIVE CASTINGS & AUDITIONS GRID ===================== */}
      <section id="castings-section" style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
            <div>
              <span className="badge badge-rose" style={{ marginBottom: "10px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span className="live-dot" /> LIVE AUDITION CALLS
              </span>
              <h2
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                Featured Roles & Audition Notices
              </h2>
            </div>
            <button onClick={onEnterStudioHub} className="btn-secondary" style={{ fontSize: "0.9rem" }}>
              View All 140+ Audition Notices →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
            {OPEN_CASTINGS.map((casting) => (
              <div
                key={casting.id}
                className="glass-card hover-lift"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: casting.isUrgent ? "1px solid rgba(244, 63, 94, 0.4)" : "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span className="badge badge-gold">{casting.projectType}</span>
                    {casting.isUrgent && (
                      <span className="badge badge-rose" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span className="live-dot" /> Urgent Call
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: "6px",
                      lineHeight: 1.35,
                    }}
                  >
                    {casting.title}
                  </h3>

                  <span style={{ fontSize: "0.85rem", color: "var(--accent-gold)", fontWeight: 600, display: "block", marginBottom: "12px" }}>
                    {casting.productionHouse} {casting.director ? `• Dir. ${casting.director}` : ""}
                  </span>

                  <p
                    style={{
                      fontSize: "0.88rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.5,
                      marginBottom: "16px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {casting.characterDescription}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      background: "rgba(0,0,0,0.3)",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      marginBottom: "18px",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Location</span>
                      <span style={{ color: "#fff", fontWeight: 600 }}>{casting.location}</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)", display: "block" }}>Pay</span>
                      <span style={{ color: "#34d399", fontWeight: 700 }}>{casting.payRange}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    Deadline: <strong>{casting.deadline}</strong>
                  </span>
                  <button
                    onClick={() => onOpenAuditionModal(casting)}
                    className="btn-primary"
                    style={{ fontSize: "0.85rem", padding: "8px 16px" }}
                  >
                    Instant Audition 🎬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PITCH & FUNDING MARKETPLACE ===================== */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
            <div>
              <span className="badge badge-purple" style={{ marginBottom: "10px" }}>
                INTELLECTUAL PROPERTY & SCREENPLAY VAULT
              </span>
              <h2
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                Curated Pitch Decks & Co-Productions
              </h2>
            </div>
            <button onClick={onEnterStudioHub} className="btn-secondary" style={{ fontSize: "0.9rem" }}>
              Explore Pitch Deck Repository →
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "24px" }}>
            {PITCH_DECKS.map((pitch) => (
              <div
                key={pitch.id}
                className="glass-card hover-lift"
                style={{
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                  <img
                    src={pitch.coverImage}
                    alt={pitch.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(15, 19, 28, 0.95) 0%, transparent 60%)",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span className="badge badge-purple">{pitch.format}</span>
                      <span className="badge badge-gold">{pitch.status}</span>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.72rem", color: "var(--accent-gold)", fontWeight: 700, textTransform: "uppercase" }}>
                        Estimated Budget: {pitch.estimatedBudget}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexGrow: 1 }}>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                      {pitch.title}
                    </h3>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>
                      Written by {pitch.writer}
                    </span>

                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: "var(--text-secondary)",
                        fontStyle: "italic",
                        lineHeight: 1.5,
                        marginBottom: "16px",
                      }}
                    >
                      "{pitch.logline}"
                    </p>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Lock size={12} color="var(--accent-gold)" /> Forensic NDA Required
                    </span>
                    <button
                      onClick={() => onOpenPitchModal(pitch)}
                      className="btn-secondary"
                      style={{ fontSize: "0.82rem", padding: "6px 14px" }}
                    >
                      Review Pitch Package 📜
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== PRODUCTION TECH & ARCHITECTURE ===================== */}
      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 50px" }}>
            <span className="badge badge-cyan" style={{ marginBottom: "12px" }}>
              ENTERPRISE FILM INFRASTRUCTURE
            </span>
            <h2
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Engineered for High-Security Film Operations
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
              Compliant with major studio security benchmarks, screenwriters association guidelines, and high-bitrate media streaming protocols.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              {
                icon: <Zap size={24} color="var(--accent-gold)" />,
                title: "pgvector AI Matchmaker",
                desc: "Matches casting breakdowns with 768-dimensional actor embeddings, evaluating dialect, age bracket, and monologue performance style in sub-milliseconds.",
              },
              {
                icon: <ShieldCheck size={24} color="var(--accent-emerald)" />,
                title: "Dynamic Forensics Watermarking",
                desc: "Every screenplay page and audition reel is dynamically stamped with the viewer's identity and IP, neutralizing leak vectors for sensitive studio scripts.",
              },
              {
                icon: <Layers size={24} color="var(--accent-gold)" />,
                title: "Distributed Media S3 Vault",
                desc: "Direct-to-S3 multi-part media uploads with automated HLS transcoding, enabling casting leads to scrub 4K showreels seamlessly across any device.",
              },
              {
                icon: <Users size={24} color="var(--accent-orange)" />,
                title: "Real-Time Casting Collaboration",
                desc: "Synchronized rating rooms, private casting associate remarks, and automated Google Meet / Zoom callback coordination built directly into the dashboard.",
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: "30px 24px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "18px",
                  }}
                >
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
                  {pillar.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CREATOR TESTIMONIALS ===================== */}
      <section style={{ padding: "80px 0", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 40px" }}>
            <span className="badge badge-gold" style={{ marginBottom: "12px" }}>
              PROVEN BY INDUSTRY LEADERS
            </span>
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Voices from the Film Set
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
            {TESTIMONIALS.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: "30px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ color: "var(--text-primary)", fontStyle: "italic", lineHeight: 1.6, marginBottom: "24px", fontSize: "0.95rem" }}>
                  "{item.quote}"
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <img
                    src={item.avatar}
                    alt={item.author}
                    style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-gold)" }}
                  />
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff" }}>{item.author}</h4>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block" }}>{item.role}</span>
                    <span className="badge badge-gold" style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                      {item.project}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section style={{ padding: "80px 0", background: "var(--bg-secondary)" }}>
        <div className="container" style={{ maxWidth: "840px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="badge badge-cyan" style={{ marginBottom: "12px" }}>
              TRANSPARENCY & GUIDELINES
            </span>
            <h2
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="glass-card"
                  style={{
                    borderRadius: "var(--radius-md)",
                    overflow: "hidden",
                    border: isOpen ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--border-subtle)",
                    transition: "all 0.2s",
                  }}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    style={{
                      width: "100%",
                      padding: "18px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "transparent",
                      border: "none",
                      color: isOpen ? "var(--accent-gold)" : "var(--text-primary)",
                      fontWeight: 700,
                      fontSize: "1rem",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                      }}
                    />
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 24px 20px", color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section
        style={{
          padding: "100px 0",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: "radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, var(--bg-primary) 70%)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div className="container" style={{ maxWidth: "700px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 0 35px rgba(245, 158, 11, 0.5)",
            }}
          >
            <Clapperboard size={30} color="#000" />
          </div>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              marginBottom: "16px",
            }}
          >
            Your Next Feature Role or Production Begins Here.
          </h2>

          <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", marginBottom: "36px", lineHeight: 1.6 }}>
            Join 15,000+ verified actors, cinematographers, directors, and production houses building the future of cinema.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <button
              onClick={onEnterStudioHub}
              className="btn-primary glow-gold"
              style={{ fontSize: "1.05rem", padding: "14px 32px" }}
            >
              Enter Studio Hub & Feed 🚀
            </button>
            <button
              onClick={onOpenAuthModal}
              className="btn-secondary"
              style={{ fontSize: "1.05rem", padding: "14px 28px" }}
            >
              Register New Account
            </button>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer
        style={{
          background: "#040609",
          borderTop: "1px solid var(--border-subtle)",
          padding: "60px 0 30px",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "40px",
              marginBottom: "48px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "var(--accent-gold)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clapperboard size={18} color="#000" />
                </div>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "#fff" }}>
                  Cine<span style={{ color: "var(--accent-gold)" }}>Connect</span>
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                The premier digital ecosystem connecting film talent with top production opportunities and funding.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "14px", textTransform: "uppercase" }}>
                For Creators
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <li><a href="#castings-section" style={{ color: "inherit", textDecoration: "none" }}>Audition Notices</a></li>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Showreel Player</a></li>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Talent Directory</a></li>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Profile Verification</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "14px", textTransform: "uppercase" }}>
                For Studios & Producers
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Post a Casting Notice</a></li>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Pitch Deck Vault</a></li>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Crew Booking</a></li>
                <li><a onClick={onEnterStudioHub} style={{ color: "inherit", textDecoration: "none", cursor: "pointer" }}>Production Security</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginBottom: "14px", textTransform: "uppercase" }}>
                Platform Status
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.82rem" }}>
                <span className="badge badge-emerald" style={{ width: "fit-content" }}>
                  ● All Systems Operational
                </span>
                <span style={{ color: "var(--text-muted)" }}>FastAPI v1.0 • pgvector v0.7</span>
                <span style={{ color: "var(--text-muted)" }}>AWS S3 & CloudFront Streaming</span>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
            }}
          >
            <span>© 2026 CineConnect Technologies Inc. All rights reserved.</span>
            <div style={{ display: "flex", gap: "16px" }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Screenwriters NDA</span>
              <span>Security Audits</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
