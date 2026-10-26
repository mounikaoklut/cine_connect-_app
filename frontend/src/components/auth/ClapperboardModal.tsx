"use client";

import React from "react";
import { X } from "lucide-react";
import { PortalType } from "@/lib/supabase/auth-context";
import { ClapperboardAuthCard } from "./ClapperboardAuthCard";

interface ClapperboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (portal: PortalType) => void;
  onOpenTerms: (tab: "terms" | "privacy") => void;
}

export function ClapperboardModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenTerms,
}: ClapperboardModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CineConnect Authentication"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(3, 5, 9, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          position: "relative",
        }}
      >
        {/* Floating Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          style={{
            position: "absolute",
            top: "-12px",
            right: "-12px",
            zIndex: 10,
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#0C1120",
            border: "1px solid #8B5CF6",
            color: "#F5F7FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
          }}
        >
          <X size={16} />
        </button>

        <ClapperboardAuthCard
          onSuccess={onSuccess}
          onOpenTerms={onOpenTerms}
          onBack={onClose}
        />
      </div>
    </div>
  );
}
