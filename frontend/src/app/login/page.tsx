"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth, PortalType } from "@/lib/supabase/auth-context";
import { PhoneFrame } from "@/components/common/PhoneFrame";
import { LandingScreen } from "@/components/home/LandingScreen";
import { ClapperboardAuthCard } from "@/components/auth/ClapperboardAuthCard";
import { TermsModal } from "@/components/portal/TermsModal";

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const { setSelectedPortal } = useAuth();

  // Screen view: "landing" | "login" | "signup"
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup">(initialMode);

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
    <div style={{ minHeight: "100vh", background: "#06080c", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      {/* Realistic Mobile Phone Frame */}
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
                window.location.href = "/";
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#06080c" }} />}>
      <LoginContent />
    </Suspense>
  );
}

