import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DailyScreen } from '../screens/DailyScreen';
import { StreaksScreen } from '../screens/StreaksScreen';
import { BibleScreen } from '../screens/BibleScreen';
import { PlansScreen } from '../screens/PlansScreen';
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
      <Text style={[styles.icon, focused && styles.iconActive]}>{emoji}</Text>
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Daily"
        component={DailyScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\u2600\uFE0F'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Streaks"
        component={StreaksScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\uD83D\uDD25'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Bible"
        component={BibleScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\uD83D\uDCD6'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Plans"
        component={PlansScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji={'\uD83D\uDCCB'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
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
    backgroundColor: Colors.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: Colors.tabBarBorder,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    height: Platform.OS === 'ios' ? 88 : 72,
    elevation: 0,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  iconContainer: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.accentMuted,
  },
  icon: {
    fontSize: 20,
  },
  iconActive: {
    fontSize: 22,
  },
});
