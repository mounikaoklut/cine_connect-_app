import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Search,
  X,
  MapPin,
  Calendar,
  Bookmark,
  Sparkles,
  Zap,
  CheckCircle2,
  Film,
  Camera,
} from 'lucide-react-native';
import Header from '../components/Header';
import GlassCard from '../components/GlassCard';
import { PRODUCTION_OPPORTUNITIES } from '../data/mockData';
import { ProductionOpportunity } from '../types';

const FILTER_CHIPS = [
  'All',
  'Directing',
  'Cinematography',
  'Post-Production',
  'Writing',
  'Acting',
];

export default function OpportunitiesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({
    'opp-1': true,
    'opp-6': true,
  });
  const [appliedIds, setAppliedIds] = useState<Record<string, boolean>>({});

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApply = (opp: ProductionOpportunity) => {
    if (appliedIds[opp.id]) return;
    setAppliedIds((prev) => ({ ...prev, [opp.id]: true }));
    Alert.alert(
      'Submission Received 🎬',
      `Your verified union portfolio and showreel have been submitted to ${opp.productionCompany} for the "${opp.title}" position. You can track this in My Applications.`,
      [{ text: 'Got It' }]
    );
  };

  const filteredOpportunities = useMemo(() => {
    return PRODUCTION_OPPORTUNITIES.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.productionCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.requirements.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesChip = true;
      if (activeChip !== 'All') {
        matchesChip = item.category === activeChip;
      }

      return matchesSearch && matchesChip;
    });
  }, [searchQuery, activeChip]);

  return (
    <View style={styles.screenContainer}>
      <Header
        title="Opportunities"
        subtitle="Explore open directing, camera, and post calls"
        unreadCount={1}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= Search Bar ================= */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94A3B8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by role, studio, or camera package..."
              placeholderTextColor="#64748B"
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={14} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ================= Filter Chips ================= */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeChip === chip;
              return (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.75}
                  onPress={() => setActiveChip(chip)}
                  style={[
                    styles.chip,
                    isActive && styles.chipActive,
                  ]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ================= Results Header ================= */}
        <View style={styles.resultsMetaRow}>
          <Text style={styles.resultsCountText}>
            Showing <Text style={{ color: '#F59E0B', fontWeight: '800' }}>{filteredOpportunities.length}</Text> open casting & crew calls
          </Text>
          <View style={styles.sortPill}>
            <Sparkles size={11} color="#F59E0B" />
            <Text style={styles.sortPillText}>AI Talent Match</Text>
          </View>
        </View>

        {/* ================= Opportunity Cards ================= */}
        <View style={styles.cardsList}>
          {filteredOpportunities.map((opp) => {
            const isBookmarked = !!bookmarkedIds[opp.id];
            const isApplied = !!appliedIds[opp.id];

            return (
              <GlassCard
                key={opp.id}
                style={styles.jobCard}
                borderColor={opp.urgent ? 'rgba(245, 158, 11, 0.45)' : 'rgba(51, 65, 85, 0.65)'}
              >
                {/* Header Row */}
                <View style={styles.cardHeaderRow}>
                  <Image source={{ uri: opp.logo }} style={styles.companyLogo} />

                  <View style={{ flex: 1 }}>
                    <View style={styles.titleBadgeRow}>
                      <Text style={styles.roleTitle} numberOfLines={1}>
                        {opp.title}
                      </Text>
                      {opp.urgent && (
                        <View style={styles.urgentBadge}>
                          <Zap size={10} color="#0B0F17" />
                          <Text style={styles.urgentBadgeText}>URGENT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.companyName}>
                      {opp.productionCompany}
                      {opp.director ? ` • Dir: ${opp.director}` : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleBookmark(opp.id)}
                    style={styles.bookmarkButton}
                  >
                    <Bookmark
                      size={18}
                      color={isBookmarked ? '#F59E0B' : '#64748B'}
                      fill={isBookmarked ? '#F59E0B' : 'none'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Metadata Row: Location, Dates, Budget */}
                <View style={styles.metaRow}>
                  <View style={styles.metaInfoGroup}>
                    <MapPin size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{opp.location}</Text>
                  </View>
                  <View style={styles.metaInfoGroup}>
                    <Calendar size={12} color="#94A3B8" />
                    <Text style={styles.metaText}>{opp.shootDates}</Text>
                  </View>
                </View>

                {/* Compensation Banner */}
                <View style={styles.compensationBanner}>
                  <Text style={styles.compLabel}>BUDGET / COMPENSATION:</Text>
                  <Text style={styles.compValue}>{opp.compensation}</Text>
                </View>

                {/* Requirement Tags */}
                <View style={styles.tagsRow}>
                  {opp.requirements.map((req, idx) => (
                    <View key={idx} style={styles.tagPill}>
                      <Text style={styles.tagPillText}>{req}</Text>
                    </View>
                  ))}
                </View>

                {/* Card Footer: Match Score & Apply Button */}
                <View style={styles.cardFooter}>
                  <View style={styles.matchScoreBadge}>
                    <Sparkles size={12} color="#F59E0B" />
                    <Text style={styles.matchScoreText}>{opp.matchScore}% Match</Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleApply(opp)}
                    disabled={isApplied}
                    style={[
                      styles.applyButton,
                      isApplied && styles.applyButtonSubmitted,
                    ]}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle2 size={13} color="#0B0F17" strokeWidth={2.4} />
                        <Text style={styles.applyButtonText}>Applied</Text>
                      </>
                    ) : (
                      <>
                        <Camera size={13} color="#0B0F17" strokeWidth={2.4} />
                        <Text style={styles.applyButtonText}>Apply Now</Text>
                      </>
                    )}
                  </TouchableOpacity>
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
  searchSection: {
    paddingHorizontal: 18,
    marginTop: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    paddingHorizontal: 14,
    height: 46,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  filterSection: {
    marginTop: 14,
  },
  chipsScroll: {
    paddingHorizontal: 18,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.8)',
  },
  chipActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  chipTextActive: {
    color: '#0B0F17',
    fontWeight: '900',
  },
  resultsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginTop: 18,
    marginBottom: 12,
  },
  resultsCountText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  cardsList: {
    paddingHorizontal: 18,
    gap: 16,
  },
  jobCard: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  companyLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#0B0F17',
  },
  companyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 2,
  },
  bookmarkButton: {
    padding: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    marginBottom: 8,
  },
  metaInfoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  compensationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginVertical: 8,
  },
  compLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  compValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.7)',
  },
  tagPillText: {
    fontSize: 10,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(51, 65, 85, 0.5)',
    paddingTop: 12,
  },
  matchScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  matchScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  applyButtonSubmitted: {
    backgroundColor: '#10B981',
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0B0F17',
  },
});
