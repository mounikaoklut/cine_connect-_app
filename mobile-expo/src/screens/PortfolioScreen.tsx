import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import {
  Play,
  Film,
  Award,
  DownloadCloud,
  Lock,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { FILM_CREDITS, PITCH_DECKS, CREATOR_PROFILE } from '../data/mockData';
import { PitchDeckItem } from '../types';

export default function PortfolioScreen() {
  const [isPlayingReel, setIsPlayingReel] = useState(false);

  const handlePlayReel = () => {
    setIsPlayingReel(!isPlayingReel);
    Alert.alert(
      'Narrative Showreel 2026',
      'Playing 4K DCI (4096 × 1716) Anamorphic stream on Arri Alexa 35 & Cooke Anamorphic /i Full Frame set.',
      [{ text: 'Dismiss' }]
    );
  };

  const handleDownloadDeck = (pitch: PitchDeckItem) => {
    Alert.alert(
      'Download Pitch Package 📜',
      `Forensic NDA verified. The package for "${pitch.title}" is stamped with your DPDP digital identifier (ID: DPDP-IN-98214) and ready for offline review.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download PDF Package',
          onPress: () => {
            Alert.alert('Downloaded', `"${pitch.title}" pitch deck saved to offline vault.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Portfolio Vault"
        subtitle="4K showreels, verified film credits & pitch decks"
        unreadCount={0}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= 1. Creator Showreel Video Card ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Official DOP Showreel</Text>
          <GlassCard style={styles.showreelCard} glow borderColor="rgba(245, 158, 11, 0.45)">
            <View style={styles.videoPlayerContainer}>
              <Image
                source={{ uri: CREATOR_PROFILE.showreel.thumbnail }}
                style={styles.showreelThumbnail}
              />
              <View style={styles.videoDarkOverlay} />

              {/* Aspect Ratio & Resolution Pills */}
              <View style={styles.videoTopPillsRow}>
                <View style={styles.videoSpecPill}>
                  <Text style={styles.videoSpecPillText}>
                    {CREATOR_PROFILE.showreel.aspectRatio}
                  </Text>
                </View>
                <View style={[styles.videoSpecPill, { backgroundColor: '#F59E0B' }]}>
                  <Text style={[styles.videoSpecPillText, { color: '#0B0F17' }]}>
                    {CREATOR_PROFILE.showreel.resolution}
                  </Text>
                </View>
              </View>

              {/* Play Button Simulation */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handlePlayReel}
                style={styles.playButton}
              >
                <Play size={24} color="#0B0F17" fill="#0B0F17" style={{ marginLeft: 3 }} />
              </TouchableOpacity>

              {/* Live Timecode & Package Footer */}
              <View style={styles.videoBottomBar}>
                <View style={styles.timecodePill}>
                  <Text style={styles.timecodeText}>
                    {CREATOR_PROFILE.showreel.timecode}
                  </Text>
                </View>
                <Text style={styles.cameraPackageText}>
                  {CREATOR_PROFILE.showreel.cameraPackage}
                </Text>
              </View>
            </View>

            <View style={styles.showreelInfo}>
              <Text style={styles.showreelTitle}>
                {CREATOR_PROFILE.showreel.title}
              </Text>
              <Text style={styles.showreelSubtitle}>
                Features dramatic night interior lighting, high-speed car chases, and handheld sequences from award-winning OTT projects.
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* ================= 2. Verified Guild Credentials ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Verified Guild Credentials</Text>
          <GlassCard style={styles.guildCard} borderColor="rgba(51, 65, 85, 0.7)">
            <View style={styles.credentialsRow}>
              {CREATOR_PROFILE.unionBadges.map((badge, idx) => (
                <View key={idx} style={styles.credentialPill}>
                  <ShieldCheck size={13} color="#10B981" />
                  <Text style={styles.credentialPillText}>{badge}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* ================= 3. Film & Series Credits List ================= */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Official Film Credits</Text>
            <View style={styles.creditsCountPill}>
              <Film size={11} color="#F59E0B" />
              <Text style={styles.creditsCountText}>
                {FILM_CREDITS.length} Verified Titles
              </Text>
            </View>
          </View>

          <GlassCard style={styles.creditsCard} borderColor="rgba(51, 65, 85, 0.7)">
            {FILM_CREDITS.map((credit, idx) => {
              const isLast = idx === FILM_CREDITS.length - 1;
              return (
                <View
                  key={credit.id}
                  style={[
                    styles.creditRow,
                    !isLast && styles.creditRowBorder,
                  ]}
                >
                  <View style={styles.creditIconContainer}>
                    <Film size={18} color="#F59E0B" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.creditTitle}>{credit.title}</Text>
                    <Text style={styles.creditRole}>{credit.role}</Text>
                    <Text style={styles.creditPlatform}>
                      {credit.directorOrHouse} • {credit.platformOrFestival}
                    </Text>
                  </View>

                  <View style={styles.creditYearBadge}>
                    <Text style={styles.creditYearText}>{credit.year}</Text>
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </View>

        {/* ================= 4. Downloadable Pitch Decks (NDA Protected) ================= */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Screenplay & Pitch Decks</Text>
            <View style={styles.ndaBadge}>
              <Lock size={10} color="#F59E0B" />
              <Text style={styles.ndaBadgeText}>NDA Protected</Text>
            </View>
          </View>

          <View style={styles.pitchList}>
            {PITCH_DECKS.map((pitch) => (
              <GlassCard
                key={pitch.id}
                style={styles.pitchCard}
                borderColor="rgba(245, 158, 11, 0.35)"
              >
                <Image source={{ uri: pitch.coverImage }} style={styles.pitchCoverImage} />

                <View style={styles.pitchCardBody}>
                  <View style={styles.pitchMetaRow}>
                    <View style={styles.formatPill}>
                      <Text style={styles.formatPillText}>{pitch.format}</Text>
                    </View>
                    <Text style={styles.pitchBudget}>{pitch.budgetEstimate}</Text>
                  </View>

                  <Text style={styles.pitchTitle}>{pitch.title}</Text>
                  <Text style={styles.pitchGenre}>{pitch.genre}</Text>
                  <Text style={styles.pitchLogline}>"{pitch.logline}"</Text>

                  <View style={styles.pitchFooterRow}>
                    <Text style={styles.pitchWriter}>Written by {pitch.writer}</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleDownloadDeck(pitch)}
                      style={styles.downloadDeckBtn}
                    >
                      <DownloadCloud size={13} color="#0B0F17" strokeWidth={2.4} />
                      <Text style={styles.downloadDeckBtnText}>Download Deck</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 18,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  showreelCard: {
    padding: 0,
    overflow: 'hidden',
  },
  videoPlayerContainer: {
    height: 190,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showreelThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoDarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 23, 0.45)',
  },
  videoTopPillsRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  videoSpecPill: {
    backgroundColor: 'rgba(11, 15, 23, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  videoSpecPillText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F59E0B',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
  },
  videoBottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timecodePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  timecodeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cameraPackageText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#CBD5E1',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  showreelInfo: {
    padding: 16,
  },
  showreelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  showreelSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },
  guildCard: {
    padding: 14,
  },
  credentialsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  credentialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  credentialPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  creditsCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  creditsCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  creditsCard: {
    padding: 14,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  creditRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(51, 65, 85, 0.4)',
  },
  creditIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  creditRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 1,
  },
  creditPlatform: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  creditYearBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  creditYearText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  ndaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  ndaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  pitchList: {
    gap: 16,
  },
  pitchCard: {
    padding: 0,
    overflow: 'hidden',
  },
  pitchCoverImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  pitchCardBody: {
    padding: 16,
  },
  pitchMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  formatPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  formatPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  pitchBudget: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
  },
  pitchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  pitchGenre: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 8,
  },
  pitchLogline: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  pitchFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
    paddingTop: 10,
  },
  pitchWriter: {
    fontSize: 10,
    color: '#94A3B8',
  },
  downloadDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  downloadDeckBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0B0F17',
  },
});
