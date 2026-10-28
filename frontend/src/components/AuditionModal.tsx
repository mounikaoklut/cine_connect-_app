"use client";

import React, { useState } from "react";
import { X, Clapperboard, Calendar, MapPin, DollarSign, Clock, ShieldCheck, CheckCircle2, Upload, AlertCircle, FileText } from "lucide-react";
import { CastingCall } from "@/lib/mockData";

interface AuditionModalProps {
  casting: CastingCall | null;
  onClose: () => void;
  onSubmitSuccess?: (castingId: string, roleName: string, productionHouse: string) => void;
}

export default function AuditionModal({ casting, onClose, onSubmitSuccess }: AuditionModalProps) {
  const [selectedHeadshot, setSelectedHeadshot] = useState<string>("headshot-1");
  const [selfTapeUrl, setSelfTapeUrl] = useState<string>("https://cineconnect.media/tapes/kabir_dramatic_monologue_2026.mp4");
  const [coverNote, setCoverNote] = useState<string>("I have read the character breakdown for Vikram and deeply connect with the psychological tension between his loyalty and ambition. Attached is my monologue tape in Hindustani dialect.");
  const [agreedToDates, setAgreedToDates] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!casting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onSubmitSuccess?.(casting.id, casting.characterName || casting.title, casting.productionHouse);
        onClose();
      }, 1500);
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "780px",
          position: "relative",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          background: "#0c1017",
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, rgba(245, 158, 11, 0.08), transparent)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clapperboard size={20} color="#000" />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="badge badge-gold">{casting.projectType}</span>
                {casting.isUrgent && (
                  <span className="badge badge-rose" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span className="live-dot" /> URGENT AUDITION
                  </span>
                )}
                {casting.matchScore && (
                  <span className="badge badge-emerald">
                    ⚡ {casting.matchScore}% Match for Kabir
                  </span>
                )}
              </div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginTop: "4px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {casting.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              color: "var(--text-secondary)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.2)",
                color: "var(--accent-emerald)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
              Audition Application Submitted!
            </h3>
            <p style={{ color: "var(--text-secondary)", maxWidth: "460px", margin: "0 auto 16px" }}>
              Your verified headshots, self-tape, and cover note were encrypted and delivered directly to the casting desk at{" "}
              <strong style={{ color: "var(--accent-gold)" }}>{casting.productionHouse}</strong>.
            </p>
            <span className="badge badge-cyan">Track progress in your Audition Pipeline</span>
          </div>
        ) : (
          <div style={{ padding: "24px", maxHeight: "calc(88vh - 120px)", overflowY: "auto" }}>
            {/* Quick Meta Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.03)",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                marginBottom: "24px",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Production House</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>{casting.productionHouse}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Location</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <MapPin size={13} color="var(--accent-gold)" /> {casting.location}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Compensation</span>
                <span style={{ fontWeight: 600, color: "#34d399", fontSize: "0.9rem" }}>{casting.payRange}</span>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Shoot Dates</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Calendar size={13} color="var(--accent-neon-cyan)" /> {casting.shootDates}
                </span>
              </div>
            </div>

            {/* Role Breakdown */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-gold)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Character Breakdown & Director's Vision
              </h4>
              <p style={{ color: "var(--text-primary)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                {casting.characterDescription}
              </p>
            </div>

            {/* Requirements Checklist */}
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "10px" }}>
                Audition Requirements:
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {casting.requirements.map((req, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      background: "rgba(15, 20, 30, 0.6)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.88rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--accent-gold)" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
                Submit Your Materials
              </h4>

              {/* Headshot Selection */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>
                  Select Headshot to Attach
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  {[
                    { id: "headshot-1", title: "Commercial Studio Headshot", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80" },
                    { id: "headshot-2", title: "Dramatic / Intense Look", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80" },
                    { id: "headshot-3", title: "Period Character Test", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" },
                  ].map((shot) => (
                    <div
                      key={shot.id}
                      onClick={() => setSelectedHeadshot(shot.id)}
                      style={{
                        position: "relative",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: selectedHeadshot === shot.id ? "2px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        height: "90px",
                        transition: "all 0.2s",
                      }}
                    >
                      <img src={shot.url} alt={shot.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {selectedHeadshot === shot.id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            background: "var(--accent-gold)",
                            color: "#000",
                            borderRadius: "50%",
                            padding: "2px",
                            display: "flex",
                          }}
                        >
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Self-Tape Video Link / Vault selection */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>
                  Self-Tape Video (CloudFront S3 Vault or Vimeo / YouTube Unlisted)
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="url"
                    value={selfTapeUrl}
                    onChange={(e) => setSelfTapeUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://cineconnect.media/tapes/monologue.mp4"
                    required
                  />
                  <button type="button" className="btn-secondary" style={{ whiteSpace: "nowrap" }}>
                    <Upload size={14} /> Upload New
                  </button>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                  🔒 Self-tapes uploaded via CineConnect are automatically encrypted and watermarked with casting desk metadata.
                </span>
              </div>

              {/* Director's Note */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px", fontWeight: 600 }}>
                  Personal Note to Director & Casting Lead
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="input-field"
                  style={{ resize: "vertical" }}
                  placeholder="Share your connection to the material, dialect background, or theater credits..."
                />
              </div>

              {/* Availability affirmation */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "24px" }}>
                <input
                  type="checkbox"
                  id="dateAgreement"
                  checked={agreedToDates}
                  onChange={(e) => setAgreedToDates(e.target.checked)}
                  style={{ marginTop: "4px", accentColor: "var(--accent-gold)", cursor: "pointer" }}
                  required
                />
                <label htmlFor="dateAgreement" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  I confirm my availability for the shoot period (<strong>{casting.shootDates}</strong>) in <strong>{casting.location}</strong> and agree to standard Screen Actors Guild / Film Association working covenants.
                </label>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
                <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !agreedToDates}
                  style={{ minWidth: "180px" }}
                >
                  {isSubmitting ? "Encrypting & Submitting..." : "Submit 1-Click Audition 🎬"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
