import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  Plus,
  X,
  Play,
  Pause,
  Send,
  Camera,
  Check,
  PlusSquare,
  Sparkles,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface StorySegment {
  id: string;
  mediaUrl: string;
  caption: string;
  timestamp: string;
  tag?: string;
}

export interface CineStory {
  id: string;
  userId: string;
  userName: string;
  userCraft: string;
  avatar: string;
  verified?: boolean;
  isLive?: boolean;
  isViewed?: boolean;
  isUserStory?: boolean;
  segments: StorySegment[];
}

export const EXPO_CINE_STORIES: CineStory[] = [
  {
    id: 'story-dharma',
    userId: 'dharma-prods',
    userName: 'Dharma Prods',
    userCraft: 'Studio Banner',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
    verified: true,
    isLive: true,
    isViewed: false,
    segments: [
      {
        id: 'seg-dharma-1',
        mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&auto=format&fit=crop&q=80',
        caption: "🔴 LIVE from Studio 4: Final Screen Tests for 'Shadow of Verity' 🎬",
        timestamp: '10m ago',
        tag: 'Director Callback',
      },
      {
        id: 'seg-dharma-2',
        mediaUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=900&auto=format&fit=crop&q=80',
        caption: 'Reviewing dramatic monologues submitted via CineConnect self-tape portal ✨',
        timestamp: '5m ago',
        tag: 'Casting Room',
      },
    ],
  },
  {
    id: 'story-kabir',
    userId: 'kabir-mehra',
    userName: 'Kabir M.',
    userCraft: 'Lead Actor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    verified: true,
    isViewed: false,
    segments: [
      {
        id: 'seg-kabir-1',
        mediaUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=900&auto=format&fit=crop&q=80',
        caption: 'Table read with Anurag Kashyap. 18-page unbroken sequence locked in 📖🎬',
        timestamp: '45m ago',
        tag: 'Table Read',
      },
      {
        id: 'seg-kabir-2',
        mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80',
        caption: 'Night shoot wrapped! 24 hours non-stop in the rain. Grateful for this crew 🌧️✨',
        timestamp: '20m ago',
        tag: 'Set Life',
      },
    ],
  },
  {
    id: 'story-ananya',
    userId: 'ananya-sen',
    userName: 'Ananya DP',
    userCraft: 'Cinematographer',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    verified: true,
    isViewed: false,
    segments: [
      {
        id: 'seg-ananya-1',
        mediaUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=900&auto=format&fit=crop&q=80',
        caption: 'Testing ARRI Alexa 35 paired with Cooke Anamorphic/i Full Frame lenses 🎥✨',
        timestamp: '2h ago',
        tag: 'Camera Tech',
      },
    ],
  },
  {
    id: 'story-vikram',
    userId: 'vikram-director',
    userName: 'Vikramaditya',
    userCraft: 'Film Director',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    verified: true,
    isViewed: false,
    segments: [
      {
        id: 'seg-vikram-1',
        mediaUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=900&auto=format&fit=crop&q=80',
        caption: 'Location scouting in Spiti Valley. Golden hour light here is pure cinematic poetry 🏔️🌅',
        timestamp: '4h ago',
        tag: 'Recce Day',
      },
    ],
  },
  {
    id: 'story-redchillies',
    userId: 'red-chillies',
    userName: 'Red Chillies',
    userCraft: 'VFX Studio',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    verified: true,
    isViewed: false,
    segments: [
      {
        id: 'seg-rc-1',
        mediaUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&auto=format&fit=crop&q=80',
        caption: 'Pre-vis breakdown: 420 digital matte layers for the cyberpunk sequence 💻🔥',
        timestamp: '6h ago',
        tag: 'CGI Pipeline',
      },
    ],
  },
];

export interface InstagramStoriesBarProps {
  hideBar?: boolean;
}

export default function InstagramStoriesBar({ hideBar = false }: InstagramStoriesBarProps = {}) {
  const [stories, setStories] = useState<CineStory[]>(EXPO_CINE_STORIES);
  const [userStorySegments, setUserStorySegments] = useState<StorySegment[]>([]);

  // Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Story Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');

  const fullStoriesList: CineStory[] = [
    {
      id: 'story-me',
      userId: 'user-me',
      userName: 'Your Story',
      userCraft: 'Actor & Creator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      isUserStory: true,
      isViewed: userStorySegments.length > 0 ? false : true,
      segments: userStorySegments,
    },
    ...stories,
  ];

  // Auto-advance timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const currentStory = fullStoriesList[activeStoryIndex];
    if (!currentStory || currentStory.segments.length === 0) return;

    const stepMs = 50;
    const totalDurationMs = 5000;
    const increment = (stepMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeSegmentIndex < currentStory.segments.length - 1) {
            setActiveSegmentIndex((s) => s + 1);
            return 0;
          } else if (activeStoryIndex < fullStoriesList.length - 1) {
            const nextIdx = activeStoryIndex + 1;
            if (fullStoriesList[nextIdx].segments.length > 0) {
              setActiveStoryIndex(nextIdx);
              setActiveSegmentIndex(0);
              return 0;
            }
          }
          handleCloseViewer();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [activeStoryIndex, activeSegmentIndex, isPaused, fullStoriesList]);

  const handleOpenStory = (index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const story = fullStoriesList[index];
    if (story.isUserStory && story.segments.length === 0) {
      setShowCreateModal(true);
      return;
    }
    setActiveStoryIndex(index);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);

    if (!story.isUserStory) {
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, isViewed: true } : s))
      );
    }
  };

  const handleCloseViewer = () => {
    setActiveStoryIndex(null);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handlePrevSegment = () => {
    if (activeStoryIndex === null) return;
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((s) => s - 1);
      setProgress(0);
    } else if (activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      const prevStory = fullStoriesList[prevIdx];
      if (prevStory.segments.length > 0) {
        setActiveStoryIndex(prevIdx);
        setActiveSegmentIndex(prevStory.segments.length - 1);
        setProgress(0);
      }
    }
  };

  const handleNextSegment = () => {
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    if (activeSegmentIndex < currentStory.segments.length - 1) {
      setActiveSegmentIndex((s) => s + 1);
      setProgress(0);
    } else if (activeStoryIndex < fullStoriesList.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      if (fullStoriesList[nextIdx].segments.length > 0) {
        setActiveStoryIndex(nextIdx);
        setActiveSegmentIndex(0);
        setProgress(0);
      } else {
        handleCloseViewer();
      }
    } else {
      handleCloseViewer();
    }
  };

  const handleReaction = (emoji: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setToastMessage(`Sent ${emoji} to ${currentStory.userName}!`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setToastMessage(`Message sent to ${currentStory.userName} 📩`);
    setReplyText('');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCreateStory = () => {
    const newSeg: StorySegment = {
      id: 'seg-expo-' + Date.now(),
      mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&auto=format&fit=crop&q=80',
      caption: newCaption.trim() || 'On set testing camera package today 🎬',
      timestamp: 'Just now',
      tag: 'BTS On Set',
    };
    setUserStorySegments((prev) => [newSeg, ...prev]);
    setShowCreateModal(false);
    setNewCaption('');
    setToastMessage('Your Story posted! 🚀🎬');
    setTimeout(() => setToastMessage(null), 2400);
  };

  const activeStory = activeStoryIndex !== null ? fullStoriesList[activeStoryIndex] : null;
  const activeSegment = activeStory && activeStory.segments[activeSegmentIndex];

  return (
    <View style={!hideBar ? styles.trayContainer : undefined}>
      {!hideBar && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
        {fullStoriesList.map((story, idx) => {
          const hasStory = story.segments.length > 0;
          const isUser = story.isUserStory;

          return (
            <TouchableOpacity
              key={story.id}
              activeOpacity={0.8}
              onPress={() => handleOpenStory(idx)}
              style={styles.storyBubbleItem}
            >
              <View style={styles.avatarWrapper}>
                {story.isLive ? (
                  <LinearGradient
                    colors={['#EF4444', '#FF9800']}
                    style={styles.gradientRing}
                  />
                ) : !story.isViewed && hasStory ? (
                  <LinearGradient
                    colors={['#FFB300', '#FF9800']}
                    style={styles.gradientRing}
                  />
                ) : hasStory ? (
                  <View style={styles.viewedRing} />
                ) : null}

                <View style={styles.darkGap}>
                  <Image source={{ uri: story.avatar }} style={styles.avatarImage} />
                </View>

                {isUser && !hasStory && (
                  <View style={styles.plusBadge}>
                    <Plus size={11} color="#08090C" strokeWidth={3} />
                  </View>
                )}

                {story.isLive && (
                  <View style={styles.liveBadge}>
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
              </View>

              <Text style={styles.userNameText} numberOfLines={1}>
                {isUser ? 'Your Story' : story.userName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      )}

      {/* Full-Screen Instagram Story Viewer Modal */}
      {activeStory && activeSegment && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseViewer}
        >
          <View style={styles.modalBackdrop}>
            <Image source={{ uri: activeSegment.mediaUrl }} style={styles.storyMediaFull} />

            {/* Gradient Overlays */}
            <LinearGradient
              colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.4)', 'transparent']}
              style={styles.topVignette}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
              style={styles.bottomVignette}
            />

            {/* Top Bar: Progress and Author info */}
            <View style={styles.modalTopBar}>
              {/* Progress bars */}
              <View style={styles.progressRow}>
                {activeStory.segments.map((seg, sIdx) => {
                  let barFill = 0;
                  if (sIdx < activeSegmentIndex) barFill = 100;
                  else if (sIdx === activeSegmentIndex) barFill = progress;

                  return (
                    <View key={seg.id} style={styles.progressBarBase}>
                      <View style={[styles.progressBarFill, { width: `${barFill}%` }]} />
                    </View>
                  );
                })}
              </View>

              {/* Author & Actions */}
              <View style={styles.authorRow}>
                <View style={styles.authorLeft}>
                  <Image source={{ uri: activeStory.avatar }} style={styles.smallAvatar} />
                  <View>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.authorName}>{activeStory.userName}</Text>
                      {activeStory.verified && (
                        <View style={styles.smallVerified}>
                          <Text style={styles.verifiedCheck}>✓</Text>
                        </View>
                      )}
                      <Text style={styles.timeAgo}>{activeSegment.timestamp}</Text>
                    </View>
                    <Text style={styles.authorCraft}>{activeStory.userCraft}</Text>
                  </View>
                </View>

                <View style={styles.authorRight}>
                  <TouchableOpacity
                    onPress={() => setIsPaused((p) => !p)}
                    style={styles.headerIconBtn}
                  >
                    {isPaused ? <Play size={18} color="#FFF" /> : <Pause size={18} color="#FFF" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCloseViewer} style={styles.headerIconBtn}>
                    <X size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Left and Right Tap Zones */}
            <View style={styles.tapZones}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={handlePrevSegment}
                style={styles.leftTapZone}
              />
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleNextSegment}
                style={styles.rightTapZone}
              />
            </View>

            {/* Bottom Caption & Reply Bar */}
            <View style={styles.bottomArea}>
              {activeSegment.tag && (
                <View style={styles.tagCapsule}>
                  <Text style={styles.tagText}>{activeSegment.tag}</Text>
                </View>
              )}

              <Text style={styles.captionText}>{activeSegment.caption}</Text>

              <View style={styles.replyRow}>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder={`Reply to ${activeStory.userName}...`}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={styles.replyInput}
                />
                {replyText.trim().length > 0 && (
                  <TouchableOpacity onPress={handleSendReply} style={styles.sendBtn}>
                    <Send size={15} color="#08090C" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => handleReaction('❤️')} style={styles.reactBtn}>
                  <Text style={styles.reactEmoji}>❤️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReaction('🔥')} style={styles.reactBtn}>
                  <Text style={styles.reactEmoji}>🔥</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReaction('🎬')} style={styles.reactBtn}>
                  <Text style={styles.reactEmoji}>🎬</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reaction Feedback Toast */}
            {toastMessage && (
              <View style={styles.toastContainer}>
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            )}
          </View>
        </Modal>
      )}

      {/* Add Story Modal */}
      {showCreateModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.createModalOverlay}>
            <View style={styles.createCard}>
              <View style={styles.createHeader}>
                <Text style={styles.createTitle}>Share Behind-The-Scenes Story</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X size={18} color="#FFF" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={newCaption}
                onChangeText={setNewCaption}
                placeholder="What's happening on set today? 🎬"
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                style={styles.captionInput}
                multiline
              />

              <TouchableOpacity onPress={handleCreateStory} style={styles.postBtn}>
                <Text style={styles.postBtnText}>Share to Story 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

/**
 * InstagramStoriesHeaderButton
 * Positioned in the top app header, to the left of Notifications and Messages,
 * exactly like Instagram. Tapping opens the CineStories hub modal, viewer, or creator.
 */
export function InstagramStoriesHeaderButton() {
  const [showMenu, setShowMenu] = useState(false);
  const [stories, setStories] = useState<CineStory[]>(EXPO_CINE_STORIES);
  const [userStorySegments, setUserStorySegments] = useState<StorySegment[]>([]);

  // Story Viewer State
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Story Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');

  const fullStoriesList: CineStory[] = [
    {
      id: 'story-me-header',
      userId: 'user-me',
      userName: 'Your Story',
      userCraft: 'Actor & Creator',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      isUserStory: true,
      isViewed: userStorySegments.length > 0 ? false : true,
      segments: userStorySegments,
    },
    ...stories,
  ];

  // Auto-advance timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    const currentStory = fullStoriesList[activeStoryIndex];
    if (!currentStory || currentStory.segments.length === 0) return;

    const stepMs = 50;
    const totalDurationMs = 5000;
    const increment = (stepMs / totalDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeSegmentIndex < currentStory.segments.length - 1) {
            setActiveSegmentIndex((s) => s + 1);
            return 0;
          } else if (activeStoryIndex < fullStoriesList.length - 1) {
            const nextIdx = activeStoryIndex + 1;
            if (fullStoriesList[nextIdx].segments.length > 0) {
              setActiveStoryIndex(nextIdx);
              setActiveSegmentIndex(0);
              return 0;
            }
          }
          handleCloseViewer();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [activeStoryIndex, activeSegmentIndex, isPaused, fullStoriesList]);

  const handleOpenStory = (index: number) => {
    const story = fullStoriesList[index];
    if (story.isUserStory && story.segments.length === 0) {
      setShowMenu(false);
      setShowCreateModal(true);
      return;
    }
    setShowMenu(false);
    setActiveStoryIndex(index);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);

    if (!story.isUserStory) {
      setStories((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, isViewed: true } : s))
      );
    }
  };

  const handleCloseViewer = () => {
    setActiveStoryIndex(null);
    setActiveSegmentIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handlePrevSegment = () => {
    if (activeSegmentIndex > 0) {
      setActiveSegmentIndex((s) => s - 1);
      setProgress(0);
    } else if (activeStoryIndex !== null && activeStoryIndex > 0) {
      const prevIdx = activeStoryIndex - 1;
      setActiveStoryIndex(prevIdx);
      setActiveSegmentIndex(fullStoriesList[prevIdx].segments.length - 1);
      setProgress(0);
    }
  };

  const handleNextSegment = () => {
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    if (activeSegmentIndex < currentStory.segments.length - 1) {
      setActiveSegmentIndex((s) => s + 1);
      setProgress(0);
    } else if (activeStoryIndex < fullStoriesList.length - 1) {
      const nextIdx = activeStoryIndex + 1;
      if (fullStoriesList[nextIdx].segments.length > 0) {
        setActiveStoryIndex(nextIdx);
        setActiveSegmentIndex(0);
        setProgress(0);
      } else {
        handleCloseViewer();
      }
    } else {
      handleCloseViewer();
    }
  };

  const handleReaction = (emoji: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    if (activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setToastMessage(`Sent ${emoji} to ${currentStory.userName}!`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || activeStoryIndex === null) return;
    const currentStory = fullStoriesList[activeStoryIndex];
    setToastMessage(`Message sent to ${currentStory.userName} 📩`);
    setReplyText('');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCreateStory = () => {
    const newSeg: StorySegment = {
      id: 'seg-expo-' + Date.now(),
      mediaUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&auto=format&fit=crop&q=80',
      caption: newCaption.trim() || 'On set testing camera package today 🎬',
      timestamp: 'Just now',
      tag: 'BTS On Set',
    };
    setUserStorySegments((prev) => [newSeg, ...prev]);
    setShowCreateModal(false);
    setNewCaption('');
    setToastMessage('Your Story posted! 🚀🎬');
    setTimeout(() => setToastMessage(null), 2400);
  };

  const activeStory = activeStoryIndex !== null ? fullStoriesList[activeStoryIndex] : null;
  const activeSegment = activeStory && activeStory.segments[activeSegmentIndex];

  return (
    <View style={{ position: 'relative' }}>
      {/* Top Header Stories Button (Left to notifications and messages) */}
      <TouchableOpacity
        style={styles.headerStoriesBtn}
        activeOpacity={0.7}
        onPress={() => setShowMenu(true)}
      >
        <PlusSquare size={17} color="#858995" />
        <LinearGradient
          colors={['#FF9800', '#E11D48']}
          style={styles.headerStoryBadge}
        >
          <Text style={styles.headerStoryBadgeText}>6</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Popover Stories Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.menuModalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.menuSheetCard}>
            <View style={styles.menuSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#FF9800" />
                <Text style={styles.menuSheetTitle}>
                  CINE<Text style={{ color: '#FF9800' }}>STORIES</Text>
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.menuLiveBadge}>
                  <Text style={styles.menuLiveBadgeText}>6 ACTIVE</Text>
                </View>
                <TouchableOpacity onPress={() => setShowMenu(false)}>
                  <X size={18} color="#858995" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
            >
              {fullStoriesList.map((story, idx) => {
                const hasStory = story.segments.length > 0;
                const isUser = story.isUserStory;
                return (
                  <TouchableOpacity
                    key={story.id}
                    onPress={() => {
                      setShowMenu(false);
                      if (isUser && !hasStory) {
                        setShowCreateModal(true);
                      } else {
                        handleOpenStory(idx);
                      }
                    }}
                    style={{ alignItems: 'center', width: 56, gap: 4 }}
                  >
                    <View style={styles.miniAvatarWrapper}>
                      {story.isLive ? (
                        <LinearGradient colors={['#EF4444', '#FF9800']} style={styles.miniGradientRing} />
                      ) : !story.isViewed && hasStory ? (
                        <LinearGradient colors={['#FF9800', '#E11D48']} style={styles.miniGradientRing} />
                      ) : (
                        <View style={styles.miniViewedRing} />
                      )}
                      <Image source={{ uri: story.avatar }} style={styles.miniAvatarImg} />
                      {isUser && !hasStory && (
                        <View style={styles.miniPlusBadge}>
                          <Plus size={10} color="#08090C" strokeWidth={3} />
                        </View>
                      )}
                      {story.isLive && (
                        <View style={styles.miniLiveTag}>
                          <Text style={{ fontSize: 7, fontWeight: '900', color: '#FFF' }}>LIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text numberOfLines={1} style={{ fontSize: 10, color: '#E2E8F0', fontWeight: '600' }}>
                      {isUser ? 'You' : story.userName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity
                style={styles.watchStoriesCta}
                onPress={() => {
                  setShowMenu(false);
                  handleOpenStory(1);
                }}
              >
                <Play size={14} color="#08090C" fill="#08090C" />
                <Text style={styles.watchStoriesCtaText}>Watch Stories</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addStoryCta}
                onPress={() => {
                  setShowMenu(false);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={14} color="#FF9800" />
                <Text style={styles.addStoryCtaText}>Add Story</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Full-Screen Instagram Story Viewer Modal */}
      {activeStory && activeSegment && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseViewer}
        >
          <View style={styles.modalBackdrop}>
            <Image source={{ uri: activeSegment.mediaUrl }} style={styles.storyMediaFull} />

            <LinearGradient
              colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.4)', 'transparent']}
              style={styles.topVignette}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
              style={styles.bottomVignette}
            />

            <View style={styles.modalTopBar}>
              <View style={styles.progressRow}>
                {activeStory.segments.map((seg, sIdx) => {
                  let fill = 0;
                  if (sIdx < activeSegmentIndex) fill = 100;
                  else if (sIdx === activeSegmentIndex) fill = progress;

                  return (
                    <View key={seg.id} style={styles.progressBarBase}>
                      <View style={[styles.progressBarFill, { width: `${fill}%` }]} />
                    </View>
                  );
                })}
              </View>

              <View style={styles.authorRow}>
                <View style={styles.authorLeft}>
                  <Image source={{ uri: activeStory.avatar }} style={styles.smallAvatar} />
                  <View>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.authorName}>{activeStory.userName}</Text>
                      {activeStory.verified && (
                        <View style={styles.smallVerified}>
                          <Text style={styles.verifiedCheck}>✓</Text>
                        </View>
                      )}
                      <Text style={styles.timeAgo}>{activeSegment.timestamp}</Text>
                    </View>
                    <Text style={styles.authorCraft}>{activeStory.userCraft}</Text>
                  </View>
                </View>

                <View style={styles.authorRight}>
                  <TouchableOpacity
                    onPress={() => setIsPaused((p) => !p)}
                    style={styles.headerIconBtn}
                  >
                    {isPaused ? <Play size={16} color="#FFF" /> : <Pause size={16} color="#FFF" />}
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCloseViewer} style={styles.headerIconBtn}>
                    <X size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.tapZones}>
              <TouchableOpacity
                style={styles.leftTapZone}
                activeOpacity={1}
                onPress={handlePrevSegment}
              />
              <TouchableOpacity
                style={styles.rightTapZone}
                activeOpacity={1}
                onPress={handleNextSegment}
              />
            </View>

            <View style={styles.bottomArea}>
              {activeSegment.tag && (
                <View style={styles.tagCapsule}>
                  <Text style={styles.tagText}>{activeSegment.tag}</Text>
                </View>
              )}
              <Text style={styles.captionText}>{activeSegment.caption}</Text>

              <View style={styles.replyRow}>
                <TextInput
                  value={replyText}
                  onChangeText={setReplyText}
                  placeholder={`Reply to ${activeStory.userName}...`}
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  style={styles.replyInput}
                />
                {replyText.trim().length > 0 && (
                  <TouchableOpacity onPress={handleSendReply} style={styles.sendBtn}>
                    <Send size={15} color="#08090C" />
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => handleReaction('❤️')} style={styles.reactBtn}>
                  <Text style={styles.reactEmoji}>❤️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReaction('🔥')} style={styles.reactBtn}>
                  <Text style={styles.reactEmoji}>🔥</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleReaction('🎬')} style={styles.reactBtn}>
                  <Text style={styles.reactEmoji}>🎬</Text>
                </TouchableOpacity>
              </View>
            </View>

            {toastMessage && (
              <View style={styles.toastContainer}>
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            )}
          </View>
        </Modal>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View style={styles.createModalOverlay}>
            <View style={styles.createCard}>
              <View style={styles.createHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Camera size={18} color="#FF9800" />
                  <Text style={styles.createTitle}>Create CineStory</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <X size={18} color="#858995" />
                </TouchableOpacity>
              </View>

              <TextInput
                value={newCaption}
                onChangeText={setNewCaption}
                placeholder="What's happening on set today? 🎬"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.captionInput}
                multiline
              />

              <TouchableOpacity onPress={handleCreateStory} style={styles.postBtn}>
                <Text style={styles.postBtnText}>Share to Story 🚀</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  trayContainer: {
    backgroundColor: 'rgba(8, 10, 16, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 12,
  },
  storyBubbleItem: {
    width: 66,
    alignItems: 'center',
    gap: 5,
  },
  avatarWrapper: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 12,
  },
  gradientRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  viewedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  darkGap: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#08090C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 9,
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    borderWidth: 2,
    borderColor: '#08090C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#08090C',
  },
  liveText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFF',
  },
  userNameText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'space-between',
  },
  storyMediaFull: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topVignette: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  modalTopBar: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingHorizontal: 14,
    gap: 8,
    zIndex: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  progressBarBase: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF9800',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  authorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },
  smallVerified: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000',
  },
  timeAgo: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  authorCraft: {
    fontSize: 9.5,
    color: '#FF9800',
    fontWeight: '600',
  },
  authorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBtn: {
    padding: 4,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    top: 100,
    bottom: 150,
    flexDirection: 'row',
    zIndex: 10,
  },
  leftTapZone: {
    flex: 1,
  },
  rightTapZone: {
    flex: 2,
  },
  bottomArea: {
    paddingHorizontal: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    gap: 8,
    zIndex: 20,
  },
  tagCapsule: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 152, 0, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF9800',
    textTransform: 'uppercase',
  },
  captionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5F5F5',
    lineHeight: 18,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  replyInput: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    fontSize: 12,
    color: '#FFF',
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactEmoji: {
    fontSize: 15,
  },
  toastContainer: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: 'rgba(16, 18, 25, 0.92)',
    borderWidth: 1,
    borderColor: '#FF9800',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 50,
  },
  toastText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  createModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  createCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F131C',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    gap: 12,
  },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  captionInput: {
    height: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 10,
    color: '#FFF',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  postBtn: {
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#08090C',
  },
  headerStoriesBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E222D',
    backgroundColor: '#101219',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerStoryBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#08090C',
  },
  headerStoryBadgeText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#FFF',
  },
  menuModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  menuSheetCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#0E121B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
  },
  menuSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 10,
  },
  menuSheetTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
  },
  menuLiveBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  menuLiveBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FFF',
  },
  miniAvatarWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  miniGradientRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  miniViewedRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#08090C',
  },
  miniPlusBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF9800',
    borderWidth: 1.5,
    borderColor: '#08090C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniLiveTag: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#EF4444',
    paddingHorizontal: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#08090C',
  },
  watchStoriesCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF9800',
    height: 38,
    borderRadius: 12,
  },
  watchStoriesCtaText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#08090C',
  },
  addStoryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 12,
  },
  addStoryCtaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
});
