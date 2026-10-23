"use client";

import React, { useEffect, useState, useRef } from "react";
import { PortalType } from "@/lib/supabase/auth-context";
import { playClapperSound } from "@/lib/audio/clap-sound";
import { CheckCircle2, Clapperboard } from "lucide-react";

interface CinematicTransitionProps {
  isActive: boolean;
  portal: PortalType;
  soundEnabled: boolean;
  reducedMotion: boolean;
  onComplete: () => void;
}

export function CinematicTransition({
  isActive,
  portal,
  soundEnabled,
  reducedMotion,
  onComplete,
}: CinematicTransitionProps) {
  // Animation phases:
  // "initial-open" (visibly open) -> "clapping-down" (clap shut) -> "re-opening" (opens again) -> "light-sweep" -> "fading" -> "done"
  const [phase, setPhase] = useState<
    "idle" | "initial-open" | "clapping-down" | "re-opening" | "light-sweep" | "fading" | "done"
  >("initial-open");

  const isTalent = portal === "talent";
  const portalAccent = isTalent ? "#d4af37" : "#14b8a6";
  const portalGlow = isTalent ? "rgba(212, 175, 55, 0.45)" : "rgba(20, 184, 166, 0.45)";

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    // Clear any pending timers on unmount or when isActive changes
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!isActive) {
      return;
    }

    // Fast-path for reduced motion users
    if (reducedMotion) {
      const t = setTimeout(() => {
        onComplete();
      }, 350);
      timersRef.current.push(t);
      return;
    }

    // =========================================================================
    // CINEMATIC CLAPPERBOARD ANIMATION SEQUENCE (~1350ms total)
    // 1. Initial Open: Visually open at -26deg (starts on mount)
    // 2. Clap Down: Rotates down to 0deg with snap & sound (260ms)
    // 3. Re-Open: Top slate springs open to -20deg (520ms)
    // 4. Light Sweep: Anamorphic studio flare sweeps across (780ms)
    // 5. Fade out and reveal dashboard (1080ms - 1350ms)
    // =========================================================================

    // Step 2: Snap shut to 0deg with realistic clap contact (at 260ms)
    const t1 = setTimeout(() => {
      setPhase("clapping-down");
      playClapperSound(soundEnabled);
    }, 260);
    timersRef.current.push(t1);

    // Step 3: Animate the top slate opening upward again to -20deg (at 520ms)
    const t2 = setTimeout(() => {
      setPhase("re-opening");
    }, 520);
    timersRef.current.push(t2);

    // Step 4: Cinematic anamorphic light sweep (at 780ms)
    const t3 = setTimeout(() => {
      setPhase("light-sweep");
    }, 780);
    timersRef.current.push(t3);

    // Step 5: Smoothly fade and glide clapperboard away (at 1080ms)
    const t4 = setTimeout(() => {
      setPhase("fading");
    }, 1080);
    timersRef.current.push(t4);

    // Step 6: Complete transition and route to dashboard (at 1350ms)
    const t5 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 1350);
    timersRef.current.push(t5);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isActive, reducedMotion, soundEnabled, onComplete]);

  if (!isActive) return null;

  if (reducedMotion) {
    return (
      <div
        role="status"
        aria-label="Entering dashboard"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#06080e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: portalAccent,
          fontFamily: "var(--font-display)",
          fontSize: "1.2rem",
          fontWeight: 700,
        }}
      >
        Entering {isTalent ? "Talent Portal" : "Production House"}...
      </div>
    );
  }

  // Calculate top slate rotation based on the current sequence phase
  const getTopStickTransform = () => {
    switch (phase) {
      case "initial-open":
        return "rotate(-26deg)";
      case "clapping-down":
        return "rotate(0deg)";
      case "re-opening":
      case "light-sweep":
      case "fading":
      case "done":
        return "rotate(-20deg)";
      default:
        return "rotate(-26deg)";
    }
  };

  const getTopStickTransition = () => {
    switch (phase) {
      case "clapping-down":
        // Snappy, realistic downward clamp
        return "transform 0.16s cubic-bezier(0.55, 0.05, 0.2, 1.3)";
      case "re-opening":
        // Elastic rebound opening back upward
        return "transform 0.22s cubic-bezier(0.18, 0.89, 0.32, 1.15)";
      default:
        return "transform 0.2s ease";
    }
  };

  return (
    <div
      role="status"
      aria-label="Cinematic clapperboard transition"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4, 6, 12, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pointerEvents: "all",
      }}
    >
      {/* ===================== ANAMORPHIC CINEMATIC LIGHT SWEEP ===================== */}
      {(phase === "light-sweep" || phase === "fading") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 20,
            opacity: phase === "fading" ? 0 : 1,
            transition: "opacity 0.35s ease-out",
          }}
        >
          {/* Radial flare glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "260px",
              background: `radial-gradient(ellipse at center, ${portalGlow} 0%, rgba(0,0,0,0) 70%)`,
              filter: "blur(30px)",
            }}
          />

          {/* Horizontal anamorphic lens flare beam */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: "3px",
              background: `linear-gradient(90deg, transparent 5%, ${portalAccent} 35%, #ffffff 50%, ${portalAccent} 65%, transparent 95%)`,
              boxShadow: `0 0 35px 8px ${portalAccent}`,
              transform: "translateY(-50%)",
              animation: "anamorphicStreak 0.5s ease-out",
            }}
          />
        </div>
      )}

      {/* ===================== CLAPPERBOARD 3D RIG ===================== */}
      <div
        style={{
          width: "420px",
          maxWidth: "90vw",
          position: "relative",
          perspective: "1200px",
          transform:
            phase === "fading"
              ? "scale(1.05) translateY(-24px)"
              : phase === "clapping-down"
              ? "scale(0.99) translateY(2px)"
              : "scale(1)",
          opacity: phase === "fading" ? 0 : 1,
          transition: "transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease-out",
          zIndex: 10,
        }}
      >
        {/* ==================== EXACTLY ONE HINGED TOP SLATE STICK ==================== */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "40px",
            marginBottom: "0px",
            zIndex: 15,
          }}
        >
          {/* THE SINGLE MOVABLE TOP HINGED SLATE */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "36px",
              background: "#121722",
              borderRadius: "10px 10px 0 0",
              borderTop: "1.5px solid rgba(255, 255, 255, 0.22)",
              borderLeft: "1.5px solid rgba(255, 255, 255, 0.16)",
              borderRight: "1.5px solid rgba(255, 255, 255, 0.16)",
              borderBottom: "1.5px solid #000000",
              overflow: "hidden",
              transformOrigin: "14px calc(100% - 1px)",
              transform: getTopStickTransform(),
              transition: getTopStickTransition(),
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.75)",
              zIndex: 10,
              backfaceVisibility: "hidden",
            }}
          >
            {/* Top Chevron Stripes */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(45deg, #121722, #121722 16px, #f1f5f9 16px, #f1f5f9 32px)",
                opacity: 0.95,
              }}
            />
          </div>
        </div>

        {/* ==================== EXACTLY ONE HINGE PIVOT POINT (LEFT SIDE) ==================== */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "8px",
            top: "30px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 35%, #475569 75%, #0f172a 100%)",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.95), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
            border: "1px solid rgba(15, 23, 42, 0.8)",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          {/* Subtle Bolt Center Slot */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(40deg)",
              width: "8px",
              height: "1.5px",
              background: "#1e293b",
              borderRadius: "1px",
            }}
          />
        </div>

        {/* ==================== ONE MAIN BOARD ==================== */}
        <div
          style={{
            background: "linear-gradient(180deg, #0b0f18 0%, #060910 100%)",
            borderRadius: "0 0 16px 16px",
            borderLeft: `1.5px solid ${portalAccent}`,
            borderRight: `1.5px solid ${portalAccent}`,
            borderBottom: `1.5px solid ${portalAccent}`,
            borderTop: "none",
            boxShadow: `0 20px 50px -10px rgba(0, 0, 0, 0.9), 0 0 30px ${portalGlow}`,
            overflow: "hidden",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Top Edge of Main Board with Matching Diagonal Stripes */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "30px",
              background: "#0e131d",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(45deg, #0e131d, #0e131d 16px, #f1f5f9 16px, #f1f5f9 32px)",
                opacity: 0.9,
              }}
            />
          </div>

          <div style={{ padding: "20px 22px 26px" }}>
          {/* Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
              paddingBottom: "14px",
              marginBottom: "18px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: isTalent
                    ? "linear-gradient(135deg, #d4af37 0%, #b89327 100%)"
                    : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#000",
                }}
              >
                <Clapperboard size={18} />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "-0.01em",
                }}
              >
                CINECONNECT <span style={{ color: portalAccent }}>STUDIOS</span>
              </span>
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                padding: "3px 10px",
                borderRadius: "999px",
                color: "#6ee7b7",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                }}
              />
              REC
            </div>
          </div>

          {/* Slate Production Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                SCENE
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)" }}>
                AUTH_01
              </div>
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                TAKE
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: portalAccent, fontFamily: "var(--font-display)" }}>
                TAKE_01
              </div>
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "8px 10px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                ROLL
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)" }}>
                VERIFIED
              </div>
            </div>
          </div>

          {/* Success Status Banner */}
          <div
            style={{
              background: isTalent ? "rgba(212, 175, 55, 0.12)" : "rgba(20, 184, 166, 0.12)",
              border: `1px solid ${isTalent ? "rgba(212, 175, 55, 0.35)" : "rgba(20, 184, 166, 0.35)"}`,
              borderRadius: "10px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CheckCircle2 size={18} color={portalAccent} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "#fff" }}>
                Access Granted: {isTalent ? "Talent Portal" : "Production House"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Opening your personalized studio workspace...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
