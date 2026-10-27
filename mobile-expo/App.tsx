import React, { useState, useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CurvedDualWheelNav from './src/components/navigation/CurvedDualWheelNav';
import MobileFeedScreen from './src/screens/MobileFeedScreen';
import OpportunitiesScreen from './src/screens/OpportunitiesScreen';
import MessagesScreen from './src/screens/MessagesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import { ScreenKey } from './src/types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenKey>('Home');

  // Native Android hardware back navigation support
  useEffect(() => {
    const onBackPress = () => {
      if (activeScreen !== 'Home') {
        setActiveScreen('Home');
        return true; // handled
      }
      return false; // let system handle exit
    };

    const backHandlerSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => backHandlerSubscription.remove();
  }, [activeScreen]);

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'Home':
        return (
          <MobileFeedScreen
            activeRoute={activeScreen}
            onRouteChange={setActiveScreen}
            showNavDock={false}
          />
        );
      case 'Opportunities':
        return <OpportunitiesScreen />;
      case 'Messages':
        return <MessagesScreen />;
      case 'Notifications':
        return <NotificationsScreen onNavigate={setActiveScreen} />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Settings':
        return <SettingsScreen />;
      case 'Applications':
        return <ApplicationsScreen />;
      case 'Portfolio':
        return <PortfolioScreen />;
      default:
        return (
          <MobileFeedScreen
            activeRoute={activeScreen}
            onRouteChange={setActiveScreen}
            showNavDock={false}
          />
        );
    }
  };

  return (
    <GestureHandlerRootView style={styles.rootGestureContainer}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
          <StatusBar style="light" backgroundColor="#08090C" />

          {/* Active Screen Viewport */}
          <View style={styles.viewportContainer}>
            {renderActiveScreen()}
          </View>

          {/* Transparent Curved Dual-Option Rotary Bottom Navigation Dock */}
          <CurvedDualWheelNav
            activeRoute={activeScreen}
            onRouteSelect={setActiveScreen}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  rootGestureContainer: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#08090C',
  },
  viewportContainer: {
    flex: 1,
    backgroundColor: '#08090C',
  },
});
