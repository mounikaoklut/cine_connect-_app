"use client";

import React, { useState, useEffect } from "react";
import {
  Film,
  Camera,
  Clapperboard,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Play,
  Share2,
  Edit3,
  MapPin,
  Calendar,
  Languages,
  Award,
  Video,
  Image as ImageIcon,
  FileText,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Search,
  Bell,
  MessageSquare,
  Lock,
  ChevronRight,
  X,
  Phone,
  Mail,
} from "lucide-react";
import { ApiClient, UserProfile, CompletenessData } from "@/lib/api";

export default function UserPortalPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "experience" | "verification">("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");

  // Auth Form State
  const [accountTypeTab, setAccountTypeTab] = useState<"talent" | "production">("talent");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCompanyName, setAuthCompanyName] = useState("");
  const [authPhone, setAuthPhone] = useState("+91 98765 43210");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccessMsg, setAuthSuccessMsg] = useState("");

  // Demo user fallback if backend isn't running yet locally
  const [userData, setUserData] = useState<UserProfile>({
    id: "d3b07384-d113-4a44-9c81-c30089f23d88",
    email: "kabir.mehra@cineconnect.com",
    phone: "+91 98200 12345",
    auth_provider: "email",
    email_verified: true,
    phone_verified: true,
    identity_verified: true,
    profile: {
      name: "Kabir Mehra",
      bio: "Method actor and theater artist with 7+ years of experience across independent cinema, OTT thrillers, and commercial campaigns. Trained at the National School of Drama.",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
      primary_craft: "Actor",
      secondary_crafts: ["Voice Over Artist", "Action / Stunts"],
      city: "Mumbai",
      state: "Maharashtra",
      travel_radius_km: 500,
      completeness_score: 85,
      languages: [
        { lang: "Hindi", fluency: "Native" },
        { lang: "English", fluency: "Fluent" },
        { lang: "Punjabi", fluency: "Conversational" },
      ],
      availability: {
        status: "Available for Shoots",
        note: "Available for feature films and web-series starting November 2026",
      },
    },
    skills: [
      { skill_id: 1, skill_name: "Method Acting", category: "acting", proficiency: "Expert" },
      { skill_id: 2, skill_name: "Dialogue Delivery", category: "acting", proficiency: "Expert" },
      { skill_id: 3, skill_name: "Voice Modulation", category: "acting", proficiency: "Advanced" },
      { skill_id: 4, skill_name: "Action / Stage Stunts", category: "acting", proficiency: "Intermediate" },
      { skill_id: 5, skill_name: "Improvisation", category: "acting", proficiency: "Advanced" },
    ],
    experiences: [
      {
        id: "exp-1",
        title: "Lead Antagonist (Vikram)",
        company: "Dharma Productions / Netflix",
        role_type: "Feature Film",
        start_date: "2024-03-01",
        end_date: "2024-11-15",
        description: "Played the layered antagonist in psychological crime thriller 'Shadow of Verity'. Received praise for intensity in 12-minute unedited monologue scene.",
      },
      {
        id: "exp-2",
        title: "Inspector Samar",
        company: "Excel Entertainment / Prime Video",
        role_type: "Web Series (Season 2)",
        start_date: "2023-01-10",
        end_date: "2023-08-20",
        description: "Series regular across 8 episodes. Trained for 3 months in combat choreography and weapon handling.",
      },
      {
        id: "exp-3",
        title: "Lead Protagonist",
        company: "Prithvi Theatre Mumbai",
        role_type: "Theatre Play",
        start_date: "2021-06-01",
        end_date: "2022-12-15",
        description: "Over 45 live stage performances across Mumbai, Delhi, and Bengaluru theatrical tours.",
      },
    ],
    portfolio: [
      {
        id: "port-1",
        type: "showreel",
        s3_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
        title: "Dramatic Showreel (2025 - 2026)",
        description: "Compilation of intense monologue and dramatic scenes from OTT thriller series.",
        is_public: true,
        sort_order: 0,
      },
      {
        id: "port-2",
        type: "photo",
        s3_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
        title: "Theatrical Headshot (Commercial)",
        description: "Studio portrait by Vikram Bawa photography.",
        is_public: true,
        sort_order: 1,
      },
      {
        id: "port-3",
        type: "photo",
        s3_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        title: "Period Drama Character Look",
        description: "Prosthetics and 1940s vintage styling test for historical series.",
        is_public: true,
        sort_order: 2,
      },
      {
        id: "port-4",
        type: "resume",
        s3_url: "#",
        title: "Kabir_Mehra_Official_Resume_2026.pdf",
        description: "Verified theatrical and film credits with agent contact details.",
        is_public: true,
        sort_order: 3,
      },
    ],
  });

  const [completeness, setCompleteness] = useState<CompletenessData>({
    score: 85,
    max_score: 100,
    suggestions: [
      "Upload a 2-minute voice sample reel to increase score to 92%",
      "Add your willing-to-travel international passport status",
    ],
  });

  // Upload modal state
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortType, setNewPortType] = useState<"photo" | "showreel" | "video" | "resume">("showreel");
  const [newPortDesc, setNewPortDesc] = useState("");
  const [newPortUrl, setNewPortUrl] = useState("");

  // Edit profile state
  const [editName, setEditName] = useState(userData.profile?.name || "");
  const [editBio, setEditBio] = useState(userData.profile?.bio || "");
  const [editCraft, setEditCraft] = useState(userData.profile?.primary_craft || "Actor");
  const [editCity, setEditCity] = useState(userData.profile?.city || "Mumbai");

  // Attempt to load from real backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        const me = await ApiClient.getMe();
        if (me && me.id) {
          setUserData(me);
          const comp = await ApiClient.getCompleteness();
          if (comp) setCompleteness(comp);
        }
      } catch {
        // Fallback to rich demo data when backend is starting or offline
      }
    }
    loadData();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setAuthSuccessMsg("");

    try {
      if (authMode === "register") {
        if (accountTypeTab === "talent") {
          await ApiClient.registerTalent({
            email: authEmail,
            password: authPassword,
            name: authName,
            phone: authPhone,
          });
        } else {
          await ApiClient.registerProduction({
            company_name: authCompanyName,
            email: authEmail,
            phone: authPhone,
            password: authPassword,
          });
        }
        setAuthSuccessMsg("Registration successful! Please sign in with your email and password.");
        setAuthMode("login");
      } else {
        const res = await ApiClient.login({
          email: authEmail,
          password: authPassword,
        });
        setUserData((prev) => ({
          ...prev,
          id: res.user.id,
          email: res.user.email,
          phone: res.user.phone || prev.phone,
          profile: { ...prev.profile, name: res.user.name },
        }));
        setShowAuthModal(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setUserData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: editName,
        bio: editBio,
        primary_craft: editCraft,
        city: editCity,
      },
    }));
    setShowEditModal(false);

    try {
      await ApiClient.updateProfile({
        name: editName,
        bio: editBio,
        primary_craft: editCraft,
        city: editCity,
      });
    } catch {
      // Local state already updated
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: "port-" + Date.now(),
      type: newPortType,
      s3_url: newPortUrl || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80",
      title: newPortTitle || "Showcase Media",
      description: newPortDesc,
      is_public: true,
      sort_order: userData.portfolio.length,
    };

    setUserData((prev) => ({
      ...prev,
      portfolio: [newItem, ...prev.portfolio],
    }));

    setShowUploadModal(false);
    setNewPortTitle("");
    setNewPortDesc("");
    setNewPortUrl("");

    try {
      await ApiClient.addPortfolioItem(newItem);
    } catch {
      // Offline fallback
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    setUserData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((p) => p.id !== id),
    }));
    try {
      await ApiClient.deletePortfolioItem(id);
    } catch {
      // Offline fallback
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "80px" }}>
      {/* ===================== TOP NAVIGATION ===================== */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "rgba(8, 10, 15, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
              }}
            >
              <Clapperboard size={22} color="#000" />
            </div>
            <div>
              <span
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(to right, #fff, #cbd5e1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Cine<span style={{ color: "var(--accent-gold)", WebkitTextFillColor: "var(--accent-gold)" }}>Connect</span>
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Talent Portal
              </span>
            </div>
          </div>

          {/* Center Nav Links */}
          <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("profile")}
              style={{
                background: activeTab === "profile" ? "rgba(245, 158, 11, 0.15)" : "transparent",
                color: activeTab === "profile" ? "var(--accent-gold)" : "var(--text-secondary)",
                border: activeTab === "profile" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid transparent",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab("portfolio")}
              style={{
                background: activeTab === "portfolio" ? "rgba(245, 158, 11, 0.15)" : "transparent",
                color: activeTab === "portfolio" ? "var(--accent-gold)" : "var(--text-secondary)",
                border: activeTab === "portfolio" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid transparent",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Portfolio & Media
            </button>
            <button
              onClick={() => setActiveTab("experience")}
              style={{
                background: activeTab === "experience" ? "rgba(245, 158, 11, 0.15)" : "transparent",
                color: activeTab === "experience" ? "var(--accent-gold)" : "var(--text-secondary)",
                border: activeTab === "experience" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid transparent",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Credits & Timeline
            </button>
            <button
              onClick={() => setActiveTab("verification")}
              style={{
                background: activeTab === "verification" ? "rgba(245, 158, 11, 0.15)" : "transparent",
                color: activeTab === "verification" ? "var(--accent-gold)" : "var(--text-secondary)",
                border: activeTab === "verification" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid transparent",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ID Verification
            </button>
          </nav>

          {/* Right Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Completeness Pill */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#34d399" }}>
                {completeness.score}% Complete
              </span>
            </div>

            <button
              onClick={() => {
                setShowAuthModal(true);
              }}
              className="btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.85rem" }}
            >
              <Lock size={15} /> Switch / Sign In
            </button>

            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: "0.85rem" }}
            >
              <Upload size={16} /> Upload Media
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO PROFILE BANNER ===================== */}
      <section style={{ padding: "36px 0 20px" }}>
        <div className="container">
          <div
            className="glass-panel"
            style={{
              padding: "36px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Ambient Background Glow */}
            <div
              style={{
                position: "absolute",
                top: "-60px",
                right: "-40px",
                width: "280px",
                height: "280px",
                background: "radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "28px",
                position: "relative",
                zIndex: 2,
              }}
            >
              {/* Left Profile Details */}
              <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
                {/* Photo with Glow & Verified Ring */}
                <div style={{ position: "relative" }}>
                  <img
                    src={userData.profile?.photo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"}
                    alt={userData.profile?.name}
                    style={{
                      width: "128px",
                      height: "128px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid var(--accent-gold)",
                      boxShadow: "0 0 25px rgba(245, 158, 11, 0.35)",
                    }}
                  />
                  <div
                    title="Verified Talent Badge"
                    style={{
                      position: "absolute",
                      bottom: "4px",
                      right: "4px",
                      background: "#080a0f",
                      borderRadius: "50%",
                      padding: "2px",
                      display: "flex",
                    }}
                  >
                    <ShieldCheck size={26} color="#fbbf24" fill="#080a0f" />
                  </div>
                </div>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)" }}>
                      {userData.profile?.name}
                    </h1>
                    <span className="badge badge-gold">
                      <Sparkles size={13} /> {userData.profile?.primary_craft}
                    </span>
                    {userData.identity_verified && (
                      <span className="badge badge-emerald">
                        <CheckCircle2 size={13} /> Verified Artist
                      </span>
                    )}
                  </div>

                  {/* Secondary crafts and metadata pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                    {userData.profile?.secondary_crafts?.map((craft, idx) => (
                      <span key={idx} className="badge badge-cyan">
                        {craft}
                      </span>
                    ))}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                      <MapPin size={15} color="var(--accent-gold)" />
                      {userData.profile?.city}, {userData.profile?.state} ({userData.profile?.travel_radius_km}km travel radius)
                    </div>
                  </div>

                  {/* Bio */}
                  <p style={{ color: "var(--text-secondary)", maxWidth: "680px", fontSize: "0.95rem" }}>
                    {userData.profile?.bio}
                  </p>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                <button onClick={() => setShowEditModal(true)} className="btn-primary" style={{ width: "100%" }}>
                  <Edit3 size={16} /> Edit Profile
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert("Public Profile link copied to clipboard!");
                  }}
                  className="btn-secondary"
                  style={{ width: "100%" }}
                >
                  <Share2 size={16} /> Share Portfolio
                </button>
                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.7)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Calendar size={18} color="var(--accent-gold)" />
                  <div style={{ fontSize: "0.8rem" }}>
                    <div style={{ color: "#34d399", fontWeight: 700 }}>
                      ● {userData.profile?.availability?.status}
                    </div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {userData.profile?.availability?.note}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TAB CONTENT AREA ===================== */}
      <main className="container" style={{ marginTop: "24px" }}>
        {/* TAB 1: PROFILE & SKILLS */}
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
            {/* Left: Skills & Craft details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Skills Matrix */}
              <div className="glass-panel" style={{ padding: "28px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                    <Film size={20} color="var(--accent-gold)" /> Skills & Craft Competencies
                  </h2>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    {userData.skills.length} skills listed
                  </span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {userData.skills.map((skill) => (
                    <div
                      key={skill.skill_id}
                      style={{
                        background: "rgba(22, 28, 40, 0.8)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "10px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{skill.skill_name}</span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "var(--radius-full)",
                          background:
                            skill.proficiency === "Expert"
                              ? "rgba(245, 158, 11, 0.2)"
                              : "rgba(99, 102, 241, 0.15)",
                          color: skill.proficiency === "Expert" ? "#fbbf24" : "#a5b4fc",
                        }}
                      >
                        {skill.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages Spoken */}
              <div className="glass-panel" style={{ padding: "28px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Languages size={20} color="var(--accent-gold)" /> Languages & Dialects
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
                  {userData.profile?.languages?.map((lang, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(22, 28, 40, 0.8)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-md)",
                        padding: "12px 18px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "1rem" }}>{lang.lang}</div>
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{lang.fluency}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Profile Completeness & Suggestions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                className="glass-panel"
                style={{
                  padding: "28px",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Award size={22} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Profile Score</h3>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Completeness</span>
                    <span style={{ fontWeight: 700, color: "var(--accent-gold)" }}>{completeness.score}%</span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "var(--radius-full)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${completeness.score}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #f59e0b, #10b981)",
                        borderRadius: "var(--radius-full)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                  Producers search and rank talent profiles with higher completeness and verified video showreels.
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                    AI Recommendations to boost:
                  </div>
                  {completeness.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginBottom: "8px",
                      }}
                    >
                      <ChevronRight size={14} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fast Direct Contact Info */}
              <div className="glass-panel" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "14px" }}>Verified Contacts</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
                    <Mail size={16} color="var(--accent-gold)" /> {userData.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
                    <Phone size={16} color="var(--accent-gold)" /> {userData.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PORTFOLIO & MEDIA */}
        {activeTab === "portfolio" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Showreels & Work Samples</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  High-definition reels, audition clips, production stills, and verified resume
                </p>
              </div>
              <button onClick={() => setShowUploadModal(true)} className="btn-primary">
                <Plus size={16} /> Add Media / Showreel
              </button>
            </div>

            {/* Media Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {userData.portfolio.map((item) => (
                <div key={item.id} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  {/* Media Preview Box */}
                  <div style={{ position: "relative", width: "100%", height: "200px", background: "#05070a" }}>
                    {item.type === "photo" || item.type === "showreel" ? (
                      <img
                        src={item.s3_url}
                        alt={item.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexDirection: "column",
                          gap: "8px",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <FileText size={48} color="var(--accent-gold)" />
                        <span style={{ fontSize: "0.85rem" }}>Document / PDF</span>
                      </div>
                    )}

                    {/* Overlay Type Badge */}
                    <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                      <span className="badge badge-gold">
                        {item.type === "showreel" && <Play size={12} fill="#fbbf24" />}
                        {item.type === "photo" && <ImageIcon size={12} />}
                        {item.type === "resume" && <FileText size={12} />}
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    {/* Quick Delete */}
                    <button
                      onClick={() => handleDeletePortfolio(item.id)}
                      title="Remove media"
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "none",
                        color: "#ef4444",
                        padding: "6px",
                        borderRadius: "50%",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Caption & Metadata */}
                  <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "6px" }}>{item.title}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: "1.4" }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {item.is_public ? "Public on profile" : "Private"}
                      </span>
                      <a
                        href={item.s3_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost"
                        style={{ fontSize: "0.8rem", color: "var(--accent-gold)" }}
                      >
                        View Full <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CREDITS & EXPERIENCE TIMELINE */}
        {activeTab === "experience" && (
          <div className="glass-panel" style={{ padding: "36px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Production Credits & Experience</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  Verified work with studios, OTT platforms, feature films, and theatre houses
                </p>
              </div>
            </div>

            {/* Timeline Tree */}
            <div style={{ position: "relative", paddingLeft: "32px" }}>
              {/* Vertical Glowing Line */}
              <div
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "10px",
                  bottom: "10px",
                  width: "2px",
                  background: "linear-gradient(to bottom, var(--accent-gold), rgba(245, 158, 11, 0.1))",
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {userData.experiences.map((exp) => (
                  <div key={exp.id} style={{ position: "relative" }}>
                    {/* Circle Node */}
                    <div
                      style={{
                        position: "absolute",
                        left: "-31px",
                        top: "4px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "var(--accent-gold)",
                        boxShadow: "0 0 12px var(--accent-gold)",
                        border: "3px solid #080a0f",
                      }}
                    />

                    <div className="glass-card" style={{ padding: "20px 24px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
                        <div>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{exp.title}</h3>
                          <div style={{ color: "var(--accent-gold)", fontWeight: 600, fontSize: "0.95rem" }}>
                            {exp.company}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="badge badge-cyan">{exp.role_type}</span>
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {exp.start_date} – {exp.end_date || "Present"}
                          </span>
                        </div>
                      </div>

                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: IDENTITY VERIFICATION */}
        {activeTab === "verification" && (
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="glass-panel" style={{ padding: "36px" }}>
              <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <ShieldCheck size={32} color="#10b981" />
                </div>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Identity & Government ID Verification</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "540px", margin: "8px auto 0" }}>
                  Verified talent get up to 4x more audition callbacks and a trusted blue badge on CineConnect.
                </p>
              </div>

              {/* Status Box */}
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "28px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 700, color: "#34d399" }}>Aadhaar & Passport Verified</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      Encrypted and protected under India DPDP Act.
                    </div>
                  </div>
                </div>
                <span className="badge badge-emerald">Verified Active</span>
              </div>

              {/* Upload New Document Box */}
              <div
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "40px",
                  textAlign: "center",
                  background: "rgba(16, 20, 30, 0.4)",
                  cursor: "pointer",
                }}
                onClick={() => alert("Government ID upload dialog. In production, uploads are encrypted into a private S3 bucket.")}
              >
                <Upload size={36} color="var(--accent-gold)" style={{ margin: "0 auto 12px" }} />
                <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "6px" }}>Upload / Replace Government ID</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  Supports Passport, Aadhaar, PAN card, or Driver's License (PDF, JPG, PNG up to 25MB)
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================== MODAL: EDIT PROFILE ===================== */}
      {showEditModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="glass-panel" style={{ width: "100%", maxWidth: "560px", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setShowEditModal(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "20px" }}>Edit Profile</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Primary Craft</label>
                <select
                  className="input-field"
                  value={editCraft}
                  onChange={(e) => setEditCraft(e.target.value)}
                >
                  <option value="Actor">Actor</option>
                  <option value="Cinematographer (DOP)">Cinematographer (DOP)</option>
                  <option value="Film Editor">Film Editor</option>
                  <option value="Director">Director</option>
                  <option value="Sound Designer">Sound Designer</option>
                  <option value="Screenwriter">Screenwriter</option>
                  <option value="Playback Singer">Playback Singer</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>City / Location</label>
                <input
                  type="text"
                  className="input-field"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Professional Bio</label>
                <textarea
                  rows={4}
                  className="input-field"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} className="btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: UPLOAD PORTFOLIO ===================== */}
      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="glass-panel" style={{ width: "100%", maxWidth: "560px", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setShowUploadModal(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "20px" }}>Add Portfolio Showreel / Photo</h3>

            <form onSubmit={handleAddPortfolio} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Media Type</label>
                <select
                  className="input-field"
                  value={newPortType}
                  onChange={(e: any) => setNewPortType(e.target.value)}
                >
                  <option value="showreel">Video Showreel</option>
                  <option value="photo">Production Still / Photo</option>
                  <option value="resume">Resume (PDF)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Action Monologue Tape 2026"
                  className="input-field"
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Media URL (or S3 Asset)</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="input-field"
                  value={newPortUrl}
                  onChange={(e) => setNewPortUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Context, director, or production house details..."
                  className="input-field"
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Upload & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: SIGN IN / REGISTER ===================== */}
      {showAuthModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div className="glass-panel" style={{ width: "100%", maxWidth: "460px", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <Clapperboard size={24} color="#000" />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800 }}>
                {authMode === "register"
                  ? accountTypeTab === "talent"
                    ? "Talent Sign Up"
                    : "Production House Sign Up"
                  : "Welcome Back"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                {authMode === "register"
                  ? "Connect film & media talent with top industry opportunities"
                  : "Sign in with your email address and password"}
              </p>
            </div>

            {/* Account Type Toggle on Register Mode */}
            {authMode === "register" && (
              <div
                style={{
                  display: "flex",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "var(--radius-md)",
                  padding: "4px",
                  marginBottom: "16px",
                  gap: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setAccountTypeTab("talent")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: accountTypeTab === "talent" ? "var(--accent-gold)" : "transparent",
                    color: accountTypeTab === "talent" ? "#000" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Talent Account
                </button>
                <button
                  type="button"
                  onClick={() => setAccountTypeTab("production")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    background: accountTypeTab === "production" ? "var(--accent-gold)" : "transparent",
                    color: accountTypeTab === "production" ? "#000" : "var(--text-secondary)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Production House
                </button>
              </div>
            )}

            {authSuccessMsg && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "#86efac",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle2 size={16} /> {authSuccessMsg}
              </div>
            )}

            {authError && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#fca5a5",
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={16} /> {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {authMode === "register" && accountTypeTab === "talent" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Sharma"
                    className="input-field"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              )}

              {authMode === "register" && accountTypeTab === "production" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Production House Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dharma Productions"
                    className="input-field"
                    value={authCompanyName}
                    onChange={(e) => setAuthCompanyName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@cineconnect.com"
                  className="input-field"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              {authMode === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="input-field"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={authLoading} className="btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                {authLoading
                  ? "Authenticating..."
                  : authMode === "register"
                  ? accountTypeTab === "talent"
                    ? "Sign Up as Talent"
                    : "Register Production House"
                  : "Sign In"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {authMode === "register" ? (
                <span>
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setAuthError("");
                      setAuthSuccessMsg("");
                    }}
                    style={{ background: "none", border: "none", color: "var(--accent-gold)", fontWeight: 700, cursor: "pointer" }}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New to CineConnect?{" "}
                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setAuthError("");
                      setAuthSuccessMsg("");
                    }}
                    style={{ background: "none", border: "none", color: "var(--accent-gold)", fontWeight: 700, cursor: "pointer" }}
                  >
                    Create Account
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
