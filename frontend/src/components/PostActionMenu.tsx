"use client";

import React, { useEffect, useRef } from "react";
import { MoreVertical, ThumbsUp, ThumbsDown, Flag } from "lucide-react";

interface PostActionMenuProps {
  itemId: string;
  isOpen: boolean;
  onToggle: () => void;
  onInterested: (id: string) => void;
  onNotInterested: (id: string) => void;
  onReport: (id: string) => void;
  align?: "left" | "right";
}

export default function PostActionMenu({
  itemId,
  isOpen,
  onToggle,
  onInterested,
  onNotInterested,
  onReport,
  align = "right",
}: PostActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        id={`post-menu-btn-${itemId}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title="More options"
        style={{
          background: isOpen ? "rgba(255, 165, 0, 0.15)" : "transparent",
          border: isOpen ? "1px solid rgba(255, 165, 0, 0.35)" : "none",
          color: isOpen ? "#FFA500" : "#9E9E9E",
          padding: "6px",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.color = "#FFFFFF";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.color = "#9E9E9E";
        }}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: "100%",
            [align]: 0,
            marginTop: "6px",
            background: "#181B24",
            border: "1px solid rgba(255, 165, 0, 0.35)",
            borderRadius: "12px",
            padding: "6px",
            minWidth: "210px",
            zIndex: 40,
            boxShadow: "0 12px 36px rgba(0,0,0,0.75), 0 0 20px rgba(255,165,0,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* Option 1: Interested */}
          <button
            type="button"
            onClick={() => onInterested(itemId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 165, 0, 0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ThumbsUp size={16} color="#FFA500" />
            <div>
              <div style={{ color: "#FFA500", fontWeight: 700 }}>Interested</div>
              <div style={{ fontSize: "0.72rem", color: "#9E9E9E" }}>Show more like this</div>
            </div>
          </button>

          {/* Option 2: Not Interested */}
          <button
            type="button"
            onClick={() => onNotInterested(itemId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <ThumbsDown size={16} color="#CBD5E1" />
            <div>
              <div style={{ color: "#E2E8F0" }}>Not Interested</div>
              <div style={{ fontSize: "0.72rem", color: "#9E9E9E" }}>Hide & show fewer</div>
            </div>
          </button>

          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "4px 0" }} />

          {/* Option 3: Report */}
          <button
            type="button"
            onClick={() => onReport(itemId)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "#f43f5e",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(244, 63, 94, 0.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Flag size={16} color="#f43f5e" />
            <div>
              <div style={{ color: "#f43f5e", fontWeight: 700 }}>Report</div>
              <div style={{ fontSize: "0.72rem", color: "#9E9E9E" }}>Spam or inappropriate</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
