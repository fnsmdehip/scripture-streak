import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography, Shadows } from '../constants/theme';

interface StatCardProps {
  value: number | string;
  label: string;
  iconName: string;
  color?: string;
}

export function StatCard({ value, label, iconName, color }: StatCardProps) {
  return (
    <View style={styles.container}>
      <Ionicons
        name={iconName as any}
        size={22}
        color={color || Colors.gold}
        style={styles.icon}
      />
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
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Shadows.card,
  },
  icon: {
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.navy,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...Typography.statLabel,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
