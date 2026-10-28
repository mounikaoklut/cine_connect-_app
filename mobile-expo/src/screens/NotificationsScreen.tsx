import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Bell,
  Sparkles,
  Calendar,
  Film,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Trash2,
  Check,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { NOTIFICATIONS_DATA } from '../data/mockData';
import { NotificationItem, ScreenKey } from '../types';

interface NotificationsScreenProps {
  onNavigate?: (screen: ScreenKey) => void;
}

const FILTER_TABS = ['All', 'Callbacks', 'AI Matches', 'Reviews', 'NDA & Legal'];

export default function NotificationsScreen({ onNavigate }: NotificationsScreenProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(NOTIFICATIONS_DATA);
  const [activeTab, setActiveTab] = useState('All');

  const filteredList = notifications.filter((item) => {
    if (activeTab === 'Callbacks') return item.type === 'callback';
    if (activeTab === 'AI Matches') return item.type === 'match';
    if (activeTab === 'Reviews') return item.type === 'review';
    if (activeTab === 'NDA & Legal') return item.type === 'nda';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotificationPress = (item: NotificationItem) => {
    // Mark this item as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );

    if (item.type === 'callback') {
      Alert.alert(
        'Audition Callback Details 🎭',
        'Yash Raj Films confirmed your chemistry screen test with the lead director.\n\nTime: Tomorrow at 4:00 PM\nLocation: YRF Studios, Stage 4, Andheri West\nSelf-Tape Copy: Synced with Studio',
        [
          {
            text: 'Open Messages Thread',
            onPress: () => onNavigate?.('Messages'),
          },
          { text: 'Done', style: 'cancel' },
        ]
      );
    } else if (item.type === 'match') {
      Alert.alert(
        '98% Talent Match Found 🚀',
        'Roy Kapur Films opened a Lead DOP position for a ₹42 Cr espionage thriller.\n\nRequirements match your Arri Alexa 35 experience and WICA Union membership.',
        [
          {
            text: 'View Opportunity',
            onPress: () => onNavigate?.('Opportunities'),
          },
          { text: 'Dismiss', style: 'cancel' },
        ]
      );
    } else if (item.type === 'review') {
      Alert.alert(
        'Showreel Insight 📊',
        'Red Chillies VFX lead colorist viewed your 4K DCI anamorphic showreel for 4m 12s.\n\nEngagement: High interest in HDR Dolby Vision grading sample.',
        [{ text: 'OK' }]
      );
    } else if (item.type === 'nda') {
      Alert.alert(
        'Digital NDA Watermark Verified 🔒',
        'Your pitch deck for "The Silent Monsoon" has been digitally fingerprinted under the Digital Personal Data Protection (DPDP) Act 2026. Any screenshots or unauthorized distribution will be forensically tracked to the viewer ID.',
        [{ text: 'Understood' }]
      );
    }
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'callback':
        return <Calendar size={18} color="#F59E0B" />;
      case 'match':
        return <Sparkles size={18} color="#A855F7" />;
      case 'review':
        return <Film size={18} color="#38BDF8" />;
      case 'nda':
        return <ShieldCheck size={18} color="#10B981" />;
      default:
        return <Bell size={18} color="#F59E0B" />;
    }
  };

  const getBadgeColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'callback':
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
      case 'match':
        return { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' };
      case 'review':
        return { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' };
      case 'nda':
        return { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' };
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.titleText}>Notifications</Text>
              <Text style={styles.subtitleText}>
                Audition callbacks, studio reviews, and contract verifications.
              </Text>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity
                onPress={markAllAsRead}
                style={styles.markReadButton}
              >
                <Check size={14} color="#F59E0B" />
                <Text style={styles.markReadText}>Mark Read</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {FILTER_TABS.map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[
                  styles.filterChip,
                  isSelected && styles.activeFilterChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.activeFilterChipText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Notifications List */}
        <View style={styles.listContainer}>
          {filteredList.map((item) => {
            const colors = getBadgeColor(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => handleNotificationPress(item)}
              >
                <GlassCard
                  style={[
                    styles.notificationCard,
                    !item.read && styles.unreadNotificationCard,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    {/* Icon Circle */}
                    <View
                      style={[
                        styles.iconBadge,
                        {
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      {getIconForType(item.type)}
                    </View>

                    <View style={styles.cardContent}>
                      <View style={styles.headlineRow}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.timestampText}>
                          {item.timestamp}
                        </Text>
                      </View>

                      <Text style={styles.cardDescription}>
                        {item.description}
                      </Text>

                      <View style={styles.footerRow}>
                        {item.urgent && (
                          <View style={styles.urgentBadge}>
                            <Text style={styles.urgentText}>ACTION REQUIRED</Text>
                          </View>
                        )}
                        <View style={styles.actionPrompt}>
                          <Text style={styles.actionPromptText}>View Details</Text>
                          <ChevronRight size={13} color="#F59E0B" />
                        </View>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  titleSection: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  markReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  markReadText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  chipsScroll: {
    marginBottom: 16,
  },
  chipsContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#161F30',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: '#F59E0B',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterChipText: {
    color: '#F59E0B',
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  notificationCard: {
    padding: 14,
  },
  unreadNotificationCard: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    paddingRight: 8,
  },
  timestampText: {
    fontSize: 11,
    color: '#64748B',
  },
  cardDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  urgentText: {
    color: '#EF4444',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 'auto',
  },
  actionPromptText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
