"use client";

import React, { useState } from "react";
import { X, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "terms" | "privacy";
}

export function TermsModal({ isOpen, onClose, initialTab = "terms" }: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        background: "rgba(3, 5, 9, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          background: "#0C1120",
          border: "1px solid rgba(245, 247, 255, 0.12)",
          borderRadius: "16px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 25px rgba(139, 92, 246, 0.12)",
          overflow: "hidden",
          fontFamily: "'Poppins', 'Inter', sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid rgba(245, 247, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#070A14",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(139, 92, 246, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8B5CF6",
              }}
            >
              {activeTab === "terms" ? <FileText size={18} /> : <ShieldCheck size={18} />}
            </div>
            <div>
              <h2
                id="terms-modal-title"
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 600,
                  color: "#F5F7FF",
                }}
              >
                {activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </h2>
              <p style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                CineConnect Entertainment Industry Legal Standards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "rgba(245, 247, 255, 0.06)",
              border: "1px solid rgba(245, 247, 255, 0.12)",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab switchers */}
        <div
          style={{
            display: "flex",
            padding: "10px 22px 0",
            gap: "10px",
            background: "#070A14",
            borderBottom: "1px solid rgba(245, 247, 255, 0.08)",
          }}
        >
          <button
            onClick={() => setActiveTab("terms")}
            style={{
              padding: "9px 16px",
              background: activeTab === "terms" ? "rgba(139, 92, 246, 0.15)" : "transparent",
              color: activeTab === "terms" ? "#F5F7FF" : "#94A3B8",
              border: "none",
              borderBottom: activeTab === "terms" ? "2px solid #8B5CF6" : "2px solid transparent",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            style={{
              padding: "9px 16px",
              background: activeTab === "privacy" ? "rgba(37, 217, 208, 0.15)" : "transparent",
              color: activeTab === "privacy" ? "#F5F7FF" : "#94A3B8",
              border: "none",
              borderBottom: activeTab === "privacy" ? "2px solid #25D9D0" : "2px solid transparent",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            Privacy & Talent Protection
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            padding: "22px",
            overflowY: "auto",
            lineHeight: 1.6,
            fontSize: "0.88rem",
            color: "#94A3B8",
          }}
        >
          {activeTab === "terms" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  1. Acceptance of Industry Standards
                </h3>
                <p>
                  By accessing or registering with CineConnect, you agree to abide by international film and entertainment
                  standards. CineConnect serves as a verified bridge connecting creative professionals (actors,
                  cinematographers, directors, writers, crew) with verified production houses, studios, and casting agencies.
                </p>
              </section>

              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  2. Authentic Representation & Verification
                </h3>
                <p>
                  Talent and Production Houses represent that all portfolios, headshots, showreels, company credentials, and
                  union affiliations (SAG-AFTRA, CINTAA, WGA) submitted are genuine. Submitting misleading credits or
                  fraudulent media may result in immediate suspension.
                </p>
              </section>

              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  3. Safe Casting & Professional Conduct
                </h3>
                <p>
                  Production houses agree to conduct casting, audition reviews, and callbacks in safe, professional, and
                  legitimate industry-standard settings. Unsolicited non-professional contact or fee-for-audition scams
                  are strictly prohibited.
                </p>
              </section>

              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  4. Intellectual Property & Showreels
                </h3>
                <p>
                  All uploaded media remains the intellectual property of the respective creator or producing studio.
                  CineConnect receives a limited license to host and stream reels exclusively for casting evaluation.
                </p>
              </section>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  1. Privacy & Contact Protection
                </h3>
                <p>
                  Your phone number, direct email, and verified government ID are never publicly exposed to search engines.
                  Contact info is only disclosed to verified production houses upon explicit mutual connection or audition request.
                </p>
              </section>

              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  2. Secure Storage & Media Streaming
                </h3>
                <p>
                  All portfolios, scripts, and video reels are encrypted in transit and at rest using enterprise-grade
                  storage and authenticated CloudFront CDN distribution.
                </p>
              </section>

              <section>
                <h3 style={{ color: "#F5F7FF", fontSize: "0.96rem", fontWeight: 600, marginBottom: "4px" }}>
                  3. Data Rights
                </h3>
                <p>
                  You have the right to export, modify, or permanently delete your account, casting history, and media files at
                  any time from your settings panel.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 22px",
            borderTop: "1px solid rgba(245, 247, 255, 0.08)",
            display: "flex",
            justifyContent: "flex-end",
            background: "#070A14",
          }}
        >
          <button
            onClick={onClose}
            className="btn-primary"
            style={{ padding: "8px 22px", fontSize: "0.88rem" }}
          >
            <CheckCircle2 size={16} /> I Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
}
