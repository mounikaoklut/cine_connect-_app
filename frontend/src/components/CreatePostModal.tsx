"use client";

import React, { useState } from "react";
import { X, Clapperboard, Video, Image as ImageIcon, FileText, Send, Sparkles } from "lucide-react";
import { FeedPost } from "@/lib/mockData";

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: (post: FeedPost) => void;
  userCraft?: string;
  userName?: string;
}

export default function CreatePostModal({ onClose, onPostCreated, userCraft = "Actor", userName = "Kabir Mehra" }: CreatePostModalProps) {
  const [postType, setPostType] = useState<"casting" | "showreel" | "pitch" | "bts" | "announcement">("announcement");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [tagInput, setTagInput] = useState("#CastingCall #Cinema #Bollywood");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const tags = tagInput.split(" ").filter((t) => t.trim().length > 0);
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
        content: content.trim(),
        mediaUrl: mediaUrl.trim() || undefined,
        mediaType: postType === "showreel" ? "video" : "image",
        tags,
        likes: 0,
        commentsCount: 0,
        shares: 0,
        isLiked: false,
      };

      onPostCreated(newPost);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "640px",
          position: "relative",
          background: "#0c1017",
          border: "1px solid rgba(245, 158, 11, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={20} color="var(--accent-gold)" />
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
              Share with Film Community
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "none",
              color: "var(--text-secondary)",
              width: "32px",
              height: "32px",
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {/* Post Type Selector */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {[
              { type: "announcement" as const, label: "📣 General Update" },
              { type: "showreel" as const, label: "🎬 Showreel Drop" },
              { type: "casting" as const, label: "🎭 Casting Notice" },
              { type: "pitch" as const, label: "📜 Script Pitch" },
              { type: "bts" as const, label: "📸 Behind The Scenes" },
            ].map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => setPostType(item.type)}
                style={{
                  background: postType === item.type ? "var(--accent-gold)" : "rgba(255, 255, 255, 0.05)",
                  color: postType === item.type ? "#000" : "var(--text-secondary)",
                  border: postType === item.type ? "1px solid var(--accent-gold)" : "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-full)",
                  padding: "6px 14px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div style={{ marginBottom: "16px" }}>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field"
              placeholder={
                postType === "casting"
                  ? "Describe the role, project, shoot dates, compensation, and required self-tape..."
                  : postType === "showreel"
                  ? "Share technical details about your showreel, camera gear, lenses, and availability..."
                  : "Share an update, wrap celebration, or audition milestone with filmmakers..."
              }
              required
              style={{ resize: "vertical" }}
            />
          </div>

          {/* Media URL Input */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              Media or Video URL (Optional)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="input-field"
              placeholder="https://images.unsplash.com/... or https://vimeo.com/..."
            />
          </div>

          {/* Tags */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
              Hashtags & Categories
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="input-field"
              placeholder="#Acting #Cinematography #Audition"
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              <Send size={15} /> {isSubmitting ? "Broadcasting..." : "Broadcast to Feed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
