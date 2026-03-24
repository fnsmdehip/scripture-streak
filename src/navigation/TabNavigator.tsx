import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DailyScreen } from '../screens/DailyScreen';
import { StreaksScreen } from '../screens/StreaksScreen';
import { BibleScreen } from '../screens/BibleScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { Colors, Typography } from '../constants/theme';
import { RootTabParamList } from '../types';

const Tab = createBottomTabNavigator<RootTabParamList>();

interface TabIconProps {
  emoji: string;
  focused: boolean;
}

function TabIcon({ emoji, focused }: TabIconProps) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={styles.icon}>{emoji}</Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          ...Typography.h3,
          color: Colors.textPrimary,
        },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Daily"
        component={DailyScreen}
        options={{
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\u2600\uFE0F'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Streaks"
        component={StreaksScreen}
        options={{
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\uD83D\uDD25'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Bible"
        component={BibleScreen}
        options={{
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\uD83D\uDCD6'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: '',
          headerTransparent: true,
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\u2699\uFE0F'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
    paddingBottom: 4,
    height: 88,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.accentLight,
  },
  icon: {
    fontSize: 20,
  },
});
