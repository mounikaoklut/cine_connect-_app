"use client";

import React, { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Music } from "lucide-react";

interface FeedVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  soundTrack?: string;
  aspectRatio?: string;
  maxHeight?: string;
  onOpenFullscreen?: () => void;
}

export default function FeedVideoPlayer({
  src,
  poster,
  title,
  soundTrack,
  aspectRatio = "16 / 9",
  maxHeight = "440px",
  onOpenFullscreen,
}: FeedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const overlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Autoplay immediately on mount in background & when scrolled into view
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Browser policy: muted video can always autoplay in background
    video.muted = isMuted;
    const attemptPlay = () => {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser blocked with sound, force mute and autoplay in background
          video.muted = true;
          setIsMuted(true);
          video.play().then(() => setIsPlaying(true)).catch(() => {});
        });
    };

    attemptPlay();

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
            attemptPlay();
          } else if (!entry.isIntersecting) {
            video.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: [0, 0.1, 0.5] }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
      if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    };
  }, [isMuted]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }

    // Flash play/pause icon in center
    setShowPlayOverlay(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => setShowPlayOverlay(false), 700);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !isMuted;
    video.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleTogglePlay}
      style={{
        position: "relative",
        width: "100%",
        maxHeight,
        aspectRatio,
        borderRadius: "14px",
        overflow: "hidden",
        backgroundColor: "#07090E",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        autoPlay
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Subtle top & bottom shadow gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.75) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Floating Center Play / Pause Indicator on Tap */}
      {showPlayOverlay && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            border: "2px solid rgba(255, 165, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFA500",
            pointerEvents: "none",
            animation: "pulse 0.4s ease-out",
          }}
        >
          {isPlaying ? <Play size={28} fill="#FFA500" /> : <Pause size={28} />}
        </div>
      )}

      {/* Top Floating Controls: Sound Button & Fullscreen */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          zIndex: 5,
        }}
      >
        <button
          type="button"
          onClick={handleToggleMute}
          title={isMuted ? "Unmute audio" : "Mute audio"}
          style={{
            background: isMuted ? "rgba(0, 0, 0, 0.65)" : "rgba(255, 165, 0, 0.9)",
            color: isMuted ? "#FFFFFF" : "#0D0E12",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "9999px",
            padding: "6px 10px",
            fontSize: "0.72rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            backdropFilter: "blur(6px)",
            transition: "all 0.15s ease",
            boxShadow: isMuted ? "none" : "0 2px 10px rgba(255, 165, 0, 0.5)",
          }}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{isMuted ? "Muted" : "Sound On"}</span>
        </button>

        {onOpenFullscreen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFullscreen();
            }}
            title="Expand Fullscreen"
            style={{
              background: "rgba(0, 0, 0, 0.65)",
              color: "#FFFFFF",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
            }}
          >
            <Maximize2 size={14} />
          </button>
        )}
      </div>

      {/* Bottom Track Info & Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          zIndex: 5,
        }}
      >
        {soundTrack && (
          <div
            style={{
              padding: "0 12px 8px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#FFA500",
              fontSize: "0.72rem",
              fontWeight: 600,
            }}
          >
            <Music size={12} />
            <span
              style={{
                color: "#E2E8F0",
                maxWidth: "70%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {soundTrack}
            </span>
          </div>
        )}

        {/* Video progress line */}
        <div
          style={{
            width: "100%",
            height: "3px",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "#FFA500",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      </div>
    </div>
  );
}
