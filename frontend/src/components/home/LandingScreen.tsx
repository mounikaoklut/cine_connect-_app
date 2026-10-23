"use client";

import React, { useState, useEffect } from "react";
import { Film, User, Star, Clapperboard, ArrowRight, Sparkles } from "lucide-react";
import { PortalType, useAuth } from "@/lib/supabase/auth-context";

interface LandingScreenProps {
  onSelectPortal: (portal: PortalType, mode?: "login" | "signup") => void;
  onOpenTerms?: (tab: "terms" | "privacy") => void;
  onLogin?: () => void;
}

const CINE_LETTERS = [
  { char: "C", isGradient: false },
  { char: "i", isGradient: false },
  { char: "n", isGradient: false },
  { char: "e", isGradient: false },
  { char: "C", isGradient: true },
  { char: "o", isGradient: true },
  { char: "n", isGradient: true },
  { char: "n", isGradient: true },
  { char: "e", isGradient: true },
  { char: "c", isGradient: true },
  { char: "t", isGradient: true },
];

export function LandingScreen({
  onSelectPortal,
  onLogin,
}: LandingScreenProps) {
  const { reducedMotion } = useAuth();

  // Intro letter-by-letter animation played only on initial visit
  const [introFinished, setIntroFinished] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("cineconnect_landing_intro_seen") === "true") {
        return true;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return true;
      }
    }
    return false;
  });

  useEffect(() => {
    if (introFinished || reducedMotion) {
      if (!introFinished) setIntroFinished(true);
      return;
    }

    const timer = setTimeout(() => {
      setIntroFinished(true);
      try {
        sessionStorage.setItem("cineconnect_landing_intro_seen", "true");
      } catch {
        // Storage fail-safe
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [introFinished, reducedMotion]);

  const handleSelectTalent = () => {
    onSelectPortal("talent", "login");
    if (onLogin) onLogin();
  };

  const handleSelectProduction = () => {
    onSelectPortal("production", "login");
    if (onLogin) onLogin();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        height: "100%",
        background: "#070A14",
        color: "#F5F7FF",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      {/* ===================== 1. CINEMATIC LETTER-BY-LETTER INTRO (INITIAL VISIT ONLY) ===================== */}
      {!introFinished && (
        <div
          role="status"
          aria-label="CineConnect Intro Animation"
          onClick={() => {
            setIntroFinished(true);
            try {
              sessionStorage.setItem("cineconnect_landing_intro_seen", "true");
            } catch {}
          }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            background: "#070A14",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            overflow: "hidden",
            cursor: "pointer",
          }}
        >
          {/* Studio Backlight Flare */}
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "340px",
              height: "340px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.32) 0%, transparent 68%)",
              filter: "blur(50px)",
              pointerEvents: "none",
            }}
          />

          {/* Film Frame Icon with soft violet aura */}
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F5F7FF",
              boxShadow: "0 0 35px rgba(139, 92, 246, 0.75)",
              marginBottom: "18px",
              animation: "introIconPulse 2s ease-in-out infinite",
            }}
          >
            <Film size={28} strokeWidth={2.4} />
          </div>

          {/* Letter-by-Letter Animated Typography */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {CINE_LETTERS.map((item, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  animation: `letterIntro 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) forwards`,
                  animationDelay: `${idx * 0.11}s`,
                  opacity: 0,
                  color: item.isGradient ? "#A78BFA" : "#F5F7FF",
                  background: item.isGradient
                    ? "linear-gradient(135deg, #DDD6FE 0%, #8B5CF6 55%, #7C3AED 100%)"
                    : undefined,
                  WebkitBackgroundClip: item.isGradient ? "text" : undefined,
                  WebkitTextFillColor: item.isGradient ? "transparent" : undefined,
                  textShadow: item.isGradient
                    ? "0 0 16px rgba(139, 92, 246, 0.65)"
                    : "0 0 12px rgba(245, 247, 255, 0.4)",
                }}
              >
                {item.char}
              </span>
            ))}
          </div>

          <div
            style={{
              marginTop: "14px",
              fontSize: "10.5px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(148, 163, 184, 0.65)",
              fontWeight: 600,
              opacity: 0,
              animation: "letterIntro 0.5s ease forwards",
              animationDelay: "1.25s",
            }}
          >
            Cinema Production Platform
          </div>
        </div>
      )}

      {/* ===================== 2. CINEMATIC BACKGROUND: DIRECTOR'S CHAIR & STUDIO LIGHTS ===================== */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Main Director's Chair & Clapperboard Visual */}
        <img
          src="/images/directors_chair.jpg"
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 35%",
            opacity: 0.65,
            filter: "contrast(1.05) brightness(0.88) saturate(1.1)",
            transform: "scale(1.02)",
          }}
        />

        {/* Top Vignette Overlay for Crisp Logo Legibility */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "36%",
            background: "linear-gradient(180deg, #070A14 0%, rgba(7, 10, 20, 0.82) 50%, rgba(7, 10, 20, 0) 100%)",
          }}
        />

        {/* Bottom Vignette Overlay for Solid Card & Button Contrast */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "62%",
            background: "linear-gradient(180deg, rgba(7, 10, 20, 0) 0%, rgba(7, 10, 20, 0.72) 28%, rgba(7, 10, 20, 0.95) 60%, #070A14 100%)",
          }}
        />

        {/* Soft Violet Studio Spotlight Glow (Top-Right / Center) */}
        <div
          style={{
            position: "absolute",
            top: "14%",
            right: "-10%",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.24) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "ambientLightPulse 6s ease-in-out infinite",
          }}
        />

        {/* Warm Amber / Reddish Rim Light (Mid-Left Movie Set Accent) */}
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: "-12%",
            width: "230px",
            height: "230px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(244, 114, 66, 0.15) 0%, transparent 70%)",
            filter: "blur(38px)",
            animation: "ambientLightPulse 7s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* ===================== 3. CINECONNECT HEADER LOGO ===================== */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px 20px 10px",
          position: "relative",
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "35px",
              height: "35px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F5F7FF",
              boxShadow: "0 2px 14px rgba(139, 92, 246, 0.45)",
              flexShrink: 0,
            }}
          >
            <Film size={18} strokeWidth={2.4} />
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F5F7FF",
              lineHeight: 1.1,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Cine
            <span
              style={{
                background: "linear-gradient(135deg, #C4B5FD 0%, #8B5CF6 50%, #7C3AED 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Connect
            </span>
          </span>
        </div>
      </header>

      {/* ===================== 4. MAIN CONTENT: HEADING & PORTAL BUTTONS ===================== */}
      <main
        className="no-scrollbar"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 22px 28px",
          position: "relative",
          zIndex: 10,
          maxWidth: "390px",
          width: "100%",
          margin: "0 auto",
          animation: introFinished ? "cinematicReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" : undefined,
        }}
      >
        {/* Decorative Violet Line & Cinematic Sparkle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.7))",
            }}
          />
          <Sparkles
            size={13}
            color="#A78BFA"
            style={{
              filter: "drop-shadow(0 0 6px #8B5CF6)",
              animation: "sparkleGlow 3s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "36px",
              height: "1px",
              background: "linear-gradient(90deg, rgba(139, 92, 246, 0.7), transparent)",
            }}
          />
        </div>

        {/* Heading: “Choose Your Type” */}
        <h1
          style={{
            fontSize: "23px",
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: "-0.015em",
            color: "#F5F7FF",
            textAlign: "center",
            marginBottom: "20px",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Choose{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #DDD6FE 0%, #8B5CF6 60%, #7C3AED 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Your
          </span>{" "}
          Type
        </h1>

        {/* Two Vertically Stacked Premium Portal Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", width: "100%" }}>
          {/* Button 1: Talent Portal */}
          <button
            type="button"
            onClick={handleSelectTalent}
            className="portal-action-btn"
            style={{
              width: "100%",
              height: "62px",
              borderRadius: "14px",
              border: "1.5px solid rgba(139, 92, 246, 0.55)",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.28) 0%, rgba(109, 40, 217, 0.35) 50%, rgba(76, 29, 149, 0.38) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              color: "#F5F7FF",
              padding: "0 18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.7), 0 0 18px rgba(139, 92, 246, 0.2)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "#A78BFA";
              e.currentTarget.style.boxShadow = "0 12px 28px -4px rgba(0, 0, 0, 0.8), 0 0 24px rgba(139, 92, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.55)";
              e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(0, 0, 0, 0.7), 0 0 18px rgba(139, 92, 246, 0.2)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(139, 92, 246, 0.25)",
                  border: "1px solid rgba(139, 92, 246, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  flexShrink: 0,
                  color: "#F5F7FF",
                }}
              >
                <User size={19} strokeWidth={2.3} />
                <Star
                  size={9}
                  fill="#F4B942"
                  color="#F4B942"
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    filter: "drop-shadow(0 0 3px #F4B942)",
                  }}
                />
              </div>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#F5F7FF", letterSpacing: "-0.01em" }}>
                Talent Portal
              </span>
            </div>

            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(245, 247, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#C4B5FD",
                flexShrink: 0,
              }}
            >
              <ArrowRight size={17} strokeWidth={2.4} />
            </div>
          </button>

          {/* Button 2: Production House Portal */}
          <button
            type="button"
            onClick={handleSelectProduction}
            className="portal-action-btn"
            style={{
              width: "100%",
              height: "62px",
              borderRadius: "14px",
              border: "1.5px solid rgba(139, 92, 246, 0.3)",
              background: "linear-gradient(135deg, rgba(14, 18, 32, 0.88) 0%, rgba(8, 12, 22, 0.95) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              color: "#F5F7FF",
              padding: "0 18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.7)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "#8B5CF6";
              e.currentTarget.style.boxShadow = "0 12px 28px -4px rgba(0, 0, 0, 0.8), 0 0 24px rgba(139, 92, 246, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
              e.currentTarget.style.boxShadow = "0 8px 24px -4px rgba(0, 0, 0, 0.7)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: "rgba(245, 247, 255, 0.06)",
                  border: "1px solid rgba(245, 247, 255, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#F5F7FF",
                }}
              >
                <Clapperboard size={19} strokeWidth={2.3} />
              </div>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#F5F7FF", letterSpacing: "-0.01em" }}>
                Production House Portal
              </span>
            </div>

            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "rgba(245, 247, 255, 0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94A3B8",
                flexShrink: 0,
              }}
            >
              <ArrowRight size={17} strokeWidth={2.4} />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
