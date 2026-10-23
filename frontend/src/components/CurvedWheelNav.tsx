"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
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

  // Identify which set contains activePath
  const getSetIndex = useCallback((path: string): number => {
    const cleanPath = path === "/" ? "/home" : path;
    const found = NAVIGATION_SETS.find(
      (s) => s.primary.path === cleanPath || s.companion.path === cleanPath
    );
    return found ? found.id : 0;
  }, []);

  const [currentSetIndex, setCurrentSetIndex] = useState(() => getSetIndex(activePath));
  const [dragOffset, setDragOffset] = useState(0);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const hasSwipedRef = useRef(false);
  const lastAngleRef = useRef<number | null>(null);
  const rotaryAccumulatorRef = useRef(0);
  const wheelCooldownRef = useRef(0);
  const navRef = useRef<HTMLElement | null>(null);

  const rotateTo = useCallback(
    (index: number) => {
      let next = ((index % NAVIGATION_SETS.length) + NAVIGATION_SETS.length) % NAVIGATION_SETS.length;
      setCurrentSetIndex(next);

      const targetSet = NAVIGATION_SETS[next];
      const cleanPath = activePath === "/" ? "/home" : activePath;
      if (
        cleanPath !== targetSet.primary.path &&
        cleanPath !== targetSet.companion.path
      ) {
        if (onNavigate) {
          onNavigate(targetSet.primary.path);
        } else {
          router.push(targetSet.primary.path);
        }
      }
    },
    [activePath, onNavigate, router]
  );

  const handleMouseLeave = () => {
    if (isDragging) {
      handlePointerUp();
    }
  };

  useEffect(() => {
    setCurrentSetIndex(getSetIndex(activePath));
  }, [activePath, getSetIndex]);

  const handleRouteSelect = (path: string) => {
    if (hasSwipedRef.current) return;
    if (onNavigate) {
      onNavigate(path);
    } else {
      router.push(path);
    }
  };

  // Horizontal touch / drag & rotary swipe handling
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    dragStartTimeRef.current = Date.now();
    hasSwipedRef.current = false;
    rotaryAccumulatorRef.current = 0;

    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      lastAngleRef.current = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Nav bar stays completely still when simply moving cursor - only moves during active drag
    if (!isDragging) return;

    const deltaX = e.clientX - startXRef.current;
    const deltaY = e.clientY - startYRef.current;

    if (Math.hypot(deltaX, deltaY) > 6) {
      hasSwipedRef.current = true;
    }

    setDragOffset(deltaX);

    // Rotary angular calculation during drag
    if (navRef.current && lastAngleRef.current !== null) {
      const rect = navRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const currAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let angleDiff = currAngle - lastAngleRef.current;
      if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      rotaryAccumulatorRef.current += angleDiff * (180 / Math.PI);
      lastAngleRef.current = currAngle;
    }

    setWheelRotation(deltaX * 0.45 + rotaryAccumulatorRef.current * 0.4);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const elapsed = Math.max(1, Date.now() - dragStartTimeRef.current);
    const velocity = dragOffset / elapsed;
    const totalRotary = rotaryAccumulatorRef.current;

    const isSwipeLeft = dragOffset < -26 || velocity < -0.25 || totalRotary < -30;
    const isSwipeRight = dragOffset > 26 || velocity > 0.25 || totalRotary > 30;

    if (isSwipeLeft) {
      rotateTo(currentSetIndex + 1);
    } else if (isSwipeRight) {
      rotateTo(currentSetIndex - 1);
    }

    setDragOffset(0);
    setWheelRotation(0);
    lastAngleRef.current = null;
    rotaryAccumulatorRef.current = 0;

    setTimeout(() => {
      hasSwipedRef.current = false;
    }, 120);
  };

  const handleWheel = (e: React.WheelEvent<HTMLElement>) => {
    const now = Date.now();
    if (now - wheelCooldownRef.current < 260) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 16) {
      wheelCooldownRef.current = now;
      if (delta > 0) {
        rotateTo(currentSetIndex + 1);
      } else {
        rotateTo(currentSetIndex - 1);
      }
    }
  };

  const currentSet = NAVIGATION_SETS[currentSetIndex];
  const cleanPath = activePath === "/" ? "/home" : activePath;

  const isPrimaryActive = cleanPath === currentSet.primary.path;
  const isCompanionActive = cleanPath === currentSet.companion.path;

  return (
    <nav
      ref={navRef}
      aria-label="CineConnect Curved Bottom Navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md select-none pb-[env(safe-area-inset-bottom,10px)] ${className}`}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      style={{
        transform: isDragging ? `translateX(${dragOffset * 0.15}px)` : "none",
        transition: isDragging
          ? "none"
          : "transform 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
        cursor: isDragging ? "grabbing" : "default",
        touchAction: "pan-y",
      }}
    >
      {/* Transparent crystal glass curved dock */}
      <div className="relative overflow-hidden rounded-t-[28px] border-t border-white/25 bg-gradient-to-b from-white/[0.06] to-transparent px-4 pt-2 pb-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
        {/* Subtle glass specular rim line */}
        <div
          className="absolute top-0 left-1/4 right-1/4 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent shadow-[0_0_8px_rgba(255,255,255,0.4)]"
          style={{
            transform: isDragging ? `translateX(${dragOffset * 0.3}px)` : "none",
            transition: isDragging ? "none" : "transform 0.45s ease",
          }}
        />

        {/* 4 Set Indicator Dots */}
        <div
          className="absolute top-1.5 left-0 right-0 z-20 flex justify-center gap-1.5"
          style={{
            transform: isDragging ? `translateX(${dragOffset * 0.2}px)` : "none",
            transition: isDragging ? "none" : "transform 0.45s ease",
          }}
        >
          {NAVIGATION_SETS.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.name}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => rotateTo(s.id)}
              className={`h-1 rounded-full transition-all duration-200 ${
                currentSetIndex === s.id
                  ? "w-4 bg-[#FF9800] shadow-[0_0_6px_#FF9800]"
                  : "w-1.5 bg-white/25 hover:bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Exactly Two Navigation Options on the Curved Dock */}
        <div className="relative flex h-[68px] items-center justify-center px-4">
          <div
            className="relative flex flex-1 items-center justify-around max-w-[280px]"
            style={{
              transform: isDragging
                ? `translateX(${dragOffset}px) rotate(${wheelRotation * 0.45}deg)`
                : "none",
              transition: isDragging
                ? "none"
                : "transform 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
            }}
          >
            {/* Option 1 (Primary) */}
            <WheelOptionItem
              item={currentSet.primary}
              isActive={isPrimaryActive}
              onSelect={() => handleRouteSelect(currentSet.primary.path)}
            />

            {/* Option 2 (Companion) */}
            <WheelOptionItem
              item={currentSet.companion}
              isActive={isCompanionActive}
              onSelect={() => handleRouteSelect(currentSet.companion.path)}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}

function WheelOptionItem({
  item,
  isActive,
  onSelect,
}: {
  item: NavPairItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  const IconComponent = item.icon;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className="group relative flex flex-col items-center justify-center focus:outline-none z-10 cursor-pointer"
      aria-label={`${item.label} (${isActive ? "Active" : "Inactive"})`}
    >
      {/* Active Option: Amber-orange circular button, white border, soft glow */}
      {isActive ? (
        <>
          {/* Soft orange glow */}
          <div className="absolute -top-1 h-12 w-12 rounded-full bg-[#FF9800]/25 blur-md pointer-events-none" />

          {/* Compact Amber Circular Button */}
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full border-1.5 border-white bg-[#FF9800] text-[#08090C] shadow-[0_2px_12px_rgba(255,152,0,0.65)] transition-transform group-hover:scale-105 active:scale-95">
            <IconComponent className="h-5 w-5 stroke-[2.4]" />
          </div>

          {/* Translucent capsule with amber border and white text directly below */}
          <span className="mt-1 rounded-full border border-[#FF9800]/80 bg-black/45 px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-[#F5F5F5] shadow-sm shadow-[#FF9800]/30">
            {item.label}
          </span>
        </>
      ) : (
        /* Inactive Option: Sleek translucent dark circular button, thin border, muted icon */
        <>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-[#858995] transition-all hover:border-[#FF9800]/40 hover:text-[#F5F5F5] active:scale-95">
            <IconComponent className="h-4.5 w-4.5 stroke-[1.8]" />
          </div>

          {/* Subtle secondary label */}
          <span className="mt-1 text-[9.5px] font-semibold text-[#858995] transition-colors group-hover:text-[#F5F5F5]">
            {item.label}
          </span>
        </>
      )}
    </button>
  );
}

