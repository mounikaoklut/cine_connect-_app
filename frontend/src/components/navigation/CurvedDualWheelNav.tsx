"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Home,
  Clapperboard,
  MessageSquare,
  Bell,
  UserRound,
  Settings,
  FolderHeart,
  Film,
  LucideIcon,
} from "lucide-react";

export type RouteKey =
  | "Home"
  | "Opportunities"
  | "Messages"
  | "Notifications"
  | "Profile"
  | "Settings"
  | "Pipeline";

export interface NavWheelItem {
  key: RouteKey;
  label: string;
  icon: LucideIcon;
}

export const NAV_WHEEL_ITEMS: NavWheelItem[] = [
  { key: "Home", label: "Home", icon: Home },
  { key: "Opportunities", label: "Opportunities", icon: Clapperboard },
  { key: "Messages", label: "Messages", icon: MessageSquare },
  { key: "Notifications", label: "Notification", icon: Bell },
  { key: "Profile", label: "Profile", icon: UserRound },
  { key: "Pipeline", label: "My Applications", icon: FolderHeart },
  { key: "Settings", label: "Settings", icon: Settings },
];

export interface CurvedDualWheelNavProps {
  activeRoute: RouteKey;
  onRouteSelect: (route: RouteKey) => void;
  className?: string;
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
}

export default function CurvedDualWheelNav({
  activeRoute,
  onRouteSelect,
  className = "",
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
}: CurvedDualWheelNavProps) {
  const itemCount = NAV_WHEEL_ITEMS.length;
  const angleStep = 360 / itemCount; // ~51.4 deg

  const getItemIndex = useCallback(
    (route: RouteKey): number => {
      const idx = NAV_WHEEL_ITEMS.findIndex((item) => item.key === route);
      return idx !== -1 ? idx : 0;
    },
    []
  );

  const [wheelRotation, setWheelRotation] = useState(() => -getItemIndex(activeRoute) * angleStep);
  const [isDragging, setIsDragging] = useState(false);

  const navContainerRef = useRef<HTMLElement | null>(null);
  const dragStartXRef = useRef(0);
  const startRotationRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Synchronize rotation with activeRoute using shortest path
  useEffect(() => {
    const targetIdx = getItemIndex(activeRoute);
    const targetAngle = -targetIdx * angleStep;
    setWheelRotation((prev) => {
      const diff = (((targetAngle - prev) % 360) + 540) % 360 - 180;
      return prev + diff;
    });
  }, [activeRoute, angleStep, getItemIndex]);

  const rotateToItem = useCallback(
    (index: number) => {
      const normalizedIdx = ((index % itemCount) + itemCount) % itemCount;
      const targetAngle = -normalizedIdx * angleStep;
      setWheelRotation((prev) => {
        const diff = (((targetAngle - prev) % 360) + 540) % 360 - 180;
        return prev + diff;
      });
      onRouteSelect(NAV_WHEEL_ITEMS[normalizedIdx].key);
    },
    [angleStep, itemCount, onRouteSelect]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    startRotationRef.current = wheelRotation;
    dragStartTimeRef.current = Date.now();
    hasDraggedRef.current = false;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    // Only move while actively dragging; mouse cursor movement alone never rotates the wheel
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }

    const currentAngle = startRotationRef.current + deltaX * 0.38;
    setWheelRotation(currentAngle);
  };

  const handlePointerUp = (e?: React.PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e) {
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }

    const elapsed = Math.max(1, Date.now() - dragStartTimeRef.current);
    const deltaX = (dragStartXRef.current ? (e ? e.clientX : dragStartXRef.current) : 0) - dragStartXRef.current;
    const velocity = deltaX / elapsed;

    const projectedAngle = wheelRotation + velocity * 15;

    // Find closest item
    let closestIndex = 0;
    let minDiff = Infinity;
    NAV_WHEEL_ITEMS.forEach((_, idx) => {
      const itemAngle = idx * angleStep;
      const diff = Math.abs((((itemAngle + projectedAngle) % 360) + 540) % 360 - 180);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    rotateToItem(closestIndex);

    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 80);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handlePointerUp();
    }
  };

  return (
    <nav
      ref={navContainerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseLeave={handleMouseLeave}
      aria-label="CineConnect Semi-Circle Rotating Wheel Navigation"
      className={`fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md select-none touch-none pb-[env(safe-area-inset-bottom,8px)] ${className}`}
      style={{
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      {/* Semi-Circle Frosted Glass Chassis Dome */}
      <div
        style={{
          position: "relative",
          width: "350px",
          maxWidth: "96%",
          height: "98px",
          margin: "0 auto",
          overflow: "visible",
        }}
      >
        {/* Semi-Circle Frosted Glass Chassis */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(16, 20, 30, 0.92) 0%, rgba(8, 10, 16, 0.98) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "175px 175px 0 0",
            border: "none",
            outline: "none",
            boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.85)",
            pointerEvents: "none",
          }}
        />

        {/* Semi-Circle Rotating Options Track */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          {NAV_WHEEL_ITEMS.map((item, idx) => {
            const itemBaseAngle = idx * angleStep;
            const currentAngle = (((itemBaseAngle + wheelRotation) % 360) + 540) % 360 - 180;
            const absAngle = Math.abs(currentAngle);

            // Hide options rotated out of visible range
            if (absAngle > 88) return null;

            const isApex = absAngle < 16;
            const IconComp = item.icon;

            const badgeCount =
              item.key === "Messages"
                ? unreadMessagesCount
                : item.key === "Notifications"
                ? unreadNotificationsCount
                : 0;

            // Arc positioning gracefully centered inside 98px semi-circle dome chassis
            const rad = (currentAngle * Math.PI) / 180;
            const xOffset = Math.sin(rad) * 128;
            const yOffset = 46 + (1 - Math.cos(rad)) * 20;

            // Smooth continuous scale and fade
            const scale = Math.max(0.8, 1.06 - (absAngle / 70) * 0.26);
            const opacity = absAngle > 58 ? Math.max(0, 1 - (absAngle - 58) / 28) : 1;

            return (
              <button
                key={item.key}
                type="button"
                id={`semi-wheel-route-${item.key}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasDraggedRef.current) return;
                  rotateToItem(idx);
                }}
                title={item.label}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${xOffset}px)`,
                  top: `${yOffset}px`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  transition: isDragging
                    ? "none"
                    : "all 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.25)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  opacity,
                  zIndex: isApex ? 35 : Math.round(30 - absAngle / 4),
                  pointerEvents: opacity > 0.3 ? "auto" : "none",
                }}
              >
                {/* Icon Circle Container */}
                <div
                  style={{
                    position: "relative",
                    width: isApex ? "42px" : "34px",
                    height: isApex ? "42px" : "34px",
                    borderRadius: "50%",
                    background: isApex
                      ? "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)"
                      : "rgba(18, 22, 32, 0.82)",
                    border: isApex
                      ? "2px solid #FFFFFF"
                      : "1px solid rgba(255, 255, 255, 0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isApex
                      ? "0 4px 14px rgba(255, 152, 0, 0.65), 0 0 8px rgba(255, 152, 0, 0.35)"
                      : "0 2px 6px rgba(0, 0, 0, 0.4)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {isApex && (
                    <div
                      style={{
                        position: "absolute",
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: "rgba(255, 152, 0, 0.25)",
                        filter: "blur(6px)",
                        pointerEvents: "none",
                      }}
                    />
                  )}

                  <IconComp
                    size={isApex ? 22 : 18}
                    color={isApex ? "#08090C" : "#94A3B8"}
                    strokeWidth={isApex ? 2.5 : 2.0}
                  />

                  {badgeCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-3px",
                        right: "-3px",
                        minWidth: "15px",
                        height: "15px",
                        padding: "0 3.5px",
                        borderRadius: "7.5px",
                        background: item.key === "Messages" ? "#10b981" : "#ef4444",
                        color: "#fff",
                        fontSize: "8.5px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1.5px solid #080a0f",
                      }}
                    >
                      {badgeCount}
                    </span>
                  )}
                </div>

                {/* Option Label */}
                <div
                  style={{
                    marginTop: "3px",
                    background: isApex ? "#101219" : "rgba(8, 10, 16, 0.5)",
                    border: isApex ? "1px solid #FF9800" : "1px solid transparent",
                    padding: isApex ? "1.5px 7px" : "1px 5px",
                    borderRadius: "6px",
                    boxShadow: isApex ? "0 2px 5px rgba(255, 152, 0, 0.3)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: isApex ? "9px" : "7.5px",
                      fontWeight: isApex ? 800 : 600,
                      color: isApex ? "#F5F5F5" : "#858995",
                      letterSpacing: "0.02em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
