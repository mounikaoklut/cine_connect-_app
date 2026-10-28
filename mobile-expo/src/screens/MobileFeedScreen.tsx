import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Sparkles,
  Search,
  Bell,
  SlidersHorizontal,
  Film,
  MessageSquare,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CinematicFeedCard from '../components/feed/CinematicFeedCard';
import CurvedDualWheelNav from '../components/navigation/CurvedDualWheelNav';
import { HOME_STUDIO_POSTS } from '../data/mockData';
import { ScreenKey, StudioPost } from '../types';

export interface MobileFeedScreenProps {
  activeRoute?: ScreenKey;
  onRouteChange?: (route: ScreenKey) => void;
  onNavigateDetail?: (target: string, payload?: any) => void;
  showNavDock?: boolean;
}

const CATEGORY_CHIPS = [
  'All Studio Feeds',
  'Exclusive Pitches',
  'Priority Castings',
  'Post-Production',
  'Wrap Milestones',
];

export default function MobileFeedScreen({
  activeRoute = 'Home',
  onRouteChange = () => {},
  onNavigateDetail,
  showNavDock = true,
}: MobileFeedScreenProps) {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<StudioPost[]>(HOME_STUDIO_POSTS);
  const [selectedChip, setSelectedChip] = useState('All Studio Feeds');

  const handleLikeToggle = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handlePrimaryAction = (post: StudioPost) => {
    if (post.actionButton?.type === 'pitch') {
      Alert.alert(
        'Pitch Package Requested 🎬',
        `Your verified talent credentials and forensic NDA have been sent to ${post.author.name} for "${post.headline}".`,
        [
          {
            text: 'View Opportunities',
            onPress: () => onRouteChange('Opportunities'),
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } else if (post.actionButton?.type === 'audition') {
      Alert.alert(
        'Self-Tape Booth 🎭',
        `Priority audition self-tape slot reserved for ${post.headline}. Upload your audition reel.`,
        [
          {
            text: 'Open Messages Thread',
            onPress: () => onRouteChange('Messages'),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Department Head Contact 📞',
        `Inquiry sent to ${post.author.name}. Check your Messages for their response.`,
        [
          {
            text: 'Go to Messages',
            onPress: () => onRouteChange('Messages'),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedChip === 'Exclusive Pitches') return post.type === 'pitch_package';
    if (selectedChip === 'Priority Castings') return post.type === 'casting_call';
    if (selectedChip === 'Post-Production') return post.type === 'announcement';
    if (selectedChip === 'Wrap Milestones') return post.type === 'bts';
    return true;
  });

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#08090C" />

      {/* Cinematic Studio Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 12) }]}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Film size={16} color="#FF9800" strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              CINE<Text style={styles.brandAccent}>CONNECT</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Industry Creative Feed</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          {/* Notifications Button */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => onRouteChange('Notifications')}
          >
            <Bell size={18} color="#858995" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>

          {/* Messages Button */}
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => onRouteChange('Messages')}
          >
            <MessageSquare size={18} color="#858995" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Vertically Scrollable Feed */}
      <ScrollView
        style={styles.feedScrollView}
        contentContainerStyle={[
          styles.feedScrollContent,
          { paddingBottom: DOCK_PADDING_BOTTOM },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Studio Feed Cards */}

        {/* Live Studio Feed Cards */}
        {filteredPosts.map((post) => (
          <CinematicFeedCard
            key={post.id}
            post={post}
            onLikeToggle={handleLikeToggle}
            onActionPress={handlePrimaryAction}
            onCommentPress={() =>
              Alert.alert('Comments', `Viewing 64 studio discussions on "${post.headline}".`)
            }
            onSharePress={() =>
              Alert.alert('Share', `DPDP watermarked package link copied to clipboard.`)
            }
          />
        ))}
      </ScrollView>

      {/* Permanently Anchored Bottom Rotary Wheel Dock */}
      {showNavDock && (
        <CurvedDualWheelNav
          activeRoute={activeRoute}
          onRouteSelect={onRouteChange}
        />
      )}
    </View>
  );
}

const DOCK_PADDING_BOTTOM = 88;

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#08090C', // Near-black background
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: '#08090C',
    borderBottomWidth: 1,
    borderBottomColor: '#101219',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 152, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F5F5F5',
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: '#FF9800',
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: '#858995',
    letterSpacing: 0.2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#101219',
    borderWidth: 1,
    borderColor: '#1E222D',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
  },
  feedScrollView: {
    flex: 1,
  },
  feedScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChipsContainer: {
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#101219',
    borderWidth: 1,
    borderColor: '#1E222D',
  },
  activeCategoryChip: {
    backgroundColor: 'rgba(255, 152, 0, 0.16)',
    borderColor: '#FF9800',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#858995',
  },
  activeCategoryChipText: {
    color: '#FF9800',
    fontWeight: '700',
  },
});
