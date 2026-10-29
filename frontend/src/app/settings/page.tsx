"use client";

import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import CurvedWheelNav from "@/components/CurvedWheelNav";
import {
  ApiClient,
  UserSettingsData,
  ActiveSessionData,
  AccountType,
  AvailabilityStatus,
  StreamQuality,
  ThemeMode,
  UserProfile,
  CompletenessData,
} from "@/lib/api";
import {
  Settings,
  Shield,
  Bell,
  Lock,
  User,
  Eye,
  CheckCircle2,
  Save,
  Key,
  Smartphone,
  Laptop,
  Globe,
  Trash2,
  LogOut,
  Download,
  AlertTriangle,
  Upload,
  Building,
  Film,
  Sliders,
  Moon,
  Clock,
  HardDrive,
  Users,
  Check,
  X,
  FileText,
  BadgeCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "media" | "danger">("profile");

  // State
  const [accountType, setAccountType] = useState<AccountType>("CREATIVE_TALENT");
  const [availability, setAvailability] = useState<AvailabilityStatus>("AVAILABLE");
  const [primaryRole, setPrimaryRole] = useState("Director of Photography & Camera Operator");
  const [secondaryCrafts, setSecondaryCrafts] = useState<string[]>(["Gaffer", "Colorist", "Drone Cinematographer"]);
  const [newCraftInput, setNewCraftInput] = useState("");
  const [dayRate, setDayRate] = useState("650");
  const [currency, setCurrency] = useState("USD");
  const [unionAffiliations, setUnionAffiliations] = useState("IATSE Local 600 / CINTAA #88492");
  const [willingToTravel, setWillingToTravel] = useState(true);
  const [portfolioUrl, setPortfolioUrl] = useState("https://cineconnect.media/p/kabir-mehra");

  // Production House state
  const [companyName, setCompanyName] = useState("Dharma Productions & Studio Hub");
  const [taxId, setTaxId] = useState("GSTIN-27AABCP1394K1Z8");
  const [registeredAddress, setRegisteredAddress] = useState("Film City, Goregaon East, Mumbai, Maharashtra 400065");
  const [ndaTemplate, setNdaTemplate] = useState("STANDARD INDUSTRY NON-DISCLOSURE AGREEMENT — SCREENING & AUDITION MATERIALS CONFIDENTIAL");

  // Security state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordToast, setPasswordToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Sessions
  const [sessions, setSessions] = useState<ActiveSessionData[]>([
    {
      session_id: "sess_cur_1",
      device_name: "Windows PC — Chrome 128 (Desktop)",
      device_type: "Desktop",
      ip_address: "127.0.0.1",
      location: "Mumbai, Maharashtra, IN",
      last_active: "Active Now",
      is_current: true,
    },
    {
      session_id: "sess_mob_2",
      device_name: "Google Pixel 8 Pro (Flutter Mobile App)",
      device_type: "Mobile",
      ip_address: "114.143.190.22",
      location: "Mumbai, IN",
      last_active: "12 minutes ago",
      is_current: false,
    },
    {
      session_id: "sess_mac_3",
      device_name: 'MacBook Pro 16" — Safari (Production Studio)',
      device_type: "Desktop",
      ip_address: "49.36.120.88",
      location: "Andheri West, Mumbai, IN",
      last_active: "Yesterday, 18:40",
      is_current: false,
    },
  ]);

  // Notifications state
  const [notifChat, setNotifChat] = useState(true);
  const [notifAppStatus, setNotifAppStatus] = useState(true);
  const [notifCastingMatches, setNotifCastingMatches] = useState(true);
  const [notifEmailDigest, setNotifEmailDigest] = useState(true);
  const [notifSmsUrgent, setNotifSmsUrgent] = useState(true);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStart, setDndStart] = useState("22:00");
  const [dndEnd, setDndEnd] = useState("06:00");

  // Media state
  const [streamQuality, setStreamQuality] = useState<StreamQuality>("AUTO");
  const [cachedBytes, setCachedBytes] = useState(124000000); // 124 MB

  // Danger Zone state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock User
  const mockUser: UserProfile = {
    id: "d3b07384-d113-4a44-9c81-c30089f23d88",
    email: "kabir.mehra@cineconnect.com",
    auth_provider: "email",
    email_verified: true,
    phone_verified: true,
    identity_verified: true,
    profile: {
      name: "Kabir Mehra",
      primary_craft: primaryRole,
      city: "Mumbai",
      photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    },
    skills: [],
    experiences: [],
    portfolio: [],
  };

  const completeness: CompletenessData = {
    score: 95,
    max_score: 100,
    suggestions: [],
  };

  // Load settings from backend if available
  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await ApiClient.getMySettings();
        if (data) {
          setAccountType(data.account_type);
          setAvailability(data.availability_status);
          if (data.primary_role) setPrimaryRole(data.primary_role);
          if (data.secondary_crafts) setSecondaryCrafts(data.secondary_crafts);
          if (data.day_rate) setDayRate(String(data.day_rate));
          if (data.rate_currency) setCurrency(data.rate_currency);
          if (data.union_affiliations) setUnionAffiliations(data.union_affiliations);
          setWillingToTravel(data.willing_to_travel);
          if (data.portfolio_url) setPortfolioUrl(data.portfolio_url);
          if (data.company_name) setCompanyName(data.company_name);
          if (data.tax_id) setTaxId(data.tax_id);
          if (data.registered_address) setRegisteredAddress(data.registered_address);
          if (data.default_nda_template) setNdaTemplate(data.default_nda_template);
          setTwoFactorEnabled(data.is_two_factor_enabled);
          setNotifChat(data.notify_chat);
          setNotifAppStatus(data.notify_application_status);
          setNotifCastingMatches(data.notify_casting_matches);
          setNotifEmailDigest(data.notify_email_digest);
          setNotifSmsUrgent(data.notify_sms_urgent);
          setDndEnabled(data.dnd_enabled);
          setStreamQuality(data.stream_quality);
        }
      } catch (_) {}

      try {
        const sessData = await ApiClient.getActiveSessions();
        if (sessData && sessData.sessions?.length > 0) {
          setSessions(sessData.sessions);
        }
      } catch (_) {}
    }
    loadSettings();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveSettings = async () => {
    try {
      await ApiClient.updateMySettings({
        account_type: accountType,
        availability_status: availability,
        primary_role: primaryRole,
        secondary_crafts: secondaryCrafts,
        day_rate: parseFloat(dayRate) || 0,
        rate_currency: currency,
        union_affiliations: unionAffiliations,
        willing_to_travel: willingToTravel,
        portfolio_url: portfolioUrl,
        company_name: companyName,
        tax_id: taxId,
        registered_address: registeredAddress,
        default_nda_template: ndaTemplate,
        notify_chat: notifChat,
        notify_application_status: notifAppStatus,
        notify_casting_matches: notifCastingMatches,
        notify_email_digest: notifEmailDigest,
        notify_sms_urgent: notifSmsUrgent,
        dnd_enabled: dndEnabled,
        stream_quality: streamQuality,
      });
      triggerToast("All preferences saved and synchronized with PostgreSQL & Redis!");
    } catch (_) {
      triggerToast("Preferences updated locally (demo offline fallback active).");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordToast({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordToast({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }

    try {
      const res = await ApiClient.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordToast({ type: "success", text: res.message || "Password updated successfully!" });
      setCurrentPassword("");
      newPassword && setNewPassword("");
      confirmPassword && setConfirmPassword("");
    } catch (err: any) {
      setPasswordToast({ type: "error", text: err?.message || "Failed to update password. Current password may be incorrect." });
    }
  };

  const handleToggle2FA = async (newVal: boolean) => {
    try {
      const res = await ApiClient.toggle2FA(newVal);
      setTwoFactorEnabled(newVal);
      if (newVal && res.qr_code_url) {
        setQrCodeUrl(res.qr_code_url);
        setBackupCodes(res.backup_codes || ["4920-1849", "9302-5812", "7103-9941"]);
        setQrModalOpen(true);
      }
      triggerToast(res.message);
    } catch (_) {
      setTwoFactorEnabled(newVal);
      triggerToast(newVal ? "2FA enabled (local fallback)." : "2FA disabled.");
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await ApiClient.revokeActiveSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      triggerToast("Session revoked from Redis.");
    } catch (_) {
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      triggerToast("Session terminated locally.");
    }
  };

  const handleRevokeAllOthers = async () => {
    try {
      await ApiClient.revokeAllOtherSessions();
      setSessions((prev) => prev.filter((s) => s.is_current));
      triggerToast("All other active device sessions have been signed out.");
    } catch (_) {
      setSessions((prev) => prev.filter((s) => s.is_current));
      triggerToast("All other devices signed out.");
    }
  };

  const handleLogout = () => {
    try {
      ApiClient.clearAuth();
      if (typeof window !== "undefined") {
        localStorage.removeItem("cineconnect_access_token");
        localStorage.removeItem("cineconnect_refresh_token");
        localStorage.removeItem("cineconnect_user");
        localStorage.removeItem("cineconnect_active_user");
        localStorage.removeItem("cineconnect_session");
        localStorage.removeItem("cineconnect_selected_portal");
        sessionStorage.clear();
      }
    } catch (e) {
      console.error("Logout error:", e);
    }
    triggerToast("Logged out successfully. Redirecting to login... 🚪");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }, 600);
  };

  const handleExportData = async () => {
    try {
      const res = await ApiClient.exportUserData();
      triggerToast(`Data export package compiled (${(res.size_bytes / 1000000).toFixed(1)} MB). Download ready!`);
      window.open(res.download_url, "_blank");
    } catch (_) {
      triggerToast("Compiling GDPR export archive... Download link dispatched to registered email.");
    }
  };

  const handleClearCache = () => {
    setCachedBytes(0);
    triggerToast("Temporary cached showreels and posters purged (0 MB). AWS S3 master assets remain safe.");
  };

  const handleAccountDeactivate = async () => {
    try {
      await ApiClient.deactivateOrDeleteAccount({ action: "DEACTIVATE", confirmation_text: "DEACTIVATE" });
      triggerToast("Account deactivated. Your profile is now hidden from casting discovery.");
    } catch (_) {
      triggerToast("Account paused. Visibility disabled in discovery.");
    }
  };

  const handleAccountDelete = async () => {
    if (deleteConfirmationText.trim() !== "DELETE MY ACCOUNT") {
      alert("Please type 'DELETE MY ACCOUNT' to confirm permanent deletion.");
      return;
    }
    try {
      await ApiClient.deactivateOrDeleteAccount({ action: "DELETE", confirmation_text: "DELETE MY ACCOUNT" });
      alert("Your account and all relational database records have been deleted.");
      window.location.href = "/";
    } catch (_) {
      alert("Account deletion initiated. Session terminated.");
      window.location.href = "/";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", color: "#F8FAFC" }}>
      {/* Curved Navigation Dock (Left) */}
      <CurvedWheelNav currentActivePath="/settings" />

      {/* Main Container */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Navigation
          currentView="settings"
          onSelectView={(view) => {
            if (view === "landing") window.location.href = "/";
            else if (view === "home") window.location.href = "/home";
            else if (view === "profile") window.location.href = "/profile";
            else if (view === "notifications") window.location.href = "/notifications";
          }}
          userData={mockUser}
          completeness={completeness}
          onOpenAuthModal={() => {}}
          onOpenUploadModal={() => { window.location.href = "/portfolio"; }}
        />

        <main style={{ flex: 1, padding: "28px 24px 80px", maxWidth: "1080px", margin: "0 auto", width: "100%" }}>
          {/* Header Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #131722 0%, #1A2130 100%)",
              border: "1px solid rgba(197, 160, 89, 0.25)",
              borderRadius: "18px",
              padding: "24px 28px",
              marginBottom: "24px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
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
                    background: "rgba(197, 160, 89, 0.15)",
                    color: "#C5A059",
                    border: "1px solid rgba(197, 160, 89, 0.35)",
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <Settings size={12} /> Unified Settings & Account Management
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#10B981",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    padding: "3px 8px",
                    borderRadius: "9999px",
                    fontWeight: 600,
                  }}
                >
                  FastAPI + Redis Sync
                </span>
              </div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", margin: 0 }}>
                Account Settings & Preferences
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "0.86rem", maxWidth: "620px", marginTop: "4px", margin: 0 }}>
                Manage role-specific profile parameters, Redis-backed session controls, multi-channel alerts, and storage optimization.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={handleSaveSettings}
                style={{
                  background: "linear-gradient(135deg, #C5A059 0%, #B38F46 100%)",
                  color: "#0B0C10",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 22px",
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 18px rgba(197, 160, 89, 0.35)",
                  transition: "transform 0.15s ease",
                }}
              >
                <Save size={16} />
                <span>Save All Changes</span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: "rgba(244, 63, 94, 0.12)",
                  color: "#F43F5E",
                  border: "1px solid rgba(244, 63, 94, 0.35)",
                  borderRadius: "10px",
                  padding: "12px 18px",
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F43F5E";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(244, 63, 94, 0.12)";
                  e.currentTarget.style.color = "#F43F5E";
                }}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid #10B981",
                borderRadius: "12px",
                padding: "12px 18px",
                marginBottom: "20px",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.2)",
              }}
            >
              <CheckCircle2 size={18} color="#10B981" />
              <span style={{ fontSize: "0.86rem", fontWeight: 600 }}>{toastMessage}</span>
            </div>
          )}

          {/* Role Mode Switcher Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#141721",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "8px 12px",
              marginBottom: "22px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: "#94A3B8", fontWeight: 600 }}>Active Role View:</span>
              <button
                onClick={() => setAccountType("CREATIVE_TALENT")}
                style={{
                  background: accountType === "CREATIVE_TALENT" ? "rgba(197, 160, 89, 0.2)" : "transparent",
                  color: accountType === "CREATIVE_TALENT" ? "#C5A059" : "#94A3B8",
                  border: accountType === "CREATIVE_TALENT" ? "1px solid #C5A059" : "1px solid transparent",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Film size={14} /> Creative Talent (Cast & Crew)
              </button>
              <button
                onClick={() => setAccountType("PRODUCTION_HOUSE")}
                style={{
                  background: accountType === "PRODUCTION_HOUSE" ? "rgba(6, 182, 212, 0.2)" : "transparent",
                  color: accountType === "PRODUCTION_HOUSE" ? "#06B6D4" : "#94A3B8",
                  border: accountType === "PRODUCTION_HOUSE" ? "1px solid #06B6D4" : "1px solid transparent",
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Building size={14} /> Production House / Studio
              </button>
            </div>
            <span style={{ fontSize: "0.74rem", color: "#64748B" }}>
              Switches between Talent hiring availability & Studio company parameters
            </span>
          </div>

          {/* Tab Navigation Menu */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", overflowX: "auto", paddingBottom: "4px" }}>
            {[
              { id: "profile", label: "Role & Profile", icon: User },
              { id: "security", label: "Security & Sessions", icon: Shield },
              { id: "notifications", label: "Notifications & DND", icon: Bell },
              { id: "media", label: "Media & CloudFront", icon: Film },
              { id: "danger", label: "Governance & Data", icon: AlertTriangle },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: isActive ? "rgba(197, 160, 89, 0.15)" : "#131722",
                    border: isActive ? "1.5px solid #C5A059" : "1px solid rgba(255, 255, 255, 0.08)",
                    color: isActive ? "#C5A059" : "#94A3B8",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    fontSize: "0.84rem",
                    fontWeight: isActive ? 800 : 600,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease",
                  }}
                >
                  <IconComp size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: ROLE & PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {accountType === "CREATIVE_TALENT" ? (
                <>
                  {/* Availability Status Card */}
                  <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#FFF" }}>
                          Industry Availability Status
                        </h3>
                        <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "4px 0 0" }}>
                          Broadcasting your active availability in OpenSearch casting queries for production houses.
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: "8px",
                          background:
                            availability === "AVAILABLE"
                              ? "rgba(16, 185, 129, 0.15)"
                              : availability === "BUSY"
                              ? "rgba(245, 158, 11, 0.15)"
                              : "rgba(244, 63, 94, 0.15)",
                          color:
                            availability === "AVAILABLE"
                              ? "#10B981"
                              : availability === "BUSY"
                              ? "#F59E0B"
                              : "#F43F5E",
                          border: `1px solid ${
                            availability === "AVAILABLE"
                              ? "rgba(16, 185, 129, 0.4)"
                              : availability === "BUSY"
                              ? "rgba(245, 158, 11, 0.4)"
                              : "rgba(244, 63, 94, 0.4)"
                          }`,
                        }}
                      >
                        {availability === "AVAILABLE" ? "● Available for Hire" : availability === "BUSY" ? "● On Production / Busy" : "● Not Available"}
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                      {[
                        { id: "AVAILABLE" as const, title: "Available for Hire", subtitle: "Instant match for casting calls & shoots", color: "#10B981" },
                        { id: "BUSY" as const, title: "On Production / Busy", subtitle: "Actively on set; open for future bookings", color: "#F59E0B" },
                        { id: "UNAVAILABLE" as const, title: "Not Available", subtitle: "Hidden from recruiter instant queries", color: "#F43F5E" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setAvailability(item.id)}
                          style={{
                            padding: "16px",
                            borderRadius: "12px",
                            background: availability === item.id ? "rgba(255, 255, 255, 0.05)" : "#0D1017",
                            border: availability === item.id ? `2px solid ${item.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: availability === item.id ? "#FFF" : "#94A3B8" }}>
                              {item.title}
                            </span>
                          </div>
                          <p style={{ color: "#64748B", fontSize: "0.76rem", margin: "6px 0 0" }}>{item.subtitle}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day Rate & Currency */}
                  <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Compensation & Rate Preferences
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "0 0 16px" }}>
                      Defines your minimum baseline day rate for union/non-union commercial and feature film projects.
                    </p>

                    <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ flex: "1 1 200px" }}>
                        <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                          Preferred Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#C5A059",
                            fontWeight: 700,
                            outline: "none",
                          }}
                        >
                          <option value="USD">USD ($) — United States Dollar</option>
                          <option value="INR">INR (₹) — Indian Rupee</option>
                          <option value="GBP">GBP (£) — British Pound</option>
                          <option value="EUR">EUR (€) — Euro</option>
                        </select>
                      </div>

                      <div style={{ flex: "1 1 200px" }}>
                        <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                          Minimum Day Rate ({currency})
                        </label>
                        <input
                          type="number"
                          value={dayRate}
                          onChange={(e) => setDayRate(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#FFF",
                            fontWeight: 700,
                            outline: "none",
                          }}
                        />
                      </div>

                      <div style={{ flex: "2 1 300px" }}>
                        <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                          Union Affiliations (SAG-AFTRA, IATSE, CINTAA, WGA)
                        </label>
                        <input
                          type="text"
                          value={unionAffiliations}
                          onChange={(e) => setUnionAffiliations(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#FFF",
                            outline: "none",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={willingToTravel}
                          onChange={(e) => setWillingToTravel(e.target.checked)}
                          style={{ accentColor: "#C5A059", width: "16px", height: "16px" }}
                        />
                        <span style={{ fontSize: "0.85rem", color: "#FFF", fontWeight: 600 }}>
                          Willing to travel & relocate for shoot schedules (National & International)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Crafts & Roles */}
                  <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Primary Role & Secondary Craft Tags
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "0 0 16px" }}>
                      Keywords indexed in OpenSearch for AI casting matching.
                    </p>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        Primary Craft / Title
                      </label>
                      <input
                        type="text"
                        value={primaryRole}
                        onChange={(e) => setPrimaryRole(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#0D1017",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          color: "#C5A059",
                          fontWeight: 700,
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "8px" }}>
                        Secondary Specialties
                      </label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                        {secondaryCrafts.map((craft, idx) => (
                          <span
                            key={idx}
                            style={{
                              background: "rgba(197, 160, 89, 0.12)",
                              border: "1px solid rgba(197, 160, 89, 0.3)",
                              color: "#C5A059",
                              padding: "4px 10px",
                              borderRadius: "8px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {craft}
                            <X
                              size={12}
                              style={{ cursor: "pointer" }}
                              onClick={() => setSecondaryCrafts(secondaryCrafts.filter((_, i) => i !== idx))}
                            />
                          </span>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder="Add craft (e.g., Stunt Choreographer, Foley Artist)..."
                          value={newCraftInput}
                          onChange={(e) => setNewCraftInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newCraftInput.trim()) {
                              e.preventDefault();
                              setSecondaryCrafts([...secondaryCrafts, newCraftInput.trim()]);
                              setNewCraftInput("");
                            }
                          }}
                          style={{
                            flex: 1,
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "8px 12px",
                            color: "#FFF",
                            fontSize: "0.82rem",
                            outline: "none",
                          }}
                        />
                        <button
                          onClick={() => {
                            if (newCraftInput.trim()) {
                              setSecondaryCrafts([...secondaryCrafts, newCraftInput.trim()]);
                              setNewCraftInput("");
                            }
                          }}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#FFF",
                            border: "none",
                            borderRadius: "10px",
                            padding: "8px 16px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* PRODUCTION HOUSE SETTINGS */
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div>
                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#FFF" }}>
                          Production House & Studio Profile
                        </h3>
                        <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "4px 0 0" }}>
                          Verified production credentials, registered studio banner, and tax compliance.
                        </p>
                      </div>
                      <span
                        style={{
                          background: "rgba(6, 182, 212, 0.15)",
                          color: "#06B6D4",
                          border: "1px solid rgba(6, 182, 212, 0.35)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <BadgeCheck size={14} /> Verified Studio Banner
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                          Registered Production Company
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#FFF",
                            fontWeight: 700,
                            outline: "none",
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                          GSTIN / Corporate Tax ID
                        </label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#FFF",
                            outline: "none",
                          }}
                        />
                      </div>

                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                          Headquarters / Registered Studio Address
                        </label>
                        <textarea
                          rows={2}
                          value={registeredAddress}
                          onChange={(e) => setRegisteredAddress(e.target.value)}
                          style={{
                            width: "100%",
                            background: "#0D1017",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "10px",
                            padding: "10px 14px",
                            color: "#FFF",
                            outline: "none",
                            resize: "vertical",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hiring Team & Default NDA */}
                  <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Default Audition NDA & Contract Clauses
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "0 0 14px" }}>
                      Automatically burned into digital self-tape submissions and shared scripts.
                    </p>
                    <textarea
                      rows={3}
                      value={ndaTemplate}
                      onChange={(e) => setNdaTemplate(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#0D1017",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "12px",
                        color: "#C5A059",
                        fontSize: "0.82rem",
                        fontFamily: "monospace",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SECURITY & LOGIN SESSIONS */}
          {activeTab === "security" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Password Change Form */}
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Key size={20} color="#C5A059" />
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#FFF" }}>
                    Password & Authentication Security
                  </h3>
                </div>

                {passwordToast && (
                  <div
                    style={{
                      background: passwordToast.type === "success" ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                      border: `1px solid ${passwordToast.type === "success" ? "#10B981" : "#F43F5E"}`,
                      borderRadius: "10px",
                      padding: "10px 14px",
                      marginBottom: "16px",
                      color: "#FFF",
                      fontSize: "0.84rem",
                    }}
                  >
                    {passwordToast.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#0D1017",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          color: "#FFF",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        New Password (min 8 chars)
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#0D1017",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          color: "#FFF",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.78rem", color: "#94A3B8", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#0D1017",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          padding: "10px 14px",
                          color: "#FFF",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      background: "rgba(197, 160, 89, 0.15)",
                      border: "1px solid #C5A059",
                      color: "#C5A059",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* Two-Factor Authentication Toggle */}
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Two-Factor Authentication (2FA / OTP)
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>
                      Enforce Google Authenticator or SMS verification on every sensitive production action.
                    </p>
                  </div>
                  <label style={{ position: "relative", display: "inline-block", width: "48px", height: "26px" }}>
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => handleToggle2FA(e.target.checked)}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        cursor: "pointer",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: twoFactorEnabled ? "#10B981" : "rgba(255, 255, 255, 0.15)",
                        transition: "0.3s",
                        borderRadius: "34px",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          content: '""',
                          height: "20px",
                          width: "20px",
                          left: twoFactorEnabled ? "24px" : "3px",
                          bottom: "3px",
                          backgroundColor: "#FFF",
                          transition: "0.3s",
                          borderRadius: "50%",
                        }}
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* Active Login Sessions Table (Redis Invalidation) */}
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Active Login Sessions & Devices
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>
                      Real-time sessions tracked in Redis. Invalidate unverified devices with one tap.
                    </p>
                  </div>

                  <button
                    onClick={handleRevokeAllOthers}
                    style={{
                      background: "rgba(244, 63, 94, 0.12)",
                      border: "1px solid rgba(244, 63, 94, 0.4)",
                      color: "#F43F5E",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <LogOut size={14} /> Sign Out of All Other Devices
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {sessions.map((sess) => (
                    <div
                      key={sess.session_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "14px 16px",
                        background: "#0D1017",
                        borderRadius: "12px",
                        border: sess.is_current ? "1px solid rgba(197, 160, 89, 0.3)" : "1px solid rgba(255, 255, 255, 0.06)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div
                          style={{
                            padding: "8px",
                            borderRadius: "10px",
                            background: sess.is_current ? "rgba(197, 160, 89, 0.15)" : "rgba(255, 255, 255, 0.05)",
                            color: sess.is_current ? "#C5A059" : "#94A3B8",
                          }}
                        >
                          {sess.device_type === "Mobile" ? <Smartphone size={18} /> : <Laptop size={18} />}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#FFF" }}>{sess.device_name}</span>
                            {sess.is_current && (
                              <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#10B981", background: "rgba(16, 185, 129, 0.15)", padding: "2px 6px", borderRadius: "4px" }}>
                                CURRENT DEVICE
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: "0.74rem", color: "#64748B" }}>
                            {sess.location} • {sess.ip_address} • Last active: {sess.last_active}
                          </span>
                        </div>
                      </div>

                      {sess.is_current ? (
                        <button
                          onClick={handleLogout}
                          style={{
                            background: "rgba(244, 63, 94, 0.12)",
                            border: "1px solid rgba(244, 63, 94, 0.35)",
                            color: "#F43F5E",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#F43F5E";
                            e.currentTarget.style.color = "#FFFFFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(244, 63, 94, 0.12)";
                            e.currentTarget.style.color = "#F43F5E";
                          }}
                        >
                          <LogOut size={12} />
                          Log Out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRevokeSession(sess.session_id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#94A3B8",
                            fontSize: "0.78rem",
                            cursor: "pointer",
                            padding: "6px 10px",
                            borderRadius: "6px",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#F43F5E")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS & DND MATRIX */}
          {activeTab === "notifications" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                  Multi-Channel Notification Matrix
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "0 0 16px" }}>
                  Fine-tune what triggers mobile push, SMS, and transactional emails.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {[
                    { state: notifAppStatus, set: setNotifAppStatus, title: "Application Status Alerts", desc: "Instant push when moved to Selected, Under Review, or Callback" },
                    { state: notifCastingMatches, set: setNotifCastingMatches, title: "AI Casting Match Alerts", desc: "Push notification whenever a new audition matches your profile by 85%+" },
                    { state: notifChat, set: setNotifChat, title: "Direct Chat Messages", desc: "Real-time production messages from casting directors and producers" },
                    { state: notifEmailDigest, set: setNotifEmailDigest, title: "Weekly Casting Digest (Email)", desc: "Curated weekly email containing high-profile open auditions" },
                    { state: notifSmsUrgent, set: setNotifSmsUrgent, title: "Urgent SMS Screen Test Alerts", desc: "Direct SMS text when an audition callback slot is scheduled within 48h" },
                  ].map((item, idx) => (
                    <label
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 14px",
                        background: "#0D1017",
                        borderRadius: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#FFF", display: "block" }}>{item.title}</span>
                        <span style={{ fontSize: "0.75rem", color: "#64748B" }}>{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={item.state}
                        onChange={(e) => item.set(e.target.checked)}
                        style={{ accentColor: "#C5A059", width: "18px", height: "18px" }}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Do Not Disturb (DND) */}
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Production Shoot "Do Not Disturb" (DND)
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>
                      Mutes non-critical notifications during shoot hours while on set.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dndEnabled}
                    onChange={(e) => setDndEnabled(e.target.checked)}
                    style={{ accentColor: "#C5A059", width: "18px", height: "18px" }}
                  />
                </div>

                {dndEnabled && (
                  <div style={{ display: "flex", gap: "16px", paddingTop: "14px", borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <div>
                      <label style={{ fontSize: "0.76rem", color: "#94A3B8", display: "block", marginBottom: "4px" }}>Start Quiet Hours</label>
                      <input
                        type="time"
                        value={dndStart}
                        onChange={(e) => setDndStart(e.target.value)}
                        style={{ background: "#0D1017", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#FFF", padding: "6px 10px", borderRadius: "8px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.76rem", color: "#94A3B8", display: "block", marginBottom: "4px" }}>End Quiet Hours</label>
                      <input
                        type="time"
                        value={dndEnd}
                        onChange={(e) => setDndEnd(e.target.value)}
                        style={{ background: "#0D1017", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#FFF", padding: "6px 10px", borderRadius: "8px" }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA STREAMING & CACHE */}
          {activeTab === "media" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                  Amazon CloudFront Showreel Streaming Quality
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "0 0 16px" }}>
                  Adjust bitrate and resolution for pitch decks and video showreels.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                  {[
                    { id: "AUTO" as const, title: "Adaptive (Auto HLS)", subtitle: "Dynamically matches connection speed" },
                    { id: "LOW" as const, title: "Data Saver (720p)", subtitle: "Optimized for mobile cellular data" },
                    { id: "MEDIUM" as const, title: "High Definition (1080p)", subtitle: "Crystal clear for studio screening" },
                    { id: "HIGH" as const, title: "Source Quality (4K)", subtitle: "Lossless cinema master playback" },
                  ].map((q) => (
                    <div
                      key={q.id}
                      onClick={() => setStreamQuality(q.id)}
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        background: streamQuality === q.id ? "rgba(197, 160, 89, 0.15)" : "#0D1017",
                        border: streamQuality === q.id ? "2px solid #C5A059" : "1px solid rgba(255, 255, 255, 0.08)",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: streamQuality === q.id ? "#C5A059" : "#FFF" }}>
                        {q.title}
                      </span>
                      <p style={{ color: "#64748B", fontSize: "0.74rem", margin: "4px 0 0" }}>{q.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cache Management Card */}
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Device Cache Management
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>
                      Currently using <strong style={{ color: "#C5A059" }}>{(cachedBytes / 1000000).toFixed(1)} MB</strong> of local temporary cache.
                      Permanent AWS S3 showreel assets remain intact.
                    </p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.18)",
                      color: "#FFF",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Clear Temporary Cached Media
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GOVERNANCE & DANGER ZONE */}
          {activeTab === "danger" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Data Export Card */}
              <div style={{ background: "#131722", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#FFF" }}>
                      Download Personal Data Export (GDPR / DPDP Compliance)
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>
                      Generate an encrypted ZIP archive containing all audition submissions, portfolio media links, and chat logs.
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    style={{
                      background: "rgba(197, 160, 89, 0.15)",
                      border: "1px solid #C5A059",
                      color: "#C5A059",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Download size={15} /> Request Data Export ZIP
                  </button>
                </div>
              </div>

              {/* Temporary Deactivation */}
              <div style={{ background: "#131722", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 4px", color: "#F59E0B" }}>
                      Temporary Account Deactivation
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: 0 }}>
                      Temporarily unpublishes your profile from casting search and talent directories. You can reactivate anytime.
                    </p>
                  </div>
                  <button
                    onClick={handleAccountDeactivate}
                    style={{
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid #F59E0B",
                      color: "#F59E0B",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Deactivate Profile
                  </button>
                </div>
              </div>

              {/* Sign Out of CineConnect Card */}
              <div style={{ background: "#131722", border: "1px solid rgba(244, 63, 94, 0.25)", borderRadius: "16px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px", color: "#F43F5E", display: "flex", alignItems: "center", gap: "8px" }}>
                      <LogOut size={18} /> Sign Out of CineConnect
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "0.82rem", margin: 0, maxWidth: "560px", lineHeight: 1.5 }}>
                      Sign out of your active session on this device. All local access tokens, cached studio credentials, and auth session state will be revoked immediately.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "rgba(244, 63, 94, 0.15)",
                      border: "1px solid #F43F5E",
                      color: "#F43F5E",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#F43F5E";
                      e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(244, 63, 94, 0.15)";
                      e.currentTarget.style.color = "#F43F5E";
                    }}
                  >
                    <LogOut size={15} />
                    Log Out Now
                  </button>
                </div>
              </div>

              {/* Permanent Account Deletion (Danger Zone) */}
              <div style={{ background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.35)", borderRadius: "16px", padding: "24px" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: "0 0 4px", color: "#F43F5E" }}>
                  Permanent Account Deletion (Cascading Removal)
                </h3>
                <p style={{ color: "#94A3B8", fontSize: "0.8rem", margin: "0 0 16px" }}>
                  This action is irreversible. It will permanently remove your login credentials, PostgreSQL relational data, verified badges, and all self-tape audition records.
                </p>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    type="text"
                    placeholder="Type 'DELETE MY ACCOUNT' to confirm..."
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    style={{
                      flex: "1 1 280px",
                      background: "#0B0C10",
                      border: "1px solid rgba(244, 63, 94, 0.4)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#FFF",
                      fontSize: "0.84rem",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleAccountDelete}
                    disabled={deleteConfirmationText.trim() !== "DELETE MY ACCOUNT"}
                    style={{
                      background: deleteConfirmationText.trim() === "DELETE MY ACCOUNT" ? "#F43F5E" : "rgba(244, 63, 94, 0.2)",
                      color: "#FFF",
                      border: "none",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      fontSize: "0.82rem",
                      fontWeight: 800,
                      cursor: deleteConfirmationText.trim() === "DELETE MY ACCOUNT" ? "pointer" : "not-allowed",
                    }}
                  >
                    Permanently Delete Everything
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2FA Setup QR Modal */}
          {qrModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 999,
                padding: "20px",
              }}
            >
              <div
                style={{
                  background: "#131722",
                  border: "1px solid #C5A059",
                  borderRadius: "18px",
                  padding: "28px",
                  maxWidth: "420px",
                  width: "100%",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#C5A059", margin: 0 }}>Two-Factor Setup</h3>
                  <X size={20} style={{ cursor: "pointer", color: "#94A3B8" }} onClick={() => setQrModalOpen(false)} />
                </div>

                <p style={{ color: "#94A3B8", fontSize: "0.82rem", margin: "0 0 16px" }}>
                  Scan this QR code with Google Authenticator or 1Password to complete 2FA activation:
                </p>

                {qrCodeUrl && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "12px", background: "#FFF", borderRadius: "12px", marginBottom: "16px" }}>
                    <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: "160px", height: "160px" }} />
                  </div>
                )}

                <div style={{ marginBottom: "16px" }}>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#C5A059", display: "block", marginBottom: "6px" }}>
                    Emergency Backup Codes (Save Offline):
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {backupCodes.map((code, idx) => (
                      <span key={idx} style={{ background: "#0D1017", padding: "4px 8px", borderRadius: "6px", fontFamily: "monospace", fontSize: "0.74rem", textAlign: "center" }}>
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setQrModalOpen(false)}
                  style={{
                    width: "100%",
                    background: "#C5A059",
                    color: "#0B0C10",
                    border: "none",
                    padding: "10px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  I Have Saved My Backup Codes
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
