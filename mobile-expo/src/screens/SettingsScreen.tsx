import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  Bell,
  Lock,
  Eye,
  LogOut,
  ChevronRight,
  FileCheck,
  Sparkles,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';

export default function SettingsScreen() {
  const [ndaWatermarkEnabled, setNdaWatermarkEnabled] = useState(true);
  const [pitchPasscodeEnabled, setPitchPasscodeEnabled] = useState(true);
  const [publicShowcaseEnabled, setPublicShowcaseEnabled] = useState(true);
  const [auditionAlertsEnabled, setAuditionAlertsEnabled] = useState(true);
  const [producerInquiriesEnabled, setProducerInquiriesEnabled] = useState(true);

  const handleRowClick = (title: string, info: string) => {
    Alert.alert(title, info, [{ text: 'Close' }]);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out of CineConnect',
      'Are you sure you want to log out? Offline pitch packages will remain encrypted until your next sign-in.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Signed Out', 'You have been safely signed out.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Settings"
        subtitle="Manage DPDP verification, NDA security & alerts"
        unreadCount={0}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= 1. Account & Verification ================= */}
        <View style={styles.groupSection}>
          <Text style={styles.groupHeaderTitle}>Account & Verification</Text>
          <GlassCard style={styles.groupCard} borderColor="rgba(51, 65, 85, 0.75)">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleRowClick(
                  'DPDP Government ID Verification',
                  'Aadhaar / Passport verified under India Digital Personal Data Protection Act (DPDP Act). Credential ID: DPDP-VERIFIED-98214.'
                )
              }
              style={styles.settingRow}
            >
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <ShieldCheck size={18} color="#F59E0B" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Government ID & DPDP Verification</Text>
                <Text style={styles.rowSubtitle}>Verified & digitally signed</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                handleRowClick(
                  'Union Guild Accreditation',
                  'Active memberships: Western India Cinematographers Association (WICA #48102) & Screenwriters Association (SWA #11940).'
                )
              }
              style={styles.settingRow}
            >
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <FileCheck size={18} color="#10B981" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Guild Cards (WICA & SWA)</Text>
                <Text style={styles.rowSubtitle}>Active membership status confirmed</Text>
              </View>
              <ChevronRight size={16} color="#64748B" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* ================= 2. Push Notifications ================= */}
        <View style={styles.groupSection}>
          <Text style={styles.groupHeaderTitle}>Push Notifications</Text>
          <GlassCard style={styles.groupCard} borderColor="rgba(51, 65, 85, 0.75)">
            {/* Audition Callbacks Toggle */}
            <View style={styles.settingRow}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Bell size={18} color="#F59E0B" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Audition & Director Callbacks</Text>
                <Text style={styles.rowSubtitle}>Instant notifications for screen test invites</Text>
              </View>
              <Switch
                value={auditionAlertsEnabled}
                onValueChange={setAuditionAlertsEnabled}
                trackColor={{ false: '#334155', true: '#F59E0B' }}
                thumbColor={auditionAlertsEnabled ? '#0B0F17' : '#94A3B8'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Producer Inquiries Toggle */}
            <View style={styles.settingRow}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(129, 140, 248, 0.15)' }]}>
                <Bell size={18} color="#818CF8" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Producer Direct Inquiries</Text>
                <Text style={styles.rowSubtitle}>Direct messages from production houses</Text>
              </View>
              <Switch
                value={producerInquiriesEnabled}
                onValueChange={setProducerInquiriesEnabled}
                trackColor={{ false: '#334155', true: '#F59E0B' }}
                thumbColor={producerInquiriesEnabled ? '#0B0F17' : '#94A3B8'}
              />
            </View>
          </GlassCard>
        </View>

        {/* ================= 3. Portfolio Privacy & NDA Security ================= */}
        <View style={styles.groupSection}>
          <Text style={styles.groupHeaderTitle}>Portfolio Privacy & NDA Security</Text>
          <GlassCard style={styles.groupCard} borderColor="rgba(51, 65, 85, 0.75)">
            {/* Dynamic NDA Watermark */}
            <View style={styles.settingRow}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Lock size={18} color="#F59E0B" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Dynamic NDA Watermarking</Text>
                <Text style={styles.rowSubtitle}>Embed recipient IP & timecode on script exports</Text>
              </View>
              <Switch
                value={ndaWatermarkEnabled}
                onValueChange={setNdaWatermarkEnabled}
                trackColor={{ false: '#334155', true: '#F59E0B' }}
                thumbColor={ndaWatermarkEnabled ? '#0B0F17' : '#94A3B8'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Pitch Deck Passcode Lock */}
            <View style={styles.settingRow}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Lock size={18} color="#F59E0B" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Pitch Deck Passcode Lock</Text>
                <Text style={styles.rowSubtitle}>Require biometric authentication to open bibles</Text>
              </View>
              <Switch
                value={pitchPasscodeEnabled}
                onValueChange={setPitchPasscodeEnabled}
                trackColor={{ false: '#334155', true: '#F59E0B' }}
                thumbColor={pitchPasscodeEnabled ? '#0B0F17' : '#94A3B8'}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Public Showcase Toggle */}
            <View style={styles.settingRow}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Eye size={18} color="#10B981" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowTitle}>Public Showcase Directory</Text>
                <Text style={styles.rowSubtitle}>Visible to accredited casting directors</Text>
              </View>
              <Switch
                value={publicShowcaseEnabled}
                onValueChange={setPublicShowcaseEnabled}
                trackColor={{ false: '#334155', true: '#F59E0B' }}
                thumbColor={publicShowcaseEnabled ? '#0B0F17' : '#94A3B8'}
              />
            </View>
          </GlassCard>
        </View>

        {/* ================= 4. Sign Out ================= */}
        <View style={styles.groupSection}>
          <GlassCard style={styles.groupCard} borderColor="rgba(239, 68, 68, 0.4)">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSignOut}
              style={styles.logoutRow}
            >
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <LogOut size={18} color="#EF4444" />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.logoutTitle}>Sign Out</Text>
                <Text style={styles.logoutSubtitle}>Safely end your active session on this device</Text>
              </View>
              <ChevronRight size={16} color="#EF4444" />
            </TouchableOpacity>
          </GlassCard>
        </View>

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>
            CineConnect Mobile • v2.4 (Film & Guild Edition)
          </Text>
          <Text style={styles.engineText}>
            React Native Expo • Reanimated 3 • NativeWind
          </Text>
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
  groupSection: {
    marginTop: 20,
    paddingHorizontal: 18,
  },
  groupHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  groupCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextContainer: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rowSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F59E0B',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    marginLeft: 64,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  logoutTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EF4444',
  },
  logoutSubtitle: {
    fontSize: 11,
    color: '#F87171',
    marginTop: 2,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  engineText: {
    fontSize: 10,
    color: '#475569',
  },
});
