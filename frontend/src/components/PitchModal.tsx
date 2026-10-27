"use client";

import React, { useState } from "react";
import { X, Lock, ShieldCheck, FileText, CheckCircle2, AlertTriangle, Download, Eye, DollarSign } from "lucide-react";
import { PitchDeck } from "@/lib/mockData";

interface PitchModalProps {
  pitch: PitchDeck | null;
  onClose: () => void;
}

export default function PitchModal({ pitch, onClose }: PitchModalProps) {
  const [signedNda, setSignedNda] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!pitch) return null;

  const handleSignNda = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setSignedNda(true);
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "800px",
          position: "relative",
          background: "#0a0d14",
          border: "1px solid rgba(245, 158, 11, 0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(to right, rgba(245, 158, 11, 0.1), transparent)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span className="badge badge-purple">{pitch.format}</span>
              <span className="badge badge-gold">{pitch.status}</span>
              <span className="badge badge-cyan" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Lock size={12} /> NDA Protected Vault
              </span>
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-display)" }}>
              {pitch.title}
            </h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Screenplay by <strong style={{ color: "var(--text-secondary)" }}>{pitch.writer}</strong>
            </span>
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

        {/* Content */}
        <div style={{ padding: "24px", maxHeight: "calc(88vh - 120px)", overflowY: "auto" }}>
          {/* Cover Art Banner */}
          <div
            style={{
              position: "relative",
              height: "220px",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              marginBottom: "20px",
            }}
          >
            <img
              src={pitch.coverImage}
              alt={pitch.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(10, 13, 20, 0.95) 0%, transparent 60%)",
                display: "flex",
                alignItems: "flex-end",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>ESTIMATED BUDGET</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent-gold)" }}>{pitch.estimatedBudget}</span>
                </div>
                {pitch.attachedTalent && (
                  <div>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>ATTACHED ATTRACTION</span>
                    <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff" }}>{pitch.attachedTalent}</span>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>PITCH INQUIRIES</span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--accent-neon-cyan)" }}>{pitch.inquiriesCount} Production Houses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logline Box */}
          <div
            style={{
              background: "rgba(245, 158, 11, 0.07)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-gold)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Logline
            </span>
            <p style={{ color: "#fff", fontSize: "1rem", fontStyle: "italic", lineHeight: 1.5 }}>
              "{pitch.logline}"
            </p>
          </div>

          {/* Synopsis */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px" }}>
              Executive Synopsis
            </h4>
            <p style={{ color: "var(--text-primary)", lineHeight: 1.6, fontSize: "0.95rem" }}>
              {pitch.synopsis}
            </p>
          </div>

          {/* Genre Tags */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
            {pitch.genre.map((g, i) => (
              <span key={i} className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "#cbd5e1" }}>
                {g}
              </span>
            ))}
          </div>

          {/* NDA Section */}
          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "20px",
              background: "rgba(15, 20, 30, 0.7)",
              padding: "20px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
              <ShieldCheck size={24} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <h4 style={{ fontSize: "0.98rem", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                  Intellectual Property Protection & Digital NDA
                </h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  This screenplay is registered with the Screenwriters Association (SWA). Unlocking the full script package requires a digital NDA. Every page downloaded will be stamped with a tamper-proof forensic watermark containing your verified credentials and IP address.
                </p>
              </div>
            </div>

            {signedNda ? (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={20} color="var(--accent-emerald)" />
                  <div>
                    <span style={{ fontWeight: 600, color: "#fff", fontSize: "0.9rem", display: "block" }}>
                      Digital NDA Executed & Verified
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Watermarked Script PDF (Draft 3) unlocked for Kabir Mehra
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setDownloaded(true)}
                  className="btn-primary"
                  style={{ fontSize: "0.88rem", padding: "8px 16px" }}
                >
                  <Download size={15} /> {downloaded ? "Screenplay Downloaded" : "Download Screenplay PDF (112 pages)"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignNda}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <input
                    type="checkbox"
                    id="ndaCheck"
                    required
                    style={{ accentColor: "var(--accent-gold)", width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <label htmlFor="ndaCheck" style={{ fontSize: "0.82rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                    I agree to the CineConnect Non-Disclosure Agreement, covenanting not to disclose or duplicate plot elements, dialogue, or treatment without prior written producer consent.
                  </label>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Close Preview
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSigning}>
                    {isSigning ? "Verifying NDA..." : "Sign Digital NDA & Access Script 📜"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
