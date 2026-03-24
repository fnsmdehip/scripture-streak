import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '../constants/theme';

interface StreakBadgeProps {
  count: number;
  size?: 'small' | 'large';
}

export function StreakBadge({ count, size = 'small' }: StreakBadgeProps) {
  const isLarge = size === 'large';

  return (
    <View style={[styles.container, isLarge && styles.containerLarge]}>
      <Text style={[styles.flame, isLarge && styles.flameLarge]}>
        {count > 0 ? '\uD83D\uDD25' : '\u2B50'}
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
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minWidth: 72,
  },
  containerLarge: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    minWidth: 120,
  },
  flame: {
    fontSize: 20,
  },
  flameLarge: {
    fontSize: 40,
  },
  count: {
    ...Typography.h3,
    color: Colors.primary,
    marginTop: 2,
  },
  countLarge: {
    ...Typography.stat,
    marginTop: Spacing.xs,
  },
  label: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.primaryLight,
  },
  labelLarge: {
    fontSize: 12,
  },
});
