"use client";

import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import AuditionModal from "@/components/AuditionModal";
import {
  OPEN_CASTINGS,
  CastingCall,
  ApplicationPipelineItem,
  MY_APPLICATIONS,
  OPPORTUNITY_APPLICATIONS,
  OpportunityApplicationItem,
} from "@/lib/mockData";
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
  Bookmark,
  Send,
  XCircle,
  Video,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  Clock,
  Film,
  ChevronLeft,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [activeAudition, setActiveAudition] = useState<CastingCall | null>(null);
  const [selectedCraft, setSelectedCraft] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<OpportunityApplicationItem[]>(OPPORTUNITY_APPLICATIONS);
  const [appTab, setAppTab] = useState<"applied" | "saved" | "rejected" | "all">("all");
  const [opportunitiesView, setOpportunitiesView] = useState<"opportunities" | "my-applications">("opportunities");
  const [isApplicationsCollapsed, setIsApplicationsCollapsed] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Counts for My Applications options
  const appliedCount = applications.filter((a) => a.status === "applied").length;
  const savedCount = applications.filter((a) => a.status === "saved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  const filteredApplications = applications.filter((app) => {
    if (appTab === "all") return true;
    return app.status === appTab;
  });

  const filteredCastings = OPEN_CASTINGS.filter((casting) => {
    if (
      selectedCraft !== "all" &&
      casting.craft.toLowerCase() !== selectedCraft.toLowerCase() &&
      casting.projectType.toLowerCase() !== selectedCraft.toLowerCase()
    ) {
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAuditionSubmitted = (castingId: string, roleName: string, productionHouse: string) => {
    const casting = OPEN_CASTINGS.find((c) => c.id === castingId);
    const newApp: OpportunityApplicationItem = {
      id: "app-" + Date.now(),
      status: "applied",
      projectTitle: casting ? casting.title : roleName,
      roleTitle: roleName,
      productionHouse,
      projectType: casting ? casting.projectType : "Audition Submission",
      director: casting?.director,
      appliedDate: "Just now",
      stage: "Audition Submitted",
      progressPercent: 25,
      stageNote: "Self-tape monologue submitted. Casting department reviewing audition tape.",
      payRange: casting?.payRange || "Standard SAG/Guild Rates",
      location: casting?.location || "Mumbai Studios",
      bannerUrl: casting?.bannerUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80",
      matchScore: casting?.matchScore || 95,
      castingId,
    };

    // Remove from saved if it was saved
    setApplications((prev) => [
      newApp,
      ...prev.filter((item) => !(item.status === "saved" && item.castingId === castingId)),
    ]);
    setAppTab("applied");
    showToast(`🎉 Audition for "${roleName}" submitted to ${productionHouse}!`);
  };

  const handleRemoveSaved = (id: string, title: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    showToast(`Removed "${title}" from Saved Applications`);
  };

  const handleApplySaved = (savedApp: OpportunityApplicationItem) => {
    const casting =
      OPEN_CASTINGS.find((c) => c.id === savedApp.castingId) ||
      OPEN_CASTINGS.find((c) => c.title.toLowerCase().includes(savedApp.roleTitle.toLowerCase())) ||
      OPEN_CASTINGS[0];
    setActiveAudition(casting);
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
            else if (view === "opportunities") window.location.href = "/opportunities";
          }}
          userData={mockUser}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => {
            window.location.href = "/portfolio";
          }}
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
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
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
                <span className="badge badge-emerald" style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: "9999px" }}>
                  ⚡ Live System
                </span>
                <button
                  type="button"
                  id="desktop-top-my-apps-btn"
                  onClick={() => setOpportunitiesView("my-applications")}
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 165, 0, 0.22) 0%, rgba(255, 133, 0, 0.12) 100%)",
                    color: "#FFA500",
                    border: "1.5px solid #FFA500",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 10px rgba(255, 165, 0, 0.25)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Film size={13} color="#FFA500" />
                  <span>My Applications</span>
                  <span
                    style={{
                      background: "#FFA500",
                      color: "#0D0E12",
                      padding: "1px 6px",
                      borderRadius: "9999px",
                      fontSize: "0.65rem",
                      fontWeight: 900,
                    }}
                  >
                    {applications.length}
                  </span>
                </button>
                <span style={{ fontSize: "0.75rem", color: "#9E9E9E", marginLeft: "auto" }}>Updated 14 mins ago</span>
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                Production Opportunities
              </h1>
              <p style={{ color: "#9E9E9E", fontSize: "0.88rem", maxWidth: "560px", marginTop: "4px" }}>
                Browse verified feature film, OTT thriller, and commercial casting calls matched to your physical attributes and craft.
              </p>
            </div>

            <div style={{ display: "flex", gap: "14px" }}>
              <div
                onClick={() => setOpportunitiesView("opportunities")}
                style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center", cursor: "pointer" }}
              >
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#FFA500", display: "block" }}>
                  {OPEN_CASTINGS.length}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Open Castings</span>
              </div>
              <div
                onClick={() => setOpportunitiesView("my-applications")}
                style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center", cursor: "pointer" }}
              >
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#10B981", display: "block" }}>
                  {appliedCount}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>My Applications</span>
              </div>
              <div
                onClick={() => {
                  setOpportunitiesView("my-applications");
                  setAppTab("saved");
                }}
                style={{ background: "#0D0E12", border: "1px solid #2E3340", borderRadius: "12px", padding: "10px 18px", textAlign: "center", cursor: "pointer" }}
              >
                <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "#38BDF8", display: "block" }}>
                  {savedCount}
                </span>
                <span style={{ fontSize: "0.68rem", color: "#9E9E9E", textTransform: "uppercase" }}>Saved Roles</span>
              </div>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                position: "fixed",
                bottom: "32px",
                right: "32px",
                background: "linear-gradient(135deg, #1A1C23 0%, #0D0E12 100%)",
                border: "1px solid #FFA500",
                color: "#FFFFFF",
                padding: "12px 20px",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(255, 165, 0, 0.35)",
                zIndex: 1000,
                fontSize: "0.88rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle2 size={18} color="#FFA500" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. DEDICATED MY APPLICATIONS PAGE VIEW                   */}
          {/* Opened when clicking "My Applications" in Opportunities  */}
          {/* ======================================================== */}
          {opportunitiesView === "my-applications" && (
            <div>
              {/* Back to Opportunities Navigation Banner */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                <button
                  type="button"
                  id="desktop-back-to-opps-btn"
                  onClick={() => setOpportunitiesView("opportunities")}
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    padding: "8px 16px",
                    borderRadius: "9999px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>← Back to Production Opportunities</span>
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="badge badge-emerald" style={{ fontSize: "0.72rem", padding: "4px 10px", borderRadius: "9999px" }}>
                    ⚡ Live System
                  </span>
                  <span style={{ background: "rgba(255, 165, 0, 0.18)", color: "#FFA500", border: "1px solid rgba(255, 165, 0, 0.35)", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.74rem", fontWeight: 800 }}>
                    {applications.length} Applications Total
                  </span>
                </div>
              </div>

              <section
                id="my-applications-section"
                style={{
                  background: "#12141A",
                  border: "1px solid #2E3340",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "36px",
              boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Section Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
                marginBottom: "20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "18px",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span
                    style={{
                      background: "rgba(255, 165, 0, 0.15)",
                      color: "#FFA500",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Audition Management
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "#9E9E9E" }}>
                    {applications.length} Total Applications on Record
                  </span>
                </div>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#FFFFFF", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Film size={22} color="#FFA500" /> My Applications
                </h2>
                <p style={{ color: "#9E9E9E", fontSize: "0.84rem", margin: "4px 0 0" }}>
                  Track your submitted self-tapes, saved audition breakdowns, and casting director feedback.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsApplicationsCollapsed(!isApplicationsCollapsed)}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid #2E3340",
                    color: "#E2E8F0",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {isApplicationsCollapsed ? (
                    <>
                      <span>Expand Section</span>
                      <ChevronDown size={14} />
                    </>
                  ) : (
                    <>
                      <span>Collapse</span>
                      <ChevronUp size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* If section is expanded */}
            {!isApplicationsCollapsed && (
              <div>
                {/* 4 Core Filter Options: All Applications, Applied, Saved Applications, Rejected */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {/* Option 0: All Applications */}
                  <button
                    type="button"
                    onClick={() => setAppTab("all")}
                    style={{
                      background: appTab === "all" ? "rgba(255, 165, 0, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      color: appTab === "all" ? "#FFA500" : "#9E9E9E",
                      border: appTab === "all" ? "1.5px solid #FFA500" : "1px solid #2E3340",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      transition: "all 0.18s ease",
                      boxShadow: appTab === "all" ? "0 2px 12px rgba(255, 165, 0, 0.25)" : "none",
                    }}
                  >
                    <Film size={14} />
                    <span>All Applications</span>
                    <span
                      style={{
                        background: appTab === "all" ? "#FFA500" : "rgba(255, 255, 255, 0.12)",
                        color: appTab === "all" ? "#0D0E12" : "#FFFFFF",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    >
                      {applications.length}
                    </span>
                  </button>

                  {/* Option 1: Applied */}
                  <button
                    type="button"
                    onClick={() => setAppTab("applied")}
                    style={{
                      background: appTab === "applied" ? "rgba(16, 185, 129, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      color: appTab === "applied" ? "#34d399" : "#9E9E9E",
                      border: appTab === "applied" ? "1.5px solid #10B981" : "1px solid #2E3340",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      transition: "all 0.18s ease",
                      boxShadow: appTab === "applied" ? "0 2px 12px rgba(16, 185, 129, 0.25)" : "none",
                    }}
                  >
                    <Send size={14} />
                    <span>Applied</span>
                    <span
                      style={{
                        background: appTab === "applied" ? "#10B981" : "rgba(255, 255, 255, 0.12)",
                        color: appTab === "applied" ? "#0D0E12" : "#FFFFFF",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    >
                      {appliedCount}
                    </span>
                  </button>

                  {/* Option 2: Saved Applications */}
                  <button
                    type="button"
                    onClick={() => setAppTab("saved")}
                    style={{
                      background: appTab === "saved" ? "rgba(56, 189, 248, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      color: appTab === "saved" ? "#38BDF8" : "#9E9E9E",
                      border: appTab === "saved" ? "1.5px solid #38BDF8" : "1px solid #2E3340",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      transition: "all 0.18s ease",
                      boxShadow: appTab === "saved" ? "0 2px 12px rgba(56, 189, 248, 0.25)" : "none",
                    }}
                  >
                    <Bookmark size={14} />
                    <span>Saved Applications</span>
                    <span
                      style={{
                        background: appTab === "saved" ? "#38BDF8" : "rgba(255, 255, 255, 0.12)",
                        color: appTab === "saved" ? "#0D0E12" : "#FFFFFF",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    >
                      {savedCount}
                    </span>
                  </button>

                  {/* Option 3: Rejected */}
                  <button
                    type="button"
                    onClick={() => setAppTab("rejected")}
                    style={{
                      background: appTab === "rejected" ? "rgba(244, 63, 94, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      color: appTab === "rejected" ? "#FB7185" : "#9E9E9E",
                      border: appTab === "rejected" ? "1.5px solid #F43F5E" : "1px solid #2E3340",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      transition: "all 0.18s ease",
                      boxShadow: appTab === "rejected" ? "0 2px 12px rgba(244, 63, 94, 0.25)" : "none",
                    }}
                  >
                    <XCircle size={14} />
                    <span>Rejected</span>
                    <span
                      style={{
                        background: appTab === "rejected" ? "#F43F5E" : "rgba(255, 255, 255, 0.12)",
                        color: appTab === "rejected" ? "#FFFFFF" : "#FFFFFF",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    >
                      {rejectedCount}
                    </span>
                  </button>

                  {/* All Applications Option */}
                  <button
                    type="button"
                    onClick={() => setAppTab("all")}
                    style={{
                      background: appTab === "all" ? "rgba(255, 165, 0, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      color: appTab === "all" ? "#FFA500" : "#9E9E9E",
                      border: appTab === "all" ? "1.5px solid #FFA500" : "1px solid #2E3340",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      marginLeft: "auto",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span>All Applications</span>
                    <span
                      style={{
                        background: appTab === "all" ? "#FFA500" : "rgba(255, 255, 255, 0.12)",
                        color: appTab === "all" ? "#0D0E12" : "#FFFFFF",
                        padding: "1px 7px",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                        fontWeight: 800,
                      }}
                    >
                      {applications.length}
                    </span>
                  </button>
                </div>

                {/* Applications Grid */}
                {filteredApplications.length === 0 ? (
                  <div
                    style={{
                      background: "#0D0E12",
                      border: "1px dashed #2E3340",
                      borderRadius: "14px",
                      padding: "36px 20px",
                      textAlign: "center",
                      color: "#9E9E9E",
                    }}
                  >
                    <Clapperboard size={36} color="#FFA500" style={{ margin: "0 auto 12px", opacity: 0.6 }} />
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "6px" }}>
                      No {appTab === "applied" ? "active submissions" : appTab === "saved" ? "saved roles" : "archived decisions"} found
                    </h3>
                    <p style={{ fontSize: "0.84rem", maxWidth: "420px", margin: "0 auto" }}>
                      {appTab === "saved"
                        ? "Browse the verified casting calls below and click 'Save' to keep track of roles you want to prepare sides for."
                        : "Apply to production calls below with self-tape monologues to track real-time callback stages."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "18px" }}>
                    {filteredApplications.map((app) => (
                      <div
                        key={app.id}
                        style={{
                          background: "#161922",
                          border:
                            app.status === "applied"
                              ? "1px solid rgba(16, 185, 129, 0.35)"
                              : app.status === "saved"
                              ? "1px solid rgba(56, 189, 248, 0.35)"
                              : "1px solid rgba(244, 63, 94, 0.25)",
                          borderRadius: "14px",
                          overflow: "hidden",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.35)",
                          transition: "transform 0.2s ease, border-color 0.2s ease",
                        }}
                      >
                        {/* Media Banner Fill */}
                        <div
                          style={{
                            width: "100%",
                            height: "140px",
                            position: "relative",
                            overflow: "hidden",
                            background: "#08090C",
                          }}
                        >
                          <img
                            src={app.bannerUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80"}
                            alt={app.projectTitle}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                              filter: app.status === "rejected" ? "grayscale(40%)" : "none",
                            }}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=1000&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(22, 25, 34, 0.95) 100%)",
                            }}
                          />

                          {/* Top Badges */}
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "12px",
                              right: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                background:
                                  app.status === "applied"
                                    ? "rgba(16, 185, 129, 0.9)"
                                    : app.status === "saved"
                                    ? "rgba(56, 189, 248, 0.9)"
                                    : "rgba(244, 63, 94, 0.85)",
                                color: "#0D0E12",
                                padding: "3px 9px",
                                borderRadius: "6px",
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {app.status === "applied" && (
                                <>
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      background: "#0D0E12",
                                      display: "inline-block",
                                    }}
                                  />
                                  <span>Applied • {app.stage}</span>
                                </>
                              )}
                              {app.status === "saved" && (
                                <>
                                  <Bookmark size={11} />
                                  <span>Saved Application</span>
                                </>
                              )}
                              {app.status === "rejected" && (
                                <>
                                  <XCircle size={11} />
                                  <span>Archived Decision</span>
                                </>
                              )}
                            </span>

                            {app.matchScore && (
                              <span
                                style={{
                                  background: "rgba(0, 0, 0, 0.75)",
                                  backdropFilter: "blur(6px)",
                                  border: "1px solid rgba(255, 165, 0, 0.4)",
                                  color: "#FFA500",
                                  padding: "2px 8px",
                                  borderRadius: "9999px",
                                  fontSize: "0.7rem",
                                  fontWeight: 800,
                                }}
                              >
                                {app.matchScore}% Match
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
                            {app.roleTitle}
                          </h3>
                          <span style={{ fontSize: "0.82rem", color: "#FFA500", fontWeight: 600, marginBottom: "8px" }}>
                            {app.projectTitle} • {app.productionHouse}
                          </span>

                          {/* Stage Progress for Applied Items */}
                          {app.status === "applied" && (
                            <div style={{ marginBottom: "12px", marginTop: "4px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                                <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 700 }}>
                                  Stage: {app.stage}
                                </span>
                                <span style={{ fontSize: "0.72rem", color: "#9E9E9E", fontWeight: 600 }}>
                                  {app.progressPercent}% Completed
                                </span>
                              </div>
                              <div style={{ width: "100%", height: "5px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "9999px", overflow: "hidden" }}>
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${app.progressPercent}%`,
                                    background: "linear-gradient(90deg, #10B981 0%, #34d399 100%)",
                                    borderRadius: "9999px",
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Stage Note */}
                          <div
                            style={{
                              background: "rgba(0, 0, 0, 0.3)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                              borderRadius: "8px",
                              padding: "10px 12px",
                              fontSize: "0.78rem",
                              color: "#E2E8F0",
                              lineHeight: 1.45,
                              marginBottom: "12px",
                            }}
                          >
                            <strong style={{ color: app.status === "rejected" ? "#F43F5E" : "#FFA500", display: "block", marginBottom: "2px" }}>
                              {app.status === "applied" ? "Next Step:" : app.status === "saved" ? "Preparation Sides:" : "Casting Feedback:"}
                            </strong>
                            <span>{app.status === "rejected" && app.rejectionReason ? app.rejectionReason : app.stageNote}</span>
                          </div>

                          {/* Key Specs Pills */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "auto", marginBottom: "14px" }}>
                            {app.payRange && (
                              <span style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "2px 7px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600 }}>
                                {app.payRange}
                              </span>
                            )}
                            {app.location && (
                              <span style={{ background: "#0D0E12", color: "#9E9E9E", border: "1px solid #2E3340", padding: "2px 7px", borderRadius: "6px", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                <MapPin size={10} /> {app.location}
                              </span>
                            )}
                            {app.appliedDate && (
                              <span style={{ background: "#0D0E12", color: "#9E9E9E", border: "1px solid #2E3340", padding: "2px 7px", borderRadius: "6px", fontSize: "0.7rem" }}>
                                Applied: {app.appliedDate}
                              </span>
                            )}
                            {app.savedDate && (
                              <span style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38BDF8", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "2px 7px", borderRadius: "6px", fontSize: "0.7rem" }}>
                                {app.savedDate}
                              </span>
                            )}
                            {app.deadline && (
                              <span style={{ background: "#0D0E12", color: "#FFA500", border: "1px solid rgba(255, 165, 0, 0.3)", padding: "2px 7px", borderRadius: "6px", fontSize: "0.7rem" }}>
                                Deadline: {app.deadline}
                              </span>
                            )}
                          </div>

                          {/* Action Buttons based on status */}
                          <div style={{ display: "flex", gap: "8px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
                            {app.status === "applied" && (
                              <>
                                {app.meetingLink ? (
                                  <a
                                    href={app.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      flex: 1,
                                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                                      color: "#FFFFFF",
                                      padding: "8px 12px",
                                      borderRadius: "8px",
                                      fontSize: "0.78rem",
                                      fontWeight: 700,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "5px",
                                      textDecoration: "none",
                                      boxShadow: "0 2px 10px rgba(16, 185, 129, 0.3)",
                                    }}
                                  >
                                    <Video size={14} /> Join Callback Read
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => showToast(`Tape submission confirmed for ${app.roleTitle}`)}
                                    style={{
                                      flex: 1,
                                      background: "rgba(255, 255, 255, 0.08)",
                                      border: "1px solid #2E3340",
                                      color: "#FFFFFF",
                                      padding: "8px 12px",
                                      borderRadius: "8px",
                                      fontSize: "0.78rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    View Submission Details
                                  </button>
                                )}
                              </>
                            )}

                            {app.status === "saved" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApplySaved(app)}
                                  style={{
                                    flex: 1,
                                    background: "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)",
                                    color: "#0D0E12",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    fontSize: "0.78rem",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "5px",
                                    boxShadow: "0 2px 10px rgba(255, 165, 0, 0.3)",
                                  }}
                                >
                                  <span>Submit Self-Tape</span>
                                  <ArrowUpRight size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSaved(app.id, app.roleTitle)}
                                  title="Remove from Saved"
                                  style={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid #2E3340",
                                    color: "#9E9E9E",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}

                            {app.status === "rejected" && (
                              <div style={{ display: "flex", width: "100%", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.72rem", color: "#FFA500", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Sparkles size={11} /> Retained in Talent Roster
                                </span>
                                <button
                                  type="button"
                                  onClick={() => showToast(`Archived record for ${app.roleTitle}`)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "#9E9E9E",
                                    fontSize: "0.74rem",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Archive
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PURE OPPORTUNITIES / CASTINGS BROWSER SECTION         */}
      {/* Otherwise the opportunities page contains opportunities  */}
      {/* ======================================================== */}
      {opportunitiesView === "opportunities" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#34d399",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Explore Castings
                </span>
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                Open Production Castings
              </h2>
              <span style={{ fontSize: "0.82rem", color: "#9E9E9E" }}>
                Filter across acting leads, stunt coordinators, and cinematic department heads
              </span>
            </div>
            <span style={{ fontSize: "0.82rem", color: "#FFA500", fontWeight: 700 }}>
              {filteredCastings.length} Active Production Calls
            </span>
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
                { id: "actor", label: "🎭 Lead Actors" },
                { id: "director of photography", label: "🎥 Cinematographers" },
                { id: "sound", label: "🎧 Sound Designers" },
                { id: "supporting", label: "🎬 Supporting Cast" },
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

          {/* Castings Grid with Full-Width Media Banners */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "20px" }}>
            {filteredCastings.map((casting) => {
              const isSaved = applications.some((a) => a.status === "saved" && a.castingId === casting.id);
              const isApplied = applications.some((a) => a.status === "applied" && a.castingId === casting.id);

              return (
                <div
                  key={casting.id}
                  style={{
                    background: "#1A1C23",
                    border: "1px solid #2E3340",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Banner Image Fill */}
                  <div
                    style={{
                      width: "100%",
                      height: "170px",
                      position: "relative",
                      overflow: "hidden",
                      background: "#08090C",
                    }}
                  >
                    <img
                      src={casting.bannerUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80"}
                      alt={casting.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 40%, rgba(26, 28, 35, 0.95) 100%)",
                      }}
                    />

                    {/* Top Badges */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "12px",
                        right: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          background: "rgba(255, 165, 0, 0.9)",
                          color: "#0D0E12",
                          padding: "3px 9px",
                          borderRadius: "6px",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                        }}
                      >
                        {casting.projectType}
                      </span>
                      {casting.matchScore && (
                        <span
                          style={{
                            background: "rgba(0, 0, 0, 0.75)",
                            backdropFilter: "blur(6px)",
                            border: "1px solid rgba(255, 165, 0, 0.4)",
                            color: "#FFA500",
                            padding: "2px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                          }}
                        >
                          {casting.matchScore}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.74rem", color: "#9E9E9E", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} /> Apply by {casting.deadline}
                      </span>
                      {isApplied ? (
                        <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                          <CheckCircle2 size={12} /> Applied
                        </span>
                      ) : isSaved ? (
                        <span style={{ fontSize: "0.72rem", color: "#38BDF8", fontWeight: 700, display: "flex", alignItems: "center", gap: "3px" }}>
                          <Bookmark size={12} /> In Saved
                        </span>
                      ) : null}
                    </div>

                    <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
                      {casting.title}
                    </h3>
                    <span style={{ fontSize: "0.82rem", color: "#FFA500", fontWeight: 600, display: "block", marginBottom: "10px" }}>
                      {casting.craft} • {casting.productionHouse} {casting.director ? `• Dir. ${casting.director}` : ""}
                    </span>

                    <p style={{ fontSize: "0.84rem", color: "#FFFFFF", lineHeight: 1.5, marginBottom: "14px" }}>
                      {casting.characterDescription}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px", marginTop: "auto" }}>
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

                    <div style={{ display: "flex", gap: "10px" }}>
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
                        <span>{isApplied ? "Submit Additional Tape" : "Apply with Self-Tape"}</span>
                        <ArrowUpRight size={15} />
                      </button>

                      {!isSaved && !isApplied && (
                        <button
                          type="button"
                          onClick={() => {
                            const newSaved: OpportunityApplicationItem = {
                              id: "app-saved-" + Date.now(),
                              status: "saved",
                              roleTitle: casting.characterName || casting.title.split("—")[0].trim(),
                              projectTitle: casting.title,
                              productionHouse: casting.productionHouse,
                              projectType: casting.projectType,
                              director: casting.director,
                              savedDate: "Saved just now",
                              deadline: casting.deadline,
                              stage: "Saved to Watchlist",
                              progressPercent: 0,
                              stageNote: casting.requirements[0] || "Self-tape monologue required",
                              payRange: casting.payRange,
                              location: casting.location,
                              bannerUrl: casting.bannerUrl,
                              matchScore: casting.matchScore,
                              castingId: casting.id,
                            };
                            setApplications((prev) => [newSaved, ...prev]);
                            showToast(`Saved "${casting.title}" to My Applications!`);
                          }}
                          title="Save Application"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid #2E3340",
                            color: "#E2E8F0",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Bookmark size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
