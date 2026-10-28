"use client";

import React, { useState } from "react";
import { useAuth, PortalType } from "@/lib/supabase/auth-context";
import { PhoneFrame } from "@/components/common/PhoneFrame";
import { LandingScreen } from "@/components/home/LandingScreen";
import { ClapperboardAuthCard } from "@/components/auth/ClapperboardAuthCard";
import { TermsModal } from "@/components/portal/TermsModal";

export default function AkhilaLoginPage() {
  const { setSelectedPortal } = useAuth();

  // Screen view: "landing" (Welcome & Portal Selection) | "login" | "signup"
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup">("landing");

  // Legal Modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsTab, setTermsTab] = useState<"terms" | "privacy">("terms");

  const handleOpenTerms = (tab: "terms" | "privacy") => {
    setTermsTab(tab);
    setShowTermsModal(true);
  };

  const handleSelectPortal = (portal: PortalType, mode: "login" | "signup" = "login") => {
    setSelectedPortal(portal);
    setCurrentView(mode);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0c10", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      {/* Realistic Phone-Sized Application Viewport */}
      <PhoneFrame>
        {currentView === "landing" ? (
          <LandingScreen
            onSelectPortal={handleSelectPortal}
            onLogin={() => setCurrentView("login")}
            onOpenTerms={handleOpenTerms}
          />
        ) : (
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
                window.location.href = "/home";
              }}
              onOpenTerms={handleOpenTerms}
            />
          </div>
        )}
      </PhoneFrame>

      {/* Terms & Privacy Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        initialTab={termsTab}
      />
    </div>
  );
}

