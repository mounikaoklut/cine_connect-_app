"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, Camera, MapPin, CheckCircle2, MessageSquare, Award } from "lucide-react";
import { TalentItem } from "@/lib/mockData";

interface ShowreelModalProps {
  talent: TalentItem | null;
  onClose: () => void;
  onOpenMessage?: (talentName: string) => void;
}

export default function ShowreelModal({ talent, onClose, onOpenMessage }: ShowreelModalProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [timecode, setTimecode] = useState<string>("01:24:18:04");
  const [aspectRatio, setAspectRatio] = useState<"2.39" | "16:9">("2.39");

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const frames = Math.floor(Math.random() * 24).toString().padStart(2, "0");
      const seconds = Math.floor(Math.random() * 60).toString().padStart(2, "0");
      setTimecode(`01:24:${seconds}:${frames}`);
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!talent) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "880px",
          position: "relative",
          background: "#080a0f",
          border: "1px solid rgba(245, 158, 11, 0.4)",
          overflow: "hidden",
        }}
      >
        {/* Cinema Video Header */}
        <div
          style={{
            position: "relative",
            background: "#000",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          {/* Cinema Frame */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingBottom: aspectRatio === "2.39" ? "42.85%" : "56.25%",
              background: "#000",
              overflow: "hidden",
              transition: "padding-bottom 0.3s ease",
            }}
          >
            <img
              src={talent.featuredReelUrl}
              alt={talent.featuredReelTitle}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: isPlaying ? "brightness(0.95)" : "brightness(0.6)",
                transition: "filter 0.3s",
              }}
            />

            {/* Cinematic Overlay Details */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                left: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                zIndex: 10,
              }}
            >
              <span className="badge badge-rose" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span className="live-dot" /> REC
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  background: "rgba(0,0,0,0.65)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#e2e8f0",
                }}
              >
                TC: {timecode}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  background: "rgba(0,0,0,0.65)",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--accent-gold)",
                  fontWeight: 600,
                }}
              >
                4K HDR • 24.00 FPS
              </span>
            </div>

            {/* Aspect Ratio Switcher */}
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "60px",
                zIndex: 10,
                display: "flex",
                gap: "6px",
              }}
            >
              <button
                onClick={() => setAspectRatio("2.39")}
                style={{
                  background: aspectRatio === "2.39" ? "var(--accent-gold)" : "rgba(0,0,0,0.7)",
                  color: aspectRatio === "2.39" ? "#000" : "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                2.39:1 Anamorphic
              </button>
              <button
                onClick={() => setAspectRatio("16:9")}
                style={{
                  background: aspectRatio === "16:9" ? "var(--accent-gold)" : "rgba(0,0,0,0.7)",
                  color: aspectRatio === "16:9" ? "#000" : "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                16:9 Standard
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 15,
                background: "rgba(0, 0, 0, 0.75)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
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

            {/* Center Play Button if paused */}
            {!isPlaying && (
              <div
                onClick={() => setIsPlaying(true)}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "var(--accent-gold)",
                    color: "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 30px rgba(245, 158, 11, 0.6)",
                  }}
                >
                  <Play size={32} fill="#000" style={{ marginLeft: "4px" }} />
                </div>
              </div>
            )}

            {/* Bottom Playback Bar */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                padding: "20px 20px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                zIndex: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#fff" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Animated Sound Waves */}
                {isPlaying && !isMuted && (
                  <div style={{ display: "flex", alignItems: "center", gap: "3px", height: "24px" }}>
                    <div className="sound-bar" style={{ width: "3px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                    <div className="sound-bar" style={{ width: "3px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                    <div className="sound-bar" style={{ width: "3px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                    <div className="sound-bar" style={{ width: "3px", background: "var(--accent-gold)", borderRadius: "2px" }} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.85rem", color: "#f8fafc", fontWeight: 600 }}>
                  {talent.featuredReelTitle}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Talent & Reel Info Body */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <img
                src={talent.avatar}
                alt={talent.name}
                style={{ width: "54px", height: "54px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--accent-gold)" }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>{talent.name}</h3>
                  {talent.verified && (
                    <span className="badge badge-gold" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                      <CheckCircle2 size={12} /> Verified Artist
                    </span>
                  )}
                </div>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  {talent.craft} • {talent.city}, {talent.country}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => {
                  if (onOpenMessage) onOpenMessage(talent.name);
                }}
                className="btn-primary"
                style={{ fontSize: "0.9rem", padding: "8px 18px" }}
              >
                <MessageSquare size={15} /> Inquire Availability
              </button>
            </div>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "20px" }}>
            {talent.bio}
          </p>

          {/* Accolades & Equipment Tags */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            {talent.accolades && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", color: "#fbbf24" }}>
                <Award size={16} />
                <span>{talent.accolades}</span>
              </div>
            )}

            {talent.gear && talent.gear.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Camera size={13} /> Camera & Package:
                </span>
                {talent.gear.map((g, i) => (
                  <span key={i} className="badge badge-cyan" style={{ fontSize: "0.75rem" }}>
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Key Crafts:</span>
              {talent.skills.map((s, i) => (
                <span key={i} className="badge" style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: "0.75rem" }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
