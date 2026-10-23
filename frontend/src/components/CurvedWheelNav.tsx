"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Clapperboard,
  MessageSquare,
  Bell,
  UserRound,
  Settings,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from "lucide-react";

export interface NavPairItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSet {
  id: number;
  name: string;
  primary: NavPairItem;
  companion: NavPairItem;
}

export interface NavItem {
  id: string;
  label: string;
  subtitle: string;
  path: string;
  icon: LucideIcon;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { id: "home", label: "Home", subtitle: "Studio Feed", path: "/home", icon: Home },
  { id: "opportunities", label: "Opportunities", subtitle: "Auditions & Roles", path: "/opportunities", icon: Clapperboard },
  { id: "messages", label: "Messages", subtitle: "Production DMs", path: "/messages", icon: MessageSquare },
  { id: "applications", label: "My Applications", subtitle: "Applied Castings", path: "/applications", icon: FileText },
  { id: "notifications", label: "Notifications", subtitle: "Callbacks & Match", path: "/notifications", icon: Bell },
  { id: "profile", label: "Profile", subtitle: "Showreels & Bio", path: "/profile", icon: UserRound },
  { id: "portfolio", label: "Media Vault", subtitle: "Portfolios", path: "/portfolio", icon: Layers },
  { id: "settings", label: "Settings", subtitle: "App & Security", path: "/settings", icon: Settings },
];

export const NAVIGATION_SETS: NavSet[] = [
  {
    id: 0,
    name: "Set A",
    primary: { id: "home", label: "Home", path: "/home", icon: Home },
    companion: { id: "opportunities", label: "Opportunities", path: "/opportunities", icon: Clapperboard },
  },
  {
    id: 1,
    name: "Set B",
    primary: { id: "messages", label: "Messages", path: "/messages", icon: MessageSquare },
    companion: { id: "applications", label: "My Applications", path: "/applications", icon: FileText },
  },
  {
    id: 2,
    name: "Set C",
    primary: { id: "profile", label: "Profile", path: "/profile", icon: UserRound },
    companion: { id: "settings", label: "Settings", path: "/settings", icon: Settings },
  },
  {
    id: 3,
    name: "Set D",
    primary: { id: "portfolio", label: "Media Vault", path: "/portfolio", icon: Layers },
    companion: { id: "notifications", label: "Notifications", path: "/portfolio", icon: Bell },
  },
];

export interface CurvedWheelNavProps {
  currentActivePath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export default function CurvedWheelNav({
  currentActivePath,
  onNavigate,
  className = "",
}: CurvedWheelNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const activePath = currentActivePath || pathname || "/home";

  // Identify which item corresponds to activePath
  const getItemIndex = useCallback((path: string): number => {
    const cleanPath = path === "/" ? "/home" : path;
    const found = NAVIGATION_ITEMS.findIndex((item) => item.path === cleanPath);
    return found !== -1 ? found : 0;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(() => getItemIndex(activePath));
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const hasSwipedRef = useRef(false);
  const wheelCooldownRef = useRef(0);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setCurrentIndex(getItemIndex(activePath));
  }, [activePath, getItemIndex]);

  const navigateTo = useCallback(
    (index: number) => {
      const next = ((index % NAVIGATION_ITEMS.length) + NAVIGATION_ITEMS.length) % NAVIGATION_ITEMS.length;
      setCurrentIndex(next);
      const targetItem = NAVIGATION_ITEMS[next];
      const cleanPath = activePath === "/" ? "/home" : activePath;
      if (cleanPath !== targetItem.path) {
        if (onNavigate) {
          onNavigate(targetItem.path);
        } else {
          router.push(targetItem.path);
        }
      }
    },
    [activePath, onNavigate, router]
  );

  const handleNext = () => navigateTo(currentIndex + 1);
  const handlePrev = () => navigateTo(currentIndex - 1);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    hasSwipedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (Math.hypot(deltaX, deltaY) > 8) {
      hasSwipedRef.current = true;
    }
    setDragOffset(deltaX);

    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
      startXRef.current = e.clientX;
      setIsDragging(false);
      setDragOffset(0);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - wheelCooldownRef.current < 220) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 10) {
      wheelCooldownRef.current = now;
      if (delta > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  const currentItem = NAVIGATION_ITEMS[currentIndex] || NAVIGATION_ITEMS[0];
  const wheelRotation = currentIndex * 45 + dragOffset * 0.4;

  return (
    <nav
      ref={navRef}
      aria-label="CineConnect Semi-Circle Rotating Wheel Navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md select-none pb-[env(safe-area-inset-bottom,6px)] ${className}`}
      onMouseLeave={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{
        transform: isDragging ? `translateX(${dragOffset * 0.15}px)` : "none",
        transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
        cursor: isDragging ? "grabbing" : "default",
        touchAction: "pan-y",
      }}
    >
      {/* Prominent Semi-Circle Rotating Wheel Crystal Dock */}
      <div
        className="relative h-[124px] overflow-hidden border-t-[2.5px] border-[#FF9800] bg-gradient-to-b from-[#101420]/96 via-[#080a10]/99 to-[#04060a]/99 px-2 pt-1.5 shadow-[0_-8px_28px_rgba(255,152,0,0.45),0_-14px_40px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
        style={{
          borderRadius: "50% 50% 0 0 / 44px 44px 0 0",
        }}
      >
        {/* Top Amber Specular Glare Arc */}
        <div className="absolute top-0 left-[15%] right-[15%] h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-[#FFE082] via-[#FF9800] to-transparent shadow-[0_0_14px_#FF9800,0_0_24px_rgba(255,152,0,0.7)]" />

        {/* Semi-Circle Arc SVG Rim Highlight Contour */}
        <svg
          className="pointer-events-none absolute top-0 left-0 h-[54px] w-full overflow-visible"
          viewBox="0 0 400 54"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curvedWheelRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="20%" stopColor="rgba(255, 152, 0, 0.35)" />
              <stop offset="50%" stopColor="rgba(255, 152, 0, 1)" />
              <stop offset="80%" stopColor="rgba(255, 152, 0, 0.35)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path
            d="M 0 44 Q 200 2 400 44"
            fill="none"
            stroke="url(#curvedWheelRim)"
            strokeWidth="2.5"
          />
        </svg>

        {/* Rotating Wheel Dial Disc with Concentric Track & 8 Graduation Ticks */}
        <div
          className="pointer-events-none absolute -bottom-[150px] left-1/2 h-[350px] w-[350px] -ml-[175px] rounded-full border-2 border-dashed border-[#FF9800]/30 shadow-[inset_0_0_30px_rgba(255,152,0,0.12)]"
          style={{
            transform: `rotate(${wheelRotation}deg)`,
            transition: isDragging ? "none" : "transform 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
          }}
        >
          {/* Inner concentric bezel */}
          <div className="absolute inset-[26px] rounded-full border border-[#FF9800]/15" />

          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div
              key={deg}
              className="absolute top-0 left-1/2 h-3 w-[2px] -ml-[1px]"
              style={{
                background: i === currentIndex ? "#FF9800" : "rgba(255, 255, 255, 0.28)",
                boxShadow: i === currentIndex ? "0 0 10px #FF9800" : "none",
                transformOrigin: "50% 175px",
                transform: `rotate(${deg}deg)`,
              }}
            />
          ))}
        </div>

        {/* All 8 Destinations Arrayed Along Semi-Circle Trigonometric Arc (100% Fully Visible) */}
        <div className="relative z-20 h-[82px] w-full">
          {NAVIGATION_ITEMS.map((item, idx) => {
            const isActive = currentIndex === idx;
            const IconComp = item.icon;

            // 8 exact angles spanning the upper semi-circle from -65° to +65°
            const ARC_ANGLES = [-65, -46.5, -28, -9.5, 9.5, 28, 46.5, 65];
            const angleDeg = ARC_ANGLES[idx];
            const rad = (angleDeg * Math.PI) / 180;

            // Semi-circular trigonometry with 148px radius
            const xOffset = Math.sin(rad) * 148;
            // Parabolic vertical drop: apex is highest at y = 16px, edges at y = 45px
            const yOffset = 16 + (1 - Math.cos(rad)) * 46;

            return (
              <button
                key={item.id}
                type="button"
                id={`curved-nav-item-${item.id}`}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo(idx);
                }}
                title={item.label}
                className="group absolute flex flex-col items-center justify-center cursor-pointer outline-none"
                style={{
                  left: `calc(50% + ${xOffset}px)`,
                  top: `${yOffset}px`,
                  transform: `translate(-50%, -50%) ${isActive ? "scale(1.2) translateY(-4px)" : "scale(0.96)"}`,
                  transition: "all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                  zIndex: isActive ? 35 : 20,
                }}
              >
                {/* Glowing Aura Ring for Active 1-by-1 Item */}
                {isActive && (
                  <div className="pointer-events-none absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF9800]/45 blur-lg" />
                )}

                {/* Circular Icon Container */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-250 ${
                    isActive
                      ? "h-[38px] w-[38px] border-[2.5px] border-white bg-gradient-to-tr from-[#FFB300] to-[#FF9800] text-[#08090C] shadow-[0_4px_18px_rgba(255,152,0,0.8),0_0_12px_rgba(255,152,0,0.5)]"
                      : "h-7 w-7 border border-white/16 bg-[#141824]/88 text-slate-300 shadow-sm hover:border-white/30 hover:text-white"
                  }`}
                >
                  <IconComp
                    size={isActive ? 20 : 14}
                    color={isActive ? "#08090C" : "#CBD5E1"}
                    strokeWidth={isActive ? 2.6 : 2}
                  />
                </div>

                {/* Option Label */}
                <div
                  className={`mt-0.5 rounded px-1 transition-all duration-200 ${
                    isActive
                      ? "border border-[#FF9800] bg-[#101219] shadow-[0_2px_6px_rgba(255,152,0,0.4)]"
                      : "bg-transparent"
                  }`}
                >
                  <span
                    className={`whitespace-nowrap ${
                      item.label.length > 8 ? "text-[6.8px]" : "text-[7.5px]"
                    } ${isActive ? "font-extrabold text-white" : "font-semibold text-slate-400"}`}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Controls: Prev (←) + Active Subtitle Pill + 8 Indicator Beads + Next (→) */}
        <div className="relative z-30 flex items-center justify-between px-2 pt-0.5 pb-1">
          {/* Prev 1-by-1 Stepper Button */}
          <button
            type="button"
            id="curved-nav-prev-btn"
            title="Previous destination"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="flex items-center gap-1 rounded-xl border border-white/16 bg-white/[0.08] px-2.5 py-0.5 text-slate-200 transition-colors hover:border-[#FF9800]/50 hover:text-white active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
            <span className="text-[8px] font-bold">Prev</span>
          </button>

          {/* Center: Active Tab Pill & 8-Dot Dial Stream */}
          <div className="flex items-center gap-2">
            {/* Active Tab Subtitle Pill */}
            <div className="flex items-center gap-1 rounded-lg border border-[#FF9800]/50 bg-[#FF9800]/18 px-2 py-0.5">
              <span className="text-[8px] font-extrabold text-[#FF9800]">
                {currentItem.label}
              </span>
              <span className="text-[7.5px] font-semibold text-slate-200">
                • {currentItem.subtitle}
              </span>
            </div>

            {/* 8 Indicator Beads */}
            <div className="flex items-center gap-1">
              {NAVIGATION_ITEMS.map((item, idx) => {
                const isSelected = currentIndex === idx;
                return (
                  <button
                    key={`indicator-${item.id}`}
                    type="button"
                    title={item.label}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateTo(idx);
                    }}
                    className={`h-1 cursor-pointer rounded-full transition-all duration-200 ${
                      isSelected
                        ? "w-[15px] bg-[#FF9800] shadow-[0_0_6px_#FF9800]"
                        : "w-1 bg-white/25 hover:bg-white/45"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Next 1-by-1 Stepper Button */}
          <button
            type="button"
            id="curved-nav-next-btn"
            title="Next destination"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="flex items-center gap-1 rounded-xl border border-white/16 bg-white/[0.08] px-2.5 py-0.5 text-slate-200 transition-colors hover:border-[#FF9800]/50 hover:text-white active:scale-95 cursor-pointer"
          >
            <span className="text-[8px] font-bold">Next</span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </nav>
  );
}
