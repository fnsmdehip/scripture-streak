import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../constants/theme';

interface StatCardProps {
  value: number | string;
  label: string;
  icon: string;
  color?: string;
}

export function StatCard({ value, label, icon, color }: StatCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, color ? { color } : null]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.card,
  },
  icon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.stat,
    fontSize: 28,
  },
  label: {
    ...Typography.statLabel,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
