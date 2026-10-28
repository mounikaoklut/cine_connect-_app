import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Heart,
  MessageSquare,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Film,
  Calendar,
  Check,
} from 'lucide-react-native';
import { StudioPost } from '../../types';

export interface CinematicFeedCardProps {
  post: StudioPost;
  onLikeToggle: (id: string) => void;
  onActionPress?: (post: StudioPost) => void;
  onCommentPress?: (post: StudioPost) => void;
  onSharePress?: (post: StudioPost) => void;
}

export default function CinematicFeedCard({
  post,
  onLikeToggle,
  onActionPress,
  onCommentPress,
  onSharePress,
}: CinematicFeedCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handlePrimaryAction = () => {
    if (onActionPress) {
      onActionPress(post);
      return;
    }

    if (post.actionButton?.type === 'pitch') {
      Alert.alert(
        'Pitch Package Requested 🎬',
        `Your verified credentials and NDA have been submitted to ${post.author.name} for "${post.headline}".`,
        [{ text: 'OK' }]
      );
    } else if (post.actionButton?.type === 'audition') {
      Alert.alert(
        'Audition Submission 🎭',
        `Self-tape booth opened for "${post.headline}". Upload your video submission directly.`,
        [{ text: 'Continue' }]
      );
    } else {
      Alert.alert(
        'Inquiry Sent 📩',
        `Direct communication channel opened with ${post.author.name}.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.cardContainer}>
      {/* Creator Header */}
      <View style={styles.cardHeader}>
        <View style={styles.authorRow}>
          <Image source={{ uri: post.author.avatar }} style={styles.avatar} />
          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              {post.author.verified && (
                <CheckCircle2 size={14} color="#FF9800" strokeWidth={2.5} />
              )}
            </View>
            <Text style={styles.studioSubtitle}>
              {post.author.studio} &bull; {post.timestamp}
            </Text>
          </View>
        </View>

        {/* Instagram-style Follow / Following Button */}
        <TouchableOpacity
          style={[
            styles.followButton,
            isFollowing ? styles.followingButton : styles.unfollowedButton,
          ]}
          activeOpacity={0.8}
          onPress={() => setIsFollowing(!isFollowing)}
        >
          {isFollowing ? (
            <View style={styles.followingContent}>
              <Check size={12} color="#E2E8F0" strokeWidth={2.8} />
              <Text style={styles.followingText}>Following</Text>
            </View>
          ) : (
            <Text style={styles.followText}>Follow</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Post Headline & Description */}
      <View style={styles.contentSection}>
        <Text style={styles.headlineText}>{post.headline}</Text>
        <Text style={styles.bodyContent}>{post.content}</Text>
      </View>

      {/* Cinematic Media Thumbnail */}
      {post.mediaUrl && (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: post.mediaUrl }} style={styles.mediaImage} />
          {post.projectBudget && (
            <View style={styles.budgetPill}>
              <Film size={11} color="#FFC247" />
              <Text style={styles.budgetPillText}>{post.projectBudget}</Text>
            </View>
          )}
        </View>
      )}

      {/* Post Action Bar: Muted Gray Icons + Amber-Orange Pill Button */}
      <View style={styles.cardFooter}>
        <View style={styles.socialActionGroup}>
          {/* Like Button */}
          <TouchableOpacity
            style={styles.actionIconButton}
            activeOpacity={0.7}
            onPress={() => onLikeToggle(post.id)}
          >
            <Heart
              size={18}
              color={post.isLiked ? '#FF9800' : '#858995'}
              fill={post.isLiked ? '#FF9800' : 'none'}
              strokeWidth={1.8}
            />
            <Text
              style={[
                styles.actionCountText,
                post.isLiked && styles.actionCountLiked,
              ]}
            >
              {post.likes}
            </Text>
          </TouchableOpacity>

          {/* Comment Button */}
          <TouchableOpacity
            style={styles.actionIconButton}
            activeOpacity={0.7}
            onPress={() => onCommentPress?.(post)}
          >
            <MessageSquare size={18} color="#858995" strokeWidth={1.8} />
            <Text style={styles.actionCountText}>{post.commentsCount}</Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={styles.actionIconButton}
            activeOpacity={0.7}
            onPress={() => onSharePress?.(post)}
          >
            <Share2 size={17} color="#858995" strokeWidth={1.8} />
          </TouchableOpacity>
        </View>

        {/* Primary Action Button: Amber-Orange Pill */}
        {post.actionButton && (
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.85}
            onPress={handlePrimaryAction}
          >
            <Text style={styles.primaryActionText}>
              {post.actionButton.label}
            </Text>
            <ArrowUpRight size={13} color="#08090C" strokeWidth={2.5} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#101219', // Dark charcoal surface
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E222D', // Subtle charcoal gray border
    marginBottom: 16,
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#262A36',
  },
  authorMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F5', // White text
    letterSpacing: -0.2,
  },
  studioSubtitle: {
    fontSize: 12,
    color: '#858995', // Secondary gray
    marginTop: 1,
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowedButton: {
    backgroundColor: '#FF9800',
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  followText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#08090C',
    letterSpacing: 0.2,
  },
  followingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  followingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    letterSpacing: 0.2,
  },
  contentSection: {
    marginBottom: 12,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5F5',
    lineHeight: 21,
    marginBottom: 6,
  },
  bodyContent: {
    fontSize: 13,
    color: '#858995',
    lineHeight: 19,
  },
  mediaContainer: {
    position: 'relative',
    width: '100%',
    height: 190,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#08090C',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E222D',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  budgetPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(8, 9, 12, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 194, 71, 0.3)',
  },
  budgetPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC247', // Golden yellow
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#171A23',
  },
  socialActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#858995', // Muted gray
  },
  actionCountLiked: {
    color: '#FF9800',
    fontWeight: '700',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF9800', // Amber-orange primary
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#08090C', // Black contrast text
    letterSpacing: 0.2,
  },
});
