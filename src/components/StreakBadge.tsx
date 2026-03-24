import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface StreakBadgeProps {
  count: number;
  size?: 'small' | 'large';
}

export function StreakBadge({ count, size = 'small' }: StreakBadgeProps) {
  const isLarge = size === 'large';

  const getIconName = (): string => {
    if (count >= 30) return 'flame';
    if (count >= 7) return 'star';
    if (count > 0) return 'leaf';
    return 'leaf-outline';
  };

  const getIconColor = (): string => {
    if (count >= 30) return Colors.streakFire;
    if (count >= 7) return Colors.gold;
    return Colors.success;
  };

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Ionicons
        name={getIconName() as any}
        size={isLarge ? 36 : 18}
        color={getIconColor()}
      />
      <Text style={[styles.count, isLarge && styles.countLarge]}>
        {count}
      </Text>
      <Text style={[styles.label, isLarge && styles.labelLarge]}>
        {count === 1 ? 'day' : 'days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentMuted,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minWidth: 72,
    borderWidth: 1,
    borderColor: Colors.goldMuted,
  },
  containerLarge: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    minWidth: 120,
  },
  count: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gold,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
    fontVariant: ['tabular-nums'],
  },
  countLarge: {
    fontSize: 36,
    marginTop: Spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelLarge: {
    fontSize: 12,
  },
});
