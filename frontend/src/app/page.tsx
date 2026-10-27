"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/supabase/auth-context";
import { PhoneFrame } from "@/components/common/PhoneFrame";
import { LandingScreen } from "@/components/home/LandingScreen";
import { ClapperboardAuthCard } from "@/components/auth/ClapperboardAuthCard";
import { TermsModal } from "@/components/portal/TermsModal";

export default function CineConnectRootPage() {
  const { setSelectedPortal } = useAuth();

  // Screen view: "landing" (Welcome) | "login" | "signup"
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup">("landing");

  // Legal Modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsTab, setTermsTab] = useState<"terms" | "privacy">("terms");

  const handleOpenTerms = (tab: "terms" | "privacy") => {
    setTermsTab(tab);
    setShowTermsModal(true);
  };

  const handleSelectPortal = (portal: "talent" | "production", mode: "login" | "signup" = "login") => {
    setSelectedPortal(portal);
    setCurrentView(mode);
  };

  return (
    <>
      {/* ===================== REALISTIC PHONE-SIZED APPLICATION VIEWPORT ===================== */}
      {/* On desktop browsers: phone frame preview with status bar, notch, and dark backdrop */}
      {/* On actual mobile devices: clean responsive full-bleed display without nested frames */}
      <PhoneFrame>
        {currentView === "landing" ? (
          /* =============================================================== */
          /* LANDING PAGE (WELCOME & PORTAL SELECTION)                        */
          /* =============================================================== */
          <LandingScreen
            onSelectPortal={handleSelectPortal}
            onLogin={() => setCurrentView("login")}
            onOpenTerms={handleOpenTerms}
          />
        ) : (
          /* =============================================================== */
          /* AUTHENTICATION (TALENT / PRODUCTION LOGIN & SIGNUP)             */
          /* =============================================================== */
          <div
            className="no-scrollbar"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}
          >
            <ClapperboardAuthCard
              initialScreen={currentView}
              onBack={() => setCurrentView("landing")}
              onSuccess={() => {
                // Navigate or switch to /home
                window.location.href = "/home";
              }}
              onOpenTerms={handleOpenTerms}
            />
          </div>
        )}
      </PhoneFrame>

      {/* ===================== TERMS & PRIVACY MODAL ===================== */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        initialTab={termsTab}
      />
    </>
  );
}
