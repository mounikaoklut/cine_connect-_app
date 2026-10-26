"use client";

import React from "react";
import { Sparkles, Building2, ArrowRight, CheckCircle } from "lucide-react";
import { PortalType } from "@/lib/supabase/auth-context";

interface PortalSelectionCardsProps {
  onSelectPortal: (portal: PortalType) => void;
  selectedPortal?: PortalType;
}

export function PortalSelectionCards({ onSelectPortal, selectedPortal }: PortalSelectionCardsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "18px",
        maxWidth: "960px",
        margin: "0 auto",
        width: "100%",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      {/* ===================== TALENT SIDE CARD ===================== */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Select Talent Portal for actors, models, artists, comedians, and cinematographers"
        onClick={() => onSelectPortal("talent")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectPortal("talent");
          }
        }}
        className="portal-card"
        style={{
          position: "relative",
          background: "#0C1120",
          border: selectedPortal === "talent" ? "2px solid #8B5CF6" : "1px solid rgba(245, 247, 255, 0.1)",
          borderRadius: "16px",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "380px",
          boxShadow:
            selectedPortal === "talent"
              ? "0 20px 45px -10px rgba(0, 0, 0, 0.9), 0 0 25px rgba(139, 92, 246, 0.25)"
              : "0 14px 35px -10px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, padding: "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8B5CF6",
              }}
            >
              <Sparkles size={22} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(37, 217, 208, 0.12)",
                border: "1px solid rgba(37, 217, 208, 0.35)",
                color: "#25D9D0",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {selectedPortal === "talent" ? (
                <>
                  <CheckCircle size={12} color="#25D9D0" /> Selected
                </>
              ) : (
                "Artists & Crew"
              )}
            </div>
          </div>

          <h3
            style={{
              fontSize: "21px",
              fontWeight: 600,
              color: "#F5F7FF",
              marginBottom: "8px",
            }}
          >
            For Talent
          </h3>

          <p
            style={{
              fontSize: "13.5px",
              color: "#94A3B8",
              lineHeight: 1.5,
              marginBottom: "14px",
            }}
          >
            For actors, models, comedians, cinematographers, and film crew showcasing verified credits and applying for auditions.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["Actors & Models", "Cinematographers", "Comedians", "Directors & Crew"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  background: "rgba(245, 247, 255, 0.05)",
                  border: "1px solid rgba(245, 247, 255, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "16px 20px 20px",
            borderTop: "1px solid rgba(245, 247, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "16px",
          }}
        >
          <span style={{ fontSize: "12.5px", color: "#64748B", fontWeight: 500 }}>
            Auditions • Showreels
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#8B5CF6",
              color: "#F5F7FF",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
            }}
          >
            Enter Talent Portal <ArrowRight size={15} />
          </div>
        </div>
      </div>

      {/* ===================== PRODUCTION HOUSE SIDE CARD ===================== */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Select Production House Portal for casting teams, directors, and film production companies"
        onClick={() => onSelectPortal("production")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectPortal("production");
          }
        }}
        className="portal-card"
        style={{
          position: "relative",
          background: "#0C1120",
          border: selectedPortal === "production" ? "2px solid #8B5CF6" : "1px solid rgba(245, 247, 255, 0.1)",
          borderRadius: "16px",
          overflow: "hidden",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "380px",
          boxShadow:
            selectedPortal === "production"
              ? "0 20px 45px -10px rgba(0, 0, 0, 0.9), 0 0 25px rgba(139, 92, 246, 0.25)"
              : "0 14px 35px -10px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div style={{ position: "relative", zIndex: 2, padding: "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8B5CF6",
              }}
            >
              <Building2 size={22} />
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(37, 217, 208, 0.12)",
                border: "1px solid rgba(37, 217, 208, 0.35)",
                color: "#25D9D0",
                borderRadius: "999px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {selectedPortal === "production" ? (
                <>
                  <CheckCircle size={12} color="#25D9D0" /> Selected
                </>
              ) : (
                "Studios & Casting"
              )}
            </div>
          </div>

          <h3
            style={{
              fontSize: "21px",
              fontWeight: 600,
              color: "#F5F7FF",
              marginBottom: "8px",
            }}
          >
            For Production House
          </h3>

          <p
            style={{
              fontSize: "13.5px",
              color: "#94A3B8",
              lineHeight: 1.5,
              marginBottom: "14px",
            }}
          >
            For production houses, casting directors, and streaming studios looking to discover verified talents and manage projects.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {["Feature Films", "OTT Series", "Casting Directors", "Studio Breakdowns"].map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  background: "rgba(245, 247, 255, 0.05)",
                  border: "1px solid rgba(245, 247, 255, 0.1)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "16px 20px 20px",
            borderTop: "1px solid rgba(245, 247, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "16px",
          }}
        >
          <span style={{ fontSize: "12.5px", color: "#64748B", fontWeight: 500 }}>
            Casting • Verified Profiles
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 18px",
              borderRadius: "10px",
              background: "#8B5CF6",
              color: "#F5F7FF",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
            }}
          >
            Enter Production Portal <ArrowRight size={15} />
          </div>
        </div>
      </div>
    </div>
  );
}
