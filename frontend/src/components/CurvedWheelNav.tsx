"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Clapperboard,
  MessageSquare,
  Bell,
  UserRound,
  Settings,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  subtitle: string;
  path: string;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: "home", label: "Home", subtitle: "Studio Feed & Stream", path: "/home", icon: Home },
  { id: "search", label: "Search", subtitle: "Find Talent & Castings", path: "/search", icon: Search },
  { id: "opportunities", label: "Opportunities", subtitle: "Auditions & Roles", path: "/opportunities", icon: Clapperboard },
  { id: "notifications", label: "Notifications", subtitle: "Callbacks & Match", path: "/notifications", icon: Bell },
  { id: "profile", label: "Profile", subtitle: "Showreels & Bio", path: "/profile", icon: UserRound },
  { id: "messages", label: "Messages", subtitle: "Production DMs", path: "/messages", icon: MessageSquare },
  { id: "settings", label: "Settings", subtitle: "App & Security", path: "/settings", icon: Settings },
];

// Preserved for backward-compatibility if referenced elsewhere
export const NAVIGATION_SETS = [
  {
    id: 0,
    name: "Set A",
    primary: { id: "home", label: "Home", path: "/home", icon: Home },
    companion: { id: "opportunities", label: "Opportunities", path: "/opportunities", icon: Clapperboard },
  },
];

export interface CurvedWheelNavProps {
  currentActivePath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
}

export default function CurvedWheelNav({
  currentActivePath,
  onNavigate,
  className = "",
  unreadMessagesCount = 2,
  unreadNotificationsCount = 5,
}: CurvedWheelNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activePath = currentActivePath || pathname || "/home";

  const handleNavClick = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  return (
    <nav
      aria-label="Bottom Navigation Bar"
      className={className}
      style={{
        position: "fixed",
        bottom: "18px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 90,
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(12, 16, 26, 0.85)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        border: "none",
        boxShadow:
          "0 14px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.16)",
        borderRadius: "9999px",
        padding: "7px 12px",
        userSelect: "none",
        maxWidth: "calc(100vw - 28px)",
        overflowX: "auto",
      }}
    >
      {NAVIGATION_ITEMS.map((item) => {
        const cleanPath = activePath === "/" ? "/home" : activePath;
        const isActive = cleanPath === item.path || (cleanPath.startsWith(item.path) && item.path !== "/home");
        const IconComp = item.icon;
        const isNotif = item.id === "notifications" && unreadNotificationsCount > 0;
        const isMsg = item.id === "messages" && unreadMessagesCount > 0;

        return (
          <button
            key={item.id}
            id={`bottom-nav-${item.id}`}
            type="button"
            onClick={() => handleNavClick(item.path)}
            title={`${item.label} • ${item.subtitle}`}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "3px",
              padding: "7px 14px",
              borderRadius: "9999px",
              background: isActive
                ? "linear-gradient(135deg, rgba(255, 165, 0, 0.24) 0%, rgba(255, 133, 0, 0.12) 100%)"
                : "transparent",
              border: "none",
              color: isActive ? "#FFA500" : "#94A3B8",
              cursor: "pointer",
              transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
              boxShadow: isActive ? "0 0 16px rgba(255, 165, 0, 0.3)" : "none",
              minWidth: "64px",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#94A3B8";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {/* Icon + Live Badge */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconComp
                size={19}
                color={isActive ? "#FFA500" : "currentColor"}
                strokeWidth={isActive ? 2.5 : 1.9}
              />

              {/* Live Badge for Notifications */}
              {isNotif && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-8px",
                    minWidth: "15px",
                    height: "15px",
                    borderRadius: "8px",
                    background: "#FF3B5C",
                    color: "#FFFFFF",
                    fontSize: "9px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 2px",
                    boxShadow: "0 0 8px rgba(255, 59, 92, 0.8)",
                  }}
                >
                  {unreadNotificationsCount}
                </span>
              )}

              {/* Live Badge for Messages */}
              {isMsg && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-8px",
                    minWidth: "15px",
                    height: "15px",
                    borderRadius: "8px",
                    background: "#FFA500",
                    color: "#0D0E12",
                    fontSize: "9px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 2px",
                    boxShadow: "0 0 8px rgba(255, 165, 0, 0.8)",
                  }}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: isActive ? 800 : 500,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
