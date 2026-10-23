"use client";

import React from "react";
import { Film, UserCheck, Video } from "lucide-react";
import { PortalType } from "@/lib/supabase/auth-context";

interface LandingScreenProps {
  onSelectPortal: (portal: PortalType, mode?: "login" | "signup") => void;
  onOpenTerms?: (tab: "terms" | "privacy") => void;
  onLogin?: () => void;
}

export function LandingScreen({
  onSelectPortal,
  onLogin,
}: LandingScreenProps) {
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
        background: "#070A14",
        color: "#F5F7FF",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      {/* ===================== CINE CONNECT LOGO ===================== */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          padding: "20px 24px",
          background: "#070A14",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              background: "#8B5CF6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F5F7FF",
              boxShadow: "0 2px 10px rgba(139, 92, 246, 0.35)",
              flexShrink: 0,
            }}
          >
            <Film size={19} strokeWidth={2.4} />
          </div>
          <span
            style={{
              fontSize: "22px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F5F7FF",
              lineHeight: 1.1,
            }}
          >
            Cine<span style={{ color: "#8B5CF6" }}>Connect</span>
          </span>
        </div>
      </header>

      {/* ===================== MAIN CONTENT: CHOOSE YOUR TYPE & 2 BUTTONS ===================== */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "32px 24px 48px",
          maxWidth: "380px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "26px",
            fontWeight: 700,
            lineHeight: 1.25,
            letterSpacing: "-0.02em",
            color: "#F5F7FF",
            marginBottom: "32px",
            textAlign: "center",
          }}
        >
          Choose Your Type
        </h1>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Talent Portal Button */}
          <button
            type="button"
            onClick={handleSelectTalent}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "12px",
              border: "none",
              background: "#8B5CF6",
              color: "#F5F7FF",
              fontWeight: 600,
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 16px rgba(139, 92, 246, 0.35)",
              transition: "all 0.18s ease",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.35)";
            }}
          >
            <UserCheck size={20} strokeWidth={2.3} />
            <span>Talent Portal</span>
          </button>

          {/* Production House Portal Button */}
          <button
            type="button"
            onClick={handleSelectProduction}
            style={{
              width: "100%",
              height: "52px",
              borderRadius: "12px",
              border: "1.5px solid #8B5CF6",
              background: "#0C1120",
              color: "#F5F7FF",
              fontWeight: 600,
              fontSize: "16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
              transition: "all 0.18s ease",
              fontFamily: "'Poppins', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
              e.currentTarget.style.borderColor = "#A78BFA";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#0C1120";
              e.currentTarget.style.borderColor = "#8B5CF6";
            }}
          >
            <Video size={20} strokeWidth={2.3} />
            <span>Production House Portal</span>
          </button>
        </div>
      </main>
    </div>
  );
}

