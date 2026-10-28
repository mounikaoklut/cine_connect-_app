import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import {
  MapPin,
  CheckCircle2,
  Edit3,
  ShieldCheck,
  Award,
  Film,
  Camera,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { CREATOR_PROFILE } from '../data/mockData';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(CREATOR_PROFILE);
  const [bioExpanded, setBioExpanded] = useState(false);

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Talent Credentials',
      'Update your representation contacts, union affiliation, or camera equipment packages.',
      [{ text: 'Dismiss' }]
    );
  };

  const handleContactAgent = () => {
    Alert.alert(
      `Representation: ${profile.representation.agency}`,
      `Lead Agent: ${profile.representation.agentName}\nEmail: ${profile.representation.email}\nPhone: ${profile.representation.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => Linking.openURL(`mailto:${profile.representation.email}`),
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Creator Profile"
        subtitle="Verified film credits, union badges & equipment"
        unreadCount={0}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= 1. Verified Creator Hero Card ================= */}
        <View style={styles.heroSection}>
          <GlassCard style={styles.heroCard} glow borderColor="rgba(245, 158, 11, 0.45)">
            <View style={styles.avatarContainer}>
              <Image source={{ uri: profile.avatar }} style={styles.heroAvatar} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEditProfile}
                style={styles.avatarEditBadge}
              >
                <Edit3 size={13} color="#0B0F17" strokeWidth={2.4} />
              </TouchableOpacity>
              <View style={styles.verifiedFloatingPill}>
                <CheckCircle2 size={12} color="#F59E0B" />
                <Text style={styles.verifiedText}>DPDP Act Verified</Text>
              </View>
            </View>

            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userHandle}>{profile.handle}</Text>
            <Text style={styles.userHeadline}>{profile.headline}</Text>

            <View style={styles.locationRow}>
              <MapPin size={13} color="#94A3B8" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>

            {/* Union Badges Pill Row */}
            <View style={styles.unionBadgesRow}>
              {profile.unionBadges.map((badge, idx) => (
                <View key={idx} style={styles.unionBadgePill}>
                  <ShieldCheck size={11} color="#10B981" />
                  <Text style={styles.unionBadgeText}>{badge}</Text>
                </View>
              ))}
            </View>

            {/* Quick Metrics Bar */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.creditsCount}</Text>
                <Text style={styles.statLabel}>Feature Credits</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{profile.awardsCount}</Text>
                <Text style={styles.statLabel}>Awards Won</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statValue}>94%</Text>
                <Text style={styles.statLabel}>Completeness</Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* ================= 2. Bio & Director Statement ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Creator Bio & Aesthetics</Text>
          <GlassCard style={styles.bioCard} borderColor="rgba(51, 65, 85, 0.7)">
            <Text
              style={styles.bioText}
              numberOfLines={bioExpanded ? undefined : 3}
            >
              {profile.bio}
              {'\n\n'}
              Equipped with full DCI color calibration gear, wireless monitoring kits, and high-speed motion rigs. Member of the Western India Cinematographers Association since 2018.
            </Text>

            <TouchableOpacity
              onPress={() => setBioExpanded(!bioExpanded)}
              style={styles.readMoreBtn}
            >
              <Text style={styles.readMoreText}>
                {bioExpanded ? 'Show Less' : 'Read Full Director Statement'}
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* ================= 3. Production Equipment List ================= */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeaderTitle}>Owned Camera & Lighting Gear</Text>
            <View style={styles.gearPill}>
              <Camera size={11} color="#F59E0B" />
              <Text style={styles.gearPillText}>Ready for Field</Text>
            </View>
          </View>

          <GlassCard style={styles.gearCard} borderColor="rgba(51, 65, 85, 0.7)">
            <View style={styles.gearGrid}>
              {profile.equipment.map((item, idx) => (
                <View key={idx} style={styles.gearItemRow}>
                  <View style={styles.gearDot} />
                  <Text style={styles.gearItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </View>

        {/* ================= 4. Representation & Contacts ================= */}
        <View style={styles.section}>
          <Text style={styles.sectionHeaderTitle}>Agency Representation</Text>
          <GlassCard style={styles.repCard} borderColor="rgba(245, 158, 11, 0.35)">
            <View style={styles.repHeaderRow}>
              <View style={styles.repIconWrap}>
                <Briefcase size={20} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.repAgency}>{profile.representation.agency}</Text>
                <Text style={styles.repAgent}>
                  Contact Agent: {profile.representation.agentName}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleContactAgent}
                style={styles.contactAgentBtn}
              >
                <Mail size={13} color="#0B0F17" strokeWidth={2.4} />
                <Text style={styles.contactAgentBtnText}>Contact</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.repMetaRow}>
              <View style={styles.repMetaItem}>
                <Mail size={12} color="#94A3B8" />
                <Text style={styles.repMetaText}>{profile.representation.email}</Text>
              </View>
              <View style={styles.repMetaItem}>
                <Phone size={12} color="#94A3B8" />
                <Text style={styles.repMetaText}>{profile.representation.phone}</Text>
              </View>
            </View>
          </GlassCard>
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
  heroSection: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  heroCard: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(20, 16, 10, 0.85)',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  heroAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: '#F59E0B',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F59E0B',
    borderWidth: 2,
    borderColor: '#0B0F17',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedFloatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 15, 23, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: -8,
    alignSelf: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  userName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 8,
  },
  userHandle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
    marginTop: 2,
  },
  userHeadline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  unionBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  unionBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  unionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F59E0B',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
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
  bioCard: {
    padding: 16,
  },
  bioText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  readMoreBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  gearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gearPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  gearCard: {
    padding: 16,
  },
  gearGrid: {
    gap: 10,
  },
  gearItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  gearDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  gearItemText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  repCard: {
    padding: 16,
  },
  repHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  repIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repAgency: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  repAgent: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  contactAgentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  contactAgentBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#0B0F17',
  },
  repMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.4)',
    marginTop: 14,
    paddingTop: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  repMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  repMetaText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
});
