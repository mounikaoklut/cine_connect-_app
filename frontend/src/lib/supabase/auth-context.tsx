"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";
import { ApiClient } from "@/lib/api";
import { validateStrongPassword } from "@/lib/validation/password";

export type PortalType = "talent" | "production";

export interface CineUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  companyName?: string;
  role: PortalType;
  emailConfirmed?: boolean;
}

interface AuthContextType {
  user: CineUser | null;
  role: PortalType | null;
  selectedPortal: PortalType;
  setSelectedPortal: (portal: PortalType) => void;
  isSupabaseConfigured: boolean;
  isLoading: boolean;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  reducedMotion: boolean;
  setReducedMotion: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  login: (data: { email: string; password: string; portal: PortalType; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    name?: string;
    companyName?: string;
    phone?: string;
    portal: PortalType;
  }) => Promise<{ success: boolean; confirmationRequired?: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PORTAL_STORAGE_KEY = "cineconnect_selected_portal";
const USER_STORAGE_KEY = "cineconnect_active_user";
const SOUND_STORAGE_KEY = "cineconnect_sound_enabled";
const MOTION_STORAGE_KEY = "cineconnect_reduced_motion";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [selectedPortal, setSelectedPortalState] = useState<PortalType>("talent");
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(false);
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [user, setUser] = useState<CineUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync client-side persisted preferences and session after hydration via microtask
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedPortal = localStorage.getItem(PORTAL_STORAGE_KEY) as PortalType | null;
        if (savedPortal === "talent" || savedPortal === "production") {
          setSelectedPortalState(savedPortal);
        }

        const savedSound = localStorage.getItem(SOUND_STORAGE_KEY);
        if (savedSound !== null) {
          setSoundEnabledState(savedSound === "true");
        }

        const savedMotion = localStorage.getItem(MOTION_STORAGE_KEY);
        if (savedMotion !== null) {
          setReducedMotionState(savedMotion === "true");
        } else if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setReducedMotionState(true);
        }

        const cached = localStorage.getItem(USER_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.id && parsed.role) {
            setUser(parsed);
            setSelectedPortalState(parsed.role);
          }
        }
      } catch {
        // Ignore localStorage read failures
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  // Sync Supabase Auth listener on mount
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session }, error }: { data: { session: any }; error: any }) => {
        if (session?.user && !error) {
          const meta = session.user.user_metadata || {};
          const detectedRole: PortalType = meta.role === "production" ? "production" : "talent";
          const activeUser: CineUser = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone || meta.phone,
            name: meta.name || meta.full_name || session.user.email?.split("@")[0],
            companyName: meta.company_name || meta.companyName,
            role: detectedRole,
            emailConfirmed: Boolean(session.user.confirmed_at || session.user.email_confirmed_at),
          };
          setUser(activeUser);
          setSelectedPortalState(detectedRole);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        if (session?.user) {
          const meta = session.user.user_metadata || {};
          const detectedRole: PortalType = meta.role === "production" ? "production" : "talent";
          const activeUser: CineUser = {
            id: session.user.id,
            email: session.user.email,
            phone: session.user.phone || meta.phone,
            name: meta.name || meta.full_name || session.user.email?.split("@")[0],
            companyName: meta.company_name || meta.companyName,
            role: detectedRole,
            emailConfirmed: Boolean(session.user.confirmed_at || session.user.email_confirmed_at),
          };
          setUser(activeUser);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(activeUser));
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const setSelectedPortal = (portal: PortalType) => {
    setSelectedPortalState(portal);
    if (typeof window !== "undefined") {
      localStorage.setItem(PORTAL_STORAGE_KEY, portal);
    }
  };

  const setSoundEnabled = (value: boolean | ((prev: boolean) => boolean)) => {
    setSoundEnabledState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      return next;
    });
  };

  const setReducedMotion = (value: boolean | ((prev: boolean) => boolean)) => {
    setReducedMotionState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      localStorage.setItem(MOTION_STORAGE_KEY, String(next));
      return next;
    });
  };

  const login = async ({
    email,
    password,
    portal,
    rememberMe = true,
  }: {
    email: string;
    password: string;
    portal: PortalType;
    rememberMe?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: "Unable to retrieve user credentials." };
        }

        const meta = data.user.user_metadata || {};
        const userRole: PortalType = meta.role === "production" ? "production" : "talent";

        const loggedInUser: CineUser = {
          id: data.user.id,
          email: data.user.email,
          phone: data.user.phone || meta.phone,
          name: meta.name || meta.full_name || data.user.email?.split("@")[0],
          companyName: meta.company_name || meta.companyName,
          role: userRole,
          emailConfirmed: Boolean(data.user.confirmed_at || data.user.email_confirmed_at),
        };

        setUser(loggedInUser);
        setSelectedPortal(userRole);

        if (rememberMe) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        } else {
          sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        }

        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Network error during authentication.";
        return { success: false, error: message };
      }
    }

    // If Supabase credentials are not yet configured in .env.local
    // Check if FastAPI backend is reachable
    try {
      const res = await ApiClient.login({ email, password });
      if (res && res.user) {
        const loggedInUser: CineUser = {
          id: res.user.id,
          email: res.user.email,
          phone: res.user.phone,
          name: res.user.name || email.split("@")[0],
          companyName: portal === "production" ? res.user.name : undefined,
          role: portal,
          emailConfirmed: res.user.email_verified,
        };
        setUser(loggedInUser);
        setSelectedPortal(portal);
        if (rememberMe) {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
        }
        return { success: true };
      }
    } catch {
      // Backend not running either
    }

    // Explicit user-friendly message when auth service is unreachable
    return {
      success: false,
      error: "Authentication service is temporarily unavailable. Please verify your credentials or try again later.",
    };
  };

  const register = async ({
    email,
    password,
    name,
    companyName,
    phone,
    portal,
  }: {
    email: string;
    password: string;
    name?: string;
    companyName?: string;
    phone?: string;
    portal: PortalType;
  }): Promise<{ success: boolean; confirmationRequired?: boolean; error?: string }> => {
    const pwCheck = validateStrongPassword(password);
    if (!pwCheck.isValid) {
      return { success: false, error: pwCheck.error || "Password does not meet security requirements." };
    }

    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role: portal,
              name: name || companyName,
              company_name: companyName,
              phone: phone || null,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const isConfirmed = Boolean(data.user.confirmed_at || data.user.email_confirmed_at);
          const meta = data.user.user_metadata || {};

          const newUser: CineUser = {
            id: data.user.id,
            email: data.user.email,
            phone: phone || data.user.phone,
            name: name || meta.name || email.split("@")[0],
            companyName: companyName || meta.company_name,
            role: portal,
            emailConfirmed: isConfirmed,
          };

          if (data.session) {
            setUser(newUser);
            setSelectedPortal(portal);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            return { success: true, confirmationRequired: false };
          } else {
            // Confirmation email sent
            return { success: true, confirmationRequired: true };
          }
        }

        return { success: false, error: "Signup returned an empty response. Please try again." };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create account.";
        return { success: false, error: message };
      }
    }

    // Fallback attempt with backend API if running
    try {
      const res = await ApiClient.register({
        email,
        password,
        name: (name || companyName || email.split("@")[0]),
      });
      if (res && res.user) {
        const newUser: CineUser = {
          id: res.user.id,
          email: res.user.email,
          phone,
          name: res.user.name,
          companyName,
          role: portal,
          emailConfirmed: false,
        };
        setUser(newUser);
        setSelectedPortal(portal);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        return { success: true, confirmationRequired: false };
      }
    } catch {
      // Backend not running
    }

    return {
      success: false,
      error: "Registration service is temporarily unavailable. Please try again later.",
    };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback?type=recovery` : undefined,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to send recovery email.";
        return { success: false, error: message };
      }
    }

    return {
      success: false,
      error: "Password reset service is temporarily unavailable. Please try again later.",
    };
  };

  const logout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue clearing local state
      }
    }
    ApiClient.clearAuth();
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        selectedPortal,
        setSelectedPortal,
        isSupabaseConfigured,
        isLoading,
        soundEnabled,
        setSoundEnabled,
        reducedMotion,
        setReducedMotion,
        login,
        register,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
