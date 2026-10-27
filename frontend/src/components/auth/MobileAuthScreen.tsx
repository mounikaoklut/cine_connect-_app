"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth, PortalType } from "@/lib/supabase/auth-context";

interface MobileAuthScreenProps {
  initialScreen?: "login" | "signup";
  onBack: () => void;
  onSuccess: (portal: PortalType) => void;
  onOpenTerms: (tab: "terms" | "privacy") => void;
}

export function MobileAuthScreen({
  initialScreen = "login",
  onBack,
  onSuccess,
  onOpenTerms,
}: MobileAuthScreenProps) {
  const {
    selectedPortal,
    login,
    register,
    resetPassword,
    soundEnabled,
    setSoundEnabled,
  } = useAuth();

  // Screen state: "login" | "signup" | "forgot"
  const [screen, setScreen] = useState<"login" | "signup" | "forgot">(initialScreen);

  // Common Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Talent Specific Fields
  const [fullName, setFullName] = useState("");

  // Production House Specific Fields
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");

  // Agreement & Status
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  const isTalent = selectedPortal === "talent";
  const portalAccent = isTalent ? "#d4af37" : "#14b8a6";
  const portalGlow = isTalent ? "rgba(212, 175, 55, 0.2)" : "rgba(20, 184, 166, 0.2)";

  // Switch between Login and Sign Up while preserving the active portal
  const handleSwitchTab = (newScreen: "login" | "signup") => {
    setScreen(newScreen);
    setErrorMessage("");
    setSuccessInfo("");
  };

  // Submit Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessInfo("");

    if (!email.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({
        email,
        password,
        portal: selectedPortal,
        rememberMe,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Invalid email or password. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      // Genuine authentication success: Trigger clapperboard animation
      onSuccess(selectedPortal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessInfo("");

    if (isTalent && !fullName.trim()) {
      setErrorMessage("Please enter your full professional name.");
      return;
    }

    if (!isTalent) {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your production company or studio name.");
        return;
      }
      if (!contactPerson.trim()) {
        setErrorMessage("Please enter the primary contact person's name.");
        return;
      }
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid business or personal email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage("Please accept the Terms of Service & Privacy Policy to proceed.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        email,
        password,
        name: isTalent ? fullName : contactPerson,
        companyName: !isTalent ? companyName : undefined,
        phone: phone.trim() || undefined,
        portal: selectedPortal,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Unable to complete registration. Please try again.");
        setIsLoading(false);
        return;
      }

      if (res.confirmationRequired) {
        setSuccessInfo("Account created! Please check your email to verify your registration.");
        setIsLoading(false);
        return;
      }

      // Genuine authentication success: Trigger clapperboard animation
      onSuccess(selectedPortal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during account creation.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Password Reset
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessInfo("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address to receive reset instructions.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(email);
      if (!res.success) {
        setErrorMessage(res.error || "Unable to send reset email. Please try again later.");
      } else {
        setSuccessInfo("Password reset instructions sent. Please check your inbox.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error sending password reset request.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: "100%",
        background: "#06080e",
        color: "#fbfaf7",
      }}
    >
      {/* ===================== ANDROID TOP APP BAR ===================== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(10, 14, 23, 0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        {/* Back Navigation Arrow */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Return to home portal selection"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fbfaf7",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <ArrowLeft size={18} />
        </button>

        {/* Selected Portal Indicator Pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "999px",
            background: isTalent ? "rgba(212, 175, 55, 0.12)" : "rgba(20, 184, 166, 0.12)",
            border: `1px solid ${isTalent ? "rgba(212, 175, 55, 0.4)" : "rgba(20, 184, 166, 0.4)"}`,
            color: portalAccent,
            fontSize: "0.74rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          {isTalent ? <Sparkles size={12} /> : <Building2 size={12} />}
          <span>{isTalent ? "Talent Studio" : "Production House"}</span>
        </div>

        {/* Sound Toggle Button */}
        <button
          type="button"
          onClick={() => setSoundEnabled((prev) => !prev)}
          aria-label={soundEnabled ? "Sound enabled" : "Sound muted"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: soundEnabled ? portalAccent : "var(--text-muted)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* ===================== SCROLLABLE APP BODY ===================== */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 18px 32px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Screen Title & Subtitle */}
        <div style={{ marginBottom: "20px", textAlign: "left" }}>
          <h2
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "4px",
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            {screen === "login"
              ? "Welcome Back"
              : screen === "signup"
              ? "Create Your Account"
              : "Reset Password"}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            {screen === "login"
              ? `Sign in to access your verified ${isTalent ? "Talent" : "Production"} profile.`
              : screen === "signup"
              ? `Join CineConnect as a ${isTalent ? "film creative or actor" : "verified production studio"}.`
              : "Enter your email address to receive password recovery instructions."}
          </p>
        </div>

        {/* ===================== ANDROID SEGMENTED SWITCHER (LOGIN / SIGN UP) ===================== */}
        {screen !== "forgot" && (
          <div
            role="tablist"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "rgba(18, 23, 34, 0.8)",
              borderRadius: "14px",
              padding: "4px",
              marginBottom: "22px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={screen === "login"}
              onClick={() => handleSwitchTab("login")}
              style={{
                padding: "9px 0",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.86rem",
                fontWeight: 700,
                cursor: "pointer",
                background:
                  screen === "login"
                    ? isTalent
                      ? "linear-gradient(135deg, #d4af37 0%, #b89327 100%)"
                      : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                    : "transparent",
                color: screen === "login" ? "#06080e" : "var(--text-muted)",
                boxShadow: screen === "login" ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "none",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Log In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={screen === "signup"}
              onClick={() => handleSwitchTab("signup")}
              style={{
                padding: "9px 0",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.86rem",
                fontWeight: 700,
                cursor: "pointer",
                background:
                  screen === "signup"
                    ? isTalent
                      ? "linear-gradient(135deg, #d4af37 0%, #b89327 100%)"
                      : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)"
                    : "transparent",
                color: screen === "signup" ? "#06080e" : "var(--text-muted)",
                boxShadow: screen === "signup" ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "none",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* ===================== ERROR / SUCCESS ALERTS ===================== */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#fca5a5",
              fontSize: "0.82rem",
              lineHeight: 1.45,
              marginBottom: "18px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successInfo && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 14px",
              borderRadius: "12px",
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              color: "#86efac",
              fontSize: "0.82rem",
              lineHeight: 1.45,
              marginBottom: "18px",
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{successInfo}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* ===================== VIEW A: LOGIN FORM ======================== */}
        {/* ================================================================= */}
        {screen === "login" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {/* Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                  letterSpacing: "0.02em",
                }}
              >
                EMAIL ADDRESS
              </label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  required
                  placeholder={isTalent ? "actor@cineconnect.com" : "casting@studio.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "14px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    letterSpacing: "0.02em",
                  }}
                >
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setScreen("forgot");
                    setErrorMessage("");
                    setSuccessInfo("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: portalAccent,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "44px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "2px 0 6px" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: portalAccent,
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Remember me on this device
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "14px",
                border: "none",
                background: isTalent
                  ? "linear-gradient(135deg, #d4af37 0%, #b89327 100%)"
                  : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                color: "#06080e",
                fontSize: "0.94rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: `0 6px 20px ${portalGlow}`,
                transition: "transform 0.1s ease, filter 0.2s ease",
                opacity: isLoading ? 0.75 : 1,
                marginTop: "4px",
              }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <span>Log In to {isTalent ? "Talent Portal" : "Production House"}</span>
              )}
            </button>

            {/* Switch to Sign Up Link */}
            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                New to CineConnect?{" "}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchTab("signup")}
                style={{
                  background: "none",
                  border: "none",
                  color: portalAccent,
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* ===================== VIEW B: SIGN UP FORM ====================== */}
        {/* ================================================================= */}
        {screen === "signup" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* Talent: Full Name */}
            {isTalent && (
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    marginBottom: "6px",
                  }}
                >
                  FULL PROFESSIONAL NAME
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                    <User size={17} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "48px",
                      paddingLeft: "42px",
                      paddingRight: "14px",
                      borderRadius: "12px",
                      background: "rgba(18, 24, 36, 0.85)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#ffffff",
                      fontSize: "0.88rem",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = portalAccent;
                      e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Production: Company & Contact Person */}
            {!isTalent && (
              <>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      marginBottom: "6px",
                    }}
                  >
                    PRODUCTION HOUSE / STUDIO NAME
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                      <Building2 size={17} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paramount Cinema Studio"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      style={{
                        width: "100%",
                        height: "48px",
                        paddingLeft: "42px",
                        paddingRight: "14px",
                        borderRadius: "12px",
                        background: "rgba(18, 24, 36, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        fontSize: "0.88rem",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = portalAccent;
                        e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      marginBottom: "6px",
                    }}
                  >
                    PRIMARY CONTACT PERSON
                  </label>
                  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                    <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                      <User size={17} />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Christopher Nolan (Head of Casting)"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      style={{
                        width: "100%",
                        height: "48px",
                        paddingLeft: "42px",
                        paddingRight: "14px",
                        borderRadius: "12px",
                        background: "rgba(18, 24, 36, 0.85)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        color: "#ffffff",
                        fontSize: "0.88rem",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = portalAccent;
                        e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                {isTalent ? "PERSONAL EMAIL ADDRESS" : "BUSINESS EMAIL ADDRESS"}
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  required
                  placeholder={isTalent ? "actor@cineconnect.com" : "casting@paramount.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "14px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                MOBILE PHONE NUMBER
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                  <Phone size={17} />
                </div>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "14px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                CREATE PASSWORD (MIN 6 CHARACTERS)
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "44px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                CONFIRM PASSWORD
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                  <Lock size={17} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "44px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px",
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Terms and Privacy Agreement */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", margin: "4px 0" }}>
              <input
                type="checkbox"
                id="agreeTerms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: portalAccent,
                  marginTop: "2px",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="agreeTerms"
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.45,
                  cursor: "pointer",
                }}
              >
                I agree to the{" "}
                <button
                  type="button"
                  onClick={() => onOpenTerms("terms")}
                  style={{
                    background: "none",
                    border: "none",
                    color: portalAccent,
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "0.8rem",
                  }}
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => onOpenTerms("privacy")}
                  style={{
                    background: "none",
                    border: "none",
                    color: portalAccent,
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "0.8rem",
                  }}
                >
                  Privacy Policy
                </button>
                .
              </label>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "14px",
                border: "none",
                background: isTalent
                  ? "linear-gradient(135deg, #d4af37 0%, #b89327 100%)"
                  : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                color: "#06080e",
                fontSize: "0.94rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: `0 6px 20px ${portalGlow}`,
                transition: "transform 0.1s ease, filter 0.2s ease",
                opacity: isLoading ? 0.75 : 1,
                marginTop: "4px",
              }}
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <span>Create {isTalent ? "Talent" : "Studio"} Account</span>
              )}
            </button>

            {/* Switch to Log In Link */}
            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <span style={{ fontSize: "0.84rem", color: "var(--text-muted)" }}>
                Already have an account?{" "}
              </span>
              <button
                type="button"
                onClick={() => handleSwitchTab("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: portalAccent,
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Log in
              </button>
            </div>
          </form>
        )}

        {/* ================================================================= */}
        {/* ===================== VIEW C: FORGOT PASSWORD =================== */}
        {/* ================================================================= */}
        {screen === "forgot" && (
          <form onSubmit={handleForgot} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                  marginBottom: "6px",
                }}
              >
                ACCOUNT EMAIL
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "14px", color: "var(--text-muted)" }}>
                  <Mail size={17} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    paddingLeft: "42px",
                    paddingRight: "14px",
                    borderRadius: "12px",
                    background: "rgba(18, 24, 36, 0.85)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = portalAccent;
                    e.currentTarget.style.boxShadow = `0 0 12px ${portalGlow}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "14px",
                border: "none",
                background: isTalent
                  ? "linear-gradient(135deg, #d4af37 0%, #b89327 100%)"
                  : "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                color: "#06080e",
                fontSize: "0.94rem",
                fontWeight: 800,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: `0 6px 20px ${portalGlow}`,
              }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => {
                setScreen("login");
                setErrorMessage("");
                setSuccessInfo("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
                textAlign: "center",
                marginTop: "10px",
              }}
            >
              Back to Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
