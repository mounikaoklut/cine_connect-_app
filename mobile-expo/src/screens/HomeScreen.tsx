import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  CheckCircle2,
  Film,
  Clapperboard,
  DownloadCloud,
  ChevronRight,
  TrendingUp,
  Check,
  Bookmark,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { HOME_STUDIO_POSTS } from '../data/mockData';
import { ScreenKey, StudioPost } from '../types';

interface HomeScreenProps {
  onNavigate: (screen: ScreenKey) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [feedPosts, setFeedPosts] = useState<StudioPost[]>(HOME_STUDIO_POSTS);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({});
  const [savedPostIds, setSavedPostIds] = useState<Record<string, boolean>>({});

  const handleToggleFollow = (authorName: string) => {
    setFollowedAuthors((prev) => ({
      ...prev,
      [authorName]: !prev[authorName],
    }));
  };

  const handleToggleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const isSaved = !prev[postId];
      Alert.alert(
        isSaved ? 'Saved 🔖' : 'Removed',
        isSaved
          ? 'Post saved to your CineConnect collection.'
          : 'Post removed from your saved collection.'
      );
      return { ...prev, [postId]: isSaved };
    });
  };

  const handleToggleLike = (id: string) => {
    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );
  };

  const handleActionClick = (post: StudioPost) => {
    if (post.actionButton?.type === 'pitch') {
      Alert.alert(
        'Pitch Package Requested 🎬',
        `Your verified talent credentials and NDA agreement have been sent to ${post.author.name} for "${post.headline}". You will receive the watermarked script bible in your Portfolio Vault.`,
        [
          { text: 'View Portfolio Vault', onPress: () => onNavigate('Portfolio') },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } else if (post.actionButton?.type === 'audition') {
      Alert.alert(
        'Audition Notice 🎭',
        `Direct self-tape submission for ${post.author.name}. Would you like to review the audition requirements in Opportunities?`,
        [
          { text: 'Open Opportunities', onPress: () => onNavigate('Opportunities') },
          { text: 'Later', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Inquiry Sent',
        `Your direct message was delivered to the department head at ${post.author.name}.`
      );
    }
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        showUserGreeting
        userName="Alex"
        unreadCount={3}
        onNotificationPress={() =>
          Alert.alert('Studio Notifications', 'Roy Kapur Films approved your Pitch Package request! Director callback scheduled for Oct 24.')
        }
        onAvatarPress={() => onNavigate('Profile')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= 1. Top Featured Studio Spotlight Banner ================= */}
        <View style={styles.bannerSection}>
          <GlassCard style={styles.spotlightCard} glow borderColor="rgba(245, 158, 11, 0.45)">
            <View style={styles.spotlightHeaderRow}>
              <View style={styles.spotlightTag}>
                <Sparkles size={11} color="#0B0F17" />
                <Text style={styles.spotlightTagText}>STUDIO SPOTLIGHT</Text>
              </View>
              <Text style={styles.spotlightBudget}>₹42 Cr Production</Text>
            </View>

            <Text style={styles.spotlightHeadline}>
              "Shadow of Verity" — Vikramaditya Motwane
            </Text>
            <Text style={styles.spotlightDesc}>
              Roy Kapur Films opened co-production & department head calls across Mumbai and Berlin.
            </Text>

            <View style={styles.spotlightActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleActionClick(feedPosts[0])}
                style={styles.spotlightPrimaryBtn}
              >
                <Film size={14} color="#0B0F17" strokeWidth={2.4} />
                <Text style={styles.spotlightPrimaryBtnText}>Explore Production</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => onNavigate('Opportunities')}
                style={styles.spotlightSecondaryBtn}
              >
                <Text style={styles.spotlightSecondaryBtnText}>View Roles</Text>
                <ChevronRight size={13} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>

        {/* ================= 2. Live Media & Casting Feed ================= */}
        <View style={styles.feedHeaderRow}>
          <View>
            <Text style={styles.feedTitle}>Studio Stream & Industry Feed</Text>
            <Text style={styles.feedSubtitle}>
              Announcements, casting calls & film milestones
            </Text>
          </View>
          <View style={styles.liveStreamBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>CineConnect Live</Text>
          </View>
        </View>

        <View style={styles.postsList}>
          {feedPosts.map((post) => (
            <GlassCard
              key={post.id}
              style={styles.postCard}
              borderColor="rgba(51, 65, 85, 0.6)"
            >
              {/* Post Author Row */}
              <View style={styles.postAuthorRow}>
                <Image source={{ uri: post.author.avatar }} style={styles.authorAvatar} />
                <View style={{ flex: 1 }}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{post.author.name}</Text>
                    {post.author.verified && (
                      <CheckCircle2 size={12} color="#F59E0B" />
                    )}
                  </View>
                  <Text style={styles.authorMeta}>
                    {post.author.studio} • {post.timestamp}
                  </Text>
                </View>

                {/* Instagram-style Follow / Following Button */}
                <TouchableOpacity
                  style={[
                    styles.followBtn,
                    followedAuthors[post.author.name] ? styles.followingBtn : styles.unfollowedBtn,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleToggleFollow(post.author.name)}
                >
                  {followedAuthors[post.author.name] ? (
                    <View style={styles.followingContent}>
                      <Check size={11} color="#E2E8F0" strokeWidth={2.8} />
                      <Text style={styles.followingBtnText}>Following</Text>
                    </View>
                  ) : (
                    <Text style={styles.followBtnText}>Follow</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Post Content */}
              <Text style={styles.postHeadline}>{post.headline}</Text>
              <Text style={styles.postContentText}>{post.content}</Text>

              {/* Media Image Card */}
              {post.mediaUrl && (
                <View style={styles.mediaContainer}>
                  <Image source={{ uri: post.mediaUrl }} style={styles.postMediaImage} />
                  {post.projectBudget && (
                    <View style={styles.budgetPill}>
                      <Film size={11} color="#F59E0B" />
                      <Text style={styles.budgetPillText}>{post.projectBudget}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Interactive Engagement Row */}
              <View style={styles.engagementRow}>
                <View style={styles.countersGroup}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleToggleLike(post.id)}
                    style={styles.iconCounterBtn}
                  >
                    <Heart
                      size={16}
                      color={post.isLiked ? '#EF4444' : '#94A3B8'}
                      fill={post.isLiked ? '#EF4444' : 'none'}
                    />
                    <Text
                      style={[
                        styles.counterText,
                        post.isLiked && { color: '#EF4444', fontWeight: '800' },
                      ]}
                    >
                      {post.likes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Alert.alert('Discussion', `Join 64 industry guild members discussing "${post.author.name}".`)
                    }
                    style={styles.iconCounterBtn}
                  >
                    <MessageSquare size={16} color="#94A3B8" />
                    <Text style={styles.counterText}>{post.commentsCount}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Alert.alert('Share', `Direct pitch link copied to clipboard for ${post.author.name}.`)
                    }
                    style={styles.iconCounterBtn}
                  >
                    <Share2 size={16} color="#94A3B8" />
                    <Text style={styles.counterText}>{post.sharesCount}</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {post.actionButton && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleActionClick(post)}
                      style={styles.ctaButton}
                    >
                      <Text style={styles.ctaButtonText}>
                        {post.actionButton.label}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Instagram-style Save Button on the right side */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleToggleSavePost(post.id)}
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      backgroundColor: savedPostIds[post.id]
                        ? 'rgba(255, 152, 0, 0.18)'
                        : 'transparent',
                    }}
                  >
                    <Bookmark
                      size={18}
                      color={savedPostIds[post.id] ? '#FF9800' : '#94A3B8'}
                      fill={savedPostIds[post.id] ? '#FF9800' : 'none'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollContent: {
    paddingBottom: 190, // Safe clearance above bottom rotary dock
  },
  bannerSection: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  spotlightCard: {
    padding: 16,
    backgroundColor: 'rgba(24, 20, 12, 0.85)',
  },
  spotlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spotlightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spotlightTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0B0F17',
    letterSpacing: 0.5,
  },
  spotlightBudget: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  spotlightHeadline: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  spotlightDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  spotlightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  spotlightPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  spotlightPrimaryBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0B0F17',
  },
  spotlightSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  spotlightSecondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  feedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 12,
  },
  feedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  feedSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  liveStreamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  postsList: {
    paddingHorizontal: 18,
    gap: 16,
  },
  postCard: {
    padding: 16,
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  authorMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowedBtn: {
    backgroundColor: '#FF9800',
  },
  followingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  followBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#08090C',
    letterSpacing: 0.2,
  },
  followingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  followingBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    letterSpacing: 0.2,
  },
  postHeadline: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 19,
    marginBottom: 6,
  },
  postContentText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginBottom: 12,
  },
  mediaContainer: {
    height: 160,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  postMediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  budgetPill: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11, 15, 23, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  budgetPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
    paddingTop: 12,
  },
  countersGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCounterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  counterText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0B0F17',
  },
});
