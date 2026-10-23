"use client";

import React, { useState } from "react";
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
  Phone,
  Mail,
  ChevronRight,
  X,
} from "lucide-react";
import { UserProfile, CompletenessData } from "@/lib/api";

interface ProfilePortalProps {
  userData: UserProfile;
  completeness: CompletenessData;
  onUpdateProfile: (updated: { name: string; bio: string; primary_craft: string; city: string }) => void;
  onAddPortfolio: (item: any) => void;
  onDeletePortfolio: (id: string) => void;
  onOpenUploadModal: () => void;
}

export default function ProfilePortal({
  userData,
  completeness,
  onUpdateProfile,
  onAddPortfolio,
  onDeletePortfolio,
  onOpenUploadModal,
}: ProfilePortalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "portfolio" | "experience" | "verification">("profile");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(userData.profile?.name || "");
  const [editBio, setEditBio] = useState(userData.profile?.bio || "");
  const [editCraft, setEditCraft] = useState(userData.profile?.primary_craft || "Actor");
  const [editCity, setEditCity] = useState(userData.profile?.city || "Mumbai");

  const handleSaveProfile = () => {
    onUpdateProfile({
      name: editName,
      bio: editBio,
      primary_craft: editCraft,
      city: editCity,
    });
    setShowEditModal(false);
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      {/* Sub Tabs */}
      <div
        style={{
          borderBottom: "1px solid var(--border-subtle)",
          background: "rgba(10, 14, 22, 0.95)",
          backdropFilter: "blur(16px)",
          position: "sticky",
          top: "72px",
          zIndex: 30,
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {[
              { id: "profile" as const, label: "My Profile & Skills" },
              { id: "portfolio" as const, label: "Portfolio & Showreels" },
              { id: "experience" as const, label: "Credits & Timeline" },
              { id: "verification" as const, label: "ID Verification" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? "rgba(245, 158, 11, 0.15)" : "transparent",
                  color: activeTab === tab.id ? "var(--accent-gold)" : "var(--text-secondary)",
                  border: activeTab === tab.id ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid transparent",
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button onClick={onOpenUploadModal} className="btn-primary" style={{ padding: "8px 18px", fontSize: "0.85rem" }}>
              <Upload size={15} /> Upload Media
            </button>
          </div>
        </div>
      </div>

      {/* Hero Profile Banner */}
      <section style={{ padding: "36px 0 20px" }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: "36px", position: "relative", overflow: "hidden" }}>
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
              <div style={{ display: "flex", gap: "28px", alignItems: "center", flexWrap: "wrap" }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
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

                  <p style={{ color: "var(--text-secondary)", maxWidth: "680px", fontSize: "0.95rem" }}>
                    {userData.profile?.bio}
                  </p>
                </div>
              </div>

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

      {/* Main Tab Content */}
      <main className="container" style={{ marginTop: "24px" }}>
        {activeTab === "profile" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
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

              {/* Languages */}
              <div className="glass-panel" style={{ padding: "28px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Languages size={20} color="var(--accent-gold)" /> Languages & Dialects
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
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

            {/* Right: Score and Recommendations */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="glass-panel" style={{ padding: "28px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Award size={22} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Profile Score</h3>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Completeness</span>
                    <span style={{ fontWeight: 700, color: "var(--accent-gold)" }}>{completeness.score}%</span>
                  </div>
                  <div style={{ height: "8px", background: "rgba(255, 255, 255, 0.1)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                    <div style={{ width: `${completeness.score}%`, height: "100%", background: "linear-gradient(90deg, #f59e0b, #10b981)", borderRadius: "var(--radius-full)" }} />
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "10px" }}>
                    AI Recommendations to boost:
                  </div>
                  {completeness.suggestions.map((sug, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "8px" }}>
                      <ChevronRight size={14} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>

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

        {/* Tab 2: Portfolio */}
        {activeTab === "portfolio" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Showreels & Work Samples</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                  High-definition reels, audition clips, production stills, and verified resume
                </p>
              </div>
              <button onClick={onOpenUploadModal} className="btn-primary">
                <Plus size={16} /> Add Media / Showreel
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
              {userData.portfolio.map((item) => (
                <div key={item.id} className="glass-card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", width: "100%", height: "200px", background: "#05070a" }}>
                    {item.type === "photo" || item.type === "showreel" ? (
                      <img src={item.s3_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", color: "var(--text-secondary)" }}>
                        <FileText size={48} color="var(--accent-gold)" />
                        <span style={{ fontSize: "0.85rem" }}>Document / PDF</span>
                      </div>
                    )}

                    <div style={{ position: "absolute", top: "12px", left: "12px" }}>
                      <span className="badge badge-gold">
                        {item.type === "showreel" && <Play size={12} fill="#fbbf24" />}
                        {item.type === "photo" && <ImageIcon size={12} />}
                        {item.type === "resume" && <FileText size={12} />}
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeletePortfolio(item.id)}
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

        {/* Tab 3: Experience */}
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

            <div style={{ position: "relative", paddingLeft: "32px" }}>
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

        {/* Tab 4: ID Verification */}
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
                  flexWrap: "wrap",
                  gap: "12px",
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

              <div
                style={{
                  border: "2px dashed var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "40px",
                  textAlign: "center",
                  background: "rgba(16, 20, 30, 0.4)",
                  cursor: "pointer",
                }}
                onClick={() => alert("Government ID upload dialog. In production, documents are encrypted into a private S3 vault.")}
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

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", padding: "32px", position: "relative" }}>
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
    </div>
  );
}
