import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Compass,
  MessageSquare,
  Bell,
  User,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react-native';
import { ScreenKey } from '../../types';

export interface NavRouteItem {
  key: ScreenKey;
  label: string;
  subtitle: string;
  icon: LucideIcon;
}

export interface NavSet {
  id: number;
  label: string;
  primary: { key: ScreenKey; label: string; icon: LucideIcon };
  companion: { key: ScreenKey; label: string; icon: LucideIcon };
}

export const NAVIGATION_ITEMS: NavRouteItem[] = [
  { key: 'Home', label: 'Home', subtitle: 'Studio Feed', icon: Home },
  { key: 'Opportunities', label: 'Opportunities', subtitle: 'Auditions & Roles', icon: Compass },
  { key: 'Messages', label: 'Messages', subtitle: 'Production DMs', icon: MessageSquare },
  { key: 'Applications', label: 'Applications', subtitle: 'Applied Castings', icon: FileText },
  { key: 'Notifications', label: 'Notifications', subtitle: 'Callbacks & Match', icon: Bell },
  { key: 'Profile', label: 'Profile', subtitle: 'Showreels & Bio', icon: User },
  { key: 'Portfolio', label: 'Portfolio', subtitle: 'Media Vault', icon: Compass },
  { key: 'Settings', label: 'Settings', subtitle: 'App & Security', icon: Settings },
];

export const NAVIGATION_SETS: NavSet[] = [
  {
    id: 0,
    label: 'Set A',
    primary: { key: 'Home', label: 'Home', icon: Home },
    companion: { key: 'Opportunities', label: 'Opportunities', icon: Compass },
  },
  {
    id: 1,
    label: 'Set B',
    primary: { key: 'Messages', label: 'Messages', icon: MessageSquare },
    companion: { key: 'Notifications', label: 'Notifications', icon: Bell },
  },
  {
    id: 2,
    label: 'Set C',
    primary: { key: 'Profile', label: 'Profile', icon: User },
    companion: { key: 'Settings', label: 'Settings', icon: Settings },
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOCK_HEIGHT = 104;
const ACTIVE_BUTTON_SIZE = 48;

export interface CurvedDualWheelNavProps {
  activeRoute: ScreenKey;
  onRouteSelect: (route: ScreenKey) => void;
}

export default function CurvedDualWheelNav({
  activeRoute,
  onRouteSelect,
}: CurvedDualWheelNavProps) {
  const insets = useSafeAreaInsets();

  const getIndexForRoute = (route: ScreenKey): number => {
    const found = NAVIGATION_ITEMS.findIndex((item) => item.key === route);
    return found !== -1 ? found : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(() => getIndexForRoute(activeRoute));

  useEffect(() => {
    const idx = getIndexForRoute(activeRoute);
    if (idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [activeRoute]);

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptic fallback
    }
  }, []);

  const goToIndex = useCallback(
    (newIndex: number) => {
      let normalized = ((newIndex % NAVIGATION_ITEMS.length) + NAVIGATION_ITEMS.length) % NAVIGATION_ITEMS.length;
      setCurrentIndex(normalized);
      triggerHaptic();
      const target = NAVIGATION_ITEMS[normalized];
      if (activeRoute !== target.key) {
        onRouteSelect(target.key);
      }
    },
    [activeRoute, onRouteSelect, triggerHaptic]
  );

  const handleNext = () => goToIndex(currentIndex + 1);
  const handlePrev = () => goToIndex(currentIndex - 1);

  // Pan gesture for horizontal swipe 1-by-1
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -30 || e.velocityX < -300) {
        runOnJS(handleNext)();
      } else if (e.translationX > 30 || e.velocityX > 300) {
        runOnJS(handlePrev)();
      }
    });

  const currentItem = NAVIGATION_ITEMS[currentIndex] || NAVIGATION_ITEMS[0];
  const itemWidth = SCREEN_WIDTH / NAVIGATION_ITEMS.length;

  return (
    <View
      style={[
        styles.dockWrapper,
        {
          height: DOCK_HEIGHT + (insets.bottom > 0 ? insets.bottom : 8),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
      ]}
      pointerEvents="box-none"
    >
      {/* Transparent Curved Backdrop */}
      <View
        style={[
          styles.transparentCurvedBackdrop,
          Platform.OS === 'web'
            ? ({ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' } as any)
            : null,
        ]}
        pointerEvents="none"
      >
        <View style={styles.topCurvedRim} />
      </View>

      {/* 1-by-1 Interactive Navigation Dock */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.interactiveArea}>
          {/* All 8 Destinations Arrayed Along Semi-Circle Arc (Fully Visible) */}
          <View style={styles.arcItemsContainer}>
            {NAVIGATION_ITEMS.map((item, idx) => {
              const isSelected = currentIndex === idx;
              const IconComp = item.icon;

              const ARC_ANGLES = [-65, -46.5, -28, -9.5, 9.5, 28, 46.5, 65];
              const rad = (ARC_ANGLES[idx] * Math.PI) / 180;
              const xOffset = Math.sin(rad) * (SCREEN_WIDTH * 0.39);
              const yOffset = 10 + (1 - Math.cos(rad)) * 36;
              const leftPos = SCREEN_WIDTH / 2 + xOffset - 24;

              return (
                <TouchableOpacity
                  key={`arc-item-${item.key}`}
                  activeOpacity={0.8}
                  onPress={() => goToIndex(idx)}
                  style={[
                    styles.arcItemButton,
                    {
                      left: leftPos,
                      width: 48,
                      top: yOffset,
                    },
                  ]}
                >
                  {/* Glowing Aura for Active Item */}
                  {isSelected && <View style={styles.activeAura} />}

                  {/* Icon Circle */}
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected ? styles.iconCircleActive : styles.iconCircleInactive,
                    ]}
                  >
                    <IconComp
                      size={isSelected ? 19 : 15}
                      color={isSelected ? '#08090C' : '#CBD5E1'}
                      strokeWidth={isSelected ? 2.6 : 2}
                    />
                  </View>

                  {/* Label */}
                  <View
                    style={[
                      styles.labelCapsule,
                      isSelected ? styles.labelCapsuleActive : styles.labelCapsuleInactive,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.labelText,
                        isSelected ? styles.labelTextActive : styles.labelTextInactive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bottom Controls: Prev + Active Pill + 8 Indicator Beads + Next */}
          <View style={styles.bottomControlsRow}>
            {/* Prev Stepper Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handlePrev}
              style={styles.stepperButton}
            >
              <ChevronLeft size={13} color="#CBD5E1" strokeWidth={2.5} />
              <Text style={styles.stepperLabel}>Prev</Text>
            </TouchableOpacity>

            {/* Active Destination Subtitle Pill & Beads */}
            <View style={styles.centerPillAndBeads}>
              <View style={styles.activeTabPill}>
                <Text style={styles.activeTabPillTitle}>{currentItem.label}</Text>
                <Text style={styles.activeTabPillSubtitle}>• {currentItem.subtitle}</Text>
              </View>

              <View style={styles.dotsRow}>
                {NAVIGATION_ITEMS.map((item, idx) => {
                  const isSelected = currentIndex === idx;
                  return (
                    <TouchableOpacity
                      key={`dot-${item.key}`}
                      activeOpacity={0.7}
                      onPress={() => goToIndex(idx)}
                      style={[
                        styles.dotBead,
                        isSelected ? styles.dotBeadActive : styles.dotBeadInactive,
                      ]}
                    />
                  );
                })}
              </View>
            </View>

            {/* Next Stepper Button */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleNext}
              style={styles.stepperButton}
            >
              <Text style={styles.stepperLabel}>Next</Text>
              <ChevronRight size={13} color="#CBD5E1" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 99,
  },
  transparentCurvedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 10, 16, 0.96)',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 152, 0, 0.35)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 16,
  },
  topCurvedRim: {
    position: 'absolute',
    top: 0,
    left: '12%',
    right: '12%',
    height: 2,
    backgroundColor: '#FF9800',
    borderRadius: 1,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 4,
  },
  interactiveArea: {
    width: SCREEN_WIDTH,
    height: DOCK_HEIGHT,
    paddingTop: 4,
    justifyContent: 'space-between',
  },
  arcItemsContainer: {
    position: 'relative',
    height: 72,
    width: '100%',
  },
  arcItemButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeAura: {
    position: 'absolute',
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 152, 0, 0.35)',
  },
  iconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF9800',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircleInactive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(20, 24, 36, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  labelCapsule: {
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  labelCapsuleActive: {
    backgroundColor: '#101219',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  labelCapsuleInactive: {
    backgroundColor: 'transparent',
  },
  labelText: {
    fontSize: 7.5,
  },
  labelTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  labelTextInactive: {
    color: '#858995',
    fontWeight: '600',
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  stepperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stepperLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  centerPillAndBeads: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 152, 0, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeTabPillTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FF9800',
  },
  activeTabPillSubtitle: {
    fontSize: 7,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dotBead: {
    height: 3.5,
    borderRadius: 2,
  },
  dotBeadActive: {
    width: 14,
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 3,
  },
  dotBeadInactive: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
});
