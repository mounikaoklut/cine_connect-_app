import React, { useState, useMemo } from 'react';
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
  Clock,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Film,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { PRODUCTION_APPLICATIONS } from '../data/mockData';
import { ProductionApplication } from '../types';

const STATUS_TABS = [
  'All',
  'Submitted',
  'Under Review',
  'Audition/Interview',
  'Archived',
] as const;

type StatusTab = typeof STATUS_TABS[number];

const STEP_LABELS = ['Submitted', 'Under Review', 'Audition', 'Selected'];

export default function ApplicationsScreen() {
  const [selectedTab, setSelectedTab] = useState<StatusTab>('All');

  const filteredApplications = useMemo(() => {
    if (selectedTab === 'All') return PRODUCTION_APPLICATIONS;
    return PRODUCTION_APPLICATIONS.filter((app) => app.stage === selectedTab);
  }, [selectedTab]);

  const handleMessageProducer = (app: ProductionApplication) => {
    Alert.alert(
      `Message ${app.producerContact.name}`,
      `Send an in-app production inquiry or schedule confirmation regarding "${app.projectTitle}" (${app.roleTitle}).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Direct Message',
          onPress: () => {
            Alert.alert(
              'Message Sent',
              `Your message has been delivered to ${app.producerContact.name} (${app.producerContact.title}).`
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="My Applications"
        subtitle="Track your submission lifecycle & director meetings"
        unreadCount={1}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= Status Tabs Filter ================= */}
        <View style={styles.tabSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {STATUS_TABS.map((tab) => {
              const isSelected = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.8}
                  onPress={() => setSelectedTab(tab)}
                  style={[
                    styles.tabButton,
                    isSelected && styles.tabButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.tabButtonText,
                      isSelected && styles.tabButtonTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ================= Meta Summary Row ================= */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            Active Pipeline: <Text style={{ color: '#F59E0B', fontWeight: '800' }}>{filteredApplications.length}</Text> applications
          </Text>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>Live Producer Sync</Text>
          </View>
        </View>

        {/* ================= Applications List ================= */}
        <View style={styles.applicationsList}>
          {filteredApplications.map((app) => {
            const isInterview = app.stage === 'Audition/Interview';
            const isReview = app.stage === 'Under Review';
            const stageColor = isInterview
              ? '#F59E0B' // Amber
              : isReview
              ? '#818CF8' // Indigo
              : '#10B981'; // Emerald

            return (
              <GlassCard
                key={app.id}
                style={styles.appCard}
                borderColor={isInterview ? 'rgba(245, 158, 11, 0.45)' : 'rgba(51, 65, 85, 0.65)'}
                glow={isInterview}
              >
                {/* Header: Project, Role, Stage Badge */}
                <View style={styles.cardHeader}>
                  <Image source={{ uri: app.logo }} style={styles.studioLogo} />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.projectTitle} numberOfLines={1}>
                      {app.projectTitle}
                    </Text>
                    <Text style={styles.roleTitle}>{app.roleTitle}</Text>
                    <Text style={styles.houseTitle}>{app.productionHouse}</Text>
                  </View>

                  <View
                    style={[
                      styles.stageBadge,
                      {
                        backgroundColor: `${stageColor}20`,
                        borderColor: `${stageColor}50`,
                      },
                    ]}
                  >
                    <Text style={[styles.stageBadgeText, { color: stageColor }]}>
                      {app.stage}
                    </Text>
                  </View>
                </View>

                {/* Stepper Progress Bar */}
                <View style={styles.stepperContainer}>
                  <View style={styles.stepperTrackBg} />
                  <View
                    style={[
                      styles.stepperTrackFill,
                      {
                        width: `${((app.currentStepIndex + 1) / 4) * 100}%`,
                        backgroundColor: stageColor,
                      },
                    ]}
                  />

                  <View style={styles.stepperNodesRow}>
                    {STEP_LABELS.map((label, stepIdx) => {
                      const isCompleted = stepIdx <= app.currentStepIndex;
                      const isCurrent = stepIdx === app.currentStepIndex;

                      return (
                        <View key={label} style={styles.stepperNodeCol}>
                          <View
                            style={[
                              styles.stepperDot,
                              isCompleted && {
                                backgroundColor: stageColor,
                                borderColor: '#0B0F17',
                              },
                              isCurrent && styles.stepperDotCurrent,
                            ]}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={10} color="#0B0F17" strokeWidth={3} />
                            ) : (
                              <View style={styles.stepperDotEmpty} />
                            )}
                          </View>
                          <Text
                            style={[
                              styles.stepperLabel,
                              isCompleted && { color: '#E2E8F0', fontWeight: '700' },
                            ]}
                          >
                            {label}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Next Step Note / Producer Action Item */}
                <View style={styles.noteBox}>
                  <View style={styles.noteHeader}>
                    <Sparkles size={11} color="#F59E0B" />
                    <Text style={styles.noteTitle}>CURRENT STAGE STATUS</Text>
                  </View>
                  <Text style={styles.noteText}>{app.nextStepNote}</Text>

                  {app.hearingDate && (
                    <View style={styles.calendarCallout}>
                      <Calendar size={12} color="#F59E0B" />
                      <Text style={styles.calendarCalloutText}>
                        Confirmed Meeting: {app.hearingDate}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Producer Contact Row with Messaging CTA */}
                <View style={styles.producerFooterRow}>
                  <View style={styles.producerInfoGroup}>
                    <Image
                      source={{ uri: app.producerContact.avatar }}
                      style={styles.producerAvatar}
                    />
                    <View>
                      <Text style={styles.producerName}>
                        {app.producerContact.name}
                      </Text>
                      <Text style={styles.producerTitle}>
                        {app.producerContact.title}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleMessageProducer(app)}
                    style={styles.messageProducerBtn}
                  >
                    <MessageSquare size={13} color="#0B0F17" strokeWidth={2.4} />
                    <Text style={styles.messageProducerBtnText}>Message</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.dateStampRow}>
                  <Clock size={11} color="#64748B" />
                  <Text style={styles.dateStampText}>
                    Applied on {app.appliedDate}
                  </Text>
                </View>
              </GlassCard>
            );
          })}
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
    paddingBottom: 190,
  },
  tabSection: {
    marginTop: 16,
  },
  tabsScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  tabButtonActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#0B0F17',
    fontWeight: '900',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  syncText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  applicationsList: {
    paddingHorizontal: 18,
    gap: 16,
  },
  appCard: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  studioLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 2,
  },
  houseTitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepperContainer: {
    marginVertical: 16,
    position: 'relative',
    paddingHorizontal: 4,
  },
  stepperTrackBg: {
    position: 'absolute',
    top: 9,
    left: 14,
    right: 14,
    height: 3,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    borderRadius: 2,
  },
  stepperTrackFill: {
    position: 'absolute',
    top: 9,
    left: 14,
    height: 3,
    borderRadius: 2,
  },
  stepperNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepperNodeCol: {
    alignItems: 'center',
    width: 65,
  },
  stepperDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: 'rgba(71, 85, 105, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepperDotCurrent: {
    borderColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
  },
  stepperDotEmpty: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
  stepperLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  noteBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  noteText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  calendarCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  calendarCalloutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  producerFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
    marginTop: 14,
    paddingTop: 12,
  },
  producerInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  producerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  producerName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  producerTitle: {
    fontSize: 10,
    color: '#94A3B8',
  },
  messageProducerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  messageProducerBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0B0F17',
  },
  dateStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  dateStampText: {
    fontSize: 10,
    color: '#64748B',
  },
});
