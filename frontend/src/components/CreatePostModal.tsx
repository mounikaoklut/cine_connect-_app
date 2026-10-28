"use client";

import React, { useState } from "react";
import { X, Clapperboard, Video, Image as ImageIcon, FileText, Send, Sparkles, Check, Play, Film } from "lucide-react";
import { FeedPost } from "@/lib/mockData";

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: FeedPost) => void;
  userCraft?: string;
  userName?: string;
  initialType?: "casting" | "showreel" | "pitch" | "bts" | "announcement";
}

const AUDITION_PRESETS = [
  {
    id: "preset-1",
    label: "🎬 Dramatic Monologue",
    url: "/reels/reel1.mp4",
    type: "video" as const,
    desc: "Crime Noir self-tape (1080p HD)",
  },
  {
    id: "preset-2",
    label: "🎭 Commercial Range",
    url: "/reels/reel2.mp4",
    type: "video" as const,
    desc: "Expressive character read",
  },
  {
    id: "preset-3",
    label: "🥋 Action Stunt Tape",
    url: "/reels/reel3.mp4",
    type: "video" as const,
    desc: "Combat & choreography reel",
  },
  {
    id: "preset-4",
    label: "🌟 Method Acting Scene",
    url: "/reels/reel4.mp4",
    type: "video" as const,
    desc: "Emotional dialogue piece",
  },
  {
    id: "preset-photo",
    label: "📸 Look Test / Headshot",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80",
    type: "image" as const,
    desc: "Professional studio headshot",
  },
];

const SUGGESTED_TAGS = [
  "#AuditionTape",
  "#Monologue",
  "#MethodActing",
  "#Bollywood",
  "#CastingCall",
  "#SelfTape",
  "#IndieFilm",
];

export default function CreatePostModal({
  onClose,
  onPostCreated,
  userCraft = "Actor",
  userName = "Kabir Mehra",
  initialType = "showreel",
}: CreatePostModalProps) {
  const [postType, setPostType] = useState<"casting" | "showreel" | "pitch" | "bts" | "announcement">(initialType);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("/reels/reel1.mp4");
  const [mediaType, setMediaType] = useState<"video" | "image">("video");
  const [tagInput, setTagInput] = useState("#AuditionTape #Monologue #MethodActing");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-1");
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPreset = (preset: typeof AUDITION_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setMediaUrl(preset.url);
    setMediaType(preset.type);
    setShowCustomUrlInput(false);
  };

  const handleToggleTag = (tag: string) => {
    const currentTags = tagInput.split(" ").filter((t) => t.trim().length > 0);
    if (currentTags.includes(tag)) {
      setTagInput(currentTags.filter((t) => t !== tag).join(" "));
    } else {
      setTagInput([...currentTags, tag].join(" "));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const tags = tagInput.split(" ").filter((t) => t.trim().length > 0);
      const isVideo = mediaType === "video" || mediaUrl.endsWith(".mp4") || postType === "showreel";
      const newPost: FeedPost = {
        id: "feed-" + Date.now(),
        author: {
          name: userName,
          craft: userCraft,
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
          verified: true,
        },
        timestamp: "Just now",
        type: postType,
        content: content.trim() || (postType === "showreel" ? "Audition tape & monologue breakdown shared with casting directors." : "Project update for the film community."),
        mediaUrl: mediaUrl.trim() || (isVideo ? "/reels/reel1.mp4" : undefined),
        mediaType: isVideo ? "video" : "image",
        tags: tags.length > 0 ? tags : ["#AuditionTape", "#Monologue"],
        likes: 0,
        commentsCount: 0,
        shares: 0,
        isLiked: false,
      };

      onPostCreated(newPost);
      setIsSubmitting(false);
      onClose();
    }, 450);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "600px",
          width: "94%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "linear-gradient(180deg, #121622 0%, #0c0e15 100%)",
          border: "1px solid rgba(245, 158, 11, 0.35)",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.7), 0 0 30px rgba(245, 158, 11, 0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0, 0, 0, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF9800 0%, #F59E0B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(255, 152, 0, 0.4)",
              }}
            >
              <Sparkles size={18} color="#000" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", margin: 0 }}>
                Broadcast to Feed
              </h3>
              <span style={{ fontSize: "0.72rem", color: "#FFB74D", fontWeight: 600 }}>
                {userName} • {userCraft} • Public Post
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#E2E8F0",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "18px 20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Post Type Selector */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#9E9E9E", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Select Post Category
            </label>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { type: "showreel" as const, label: "🎬 Audition Tape" },
                { type: "announcement" as const, label: "📣 Update" },
                { type: "casting" as const, label: "🎭 Casting Notice" },
                { type: "bts" as const, label: "📸 Look Test / BTS" },
                { type: "pitch" as const, label: "📜 Script Pitch" },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => {
                    setPostType(item.type);
                    if (item.type === "showreel" && !mediaUrl) {
                      setMediaUrl("/reels/reel1.mp4");
                      setMediaType("video");
                    }
                  }}
                  style={{
                    background: postType === item.type ? "linear-gradient(135deg, #FF9800 0%, #F59E0B 100%)" : "rgba(255, 255, 255, 0.05)",
                    color: postType === item.type ? "#000" : "#CBD5E1",
                    border: postType === item.type ? "1px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "9999px",
                    padding: "5px 12px",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field"
              placeholder={
                postType === "showreel"
                  ? "Describe your audition tape: monologue title, character archetype, director notes, accent, or scene context..."
                  : postType === "casting"
                  ? "Describe the role, project, shoot dates, compensation, and self-tape submission sides..."
                  : "Share an update, wrap celebration, or audition milestone with the community..."
              }
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "10px",
                padding: "10px 12px",
                color: "#fff",
                fontSize: "0.85rem",
                resize: "vertical",
              }}
            />
          </div>

          {/* Audition Tape & Media Attachments */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              padding: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.76rem", color: "#FF9800", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                <Film size={14} /> 1-Click Audition Reel Presets
              </span>
              <button
                type="button"
                onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38BDF8",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {showCustomUrlInput ? "Hide Custom URL" : "Paste Custom Link"}
              </button>
            </div>

            {/* Presets Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "6px" }}>
              {AUDITION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id && mediaUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      background: isSelected ? "rgba(255, 152, 0, 0.18)" : "rgba(255, 255, 255, 0.04)",
                      border: isSelected ? "1.5px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      padding: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: isSelected ? "#FF9800" : "#fff" }}>
                        {preset.label}
                      </span>
                      {isSelected && <Check size={12} color="#FF9800" />}
                    </div>
                    <span style={{ fontSize: "0.62rem", color: "#9E9E9E" }}>{preset.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom URL Input if toggled */}
            {showCustomUrlInput && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    setSelectedPresetId("");
                    if (e.target.value.endsWith(".mp4")) {
                      setMediaType("video");
                    }
                  }}
                  className="input-field"
                  placeholder="Paste video (.mp4) or image URL..."
                  style={{
                    width: "100%",
                    fontSize: "0.78rem",
                    padding: "7px 10px",
                    background: "rgba(0,0,0,0.5)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "6px",
                    color: "#fff",
                  }}
                />
              </div>
            )}

            {/* Live Media Preview Card */}
            {mediaUrl && (
              <div
                style={{
                  marginTop: "10px",
                  background: "#08090C",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 152, 0, 0.25)",
                  position: "relative",
                }}
              >
                {mediaType === "video" || mediaUrl.endsWith(".mp4") ? (
                  <div style={{ position: "relative", width: "100%", height: "130px", background: "#000" }}>
                    <video
                      src={mediaUrl}
                      controls
                      playsInline
                      muted
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        background: "rgba(0,0,0,0.7)",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.62rem",
                        color: "#FF9800",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Video size={10} /> Audition Tape Attached
                    </div>
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "120px", position: "relative" }}>
                    <img
                      src={mediaUrl}
                      alt="Attachment Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                <div
                  style={{
                    padding: "6px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#0D0E12",
                    fontSize: "0.68rem",
                  }}
                >
                  <span style={{ color: "#9E9E9E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "260px" }}>
                    {mediaUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaUrl("");
                      setSelectedPresetId("");
                    }}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#FB7185",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hashtags */}
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#9E9E9E", fontWeight: 600, marginBottom: "4px" }}>
              Suggested Tags & Topics
            </label>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "6px" }}>
              {SUGGESTED_TAGS.map((tag) => {
                const isActive = tagInput.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    style={{
                      background: isActive ? "rgba(255, 152, 0, 0.2)" : "rgba(255, 255, 255, 0.05)",
                      border: isActive ? "1px solid #FF9800" : "1px solid rgba(255, 255, 255, 0.08)",
                      color: isActive ? "#FF9800" : "#9E9E9E",
                      borderRadius: "6px",
                      padding: "2px 7px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="input-field"
              placeholder="#Acting #Cinematography #Audition"
              style={{
                width: "100%",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                padding: "6px 10px",
                color: "#fff",
                fontSize: "0.78rem",
              }}
            />
          </div>

          {/* Action Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "8px",
              paddingTop: "6px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#9E9E9E",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #FF9800 0%, #F59E0B 100%)",
                border: "none",
                color: "#08090C",
                padding: "8px 18px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 10px rgba(255, 152, 0, 0.35)",
              }}
              disabled={isSubmitting}
            >
              <Send size={14} />
              {isSubmitting ? "Publishing Audition..." : "Broadcast to Feed 🎬"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

