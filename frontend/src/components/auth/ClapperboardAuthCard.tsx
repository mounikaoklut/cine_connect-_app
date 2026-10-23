"use client";

import React, { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useAuth, PortalType } from "@/lib/supabase/auth-context";
import {
  evaluatePasswordStrength,
  validateStrongPassword,
} from "@/lib/validation/password";

interface ClapperboardAuthCardProps {
  initialScreen?: "login" | "signup";
  onSuccess: (portal: PortalType) => void;
  onOpenTerms: (tab: "terms" | "privacy") => void;
  onBack?: () => void;
}

export function ClapperboardAuthCard({
  initialScreen = "login",
  onSuccess,
  onOpenTerms,
  onBack,
}: ClapperboardAuthCardProps) {
  const {
    selectedPortal,
    login,
    register,
    resetPassword,
  } = useAuth();

  // Screen state: "login" | "signup" | "forgot"
  const [screen, setScreen] = useState<"login" | "signup" | "forgot">(initialScreen);

  // Form input fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Talent specific field: Name
  const [fullName, setFullName] = useState("");

  // Production House specific field: Production House Name
  const [companyName, setCompanyName] = useState("");

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  const isTalent = selectedPortal === "talent";

  // Sync initialScreen / portal changes
  useEffect(() => {
    setScreen(initialScreen);
    setErrorMsg("");
    setSuccessInfo("");
  }, [initialScreen, selectedPortal]);

  // Live password strength calculation
  const passwordStrength = evaluatePasswordStrength(password);

  // Switch between Login, Sign Up, and Forgot Password while preserving the portal
  const handleSwitchScreen = (nextScreen: "login" | "signup" | "forgot") => {
    setScreen(nextScreen);
    setErrorMsg("");
    setSuccessInfo("");
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessInfo("");

    if (!email.trim()) {
      setErrorMsg(isTalent ? "Please enter your email." : "Please enter your business email.");
      return;
    }
    if (!password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({
        email: email.trim(),
        password,
        portal: selectedPortal,
        rememberMe,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Invalid email or password. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess(selectedPortal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  // Submit Registration with strong password validation
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessInfo("");

    if (isTalent && !fullName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    if (!isTalent && !companyName.trim()) {
      setErrorMsg("Please enter your Production House name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!phone.trim()) {
      setErrorMsg("Please enter your mobile number.");
      return;
    }

    // Enforce 5-point strong password requirements
    const pwCheck = validateStrongPassword(password);
    if (!pwCheck.isValid) {
      setErrorMsg(pwCheck.error || "Password does not meet the required security standards.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await register({
        email: email.trim(),
        password,
        name: isTalent ? fullName.trim() : companyName.trim(),
        companyName: !isTalent ? companyName.trim() : undefined,
        phone: phone.trim(),
        portal: selectedPortal,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Unable to register. Please check your information.");
        setIsLoading(false);
        return;
      }

      if (res.confirmationRequired) {
        setSuccessInfo("Account created! Please check your email inbox to verify your account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onSuccess(selectedPortal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during registration.";
      setErrorMsg(msg);
      setIsLoading(false);
    }
  };

  // Submit Password Reset
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessInfo("");

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address to receive recovery instructions.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(email.trim());
      if (!res.success) {
        setErrorMsg(res.error || "Unable to send reset email. Please try again.");
      } else {
        setSuccessInfo("Password recovery instructions sent. Please check your inbox.");
      }
    } catch {
      setErrorMsg("Unable to process password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        padding: "16px 18px 24px",
        background: "#070A14",
        color: "#F5F7FF",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      {/* ===================== TOP NAVIGATION: BACK ===================== */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to landing screen"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "#94A3B8",
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            marginBottom: "14px",
            padding: "4px 0",
            alignSelf: "flex-start",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F7FF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Back</span>
        </button>
      )}

      {/* ===================== CLEAN DARK FORM PANEL ===================== */}
      <div
        style={{
          width: "100%",
          maxWidth: "385px",
          margin: "0 auto",
          background: "#0C1120",
          border: "1px solid rgba(245, 247, 255, 0.1)",
          borderRadius: "16px",
          padding: "20px 18px 22px",
          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Portal Heading */}
        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#F5F7FF",
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            {isTalent ? "Talent Portal" : "Production House Portal"}
          </h1>
          <p style={{ fontSize: "13px", color: "#94A3B8", marginTop: "3px" }}>
            {isTalent
              ? screen === "login"
                ? "Log in to access your creative workspace"
                : "Create your talent account"
              : screen === "login"
              ? "Log in to access your production workspace"
              : "Register your production house"}
          </p>
        </div>

        {/* ===================== LOGIN / SIGN UP TABS ===================== */}
        {screen !== "forgot" && (
          <div
            role="tablist"
            aria-label={`${isTalent ? "Talent" : "Production House"} Portal Access`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              background: "#070A14",
              borderRadius: "10px",
              padding: "3px",
              marginBottom: "16px",
              border: "1px solid rgba(245, 247, 255, 0.08)",
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={screen === "login"}
              onClick={() => handleSwitchScreen("login")}
              style={{
                padding: "8px 0",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                background: screen === "login" ? "#8B5CF6" : "transparent",
                color: screen === "login" ? "#F5F7FF" : "#94A3B8",
                boxShadow: screen === "login" ? "0 2px 8px rgba(139, 92, 246, 0.35)" : "none",
                transition: "all 0.15s ease",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Log In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={screen === "signup"}
              onClick={() => handleSwitchScreen("signup")}
              style={{
                padding: "8px 0",
                borderRadius: "8px",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                background: screen === "signup" ? "#8B5CF6" : "transparent",
                color: screen === "signup" ? "#F5F7FF" : "#94A3B8",
                boxShadow: screen === "signup" ? "0 2px 8px rgba(139, 92, 246, 0.35)" : "none",
                transition: "all 0.15s ease",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMsg && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#FCA5A5",
              fontSize: "13px",
              lineHeight: 1.4,
              marginBottom: "14px",
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Info Message */}
        {successInfo && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              padding: "10px 12px",
              borderRadius: "8px",
              background: "rgba(37, 217, 208, 0.12)",
              border: "1px solid rgba(37, 217, 208, 0.4)",
              color: "#25D9D0",
              fontSize: "13px",
              lineHeight: 1.4,
              marginBottom: "14px",
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{successInfo}</span>
          </div>
        )}

        {/* ===================== VIEW 1: LOGIN FORM ===================== */}
        {screen === "login" && (
          <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "5px",
                }}
              >
                Email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                  <Mail size={16} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder={isTalent ? "Enter your email" : "Enter your business email"}
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    paddingLeft: "38px",
                    paddingRight: "12px",
                    borderRadius: "8px",
                    background: "#070A14",
                    border: "1px solid rgba(245, 247, 255, 0.12)",
                    color: "#F5F7FF",
                    fontSize: "14.5px",
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                <label
                  htmlFor="login-password"
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#94A3B8",
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => handleSwitchScreen("forgot")}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#25D9D0",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                  <Lock size={16} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    paddingLeft: "38px",
                    paddingRight: "40px",
                    borderRadius: "8px",
                    background: "#070A14",
                    border: "1px solid rgba(245, 247, 255, 0.12)",
                    color: "#F5F7FF",
                    fontSize: "14.5px",
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "6px",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "2px 0" }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                disabled={isLoading}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: "15px",
                  height: "15px",
                  accentColor: "#8B5CF6",
                  cursor: "pointer",
                }}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  fontSize: "13px",
                  color: "#94A3B8",
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                Remember me on this device
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "10px",
                border: "none",
                background: "#8B5CF6",
                color: "#F5F7FF",
                fontSize: "15.5px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
                opacity: isLoading ? 0.8 : 1,
                marginTop: "6px",
                transition: "all 0.15s ease",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {isLoading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </>
              )}
            </button>

            {/* Link to Signup */}
            <div style={{ textAlign: "center", marginTop: "10px", fontSize: "13.5px", color: "#94A3B8" }}>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => handleSwitchScreen("signup")}
                disabled={isLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#25D9D0",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "13.5px",
                }}
              >
                Sign up
              </button>
            </div>
          </form>
        )}

        {/* ===================== VIEW 2: SIGN UP FORM ===================== */}
        {screen === "signup" && (
          <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
            {/* Field 1: Name (Talent) / Production House Name (Production) */}
            {isTalent ? (
              <div>
                <label
                  htmlFor="signup-name"
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#94A3B8",
                    marginBottom: "4px",
                  }}
                >
                  Name
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                    <User size={16} />
                  </div>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={fullName}
                    disabled={isLoading}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      paddingLeft: "38px",
                      paddingRight: "12px",
                      borderRadius: "8px",
                      background: "#070A14",
                      border: "1px solid rgba(245, 247, 255, 0.12)",
                      color: "#F5F7FF",
                      fontSize: "14.5px",
                      fontFamily: "'Poppins', sans-serif",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#8B5CF6";
                      e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="signup-company"
                  style={{
                    display: "block",
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: "#94A3B8",
                    marginBottom: "4px",
                  }}
                >
                  Production House Name
                </label>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                    <Building2 size={16} />
                  </div>
                  <input
                    id="signup-company"
                    type="text"
                    required
                    placeholder="Enter production house name"
                    value={companyName}
                    disabled={isLoading}
                    onChange={(e) => setCompanyName(e.target.value)}
                    style={{
                      width: "100%",
                      height: "42px",
                      paddingLeft: "38px",
                      paddingRight: "12px",
                      borderRadius: "8px",
                      background: "#070A14",
                      border: "1px solid rgba(245, 247, 255, 0.12)",
                      color: "#F5F7FF",
                      fontSize: "14.5px",
                      fontFamily: "'Poppins', sans-serif",
                      outline: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#8B5CF6";
                      e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Field 2: Email */}
            <div>
              <label
                htmlFor="signup-email"
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "4px",
                }}
              >
                Email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                  <Mail size={16} />
                </div>
                <input
                  id="signup-email"
                  type="email"
                  required
                  placeholder={isTalent ? "Enter your email" : "Enter business email"}
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    paddingLeft: "38px",
                    paddingRight: "12px",
                    borderRadius: "8px",
                    background: "#070A14",
                    border: "1px solid rgba(245, 247, 255, 0.12)",
                    color: "#F5F7FF",
                    fontSize: "14.5px",
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Field 3: Mobile Number */}
            <div>
              <label
                htmlFor="signup-phone"
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "4px",
                }}
              >
                Mobile Number
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                  <Phone size={16} />
                </div>
                <input
                  id="signup-phone"
                  type="tel"
                  required
                  placeholder="Enter your mobile number"
                  value={phone}
                  disabled={isLoading}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    paddingLeft: "38px",
                    paddingRight: "12px",
                    borderRadius: "8px",
                    background: "#070A14",
                    border: "1px solid rgba(245, 247, 255, 0.12)",
                    color: "#F5F7FF",
                    fontSize: "14.5px",
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Field 4: Password */}
            <div>
              <label
                htmlFor="signup-password"
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "4px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                  <Lock size={16} />
                </div>
                <input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    paddingLeft: "38px",
                    paddingRight: "40px",
                    borderRadius: "8px",
                    background: "#070A14",
                    border: "1px solid rgba(245, 247, 255, 0.12)",
                    color: "#F5F7FF",
                    fontSize: "14.5px",
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: "6px",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Checklist */}
              {password.length > 0 && (
                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div
                    style={{
                      width: "100%",
                      height: "4px",
                      borderRadius: "999px",
                      background: "rgba(245, 247, 255, 0.1)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        background: passwordStrength.score >= 5 ? "#25D9D0" : "#8B5CF6",
                        transition: "width 0.25s ease, background 0.25s ease",
                      }}
                    />
                  </div>

                  <div style={{ fontSize: "12px", color: passwordStrength.score >= 5 ? "#25D9D0" : "#F4B942", fontWeight: 500 }}>
                    {passwordStrength.message}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                    <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: passwordStrength.lengthValid ? "rgba(37, 217, 208, 0.18)" : "rgba(245, 247, 255, 0.05)", color: passwordStrength.lengthValid ? "#25D9D0" : "#64748B" }}>
                      {passwordStrength.lengthValid ? "✓" : "○"} 8+ chars
                    </span>
                    <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: passwordStrength.hasUpper ? "rgba(37, 217, 208, 0.18)" : "rgba(245, 247, 255, 0.05)", color: passwordStrength.hasUpper ? "#25D9D0" : "#64748B" }}>
                      {passwordStrength.hasUpper ? "✓" : "○"} Upper
                    </span>
                    <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: passwordStrength.hasLower ? "rgba(37, 217, 208, 0.18)" : "rgba(245, 247, 255, 0.05)", color: passwordStrength.hasLower ? "#25D9D0" : "#64748B" }}>
                      {passwordStrength.hasLower ? "✓" : "○"} Lower
                    </span>
                    <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: passwordStrength.hasNumber ? "rgba(37, 217, 208, 0.18)" : "rgba(245, 247, 255, 0.05)", color: passwordStrength.hasNumber ? "#25D9D0" : "#64748B" }}>
                      {passwordStrength.hasNumber ? "✓" : "○"} Number
                    </span>
                    <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", background: passwordStrength.hasSpecial ? "rgba(37, 217, 208, 0.18)" : "rgba(245, 247, 255, 0.05)", color: passwordStrength.hasSpecial ? "#25D9D0" : "#64748B" }}>
                      {passwordStrength.hasSpecial ? "✓" : "○"} Special
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "10px",
                border: "none",
                background: "#8B5CF6",
                color: "#F5F7FF",
                fontSize: "15.5px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
                opacity: isLoading ? 0.8 : 1,
                marginTop: "6px",
                transition: "all 0.15s ease",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={17} strokeWidth={2.2} />
                </>
              )}
            </button>

            {/* Terms Disclaimer */}
            <p style={{ fontSize: "11.5px", color: "#64748B", textAlign: "center", margin: "4px 0 0", lineHeight: 1.4 }}>
              By signing up, you agree to our{" "}
              <button
                type="button"
                onClick={() => onOpenTerms("terms")}
                style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 0, fontSize: "11.5px" }}
              >
                Terms
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => onOpenTerms("privacy")}
                style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 0, fontSize: "11.5px" }}
              >
                Privacy Policy
              </button>
              .
            </p>

            {/* Switch Link */}
            <div style={{ textAlign: "center", marginTop: "8px", fontSize: "13.5px", color: "#94A3B8" }}>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleSwitchScreen("login")}
                disabled={isLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#25D9D0",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "13.5px",
                }}
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* ===================== VIEW 3: FORGOT PASSWORD ===================== */}
        {screen === "forgot" && (
          <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label
                htmlFor="forgot-email"
                style={{
                  display: "block",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: "#94A3B8",
                  marginBottom: "5px",
                }}
              >
                Account email
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: "12px", color: "#64748B", pointerEvents: "none" }}>
                  <Mail size={16} />
                </div>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="Enter your registered email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    paddingLeft: "38px",
                    paddingRight: "12px",
                    borderRadius: "8px",
                    background: "#070A14",
                    border: "1px solid rgba(245, 247, 255, 0.12)",
                    color: "#F5F7FF",
                    fontSize: "14.5px",
                    fontFamily: "'Poppins', sans-serif",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139, 92, 246, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(245, 247, 255, 0.12)";
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
                height: "46px",
                borderRadius: "10px",
                border: "none",
                background: "#8B5CF6",
                color: "#F5F7FF",
                fontSize: "15.5px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px rgba(139, 92, 246, 0.35)",
                marginTop: "6px",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchScreen("login")}
              disabled={isLoading}
              style={{
                background: "none",
                border: "none",
                color: "#94A3B8",
                fontSize: "13px",
                cursor: "pointer",
                textAlign: "center",
                marginTop: "6px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F5F7FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
            >
              ← Back to Log In
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
