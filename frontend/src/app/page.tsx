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

  const handleSelectPortal = (portal: "talent" | "production", mode: "login" | "signup" = "login") => {
    setSelectedPortal(portal);
    setCurrentView(mode);
  };

  return (
    <>
      {/* ===================== REALISTIC PHONE-SIZED APPLICATION VIEWPORT ===================== */}
      {/* On desktop browsers: phone frame preview with status bar, notch, and dark backdrop */}
      {/* On actual mobile devices: clean responsive full-bleed display without nested frames */}
      <PhoneFrame>
        {currentView === "landing" ? (
          /* =============================================================== */
          /* LANDING PAGE (WELCOME & PORTAL SELECTION)                        */
          /* =============================================================== */
          <LandingScreen
            onSelectPortal={handleSelectPortal}
            onLogin={() => setCurrentView("login")}
            onOpenTerms={handleOpenTerms}
          />
        ) : (
          /* =============================================================== */
          /* AUTHENTICATION (TALENT / PRODUCTION LOGIN & SIGNUP)             */
          /* =============================================================== */
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <ClapperboardAuthCard
              initialScreen={currentView}
              onBack={() => setCurrentView("landing")}
              onSuccess={() => {
                // Post-login destination left unimplemented; teammates are developing post-login pages separately
              }}
              onOpenTerms={handleOpenTerms}
            />
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
