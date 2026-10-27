"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Heart, MessageSquare, Send, CheckCircle2, Smile } from "lucide-react";

export interface CineCommentItem {
  id: string;
  user: string;
  craft?: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  verified?: boolean;
}

export type CommentItem = CineCommentItem;

interface InstagramCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    id: string;
    author: {
      name: string;
      avatar: string;
      craft?: string;
      verified?: boolean;
    };
    content: string;
    commentsCount: number;
  } | null;
  comments: CineCommentItem[];
  onAddComment: (targetId: string, text: string) => void;
  onToggleCommentLike?: (targetId: string, commentId: string) => void;
}

const QUICK_EMOJIS = ["❤️", "🔥", "👏", "🎬", "✨", "🙌", "💯", "🚀", "🎥", "🤩"];

export default function InstagramCommentsModal({
  isOpen,
  onClose,
  targetItem,
  comments,
  onAddComment,
  onToggleCommentLike,
}: InstagramCommentsModalProps) {
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<CineCommentItem[]>(comments);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CineCommentItem = {
      id: "cmt-" + Date.now(),
      user: "Kabir Mehra",
      craft: "Method Actor",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      text: commentText.trim(),
      time: "Just now",
      likes: 0,
      isLiked: false,
      verified: true,
    };

    setLocalComments((prev) => [...prev, newComment]);
    onAddComment(targetItem.id, commentText.trim());
    setCommentText("");

    setTimeout(() => {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleToggleLike = (commentId: string) => {
    setLocalComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isLiked;
          return {
            ...c,
            isLiked,
            likes: c.likes + (isLiked ? 1 : -1),
          };
        }
        return c;
      })
    );
    if (onToggleCommentLike) {
      onToggleCommentLike(targetItem.id, commentId);
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "540px",
          height: "82vh",
          maxHeight: "720px",
          backgroundColor: "#131620",
          border: "1px solid rgba(255, 165, 0, 0.35)",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.15)",
          overflow: "hidden",
          animation: "fadeIn 0.2s ease-out",
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
            background: "#161925",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #FFA500 0%, #FF5722 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#08090C",
              }}
            >
              <MessageSquare size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                Comments
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#9E9E9E" }}>
                {localComments.length} thoughts shared
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              color: "#CBD5E1",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Original Post Context Header */}
        <div
          style={{
            padding: "12px 18px",
            background: "rgba(255, 255, 255, 0.02)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <img
            src={targetItem.author.avatar}
            alt={targetItem.author.name}
            style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FFA500" }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>
                {targetItem.author.name}
              </span>
              {targetItem.author.verified && <CheckCircle2 size={13} color="#FFA500" />}
              {targetItem.author.craft && (
                <span style={{ fontSize: "0.72rem", color: "#9E9E9E" }}>
                  • {targetItem.author.craft}
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: "0.8rem",
                color: "#CBD5E1",
                margin: "4px 0 0",
                lineHeight: 1.35,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {targetItem.content}
            </p>
          </div>
        </div>

        {/* Scrollable Comments List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {localComments.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "#9E9E9E",
                gap: "10px",
              }}
            >
              <MessageSquare size={36} color="rgba(255, 165, 0, 0.4)" />
              <p style={{ margin: 0, fontSize: "0.9rem" }}>No comments yet.</p>
              <span style={{ fontSize: "0.78rem", color: "#64748B" }}>
                Be the first to share an impression or compliment!
              </span>
            </div>
          ) : (
            localComments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <img
                  src={comment.avatar}
                  alt={comment.user}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#FFFFFF" }}>
                      {comment.user}
                    </span>
                    {comment.verified && <CheckCircle2 size={12} color="#FFA500" />}
                    {comment.craft && (
                      <span style={{ fontSize: "0.7rem", color: "#9E9E9E" }}>
                        • {comment.craft}
                      </span>
                    )}
                    <span style={{ fontSize: "0.7rem", color: "#64748B", marginLeft: "auto" }}>
                      {comment.time}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#E2E8F0",
                      margin: "4px 0 6px",
                      lineHeight: 1.45,
                      wordBreak: "break-word",
                    }}
                  >
                    {comment.text}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: comment.isLiked ? "#f43f5e" : "#9E9E9E",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <Heart
                        size={13}
                        fill={comment.isLiked ? "#f43f5e" : "none"}
                        strokeWidth={comment.isLiked ? 2.5 : 2}
                      />
                      <span>{comment.likes > 0 ? comment.likes : "Like"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCommentText(`@${comment.user} `);
                        inputRef.current?.focus();
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9E9E9E",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Quick Emoji Bar (Instagram Style) */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            scrollbarWidth: "none",
            background: "rgba(0, 0, 0, 0.25)",
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleInsertEmoji(emoji)}
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "none",
                borderRadius: "8px",
                padding: "4px 8px",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "transform 0.1s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.2)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Sticky Comment Composer */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "12px 18px",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#161925",
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80"
            alt="Current user"
            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid #FFA500" }}
          />

          <input
            ref={inputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Add a comment for ${targetItem.author.name.split(" ")[0]}...`}
            style={{
              flex: 1,
              background: "#0C0F17",
              border: "1px solid #2E3340",
              borderRadius: "20px",
              padding: "10px 16px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={!commentText.trim()}
            style={{
              background: commentText.trim()
                ? "linear-gradient(135deg, #FFA500 0%, #FF8500 100%)"
                : "rgba(255, 255, 255, 0.08)",
              color: commentText.trim() ? "#08090C" : "rgba(255, 255, 255, 0.3)",
              border: "none",
              borderRadius: "20px",
              padding: "9px 18px",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: commentText.trim() ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              transition: "all 0.15s ease",
              boxShadow: commentText.trim() ? "0 2px 12px rgba(255, 165, 0, 0.4)" : "none",
            }}
          >
            <span>Post</span>
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
