import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { TabNavigator } from './src/navigation/TabNavigator';
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { StorageService } from './src/services/storage';
import { Colors } from './src/constants/theme';
import type { AppScreen } from './src/types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [isReady, setIsReady] = useState(false);

  const checkOnboardingState = useCallback(async () => {
    const onboarding = await StorageService.getOnboardingState();
    if (onboarding.completed) {
      setCurrentScreen('main');
    } else {
      setCurrentScreen('onboarding');
    }
    setIsReady(true);
  }, []);

  const handleSplashFinish = useCallback(() => {
    if (isReady) {
      // State already loaded, show the right screen
      return;
    }
    // If still loading, transition after check
    checkOnboardingState();
  }, [isReady, checkOnboardingState]);

  useEffect(() => {
    // Start loading state immediately
    checkOnboardingState();
  }, [checkOnboardingState]);

  const handleOnboardingComplete = useCallback(() => {
    setCurrentScreen('paywall');
  }, []);

  const handlePaywallContinueFree = useCallback(() => {
    setCurrentScreen('main');
  }, []);

  const handlePaywallSubscribe = useCallback(async () => {
    // In production, this would handle IAP
    const settings = await StorageService.getUserSettings();
    await StorageService.saveUserSettings({ ...settings, isPremium: true });
    setCurrentScreen('main');
  }, []);

  if (currentScreen === 'splash') {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={handleSplashFinish} />
      </>
    );
  }

  if (currentScreen === 'onboarding') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'paywall') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <PaywallScreen
          onContinueFree={handlePaywallContinueFree}
          onSubscribe={handlePaywallSubscribe}
        />
      </SafeAreaProvider>
    );
  }

  // Main app
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
