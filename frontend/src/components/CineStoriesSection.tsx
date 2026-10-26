"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Heart,
  Send,
  CheckCircle2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Video,
  RotateCcw,
  Zap,
  ZapOff,
  Volume2,
  VolumeX,
} from "lucide-react";

export interface StorySegment {
  id: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  tag?: string;
  type?: "image" | "video";
}

export interface CineStory {
  id: string;
  userId: string;
  userName: string;
  userCraft: string;
  avatar: string;
  thumbnail: string;
  verified?: boolean;
  isUserStory?: boolean;
  isViewed?: boolean;
  segments: StorySegment[];
}

export const INITIAL_CINE_STORIES: CineStory[] = [
  {
    id: "story-user",
    userId: "user-kabir",
    userName: "My Story",
    userCraft: "Lead Actor",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
    isUserStory: true,
    isViewed: false,
    segments: [
      {
        id: "seg-user-1",
        mediaUrl: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=900&auto=format&fit=crop&q=80",
        caption: "🎬 Table read day 2. Running through act 3 scene breakdown for next week's shoot!",
        timestamp: "Just now",
        tag: "Rehearsals",
        type: "image",
      },
      {
        id: "seg-user-2",
        mediaUrl: "https://images.unsplash.com/photo-1515634928627-2a4e0dae3ddf?w=900&auto=format&fit=crop&q=80",
        caption: "Self-tape audition submitted through CineConnect portal. Fingers crossed! 🤞✨",
        timestamp: "2h ago",
        tag: "Auditions",
        type: "image",
      },
    ],
  },
  {
    id: "story-dharma",
    userId: "dharma-prods",
    userName: "Dharma Prods",
    userCraft: "Studio Banner",
    avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-dharma-1",
        mediaUrl: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900&auto=format&fit=crop&q=80",
        caption: "🔴 LIVE from Studio 4: Final Screen Tests for 'Shadow of Verity' 🎬",
        timestamp: "10m ago",
        tag: "Director Callback",
        type: "image",
      },
      {
        id: "seg-dharma-2",
        mediaUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=900&auto=format&fit=crop&q=80",
        caption: "Reviewing dramatic monologues submitted via CineConnect self-tape portal ✨",
        timestamp: "5m ago",
        tag: "Casting Room",
        type: "image",
      },
    ],
  },
  {
    id: "story-zoya",
    userId: "zoya-akhtar",
    userName: "Zoya Akhtar",
    userCraft: "Director & Showrunner",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-zoya-1",
        mediaUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&auto=format&fit=crop&q=80",
        caption: "Location scouting in Ladakh. Day 3. The light at 6am is pure cinema magic 🏔️🎥",
        timestamp: "25m ago",
        tag: "Location Scout",
        type: "image",
      },
      {
        id: "seg-zoya-2",
        mediaUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&auto=format&fit=crop&q=80",
        caption: "Framing the climax sequence. 35mm anamorphic lenses bring the valley to life.",
        timestamp: "15m ago",
        tag: "Camera Tests",
        type: "image",
      },
    ],
  },
  {
    id: "story-vikram",
    userId: "vikram-dop",
    userName: "Vikramaditya",
    userCraft: "Cinematographer (DOP)",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-vikram-1",
        mediaUrl: "https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=900&auto=format&fit=crop&q=80",
        caption: "Testing the new ARRI Alexa 35 with Cooke Anamorphic primes on soundstage 2 📸🎬",
        timestamp: "45m ago",
        tag: "Lens Tests",
        type: "image",
      },
    ],
  },
  {
    id: "story-mukesh",
    userId: "mukesh-chhabra",
    userName: "M. Chhabra",
    userCraft: "Casting Director",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-mukesh-1",
        mediaUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=900&auto=format&fit=crop&q=80",
        caption: "Auditions officially underway for period espionage drama. 120 actors screened today 🎭",
        timestamp: "1h ago",
        tag: "Cast Auditions",
        type: "image",
      },
    ],
  },
  {
    id: "story-alia",
    userId: "alia-bhatt",
    userName: "Alia Bhatt",
    userCraft: "Lead Actor",
    avatar: "https://images.unsplash.com/photo-1519741497674-611481863552?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-alia-1",
        mediaUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=900&auto=format&fit=crop&q=80",
        caption: "Costume and look trials completed for upcoming neo-noir feature. Can't wait! 👗🕶️",
        timestamp: "2h ago",
        tag: "Look Tests",
        type: "image",
      },
    ],
  },
  {
    id: "story-ranveer",
    userId: "ranveer-singh",
    userName: "Ranveer Singh",
    userCraft: "Lead Actor",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-ranveer-1",
        mediaUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=900&auto=format&fit=crop&q=80",
        caption: "Stunt choreography session with South Indian stunt masters. Bruised but charged! 💥🔥",
        timestamp: "3h ago",
        tag: "Stunt Training",
        type: "image",
      },
    ],
  },
  {
    id: "story-redchillies",
    userId: "red-chillies",
    userName: "Red Chillies VFX",
    userCraft: "VFX & Post Studio",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-rc-1",
        mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=80",
        caption: "Deep composite renders underway in Houdini & Nuke. 420 shots cleared today 🖥️✨",
        timestamp: "4h ago",
        tag: "VFX Breakdown",
        type: "image",
      },
    ],
  },
  {
    id: "story-excel",
    userId: "excel-ent",
    userName: "Excel Ent.",
    userCraft: "Production House",
    avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&auto=format&fit=crop&q=80",
    thumbnail: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&auto=format&fit=crop&q=80",
    verified: true,
    isViewed: false,
    segments: [
      {
        id: "seg-excel-1",
        mediaUrl: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=900&auto=format&fit=crop&q=80",
        caption: "Kickoff meeting for Season 3 of crime series. Writers room locked in ☕✍️",
        timestamp: "5h ago",
        tag: "Writers Room",
        type: "image",
      },
    ],
  },
];

const CINE_STORY_TAGS = [
  "#OnSet",
  "#Audition",
  "#BehindTheScenes",
  "#Casting",
  "#DirectorCut",
  "#Rehearsal",
  "#ScriptReading",
  "#Cinematography",
];

interface CineStoriesSectionProps {
  className?: string;
  onOpenCreateStory?: () => void;
}

export default function CineStoriesSection({
  className = "",
  onOpenCreateStory,
}: CineStoriesSectionProps) {
  const [stories, setStories] = useState<CineStory[]>(INITIAL_CINE_STORIES);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [toastText, setToastText] = useState<string | null>(null);
  const [likedSegments, setLikedSegments] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);

  // Horizontal stories row state & boundaries
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Instagram Story Add / Camera / Gallery states
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "image" | "video";
    name?: string;
  } | null>(null);
  const [storyCaption, setStoryCaption] = useState("");
  const [selectedTag, setSelectedTag] = useState("#OnSet");
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [cameraFlash, setCameraFlash] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewerVideoRef = useRef<HTMLVideoElement>(null);

  // Drag & Scroll Refs for the Stories Bar
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const dragThresholdCrossedRef = useRef(false);
  const justDraggedRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const scrollDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Viewer Touch/Swipe Refs
  const viewerTouchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const viewerHasSwipedRef = useRef(false);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;
  const currentSegment = activeStory ? activeStory.segments[activeSegmentIndex] : null;

  // Check scroll boundary to show/hide left & right arrows
  const checkScrollBounds = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  // Load custom stories from localStorage on mount & listen to scroll & non-passive wheel
  useEffect(() => {
    try {
      const savedUserSegments = localStorage.getItem("cineconnect_user_story_segments");
      if (savedUserSegments) {
        const parsed: StorySegment[] = JSON.parse(savedUserSegments);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStories((prev) =>
            prev.map((s, idx) =>
              idx === 0 || s.isUserStory
                ? {
                    ...s,
                    thumbnail: parsed[0].mediaUrl,
                    segments: [...parsed, ...s.segments],
                  }
                : s
            )
          );
        }
      }
    } catch {}

    const el = scrollContainerRef.current;
    if (el) {
      checkScrollBounds();
      const t1 = setTimeout(checkScrollBounds, 120);
      const t2 = setTimeout(checkScrollBounds, 500);

      const handleWheelEvent = (e: WheelEvent) => {
        // Trackpad native horizontal swipe
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          checkScrollBounds();
          return;
        }

        // Vertical mouse wheel: smoothly convert to horizontal scroll without jerking
        if (Math.abs(e.deltaY) > 0) {
          const atLeft = el.scrollLeft <= 2 && e.deltaY < 0;
          const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 && e.deltaY > 0;
          if (!atLeft && !atRight) {
            e.preventDefault();
            el.scrollLeft += e.deltaY * 0.9;
            checkScrollBounds();
          }
        }
      };

      el.addEventListener("wheel", handleWheelEvent, { passive: false });
      window.addEventListener("resize", checkScrollBounds);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        el.removeEventListener("wheel", handleWheelEvent);
        window.removeEventListener("resize", checkScrollBounds);
      };
    }
  }, []);

  // Clean up camera stream and recording on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Pause / resume viewer video playback
  useEffect(() => {
    if (viewerVideoRef.current) {
      if (isPaused) {
        viewerVideoRef.current.pause();
      } else {
        viewerVideoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, activeSegmentIndex, activeStoryIndex]);

  // Clean stop for camera stream
  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (mediaRecorderRef.current && isRecordingVideo) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsRecordingVideo(false);
    setRecordingSeconds(0);
  };

  // Launch live camera view
  const startCamera = async (facing: "user" | "environment" = cameraFacing) => {
    stopCameraStream();
    setCameraError(null);
    setShowActionSheet(false);
    setShowCameraModal(true);

    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      ) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        cameraStreamRef.current = stream;
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          cameraVideoRef.current.play().catch(() => {});
        }
      } else {
        setCameraError(
          "Camera device is not directly supported in this browser. You can take a simulated 35mm frame or upload media from your device gallery."
        );
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setCameraError(
        "Camera permission is required or device has no camera. You can snap a studio frame or choose any photo/video from your device."
      );
    }
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const handleTakeSnapshot = () => {
    if (cameraVideoRef.current && cameraStreamRef.current && !cameraError) {
      try {
        const video = cameraVideoRef.current;
        const canvas = cameraCanvasRef.current || document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          if (cameraFacing === "user") {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          stopCameraStream();
          setSelectedMedia({ url: dataUrl, type: "image", name: "Camera_Snapshot.jpg" });
          setShowCameraModal(false);
          setShowPreviewModal(true);
          return;
        }
      } catch (e) {
        console.warn("Snapshot capture error, falling back", e);
      }
    }

    // High quality fallback snapshot for testing
    stopCameraStream();
    setSelectedMedia({
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1080&auto=format&fit=crop&q=80",
      type: "image",
      name: "Studio_Set_Snapshot.jpg",
    });
    setShowCameraModal(false);
    setShowPreviewModal(true);
  };

  const handleStartRecording = () => {
    if (!cameraStreamRef.current) {
      showToast("Camera stream not available for recording");
      return;
    }
    try {
      recordedChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

      const recorder = new MediaRecorder(cameraStreamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        stopCameraStream();
        setSelectedMedia({
          url: videoUrl,
          type: "video",
          name: "Camera_Record.webm",
        });
        setShowCameraModal(false);
        setShowPreviewModal(true);
      };

      recorder.start(200);
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 29) {
            recorder.stop();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.warn("Recorder error:", e);
      stopCameraStream();
      setSelectedMedia({
        url: "https://assets.mixkit.co/videos/preview/mixkit-acting-class-with-students-on-stage-41983-large.mp4",
        type: "video",
        name: "StageActing_Demo.mp4",
      });
      setShowCameraModal(false);
      setShowPreviewModal(true);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const handleOpenGallery = () => {
    setShowActionSheet(false);
    setShowCameraModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name);
    const mediaUrl = URL.createObjectURL(file);

    setSelectedMedia({
      url: mediaUrl,
      type: isVideo ? "video" : "image",
      name: file.name,
    });

    setShowActionSheet(false);
    setShowCameraModal(false);
    setShowPreviewModal(true);
    e.target.value = "";
  };

  const handlePublishToStory = () => {
    if (!selectedMedia) return;

    const newSegment: StorySegment = {
      id: `seg-user-${Date.now()}`,
      mediaUrl: selectedMedia.url,
      caption:
        storyCaption.trim() ||
        (selectedMedia.type === "video"
          ? "🎥 Live video from production set"
          : "🎬 Behind the scenes update"),
      timestamp: "Just now",
      tag: selectedTag || "On Set",
      type: selectedMedia.type,
    };

    setStories((prev) =>
      prev.map((s, idx) => {
        if (s.isUserStory || idx === 0) {
          const updatedSegments = [newSegment, ...s.segments];
          return {
            ...s,
            thumbnail: selectedMedia.url,
            isViewed: false,
            segments: updatedSegments,
          };
        }
        return s;
      })
    );

    try {
      const existing = JSON.parse(
        localStorage.getItem("cineconnect_user_story_segments") || "[]"
      );
      localStorage.setItem(
        "cineconnect_user_story_segments",
        JSON.stringify([newSegment, ...existing])
      );
    } catch {}

    setShowPreviewModal(false);
    setShowCameraModal(false);
    setShowActionSheet(false);
    setStoryCaption("");
    setSelectedTag("#OnSet");
    setSelectedMedia(null);

    showToast("Added to My Story! 🎬✨");

    // Immediately play the user's updated story
    setTimeout(() => {
      setActiveStoryIndex(0);
      setActiveSegmentIndex(0);
      setIsPaused(false);
    }, 250);
  };

  // --- Smooth Horizontal Scroll Mechanics for Stories Bar ---
  const handleContainerScroll = () => {
    checkScrollBounds();
    hasDraggedRef.current = true;
    if (scrollDebounceTimerRef.current) clearTimeout(scrollDebounceTimerRef.current);
    scrollDebounceTimerRef.current = setTimeout(() => {
      hasDraggedRef.current = false;
    }, 140);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      isMouseDownRef.current = true;
      startXRef.current = e.clientX;
      scrollStartRef.current = scrollContainerRef.current?.scrollLeft || 0;
      hasDraggedRef.current = false;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    } else {
      startXRef.current = e.clientX;
      hasDraggedRef.current = false;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const deltaX = Math.abs(e.clientX - startXRef.current);
    if (deltaX > 6) {
      hasDraggedRef.current = true;
    }

    if (e.pointerType === "mouse" && isMouseDownRef.current && scrollContainerRef.current) {
      setIsDragging(true);
      const diffX = e.clientX - startXRef.current;
      scrollContainerRef.current.scrollLeft = scrollStartRef.current - diffX;
      checkScrollBounds();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") {
      isMouseDownRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
    checkScrollBounds();
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    // Trackpads already supply native deltaX, let browser handle smoothly
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }
    // Vertical mouse wheel conversion to horizontal scroll
    if (Math.abs(e.deltaY) > 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY * 0.85;
      checkScrollBounds();
    }
  };

  // --- Unified Touch & Gestures for Full-Screen Story Viewer ---
  const handleViewerTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    viewerTouchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    viewerHasSwipedRef.current = false;
    setIsPaused(true);
  };

  const handleViewerTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPaused(false);
    const clientX = "changedTouches" in e ? e.changedTouches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = "changedTouches" in e ? e.changedTouches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaX = clientX - viewerTouchStartRef.current.x;
    const deltaY = clientY - viewerTouchStartRef.current.y;
    const duration = Date.now() - viewerTouchStartRef.current.time;

    // Detect horizontal swipe between stories
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      viewerHasSwipedRef.current = true;
      if (deltaX < 0) {
        // Swiped Left -> go to next story
        if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
          const nextIdx = activeStoryIndex + 1;
          setActiveStoryIndex(nextIdx);
          setActiveSegmentIndex(0);
          setStories((prev) =>
            prev.map((s, idx) => (idx === nextIdx ? { ...s, isViewed: true } : s))
          );
        } else {
          handleCloseViewer();
        }
      } else {
        // Swiped Right -> go to previous story
        if (activeStoryIndex !== null && activeStoryIndex > 0) {
          const prevIdx = activeStoryIndex - 1;
          setActiveStoryIndex(prevIdx);
          setActiveSegmentIndex(0);
        }
      }
      return;
    }

    // Detect swipe down to close story (Instagram gesture)
    if (deltaY > 60 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      viewerHasSwipedRef.current = true;
      handleCloseViewer();
      return;
    }

    // Quick tap to advance or step back segment
    if (Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12 && duration < 380) {
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 420;
      if (clientX < screenWidth * 0.35) {
        handlePrevSegment();
      } else {
        handleNextSegment();
      }
    }
  };

  // Open story
  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setActiveSegmentIndex(0);
    setIsPaused(false);

    setStories((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, isViewed: true } : s))
    );
  };

  const handleCloseViewer = () => {
    setActiveStoryIndex(null);
    setActiveSegmentIndex(0);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleNextSegment = () => {
    if (!activeStory) return;
    if (activeSegmentIndex < activeStory.segments.length - 1) {
      setActiveSegmentIndex((prev) => prev + 1);
    } else {
      // Advance to next story
      if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
        const nextStoryIdx = activeStoryIndex + 1;
        setActiveStoryIndex(nextStoryIdx);
        setActiveSegmentIndex(0);
        setStories((prev) =>
          prev.map((s, idx) => (idx === nextStoryIdx ? { ...s, isViewed: true } : s))
        );
      } else {
        handleCloseViewer();
      }
    }
  };

  const handlePrevSegment = () => {
    if (!activeStory) return;
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((prev) => prev - 1);
    } else {
      // Go to previous story
      if (activeStoryIndex !== null && activeStoryIndex > 0) {
        const prevStoryIdx = activeStoryIndex - 1;
        setActiveStoryIndex(prevStoryIdx);
        setActiveSegmentIndex(stories[prevStoryIdx].segments.length - 1);
      }
    }
  };

  // Auto-progress timer for active story segment (5 seconds)
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNextSegment();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, activeSegmentIndex, isPaused]);

  const handleToggleLike = () => {
    if (!currentSegment) return;
    setLikedSegments((prev) => {
      const isLiked = !prev[currentSegment.id];
      showToast(isLiked ? "Reaction sent! ❤️🎬" : "Reaction removed");
      return { ...prev, [currentSegment.id]: isLiked };
    });
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    showToast(`Reply sent to ${activeStory?.userName}! 📨`);
    setReplyMessage("");
  };

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => setToastText(null), 2400);
  };

  return (
    <section
      aria-label="CineConnect Stories"
      className={`relative w-full select-none ${className}`}
      style={{
        position: "relative",
        paddingTop: "2px",
        paddingBottom: "6px",
      }}
    >
      {/* Hidden File Picker for Gallery (Images & Videos) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFilePicked}
        style={{ display: "none" }}
      />

      {/* Left Scroll Chevron Arrow Button (Desktop / Overflow) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => {
            scrollContainerRef.current?.scrollBy({ left: -240, behavior: "smooth" });
            setTimeout(checkScrollBounds, 320);
          }}
          aria-label="Scroll stories left"
          style={{
            position: "absolute",
            left: "4px",
            top: "36px",
            transform: "translateY(-50%)",
            zIndex: 15,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "rgba(13, 17, 26, 0.95)",
            border: "1.5px solid #FF9800",
            color: "#FF9800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
            transition: "all 0.18s ease",
          }}
        >
          <ChevronLeft size={17} strokeWidth={2.8} />
        </button>
      )}

      {/* Right Scroll Chevron Arrow Button (Desktop / Overflow) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => {
            scrollContainerRef.current?.scrollBy({ left: 240, behavior: "smooth" });
            setTimeout(checkScrollBounds, 320);
          }}
          aria-label="Scroll stories right"
          style={{
            position: "absolute",
            right: "4px",
            top: "36px",
            transform: "translateY(-50%)",
            zIndex: 15,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "rgba(13, 17, 26, 0.95)",
            border: "1.5px solid #FF9800",
            color: "#FF9800",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.7)",
            transition: "all 0.18s ease",
          }}
        >
          <ChevronRight size={17} strokeWidth={2.8} />
        </button>
      )}

      {/* Horizontally scrollable & swipable stories row */}
      <div
        ref={scrollContainerRef}
        onScroll={handleContainerScroll}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
          overflowX: "auto",
          overflowY: "hidden",
          padding: "2px 12px 6px 12px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "pan-x pan-y",
        }}
      >
        {stories.map((story, index) => {
          const isUnseen = !story.isViewed && !story.isUserStory;

          return (
            <React.Fragment key={story.id}>
              <div
                onClick={() => {
                  if (hasDraggedRef.current) return;
                  if (story.isUserStory) {
                    setShowActionSheet(true);
                  } else {
                    handleOpenStory(index);
                  }
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "6px",
                  cursor: isDragging ? "grabbing" : "pointer",
                  flexShrink: 0,
                  width: "64px",
                  userSelect: "none",
                }}
              >
                {/* Square Thumbnail Container */}
                <div
                  style={{
                    position: "relative",
                    width: "64px",
                    height: "64px",
                    borderRadius: "12px",
                    padding: "2px",
                    background: isUnseen
                      ? "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)"
                      : "rgba(255, 255, 255, 0.14)",
                    boxShadow: isUnseen ? "0 0 10px rgba(255, 152, 0, 0.45)" : "none",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* Inner Square Media Tile */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#0d1017",
                    }}
                  >
                    <img
                      src={story.thumbnail}
                      alt={story.userName}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Subtle bottom gradient vignette */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Instagram-style Plus Button INSIDE the media tile at bottom-right corner */}
                    {story.isUserStory && (
                      <button
                        type="button"
                        id="my-story-plus-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionSheet(true);
                        }}
                        title="Add to My Story"
                        style={{
                          position: "absolute",
                          bottom: "3px",
                          right: "3px",
                          width: "21px",
                          height: "21px",
                          borderRadius: "50%",
                          background: "#0095F6", // Instagram's iconic blue plus button
                          border: "1.5px solid #FFFFFF", // Instagram crisp white border
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.55)",
                          cursor: "pointer",
                          transition: "transform 0.15s ease",
                          padding: 0,
                          outline: "none",
                          zIndex: 10,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <Plus size={13} color="#FFFFFF" strokeWidth={3.5} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Story User Name */}
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: isUnseen || story.isUserStory ? 700 : 500,
                    color: isUnseen || story.isUserStory ? "#FFFFFF" : "#CBD5E1",
                    width: "64px",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    letterSpacing: "0.01em",
                  }}
                >
                  {story.userName}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* 1. Instagram Story Action Sheet (Camera vs Gallery vs View) */}
      {showActionSheet && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowActionSheet(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 120,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#0d111a",
              border: "1px solid rgba(255, 152, 0, 0.35)",
              borderRadius: "20px",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.8)",
              animation: "slideUp 0.25s ease-out",
            }}
          >
            {/* Grab Handle */}
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(255, 255, 255, 0.2)",
                alignSelf: "center",
              }}
            />

            {/* Header info */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src={stories[0]?.avatar}
                  alt="My Story"
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    border: "2px solid #FF9800",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "#FFFFFF" }}>
                    Add to My Story
                  </h3>
                  <p style={{ margin: 0, fontSize: "11px", color: "#858995" }}>
                    Share a photo, self-tape, or clip with the industry
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowActionSheet(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Options list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {/* Option 1: 📸 Camera */}
              <button
                type="button"
                id="story-option-camera-btn"
                onClick={() => startCamera()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "linear-gradient(135deg, rgba(255, 152, 0, 0.12) 0%, rgba(255, 179, 0, 0.05) 100%)",
                  border: "1px solid rgba(255, 152, 0, 0.35)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s ease",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#08090C",
                    boxShadow: "0 2px 8px rgba(255, 152, 0, 0.4)",
                    flexShrink: 0,
                  }}
                >
                  <Camera size={22} strokeWidth={2.4} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                    📸 Camera
                  </div>
                  <div style={{ fontSize: "11px", color: "#CBD5E1" }}>
                    Take a live photo or record a video clip
                  </div>
                </div>
                <ChevronRight size={18} color="#FF9800" />
              </button>

              {/* Option 2: 🖼️ From Gallery */}
              <button
                type="button"
                id="story-option-gallery-btn"
                onClick={handleOpenGallery}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.18s ease",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 8px rgba(236, 72, 153, 0.3)",
                    flexShrink: 0,
                  }}
                >
                  <ImageIcon size={22} strokeWidth={2.2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                    🖼️ From Gallery
                  </div>
                  <div style={{ fontSize: "11px", color: "#858995" }}>
                    Choose photo or video from device
                  </div>
                </div>
                <ChevronRight size={18} color="#858995" />
              </button>

              {/* Option 3: ▶️ View Your Story */}
              {stories[0]?.segments.length > 0 && (
                <button
                  type="button"
                  id="story-option-view-btn"
                  onClick={() => {
                    setShowActionSheet(false);
                    handleOpenStory(0);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "14px",
                    padding: "12px 14px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      flexShrink: 0,
                    }}
                  >
                    <Play size={20} fill="#FFFFFF" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>
                      ▶️ View My Story
                    </div>
                    <div style={{ fontSize: "11px", color: "#858995" }}>
                      {stories[0].segments.length} updates currently live
                    </div>
                  </div>
                  <ChevronRight size={18} color="#858995" />
                </button>
              )}
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setShowActionSheet(false)}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "12px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#E2E8F0",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Instagram Camera Studio Modal */}
      {showCameraModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 130,
            background: "#000000",
            display: "flex",
            flexDirection: "column",
            userSelect: "none",
          }}
        >
          {/* Top Bar Controls */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
            }}
          >
            {/* Close Camera */}
            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                setShowCameraModal(false);
              }}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>

            {/* Title / Recording status */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {isRecordingVideo ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(239, 68, 68, 0.9)",
                    padding: "4px 12px",
                    borderRadius: "14px",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                    }}
                  />
                  <span>REC 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                </div>
              ) : (
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#FF9800",
                    background: "rgba(0, 0, 0, 0.55)",
                    padding: "4px 12px",
                    borderRadius: "14px",
                    border: "1px solid rgba(255, 152, 0, 0.35)",
                  }}
                >
                  🎬 CineCamera
                </span>
              )}
            </div>

            {/* Flash & Flip buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setCameraFlash(!cameraFlash)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: cameraFlash ? "#FF9800" : "rgba(0, 0, 0, 0.55)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: cameraFlash ? "#08090C" : "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {cameraFlash ? <Zap size={16} fill="#08090C" /> : <ZapOff size={16} />}
              </button>

              <button
                type="button"
                onClick={handleFlipCamera}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.55)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Camera Viewfinder View */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#05070a",
            }}
          >
            {/* Live Video Viewfinder */}
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
                display: cameraError ? "none" : "block",
              }}
            />

            {/* Flash Overlay Effect */}
            {cameraFlash && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255, 255, 255, 0.15)",
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Cinematic Camera Framing Guidelines (rule-of-thirds & corner markers) */}
            <div
              style={{
                position: "absolute",
                inset: "20px",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                borderRadius: "16px",
                pointerEvents: "none",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.18)",
              }}
            >
              {/* Corner brackets */}
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  left: "-1px",
                  width: "16px",
                  height: "16px",
                  borderTop: "3px solid #FF9800",
                  borderLeft: "3px solid #FF9800",
                  borderTopLeftRadius: "6px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  right: "-1px",
                  width: "16px",
                  height: "16px",
                  borderTop: "3px solid #FF9800",
                  borderRight: "3px solid #FF9800",
                  borderTopRightRadius: "6px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  left: "-1px",
                  width: "16px",
                  height: "16px",
                  borderBottom: "3px solid #FF9800",
                  borderLeft: "3px solid #FF9800",
                  borderBottomLeftRadius: "6px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-1px",
                  right: "-1px",
                  width: "16px",
                  height: "16px",
                  borderBottom: "3px solid #FF9800",
                  borderRight: "3px solid #FF9800",
                  borderBottomRightRadius: "6px",
                }}
              />

              {/* Center crosshair */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "20px",
                  height: "20px",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "9px",
                    left: 0,
                    right: 0,
                    height: "1px",
                    background: "rgba(255, 255, 255, 0.4)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "9px",
                    top: 0,
                    bottom: 0,
                    width: "1px",
                    background: "rgba(255, 255, 255, 0.4)",
                  }}
                />
              </div>
            </div>

            {/* Error or Fallback Viewfinder */}
            {cameraError && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "14px",
                  padding: "24px",
                  textAlign: "center",
                  maxWidth: "340px",
                  background: "rgba(13, 17, 26, 0.85)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255, 152, 0, 0.3)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(255, 152, 0, 0.15)",
                    border: "2px solid #FF9800",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FF9800",
                  }}
                >
                  <Camera size={28} />
                </div>
                <h4 style={{ margin: 0, color: "#FFFFFF", fontSize: "14px", fontWeight: 700 }}>
                  Camera Ready
                </h4>
                <p style={{ margin: 0, color: "#94A3B8", fontSize: "11.5px", lineHeight: 1.5 }}>
                  {cameraError}
                </p>
                <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                  <button
                    type="button"
                    onClick={handleTakeSnapshot}
                    style={{
                      flex: 1,
                      background: "#FF9800",
                      color: "#08090C",
                      border: "none",
                      borderRadius: "10px",
                      padding: "9px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Snap Studio Frame
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    style={{
                      flex: 1,
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "#FFFFFF",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                      padding: "9px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    From Gallery
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar: Mode Selector & Shutter */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              padding: "20px 24px 34px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
            }}
          >
            {/* Mode Switcher: PHOTO | VIDEO */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "rgba(0, 0, 0, 0.45)",
                padding: "4px 16px",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                type="button"
                onClick={() => setCameraMode("photo")}
                style={{
                  background: "none",
                  border: "none",
                  color: cameraMode === "photo" ? "#FF9800" : "#858995",
                  fontSize: "12px",
                  fontWeight: cameraMode === "photo" ? 800 : 500,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                PHOTO
              </button>
              <button
                type="button"
                onClick={() => setCameraMode("video")}
                style={{
                  background: "none",
                  border: "none",
                  color: cameraMode === "video" ? "#FF9800" : "#858995",
                  fontSize: "12px",
                  fontWeight: cameraMode === "video" ? 800 : 500,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                VIDEO
              </button>
            </div>

            {/* Shutter controls row */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {/* Quick Gallery Button (Left) */}
              <button
                type="button"
                id="camera-open-gallery-btn"
                onClick={handleOpenGallery}
                title="Select from gallery"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <ImageIcon size={20} />
              </button>

              {/* Central Concentric Instagram Shutter Button */}
              {cameraMode === "photo" ? (
                <button
                  type="button"
                  id="camera-shutter-photo-btn"
                  onClick={handleTakeSnapshot}
                  title="Take photo"
                  style={{
                    width: "74px",
                    height: "74px",
                    borderRadius: "50%",
                    border: "4px solid #FFFFFF",
                    padding: "3px",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(255, 255, 255, 0.35)",
                    transition: "transform 0.15s ease",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                    }}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  id="camera-shutter-video-btn"
                  onClick={isRecordingVideo ? handleStopRecording : handleStartRecording}
                  title={isRecordingVideo ? "Stop recording" : "Start recording"}
                  style={{
                    width: "74px",
                    height: "74px",
                    borderRadius: "50%",
                    border: "4px solid #ef4444",
                    padding: "4px",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: isRecordingVideo ? "26px" : "100%",
                      height: isRecordingVideo ? "26px" : "100%",
                      borderRadius: isRecordingVideo ? "6px" : "50%",
                      background: "#ef4444",
                      transition: "all 0.2s ease",
                    }}
                  />
                </button>
              )}

              {/* Flip Camera Button (Right) */}
              <button
                type="button"
                onClick={handleFlipCamera}
                title="Flip Camera"
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Instagram Story Preview / Composer Screen */}
      {showPreviewModal && selectedMedia && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 140,
            background: "#05070a",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          {/* Top Bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 100%)",
            }}
          >
            {/* Back / Retake */}
            <button
              type="button"
              onClick={() => {
                setShowPreviewModal(false);
                setShowActionSheet(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "rgba(0, 0, 0, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "18px",
                padding: "6px 12px",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={16} />
              <span>Retake</span>
            </button>

            {/* Selected Tag Indicator */}
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#FF9800",
                background: "rgba(255, 152, 0, 0.15)",
                border: "1px solid rgba(255, 152, 0, 0.4)",
                padding: "4px 12px",
                borderRadius: "14px",
              }}
            >
              {selectedTag}
            </span>

            {/* Discard */}
            <button
              type="button"
              onClick={() => {
                setShowPreviewModal(false);
                setSelectedMedia(null);
              }}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.55)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Media Canvas View */}
          <div
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {selectedMedia.type === "video" ? (
              <video
                src={selectedMedia.url}
                autoPlay
                loop
                playsInline
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                src={selectedMedia.url}
                alt="Story Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}

            {/* Dark Vignettes */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100px",
                background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "220px",
                background: "linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Bottom Story Composer Controls */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              padding: "16px 16px 24px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Story Caption Input (Instagram style over-image text) */}
            <div
              style={{
                background: "rgba(10, 14, 22, 0.8)",
                border: "1px solid rgba(255, 152, 0, 0.4)",
                borderRadius: "14px",
                padding: "8px 12px",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <input
                type="text"
                placeholder="Add a caption or scene note... ✨"
                value={storyCaption}
                onChange={(e) => setStoryCaption(e.target.value)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  outline: "none",
                }}
              />
            </div>

            {/* Cine Tag Selector Pills */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                scrollbarWidth: "none",
                paddingBottom: "2px",
              }}
            >
              {CINE_STORY_TAGS.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    style={{
                      background: isSelected ? "#FF9800" : "rgba(255, 255, 255, 0.08)",
                      color: isSelected ? "#08090C" : "#E2E8F0",
                      border: isSelected ? "none" : "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "12px",
                      padding: "4px 10px",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions Bar (Instagram "Your story" button) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "4px",
              }}
            >
              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedMedia(null);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#CBD5E1",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              {/* Instagram "Your Story" Action Pill Button */}
              <button
                type="button"
                id="story-publish-btn"
                onClick={handlePublishToStory}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #FFB300 0%, #FF9800 100%)",
                  border: "none",
                  borderRadius: "24px",
                  padding: "6px 16px 6px 8px",
                  color: "#08090C",
                  fontSize: "12.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(255, 152, 0, 0.45)",
                  transition: "transform 0.15s ease",
                }}
              >
                <img
                  src={stories[0]?.avatar}
                  alt="My Story"
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid #08090C",
                  }}
                />
                <span>My Story</span>
                <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Full-Screen Story Viewer Overlay */}
      {activeStory && currentSegment && (
        <div
          role="dialog"
          aria-modal="true"
          onTouchStart={handleViewerTouchStart}
          onTouchEnd={handleViewerTouchEnd}
          onMouseDown={handleViewerTouchStart}
          onMouseUp={handleViewerTouchEnd}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 110,
            background: "#05070a",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            userSelect: "none",
            touchAction: "pan-y",
          }}
        >
          {/* Background Story Media */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
          >
            {currentSegment.type === "video" ||
            currentSegment.mediaUrl.endsWith(".mp4") ||
            currentSegment.mediaUrl.endsWith(".webm") ||
            currentSegment.mediaUrl.startsWith("data:video") ? (
              <video
                ref={viewerVideoRef}
                src={currentSegment.mediaUrl}
                autoPlay
                playsInline
                loop={false}
                muted={isMuted}
                onEnded={handleNextSegment}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                src={currentSegment.mediaUrl}
                alt={activeStory.userName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            )}
            {/* Top & Bottom Cinematic Vignettes */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: "linear-gradient(180deg, rgba(5, 7, 10, 0.85) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "180px",
                background:
                  "linear-gradient(0deg, rgba(5, 7, 10, 0.95) 0%, rgba(5, 7, 10, 0.5) 60%, transparent 100%)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Desktop Left / Right Story Navigation Arrows */}
          {activeStoryIndex !== null && activeStoryIndex > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const prevIdx = activeStoryIndex - 1;
                setActiveStoryIndex(prevIdx);
                setActiveSegmentIndex(0);
              }}
              title="Previous Story"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 25,
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {activeStoryIndex !== null && activeStoryIndex < stories.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const nextIdx = activeStoryIndex + 1;
                setActiveStoryIndex(nextIdx);
                setActiveSegmentIndex(0);
                setStories((prev) =>
                  prev.map((s, idx) => (idx === nextIdx ? { ...s, isViewed: true } : s))
                );
              }}
              title="Next Story"
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 25,
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.6)",
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Top Controls Header */}
          <div
            style={{
              position: "relative",
              zIndex: 20,
              padding: "10px 14px 6px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {/* Segment Progress Bars */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                width: "100%",
              }}
            >
              {activeStory.segments.map((seg, idx) => {
                const isCompleted = idx < activeSegmentIndex;
                const isCurrent = idx === activeSegmentIndex;

                return (
                  <div
                    key={seg.id}
                    style={{
                      flex: 1,
                      height: "2.5px",
                      borderRadius: "2px",
                      background: "rgba(255, 255, 255, 0.25)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: isCompleted ? "100%" : isCurrent ? "100%" : "0%",
                        background: "#FF9800",
                        boxShadow: isCurrent ? "0 0 6px #FF9800" : "none",
                        transition: isCurrent ? "width 5s linear" : "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Story User Info, Sound & Close Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: "4px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img
                  src={activeStory.avatar}
                  alt={activeStory.userName}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "1.5px solid #FF9800",
                    objectFit: "cover",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#FFFFFF" }}>
                      {activeStory.userName}
                    </span>
                    {activeStory.verified && (
                      <CheckCircle2 size={12} color="#FF9800" fill="#FF9800" stroke="#08090C" />
                    )}
                  </div>
                  <span style={{ fontSize: "9.5px", color: "#FFB300", fontWeight: 600 }}>
                    {activeStory.userCraft} • {currentSegment.timestamp}
                  </span>
                </div>
              </div>

              {/* Sound Toggle, Add Story & Close Button */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Audio Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMuted(!isMuted);
                  }}
                  title={isMuted ? "Unmute audio" : "Mute audio"}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.55)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Add Story Button if viewing Your Story */}
                {activeStory.isUserStory && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseViewer();
                      setShowActionSheet(true);
                    }}
                    title="Add to story"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(255, 152, 0, 0.25)",
                      border: "1px solid #FF9800",
                      color: "#FF9800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Plus size={16} strokeWidth={2.8} />
                  </button>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleCloseViewer}
                  aria-label="Close story"
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.55)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Story Caption & Interaction Bar */}
          <div
            style={{
              position: "relative",
              zIndex: 20,
              marginTop: "auto",
              padding: "14px 14px 18px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {/* Craft Tag & Caption */}
            <div
              style={{
                background: "rgba(10, 14, 22, 0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 152, 0, 0.3)",
                borderRadius: "12px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {currentSegment.tag && (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sparkles size={11} color="#FF9800" />
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      color: "#FF9800",
                      textTransform: "uppercase",
                    }}
                  >
                    {currentSegment.tag}
                  </span>
                </div>
              )}
              <p
                style={{
                  margin: 0,
                  fontSize: "11.5px",
                  color: "#FFFFFF",
                  lineHeight: 1.4,
                  fontWeight: 500,
                }}
              >
                {currentSegment.caption}
              </p>
            </div>

            {/* Quick Interactive Reply & Heart Bar */}
            <form
              onSubmit={handleSendReply}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="text"
                placeholder={`Reply to ${activeStory.userName}...`}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                style={{
                  flex: 1,
                  background: "rgba(0, 0, 0, 0.65)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "20px",
                  padding: "8px 14px",
                  fontSize: "11px",
                  color: "#FFFFFF",
                  outline: "none",
                }}
              />

              {/* Heart Reaction Button */}
              <button
                type="button"
                onClick={handleToggleLike}
                aria-label="Like story"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: likedSegments[currentSegment.id]
                    ? "rgba(239, 68, 68, 0.25)"
                    : "rgba(0, 0, 0, 0.65)",
                  border: likedSegments[currentSegment.id]
                    ? "1px solid #ef4444"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: likedSegments[currentSegment.id] ? "#ef4444" : "#FFFFFF",
                  transition: "all 0.2s ease",
                }}
              >
                <Heart
                  size={16}
                  fill={likedSegments[currentSegment.id] ? "#ef4444" : "none"}
                />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                aria-label="Send reply"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#FF9800",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#08090C",
                  boxShadow: "0 2px 8px rgba(255, 152, 0, 0.4)",
                }}
              >
                <Send size={14} />
              </button>
            </form>
          </div>

          {/* In-Viewer Toast Feedback */}
          {toastText && (
            <div
              style={{
                position: "absolute",
                top: "76px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 40,
                background: "rgba(16, 18, 25, 0.95)",
                border: "1px solid #FF9800",
                color: "#FFFFFF",
                fontSize: "10.5px",
                fontWeight: 700,
                padding: "6px 14px",
                borderRadius: "14px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.6)",
                pointerEvents: "none",
              }}
            >
              {toastText}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
