import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Film } from 'lucide-react-native';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showUserGreeting?: boolean;
  userName?: string;
  avatarUrl?: string;
  unreadCount?: number;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
}

export default function Header({
  title,
  subtitle,
  showUserGreeting = false,
  userName = 'Alex',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  unreadCount = 2,
  onNotificationPress,
  onAvatarPress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      {showUserGreeting ? (
        <View style={styles.greetingRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onAvatarPress}
            style={styles.avatarWrapper}
          >
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            <View style={styles.onlineStatusDot} />
          </TouchableOpacity>

          <View style={styles.greetingTextContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.greetingTitle}>Welcome back, {userName}</Text>
              <Text style={styles.greetingWave}>🎬</Text>
            </View>
            <View style={styles.statusRow}>
              <Film size={11} color="#F59E0B" />
              <Text style={styles.greetingSubtitle}>Verified Creator & DOP Guild</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
        </View>
      )}

      {/* Unread Notification Bell */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onNotificationPress}
        style={styles.notificationButton}
      >
        <Bell size={19} color="#E2E8F0" strokeWidth={2} />
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.15)',
    backgroundColor: '#0B0F17',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#F59E0B', // Amber Gold
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981', // emerald-500
    borderWidth: 2,
    borderColor: '#0B0F17',
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  greetingWave: {
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  greetingSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#F59E0B',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#0B0F17',
  },
  unreadBadgeText: {
    color: '#0B0F17',
    fontSize: 9,
    fontWeight: '900',
  },
});
