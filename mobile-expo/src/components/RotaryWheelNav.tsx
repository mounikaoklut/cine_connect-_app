import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Compass,
  FileText,
  Layers,
  User,
  Settings,
  LucideIcon,
  ChevronLeft,
  ChevronRight,
  Disc3,
} from 'lucide-react-native';
import { ScreenKey } from '../types';

export interface PairedNavItem {
  key: ScreenKey;
  label: string;
  partnerLabel: string;
  tagline: string;
  icon: LucideIcon;
  pairIndex: number; // 0, 1, 2
  isPrimary: boolean;
  baseAngle: number; // in degrees
}

// 3 Paired Stages (6 destinations):
// Pair 0: Home (apex) + Opportunities (partner)
// Pair 1: My Applications (apex) + Portfolio (partner)
// Pair 2: Profile (apex) + Settings (partner)
export const PAIRED_NAV_ITEMS: PairedNavItem[] = [
  {
    key: 'Home',
    label: 'Home Feed',
    partnerLabel: 'Studio Feed',
    tagline: 'Production Announcements & Pitches',
    icon: Home,
    pairIndex: 0,
    isPrimary: true,
    baseAngle: -90, // Top apex (12 o'clock)
  },
  {
    key: 'Opportunities',
    label: 'Opportunities',
    partnerLabel: 'Castings & Gigs',
    tagline: 'Directing, Camera & Crew Gigs',
    icon: Compass,
    pairIndex: 0,
    isPrimary: false,
    baseAngle: -45, // Companion on upper arc
  },
  {
    key: 'Applications',
    label: 'My Applications',
    partnerLabel: 'Pipeline Status',
    tagline: 'Track Submissions & Recruiter Calls',
    icon: FileText,
    pairIndex: 1,
    isPrimary: true,
    baseAngle: 30, // 120 deg from Home
  },
  {
    key: 'Portfolio',
    label: 'Portfolio Vault',
    partnerLabel: 'Reels & Decks',
    tagline: '4K Showreels & Verified Pitch Decks',
    icon: Layers,
    pairIndex: 1,
    isPrimary: false,
    baseAngle: 75,
  },
  {
    key: 'Profile',
    label: 'Creator Profile',
    partnerLabel: 'Credits & ID',
    tagline: 'Union Badges & Film Equipment',
    icon: User,
    pairIndex: 2,
    isPrimary: true,
    baseAngle: 150, // 240 deg from Home
  },
  {
    key: 'Settings',
    label: 'Studio Settings',
    partnerLabel: 'Preferences',
    tagline: 'NDA Protection & Account Security',
    icon: Settings,
    pairIndex: 2,
    isPrimary: false,
    baseAngle: 195,
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Geometry Parameters
const WHEEL_DIAMETER = 310;
const WHEEL_RADIUS = WHEEL_DIAMETER / 2;
const ITEM_RADIUS = 118; // Orbit radius
const FOCUSED_ITEM_SIZE = 54;
const COMPANION_ITEM_SIZE = 42;
const DOCK_HEIGHT = 168;
const CENTER_X = WHEEL_RADIUS;
const CENTER_Y = WHEEL_RADIUS;

interface RotaryWheelNavProps {
  activeScreen: ScreenKey;
  onScreenChange: (screen: ScreenKey) => void;
}

export default function RotaryWheelNav({
  activeScreen,
  onScreenChange,
}: RotaryWheelNavProps) {
  const insets = useSafeAreaInsets();
  const activeItem = PAIRED_NAV_ITEMS.find((item) => item.key === activeScreen) || PAIRED_NAV_ITEMS[0];

  // Target angle that centers the active item at -90 deg (apex)
  // When item i with baseAngle is at -90: baseAngle + wheelAngle = -90 => wheelAngle = -90 - baseAngle
  const getAngleForScreen = (screen: ScreenKey) => {
    const item = PAIRED_NAV_ITEMS.find((it) => it.key === screen);
    if (!item) return 0;
    return -90 - item.baseAngle;
  };

  const wheelAngle = useSharedValue(getAngleForScreen(activeScreen));
  const isDragging = useSharedValue(false);
  const startDragAngle = useSharedValue(0);
  const startTouchX = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Graceful fallback
    }
  }, []);

  const handleScreenChangeInternal = useCallback(
    (screen: ScreenKey) => {
      if (screen !== activeScreen) {
        onScreenChange(screen);
        triggerHaptic();
      }
    },
    [activeScreen, onScreenChange, triggerHaptic]
  );

  // Sync angle if activeScreen changes from screen body navigation
  useEffect(() => {
    const targetAngle = getAngleForScreen(activeScreen);
    if (Math.abs(wheelAngle.value - targetAngle) > 1) {
      wheelAngle.value = withSpring(targetAngle, {
        damping: 18,
        stiffness: 140,
        mass: 0.85,
      });
    }
  }, [activeScreen, wheelAngle]);

  // Rotate directly to an item
  const rotateToItem = useCallback(
    (targetKey: ScreenKey) => {
      const targetAngle = getAngleForScreen(targetKey);
      wheelAngle.value = withSpring(
        targetAngle,
        {
          damping: 18,
          stiffness: 140,
          mass: 0.85,
        },
        () => {
          runOnJS(handleScreenChangeInternal)(targetKey);
        }
      );
    },
    [handleScreenChangeInternal, wheelAngle]
  );

  // Step between the 3 paired stages (Backward ◀ / Forward ▶)
  const stepPair = useCallback(
    (direction: -1 | 1) => {
      const currentPair = activeItem.pairIndex;
      const nextPair = (currentPair + direction + 3) % 3;
      // Default to primary option in next pair
      const nextItem = PAIRED_NAV_ITEMS.find(
        (it) => it.pairIndex === nextPair && it.isPrimary
      );
      if (nextItem) {
        rotateToItem(nextItem.key);
      }
    },
    [activeItem.pairIndex, rotateToItem]
  );

  // Pan Gesture Handling across dock area
  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      startDragAngle.value = wheelAngle.value;
      startTouchX.value = e.x;
    })
    .onUpdate((e) => {
      const deltaX = (e.x - startTouchX.value) * 0.48;
      wheelAngle.value = startDragAngle.value + deltaX;
    })
    .onEnd((e) => {
      isDragging.value = false;
      const velocityDelta = e.velocityX * 0.08;
      const endAngle = wheelAngle.value + velocityDelta;

      // Find the closest valid item base angle
      let closestItem = PAIRED_NAV_ITEMS[0];
      let minDiff = 9999;

      PAIRED_NAV_ITEMS.forEach((it) => {
        const itemTargetAngle = -90 - it.baseAngle;
        let diff = (endAngle - itemTargetAngle) % 360;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        if (Math.abs(diff) < minDiff) {
          minDiff = Math.abs(diff);
          closestItem = it;
        }
      });

      const snappedTargetAngle = -90 - closestItem.baseAngle;
      wheelAngle.value = withSpring(
        snappedTargetAngle,
        {
          damping: 18,
          stiffness: 135,
          mass: 0.85,
        },
        () => {
          runOnJS(handleScreenChangeInternal)(closestItem.key);
        }
      );
    });

  const wheelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${wheelAngle.value}deg` }],
    };
  });

  return (
    <View
      style={[
        styles.dockContainer,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: DOCK_HEIGHT + (insets.bottom > 0 ? insets.bottom : 8),
        },
      ]}
      pointerEvents="box-none"
    >
      {/* ================= 1. DOCK OVERLAY & CONCENTRIC ORBITAL ARCS ================= */}
      <View style={styles.dockBackdrop} pointerEvents="none">
        {/* Subtle radial dark amber halo gradient fading upward */}
        <View style={styles.haloGlowBackdrop} />

        {/* Concentric Orbital Rings */}
        <View style={styles.orbitalRingOuter} />
        <View style={styles.orbitalRingMid} />

        {/* Top Rim Amber Glowing Accent Line */}
        <View style={styles.topRimGlowLine} />
      </View>

      {/* ================= 2. QUICK ACTION CONTROLS ROW ================= */}
      <View style={styles.quickControlsRow} pointerEvents="box-none">
        {/* Left Arrow Button: ◀ Rotate */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => stepPair(-1)}
          style={styles.stepButton}
        >
          <ChevronLeft size={14} color="#F59E0B" strokeWidth={2.5} />
          <Text style={styles.stepButtonText}>Rotate</Text>
        </TouchableOpacity>

        {/* Central Instruction: ● DRAG OR SWIPE WHEEL */}
        <View style={styles.centralInstructionBadge}>
          <View style={styles.amberDotPulse} />
          <Text style={styles.centralInstructionText}>
            DRAG OR SWIPE WHEEL
          </Text>
        </View>

        {/* Right Arrow Button: Rotate ▶ */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => stepPair(1)}
          style={styles.stepButton}
        >
          <Text style={styles.stepButtonText}>Rotate</Text>
          <ChevronRight size={14} color="#F59E0B" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ================= 3. ROTARY WHEEL DISC WITH GESTURE DETECTOR ================= */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.touchArea}>
          <Animated.View style={[styles.wheelDisk, wheelAnimatedStyle]}>
            {/* Concentric inner mechanical bezel */}
            <View style={styles.wheelInnerBezel} />

            {/* Radial Spoke Ticks at 60 degree detents */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <View
                key={deg}
                style={[
                  styles.spokeTick,
                  {
                    transform: [
                      { rotate: `${deg}deg` },
                      { translateY: -ITEM_RADIUS + 4 },
                    ],
                  },
                ]}
              />
            ))}

            {/* 6 Destinations (Organized in 3 Paired Stages) */}
            {PAIRED_NAV_ITEMS.map((item) => {
              const angleRad = (item.baseAngle * Math.PI) / 180;
              const posX = CENTER_X + ITEM_RADIUS * Math.cos(angleRad) - FOCUSED_ITEM_SIZE / 2;
              const posY = CENTER_Y + ITEM_RADIUS * Math.sin(angleRad) - FOCUSED_ITEM_SIZE / 2;

              return (
                <PairedWheelItem
                  key={item.key}
                  item={item}
                  posX={posX}
                  posY={posY}
                  wheelAngle={wheelAngle}
                  isActive={activeScreen === item.key}
                  onPress={() => rotateToItem(item.key)}
                />
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>

      {/* ================= 4. CENTER BOTTOM THUMB-DIAL / HANDLE NOTCH ================= */}
      <View style={styles.centerThumbDialNotch} pointerEvents="none">
        <View style={styles.thumbDialGripLine} />
        <View style={[styles.thumbDialGripLine, { width: 14 }]} />
      </View>

      {/* ================= 5. ACTIVE APEX PILL BADGE LABEL ================= */}
      <View style={styles.activePillBadgeContainer} pointerEvents="none">
        <View style={styles.activePillBadge}>
          <Disc3 size={11} color="#0B0F17" strokeWidth={2.5} />
          <Text style={styles.activePillBadgeTitle}>
            {activeItem.label}
          </Text>
        </View>
        <Text style={styles.activePillBadgeTagline}>
          {activeItem.tagline}
        </Text>
      </View>
    </View>
  );
}

// Subcomponent: Individual Wheel Destination (Focused vs Companion vs Inactive)
interface PairedWheelItemProps {
  item: PairedNavItem;
  posX: number;
  posY: number;
  wheelAngle: Animated.SharedValue<number>;
  isActive: boolean;
  onPress: () => void;
}

function PairedWheelItem({
  item,
  posX,
  posY,
  wheelAngle,
  isActive,
  onPress,
}: PairedWheelItemProps) {
  const IconComponent = item.icon;

  const itemAnimatedStyle = useAnimatedStyle(() => {
    // Current angle in viewport space: (item.baseAngle + wheelAngle.value)
    // Apex is at -90 deg
    let currentAngle = (item.baseAngle + wheelAngle.value) % 360;
    while (currentAngle > 180) currentAngle -= 360;
    while (currentAngle < -180) currentAngle += 360;

    // Angular distance from top apex (-90 deg)
    let distFromApex = currentAngle - (-90);
    while (distFromApex > 180) distFromApex -= 360;
    while (distFromApex < -180) distFromApex += 360;
    const absDist = Math.abs(distFromApex);

    // Scale: 1.25x at apex, 1.0x companion (~45 deg), 0.7x inactive lower disc
    const scale = interpolate(
      absDist,
      [0, 30, 60, 120, 180],
      [1.24, 1.1, 0.95, 0.8, 0.65],
      Extrapolation.CLAMP
    );

    // Opacity: 1.0 at apex, 0.85 companion, 0.2 when rotated down
    const opacity = interpolate(
      absDist,
      [0, 50, 90, 160],
      [1.0, 0.88, 0.45, 0.15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { rotate: `${-wheelAngle.value}deg` }, // Counter-rotation keeps icon upright
        { scale },
      ],
      opacity,
    };
  });

  const glowAnimatedStyle = useAnimatedStyle(() => {
    let currentAngle = (item.baseAngle + wheelAngle.value) % 360;
    while (currentAngle > 180) currentAngle -= 360;
    while (currentAngle < -180) currentAngle += 360;

    let distFromApex = currentAngle - (-90);
    while (distFromApex > 180) distFromApex -= 360;
    while (distFromApex < -180) distFromApex += 360;
    const absDist = Math.abs(distFromApex);

    const glowOpacity = interpolate(
      absDist,
      [0, 25, 55],
      [1, 0.35, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity: glowOpacity,
    };
  });

  return (
    <View style={[styles.itemWrapper, { left: posX, top: posY }]}>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onPress}
        style={styles.itemTouchable}
      >
        <Animated.View style={[styles.itemContent, itemAnimatedStyle]}>
          {/* Ambient Amber Drop Shadow / Glow Halo */}
          <Animated.View style={[styles.amberGlowHalo, glowAnimatedStyle]} />

          {/* Icon Button: Glowing Amber (Focused) vs Semi-Transparent Dark Glass (Companion) */}
          <View
            style={[
              styles.iconCircleBase,
              isActive ? styles.iconCircleFocused : styles.iconCircleCompanion,
            ]}
          >
            <IconComponent
              size={isActive ? 22 : 18}
              color={isActive ? '#0B0F17' : '#E2E8F0'}
              strokeWidth={isActive ? 2.5 : 2.0}
            />
          </View>

          {/* Companion / Secondary Option Text Label on Orbital Arc */}
          {!isActive && (
            <View style={styles.companionLabelContainer}>
              <Text style={styles.companionLabelText} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 99,
    overflow: 'visible',
  },
  dockBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 23, 0.96)', // #0B0F17 dark-mode backdrop
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(245, 158, 11, 0.4)', // Amber border
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 20,
    overflow: 'hidden',
  },
  haloGlowBackdrop: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 70,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 35,
    filter: 'blur(20px)',
  },
  orbitalRingOuter: {
    position: 'absolute',
    top: 15,
    left: '50%',
    marginLeft: -155,
    width: 310,
    height: 310,
    borderRadius: 155,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.18)',
    borderStyle: 'dashed',
  },
  orbitalRingMid: {
    position: 'absolute',
    top: 35,
    left: '50%',
    marginLeft: -125,
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.12)',
  },
  topRimGlowLine: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 2.5,
    backgroundColor: '#F59E0B', // Amber gold
    borderRadius: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
  },
  quickControlsRow: {
    position: 'absolute',
    top: 10,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 105,
  },
  stepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  stepButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.3,
  },
  centralInstructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(11, 15, 23, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amberDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  centralInstructionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  touchArea: {
    width: SCREEN_WIDTH,
    height: DOCK_HEIGHT - 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    marginTop: 34,
  },
  wheelDisk: {
    width: WHEEL_DIAMETER,
    height: WHEEL_DIAMETER,
    borderRadius: WHEEL_RADIUS,
    backgroundColor: 'rgba(15, 23, 42, 0.96)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginTop: -10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  wheelInnerBezel: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    bottom: 24,
    borderRadius: (WHEEL_DIAMETER - 48) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(11, 15, 23, 0.85)',
  },
  spokeTick: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 2,
    height: 8,
    marginLeft: -1,
    marginTop: -4,
    backgroundColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: 1,
  },
  itemWrapper: {
    position: 'absolute',
    width: FOCUSED_ITEM_SIZE,
    height: FOCUSED_ITEM_SIZE,
  },
  itemTouchable: {
    width: FOCUSED_ITEM_SIZE,
    height: FOCUSED_ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    width: FOCUSED_ITEM_SIZE,
    height: FOCUSED_ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amberGlowHalo: {
    position: 'absolute',
    width: FOCUSED_ITEM_SIZE + 16,
    height: FOCUSED_ITEM_SIZE + 16,
    borderRadius: (FOCUSED_ITEM_SIZE + 16) / 2,
    backgroundColor: 'rgba(245, 158, 11, 0.32)',
    borderWidth: 2,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 14,
  },
  iconCircleBase: {
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleFocused: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B', // Glowing Amber
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  iconCircleCompanion: {
    width: COMPANION_ITEM_SIZE,
    height: COMPANION_ITEM_SIZE,
    borderRadius: COMPANION_ITEM_SIZE / 2,
    backgroundColor: 'rgba(30, 41, 59, 0.85)', // Semi-transparent dark gray glass
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  centerThumbDialNotch: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 14,
    width: 44,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(11, 15, 23, 0.95)',
    borderWidth: 1.5,
    borderColor: '#F59E0B', // Amber border
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    zIndex: 102,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  thumbDialGripLine: {
    width: 20,
    height: 1.5,
    backgroundColor: '#F59E0B',
    borderRadius: 1,
  },
  activePillBadgeContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 34,
    alignItems: 'center',
    zIndex: 101,
  },
  activePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  activePillBadgeTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0B0F17',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  activePillBadgeTagline: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
    marginTop: 2,
  },
  companionLabelContainer: {
    marginTop: 4,
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 23, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    maxWidth: 90,
  },
  companionLabelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'center',
  },
});
