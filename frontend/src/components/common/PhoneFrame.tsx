"use client";

import React, { useState, useEffect } from "react";
import { Wifi, BatteryMedium, Signal } from "lucide-react";

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const [currentTime, setCurrentTime] = useState("9:41");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const formatted = `${hours % 12 || 12}:${minutes < 10 ? "0" : ""}${minutes}`;
      setCurrentTime(formatted);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="phone-preview-backdrop">
      {/* Outer Phone Hardware Frame */}
      <div className="phone-device-chassis">
        {/* Android Punch Hole Camera */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#030509",
            border: "1.5px solid rgba(255, 255, 255, 0.18)",
            zIndex: 50,
            boxShadow: "inset 0 0 2px rgba(245, 247, 255, 0.2)",
          }}
          aria-hidden="true"
        />

        {/* Realistic Mobile Status Bar */}
        <header className="phone-status-bar" aria-label="Device Status Bar">
          <span className="phone-status-time">{currentTime}</span>
          <div className="phone-status-icons">
            <Signal size={12} strokeWidth={2.5} />
            <Wifi size={12} strokeWidth={2.5} />
            <div className="phone-battery-pill">
              <span className="phone-battery-level">98%</span>
              <BatteryMedium size={14} strokeWidth={2.2} />
            </div>
          </div>
        </header>

        {/* Application Viewport Screen Area */}
        <main className="phone-screen-viewport">
          {children}
        </main>

        {/* Realistic Bottom Home Indicator */}
        <footer className="phone-home-indicator-area" aria-hidden="true">
          <div className="phone-home-indicator" />
        </footer>
      </div>
    </div>
  );
}
