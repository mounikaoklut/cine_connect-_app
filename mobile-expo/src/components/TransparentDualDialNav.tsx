import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
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
  MessageSquare,
  Bell,
  User,
  Settings,
  LucideIcon,
} from 'lucide-react-native';
import { ScreenKey } from '../types';

export interface DialPairItem {
  key: ScreenKey;
  label: string;
  icon: LucideIcon;
}

export interface DialPair {
  id: number;
  name: string;
  primary: DialPairItem;
  companion: DialPairItem;
}

export const DIAL_PAIRS: DialPair[] = [
  {
    id: 0,
    name: 'Home & Opportunities',
    primary: { key: 'Home', label: 'Home', icon: Home },
    companion: { key: 'Opportunities', label: 'Opportunities', icon: Compass },
  },
  {
    id: 1,
    name: 'Messages & Notifications',
    primary: { key: 'Messages', label: 'Messages', icon: MessageSquare },
    companion: { key: 'Notifications', label: 'Notification', icon: Bell },
  },
  {
    id: 2,
    name: 'Profile & Settings',
    primary: { key: 'Profile', label: 'Profile', icon: User },
    companion: { key: 'Settings', label: 'Settings', icon: Settings },
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOCK_HEIGHT = 108;
const BUTTON_SIZE = 52;

export interface TransparentDualDialNavProps {
  activeTab: ScreenKey;
  onTabSelected: (route: ScreenKey) => void;
}

export default function TransparentDualDialNav({
  activeTab,
  onTabSelected,
}: TransparentDualDialNavProps) {
  const insets = useSafeAreaInsets();

  // Determine which pair index corresponds to a route
  const getPairIndexForRoute = (route: ScreenKey): number => {
    const pair = DIAL_PAIRS.find(
      (p) => p.primary.key === route || p.companion.key === route
    );
    return pair ? pair.id : 0;
  };

  const initialPair = getPairIndexForRoute(activeTab);
  const [currentPairIndex, setCurrentPairIndex] = useState(initialPair);

  // Animation shared values for smooth horizontal stage transitions
  const stageOffset = useSharedValue(initialPair);
  const isDragging = useSharedValue(false);
  const startDragOffset = useSharedValue(initialPair);
  const startTouchX = useSharedValue(0);

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptic fallback
    }
  }, []);

  const handleStageChange = useCallback(
    (nextStage: number) => {
      const normalized = Math.max(0, Math.min(2, nextStage));
      setCurrentPairIndex(normalized);
      triggerHaptic();

      // If activeTab is not in the newly visible pair, auto-select the primary item of that pair
      const activePair = DIAL_PAIRS[normalized];
      if (
        activeTab !== activePair.primary.key &&
        activeTab !== activePair.companion.key
      ) {
        onTabSelected(activePair.primary.key);
      }
    },
    [activeTab, onTabSelected, triggerHaptic]
  );

  // Sync if activeTab changes externally
  useEffect(() => {
    const targetPair = getPairIndexForRoute(activeTab);
    if (targetPair !== currentPairIndex) {
      setCurrentPairIndex(targetPair);
      stageOffset.value = withSpring(targetPair, {
        damping: 18,
        stiffness: 140,
        mass: 0.8,
      });
    }
  }, [activeTab, currentPairIndex, stageOffset]);

  // Swipe / Pan gesture handler across the dock
  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      startDragOffset.value = stageOffset.value;
      startTouchX.value = e.x;
    })
    .onUpdate((e) => {
      // Left swipe increases index; right swipe decreases index
      const deltaRatio = (startTouchX.value - e.x) / (SCREEN_WIDTH * 0.42);
      stageOffset.value = startDragOffset.value + deltaRatio;
    })
    .onEnd((e) => {
      isDragging.value = false;
      const velocityOffset = -e.velocityX * 0.0016;
      const rawTarget = stageOffset.value + velocityOffset;
      const targetIndex = Math.max(0, Math.min(2, Math.round(rawTarget)));

      stageOffset.value = withSpring(
        targetIndex,
        {
          damping: 20,
          stiffness: 155,
          mass: 0.85,
        },
        () => {
          runOnJS(handleStageChange)(targetIndex);
        }
      );
    });

  const handleSelectOption = (route: ScreenKey) => {
    triggerHaptic();
    onTabSelected(route);
  };

  const arcSvgWidth = Math.min(SCREEN_WIDTH * 0.84, 340);
  const arcSvgHeight = 36;

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
      {/* ================= 1. Transparent Frosted Glassmorphism Backdrop ================= */}
      <View
        style={[
          styles.frostedBackdrop,
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any) : null,
        ]}
        pointerEvents="none"
      >
        {/* Ambient top amber glow rim */}
        <View style={styles.topRimGlowLine} />
      </View>

      {/* ================= 2. Faint Glowing Curved Vector Arc ================= */}
      <View style={styles.orbitalArcContainer} pointerEvents="none">
        <Svg
          width={arcSvgWidth}
          height={arcSvgHeight}
          viewBox={`0 0 ${arcSvgWidth} ${arcSvgHeight}`}
        >
          <Defs>
            <SvgLinearGradient id="arcLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.05" />
              <Stop offset="30%" stopColor="#F59E0B" stopOpacity="0.45" />
              <Stop offset="50%" stopColor="#FBBF24" stopOpacity="0.75" />
              <Stop offset="70%" stopColor="#F59E0B" stopOpacity="0.45" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0.05" />
            </SvgLinearGradient>
            <SvgLinearGradient id="arcGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="15%" stopColor="#F59E0B" stopOpacity="0.0" />
              <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.25" />
              <Stop offset="85%" stopColor="#F59E0B" stopOpacity="0.0" />
            </SvgLinearGradient>
          </Defs>

          {/* Broad subtle glow stroke */}
          <Path
            d={`M 10,${arcSvgHeight - 4} Q ${arcSvgWidth / 2},4 ${arcSvgWidth - 10},${arcSvgHeight - 4}`}
            fill="none"
            stroke="url(#arcGlowGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Sharp faint glowing curved vector line */}
          <Path
            d={`M 10,${arcSvgHeight - 4} Q ${arcSvgWidth / 2},4 ${arcSvgWidth - 10},${arcSvgHeight - 4}`}
            fill="none"
            stroke="url(#arcLineGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* ================= 3. Gesture Detector for Horizontal Swipe-to-Rotate ================= */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.interactiveArea}>
          {/* Render All 3 Pairs with Animated Opacity & Horizontal Slide */}
          {DIAL_PAIRS.map((pair, index) => {
            return (
              <AnimatedPairStage
                key={pair.id}
                pair={pair}
                stageIndex={index}
                stageOffset={stageOffset}
                activeTab={activeTab}
                onSelectOption={handleSelectOption}
              />
            );
          })}
        </View>
      </GestureDetector>
    </View>
  );
}

// Subcomponent: Animated Pair Stage containing the 2 displayed circular options
interface AnimatedPairStageProps {
  pair: DialPair;
  stageIndex: number;
  stageOffset: Animated.SharedValue<number>;
  activeTab: ScreenKey;
  onSelectOption: (route: ScreenKey) => void;
}

function AnimatedPairStage({
  pair,
  stageIndex,
  stageOffset,
  activeTab,
  onSelectOption,
}: AnimatedPairStageProps) {
  const animatedStageStyle = useAnimatedStyle(() => {
    // Distance from current animated offset
    const dist = stageOffset.value - stageIndex;

    // Horizontal slide translation
    const translateX = dist * -SCREEN_WIDTH * 0.72;

    // Smooth opacity cross-fade
    const opacity = interpolate(
      Math.abs(dist),
      [0, 0.45, 1],
      [1, 0.5, 0],
      Extrapolation.CLAMP
    );

    // Subtle scale transition
    const scale = interpolate(
      Math.abs(dist),
      [0, 0.55, 1],
      [1, 0.92, 0.75],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateX }, { scale }],
      opacity,
      pointerEvents: Math.abs(dist) < 0.55 ? 'auto' : 'none',
    };
  });

  const isPrimaryActive = activeTab === pair.primary.key;
  const isCompanionActive = activeTab === pair.companion.key;

  return (
    <Animated.View style={[styles.pairStageContainer, animatedStageStyle]}>
      {/* Option 1: Primary (Left Position on Curved Arc) */}
      <DialOptionButton
        item={pair.primary}
        isActive={isPrimaryActive}
        onPress={() => onSelectOption(pair.primary.key)}
      />

      {/* Option 2: Companion (Right Position on Curved Arc) */}
      <DialOptionButton
        item={pair.companion}
        isActive={isCompanionActive}
        onPress={() => onSelectOption(pair.companion.key)}
      />
    </Animated.View>
  );
}

// Subcomponent: Individual Circular Button (Active Elevated Amber vs Companion Dark Glass)
interface DialOptionButtonProps {
  item: DialPairItem;
  isActive: boolean;
  onPress: () => void;
}

function DialOptionButton({
  item,
  isActive,
  onPress,
}: DialOptionButtonProps) {
  const IconComponent = item.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.optionButtonTouch}
    >
      <View
        style={[
          styles.buttonCircleBase,
          isActive ? styles.buttonCircleActive : styles.buttonCircleCompanion,
        ]}
      >
        {/* Warm Outer Glow Halo for Active Item */}
        {isActive && <View style={styles.activeGlowRing} />}

        <IconComponent
          size={isActive ? 23 : 20}
          color={isActive ? '#0B0F17' : '#E2E8F0'}
          strokeWidth={isActive ? 2.5 : 2.0}
        />
      </View>

      {/* Small Route Name Pill Badge directly below displaying route name */}
      {isActive ? (
        <View style={styles.activeRouteBadge}>
          <Text style={styles.activeRouteBadgeText}>{item.label}</Text>
        </View>
      ) : (
        <View style={styles.companionRouteBadge}>
          <Text style={styles.companionRouteBadgeText}>{item.label}</Text>
        </View>
      )}
    </TouchableOpacity>
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
  frostedBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 15, 23, 0.70)', // Sleek semi-transparent frosted glassmorphism dock
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.22)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 16,
  },
  topRimGlowLine: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.7)',
    borderRadius: 1,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  orbitalArcContainer: {
    position: 'absolute',
    top: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interactiveArea: {
    width: SCREEN_WIDTH,
    height: DOCK_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairStageContainer: {
    position: 'absolute',
    width: Math.min(SCREEN_WIDTH * 0.76, 320),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginTop: -4,
  },
  optionButtonTouch: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCircleBase: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCircleActive: {
    backgroundColor: '#F59E0B', // Solid amber-gold
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.85,
    shadowRadius: 16,
    elevation: 12,
    transform: [{ translateY: -6 }], // Elevated position
  },
  activeGlowRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 16,
    height: BUTTON_SIZE + 16,
    borderRadius: (BUTTON_SIZE + 16) / 2,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
  },
  buttonCircleCompanion: {
    backgroundColor: 'rgba(22, 27, 34, 0.75)', // Semi-transparent dark glass fill
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.35)', // Subtle white/amber border
  },
  activeRouteBadge: {
    backgroundColor: '#F59E0B', // Pill badge directly below displaying route name
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.55,
    shadowRadius: 5,
    elevation: 4,
  },
  activeRouteBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#0B0F17',
    letterSpacing: 0.3,
  },
  companionRouteBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
  },
  companionRouteBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    letterSpacing: 0.2,
  },
});
