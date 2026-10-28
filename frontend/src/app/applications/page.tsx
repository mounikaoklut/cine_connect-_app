"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import { MY_APPLICATIONS, ApplicationPipelineItem } from "@/lib/mockData";
import { UserProfile, CompletenessData } from "@/lib/api";
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  Video,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function ApplicationsPage() {
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

  return (
    <div style={{ minHeight: "100vh", background: "#0D0E12", display: "flex" }}>
      {/* Curved Navigation Arc (Left) */}
      <CurvedWheelNav currentActivePath="/applications" />

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="applications"
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
                  <TrendingUp size={11} /> Real-Time Casting Status
                </span>
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                My Applications & Auditions
              </h1>
              <p style={{ color: "#9E9E9E", fontSize: "0.88rem", maxWidth: "560px", marginTop: "4px" }}>
                Track the real-time stage progression of your self-tape auditions, screen test callbacks, and director meetings.
              </p>
            </div>

            <div style={{ display: "flex", gap: "14px" }}>
              <div style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center" }}>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFA500", display: "block" }}>1</span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Director Screen Test</span>
              </div>
              <div style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center" }}>
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFA500", display: "block" }}>4</span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Active Applications</span>
              </div>
            </div>
          </div>

          {/* Urgent Alert Banner */}
          <div
            style={{
              background: "#1A1C23",
              border: "1px solid #FFA500",
              borderRadius: "14px",
              padding: "18px 22px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              boxShadow: "0 4px 20px rgba(255, 165, 0, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#FFA500", display: "flex", alignItems: "center", justifyContent: "center", color: "#0D0E12" }}>
                <Calendar size={18} />
              </div>
              <div>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF", display: "block" }}>
                  Audition Callback Scheduled: October 24th, 4:00 PM
                </span>
                <span style={{ fontSize: "0.8rem", color: "#9E9E9E" }}>
                  Dharma Productions invited you to a Director Screen Test for <strong>Shadow of Verity</strong>.
                </span>
              </div>
            </div>
            <button
              onClick={() => alert("Screen Test Call Sheet:\nDate: Oct 24, 2026\nTime: 4:00 PM IST\nVenue: Dharma Studios, Andheri West\nDirector: Sharat Katariya")}
              style={{
                background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                color: "#0D0E12",
                border: "none",
                borderRadius: "8px",
                padding: "9px 18px",
                fontSize: "0.82rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(255, 165, 0, 0.3)",
              }}
            >
              View Call Sheet
            </button>
          </div>

          {/* Pipeline Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {pipelineItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#1A1C23",
                  border: "1px solid #2E3340",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          background: item.stage.includes("Screen Test")
                            ? "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)"
                            : "rgba(255, 165, 0, 0.18)",
                          color: item.stage.includes("Screen Test") ? "#0D0E12" : "#FFA500",
                          border: "1px solid rgba(255, 165, 0, 0.38)",
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                        }}
                      >
                        {item.stage}
                      </span>
                      <span style={{ fontSize: "0.74rem", color: "#9E9E9E" }}>Applied {item.appliedDate}</span>
                    </div>

                    <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF" }}>
                      {item.projectTitle}
                    </h3>
                    <span style={{ fontSize: "0.84rem", color: "#FFA500" }}>
                      Role: <strong>{item.roleTitle}</strong> • Production: {item.productionHouse}
                    </span>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9E9E9E", display: "block" }}>Progress</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFA500" }}>
                      {item.progressPercent}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: "8px", background: "#0D0E12", borderRadius: "9999px", overflow: "hidden", border: "1px solid #2E3340" }}>
                  <div
                    style={{
                      width: `${item.progressPercent}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #FFA500 0%, #FF8500 100%)",
                      boxShadow: "0 0 10px rgba(255, 165, 0, 0.5)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                {/* Next Step Note Callout */}
                <div
                  style={{
                    background: "#0D0E12",
                    border: "1px solid #2E3340",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Sparkles size={16} color="#FFA500" />
                  <div style={{ fontSize: "0.8rem", color: "#FFFFFF" }}>
                    <strong style={{ color: "#FFA500", marginRight: "6px" }}>NEXT STEP:</strong>
                    {item.nextStepNote}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
