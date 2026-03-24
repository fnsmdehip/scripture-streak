import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface StreakBadgeProps {
  count: number;
  size?: 'small' | 'large';
}

export function StreakBadge({ count, size = 'small' }: StreakBadgeProps) {
  const isLarge = size === 'large';

  const getEmoji = () => {
    if (count >= 30) return '\uD83D\uDD25';
    if (count >= 7) return '\u2B50';
    if (count > 0) return '\uD83C\uDF31';
    return '\uD83C\uDF3F';
  };

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Text style={[styles.flame, isLarge && styles.flameLarge]}>
        {getEmoji()}
      </Text>
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
  flame: {
    fontSize: 18,
  },
  flameLarge: {
    fontSize: 36,
  },
  count: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.gold,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
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
