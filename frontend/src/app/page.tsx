"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import LandingPage from "@/components/LandingPage";
import HomePage from "@/components/HomePage";
import ProfilePortal from "@/components/ProfilePortal";
import AuditionModal from "@/components/AuditionModal";
import ShowreelModal from "@/components/ShowreelModal";
import PitchModal from "@/components/PitchModal";
import CreatePostModal from "@/components/CreatePostModal";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import {
  ApiClient,
  UserProfile,
  CompletenessData,
} from "@/lib/api";
import {
  CastingCall,
  TalentItem,
  PitchDeck,
  FeedPost,
  ApplicationPipelineItem,
  OPEN_CASTINGS,
  FEATURED_TALENT,
  PITCH_DECKS,
  HOME_FEED_POSTS,
  MY_APPLICATIONS,
} from "@/lib/mockData";
import { X, Clapperboard, AlertCircle } from "lucide-react";

export default function CineConnectMasterPage() {
  // Master View: Landing Page vs Home Studio Hub vs My Profile
  const [currentView, setCurrentView] = useState<"landing" | "home" | "profile">("landing");

  // Modals state
  const [activeAudition, setActiveAudition] = useState<CastingCall | null>(null);
  const [activeShowreel, setActiveShowreel] = useState<TalentItem | null>(null);
  const [activePitch, setActivePitch] = useState<PitchDeck | null>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auth Modal State
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Feed & Pipeline State
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(HOME_FEED_POSTS);
  const [pipelineItems, setPipelineItems] = useState<ApplicationPipelineItem[]>(MY_APPLICATIONS);

  // Upload Modal State
  const [newPortTitle, setNewPortTitle] = useState("");
  const [newPortType, setNewPortType] = useState<"photo" | "showreel" | "resume">("showreel");
  const [newPortDesc, setNewPortDesc] = useState("");
  const [newPortUrl, setNewPortUrl] = useState("");

  // User Profile
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
      bio: "Method actor and theater artist with 8+ years across independent cinema, OTT thrillers, and commercial campaigns. Trained at the National School of Drama.",
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
        description: "Played the layered antagonist in psychological crime thriller 'Shadow of Verity'. Received praise for intensity in 12-minute monologue scene.",
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
        type: "resume",
        s3_url: "#",
        title: "Kabir_Mehra_Official_Resume_2026.pdf",
        description: "Verified theatrical and film credits with agent contact details.",
        is_public: true,
        sort_order: 2,
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

  // On mount check query parameter or cached user
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "home" || viewParam === "landing" || viewParam === "profile") {
        setCurrentView(viewParam);
      }
    }

    async function loadBackendData() {
      try {
        const me = await ApiClient.getMe();
        if (me && me.id) {
          setUserData(me);
          const comp = await ApiClient.getCompleteness();
          if (comp) setCompleteness(comp);
        }
      } catch {
        // Mock data already populated
      }
    }
    loadBackendData();
  }, []);

  // Update profile
  const handleUpdateProfile = (updated: { name: string; bio: string; primary_craft: string; city: string }) => {
    setUserData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name: updated.name,
        bio: updated.bio,
        primary_craft: updated.primary_craft,
        city: updated.city,
      },
    }));
  };

  // Add portfolio
  const handleAddPortfolio = (e: React.FormEvent) => {
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
  };

  // Delete portfolio
  const handleDeletePortfolio = (id: string) => {
    setUserData((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((p) => p.id !== id),
    }));
  };

  // Like feed post
  const handleToggleLikePost = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  // Post Created
  const handlePostCreated = (post: FeedPost) => {
    setFeedPosts([post, ...feedPosts]);
  };

  // Audition Submitted Success
  const handleAuditionSubmitted = (castingId: string, roleName: string, productionHouse: string) => {
    const newPipelineItem: ApplicationPipelineItem = {
      id: "app-" + Date.now(),
      projectTitle: roleName,
      roleTitle: roleName,
      productionHouse,
      appliedDate: "Just now",
      stage: "Applied",
      progressPercent: 25,
      nextStepNote: "Application received by casting team. Video self-tape under review.",
    };
    setPipelineItems([newPipelineItem, ...pipelineItems]);
  };

  // Auth Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      if (authMode === "register") {
        const res = await ApiClient.register({
          email: authEmail,
          password: authPassword,
          name: authName,
        });
        setUserData((prev) => ({
          ...prev,
          id: res.user.id,
          email: res.user.email,
          profile: { ...prev.profile, name: res.user.name },
        }));
        setShowAuthModal(false);
      } else {
        const res = await ApiClient.login({
          email: authEmail,
          password: authPassword,
        });
        setUserData((prev) => ({
          ...prev,
          id: res.user.id,
          email: res.user.email,
          profile: { ...prev.profile, name: res.user.name },
        }));
        setShowAuthModal(false);
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed. (Running with offline preview session)");
      setTimeout(() => setShowAuthModal(false), 800);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* ===================== UNIFIED NAVIGATION ===================== */}
      <Navigation
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        userData={userData}
        completeness={completeness}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenUploadModal={() => setShowUploadModal(true)}
      />

      {/* ===================== VIEW ROUTER ===================== */}
      {currentView === "landing" && (
        <>
          <LandingPage
            onEnterStudioHub={() => {
              setCurrentView("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onOpenAuditionModal={(c) => setActiveAudition(c)}
            onOpenShowreelModal={(t) => setActiveShowreel(t)}
            onOpenPitchModal={(p) => setActivePitch(p)}
            onOpenAuthModal={() => setShowAuthModal(true)}
          />
          <CurvedWheelNav
            currentActivePath="/home"
            onNavigate={(path) => {
              if (path === "/home") {
                setCurrentView("home");
              } else if (path === "/profile") {
                setCurrentView("profile");
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = path;
              }
            }}
          />
        </>
      )}

      {currentView === "home" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 72px)", background: "#0D0E12" }}>
          <CurvedWheelNav
            currentActivePath="/home"
            onNavigate={(path) => {
              if (path === "/home") {
                setCurrentView("home");
              } else if (path === "/profile") {
                setCurrentView("profile");
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else {
                window.location.href = path;
              }
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <HomePage
              onSwitchToLanding={() => {
                setCurrentView("landing");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onSwitchToProfile={() => {
                setCurrentView("profile");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onOpenAuditionModal={(c) => setActiveAudition(c)}
              onOpenShowreelModal={(t) => setActiveShowreel(t)}
              onOpenPitchModal={(p) => setActivePitch(p)}
              onOpenCreatePost={() => setShowCreatePost(true)}
              feedPosts={feedPosts}
              onToggleLikePost={handleToggleLikePost}
              pipelineItems={pipelineItems}
            />
          </div>
        </div>
      )}

      {currentView === "profile" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 72px)", background: "#0D0E12" }}>
          <CurvedWheelNav
            currentActivePath="/profile"
            onNavigate={(path) => {
              if (path === "/home") {
                setCurrentView("home");
                window.scrollTo({ top: 0, behavior: "smooth" });
              } else if (path === "/profile") {
                setCurrentView("profile");
              } else {
                window.location.href = path;
              }
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <ProfilePortal
              userData={userData}
              completeness={completeness}
              onUpdateProfile={handleUpdateProfile}
              onAddPortfolio={() => {}}
              onDeletePortfolio={handleDeletePortfolio}
              onOpenUploadModal={() => setShowUploadModal(true)}
            />
          </div>
        </div>
      )}

      {/* ===================== MODALS ===================== */}
      <AuditionModal
        casting={activeAudition}
        onClose={() => setActiveAudition(null)}
        onSubmitSuccess={handleAuditionSubmitted}
      />

      <ShowreelModal
        talent={activeShowreel}
        onClose={() => setActiveShowreel(null)}
        onOpenMessage={(talentName) => {
          setActiveShowreel(null);
          setCurrentView("home");
          alert(`Inquiry initiated with ${talentName}. Opened in Studio Messaging.`);
        }}
      />

      <PitchModal
        pitch={activePitch}
        onClose={() => setActivePitch(null)}
      />

      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onPostCreated={handlePostCreated}
          userName={userData.profile?.name || "Kabir Mehra"}
          userCraft={userData.profile?.primary_craft || "Actor"}
        />
      )}

      {/* ===================== MODAL: UPLOAD PORTFOLIO ===================== */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "560px", padding: "32px", position: "relative" }}
          >
            <button
              onClick={() => setShowUploadModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "20px" }}>
              Add Portfolio Showreel / Photo
            </h3>

            <form onSubmit={handleAddPortfolio} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Media Type
                </label>
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Title
                </label>
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
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Media URL (or S3 Asset)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="input-field"
                  value={newPortUrl}
                  onChange={(e) => setNewPortUrl(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>
                  Description
                </label>
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
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "440px", padding: "32px", position: "relative" }}
          >
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
              }}
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
                {authMode === "register" ? "Create Talent Account" : "Welcome Back"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                Connect directly with casting directors and studios
              </p>
            </div>

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
              {authMode === "register" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                    Full Name
                  </label>
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

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@cineconnect.com"
                  className="input-field"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
              >
                {authLoading ? "Authenticating..." : authMode === "register" ? "Sign Up & Build Profile" : "Sign In"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {authMode === "register" ? (
                <span>
                  Already have an account?{" "}
                  <button
                    onClick={() => setAuthMode("login")}
                    style={{ background: "none", border: "none", color: "var(--accent-gold)", fontWeight: 700, cursor: "pointer" }}
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  New to CineConnect?{" "}
                  <button
                    onClick={() => setAuthMode("register")}
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
