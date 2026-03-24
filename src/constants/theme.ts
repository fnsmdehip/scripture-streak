import { TextStyle } from 'react-native';

export const Colors = {
  background: '#FFFBF5',
  surface: '#FFFFFF',
  primary: '#8B5E34',
  primaryLight: '#A67B5B',
  accent: '#D4A574',
  accentLight: '#E8CDB0',
  success: '#6B8E23',
  successLight: '#8FB33A',
  error: '#C44536',
  textPrimary: '#2D1810',
  textSecondary: '#8B7355',
  textMuted: '#B5A08A',
  border: '#E8DDD0',
  borderLight: '#F0E8DC',
  shadow: '#2D181020',
  overlay: '#2D181080',
  streakGold: '#DAA520',
  streakFire: '#E8730E',
  calendarActive: '#6B8E23',
  calendarInactive: '#F0E8DC',
  calendarToday: '#D4A574',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Typography: Record<string, TextStyle> = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  verseText: {
    fontSize: 20,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 32,
    fontStyle: 'italic',
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  stat: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
};

export const Shadows = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  elevated: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
};
