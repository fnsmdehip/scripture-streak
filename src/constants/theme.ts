import { TextStyle, Platform } from 'react-native';

export const Colors = {
  // PrintMaxx Faith App Palette
  background: '#FFFBF5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  navy: '#1A1A2E',
  navyLight: '#2D2D44',
  gold: '#E2B53F',
  goldLight: '#F0D078',
  goldDark: '#C49A2A',
  goldMuted: '#E2B53F30',

  primary: '#1A1A2E',
  primaryLight: '#3D3D5C',
  accent: '#E2B53F',
  accentLight: '#F5E6B8',
  accentMuted: '#E2B53F20',

  success: '#4CAF50',
  successLight: '#E8F5E9',
  error: '#D32F2F',
  errorLight: '#FFEBEE',

  textPrimary: '#1A1A2E',
  textSecondary: '#6B6B80',
  textMuted: '#9E9EB0',
  textOnDark: '#FFFBF5',
  textOnGold: '#1A1A2E',

  border: '#E8E0D4',
  borderLight: '#F0EBE3',
  shadow: '#1A1A2E18',

  overlay: '#1A1A2E80',
  overlayDark: '#1A1A2ECC',

  streakGold: '#E2B53F',
  streakFire: '#FF6B35',
  calendarGold: '#E2B53F',
  calendarActive: '#E2B53F',
  calendarInactive: '#F0EBE3',
  calendarToday: '#1A1A2E',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#F0EBE3',
  tabBarActive: '#E2B53F',
  tabBarInactive: '#9E9EB0',
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
} as const;

export const Typography: Record<string, TextStyle> = {
  heroNumber: {
    fontSize: 64,
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: -2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 24,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  caption: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  verseText: {
    fontSize: 22,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 36,
    fontFamily: 'CrimsonText_400Regular',
  },
  verseTextItalic: {
    fontSize: 22,
    fontWeight: '400',
    color: Colors.textPrimary,
    lineHeight: 36,
    fontStyle: 'italic',
    fontFamily: 'CrimsonText_400Regular_Italic',
  },
  verseRef: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  stat: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.gold,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  button: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  buttonSmall: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textOnDark,
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : undefined,
  },
  onboardingBody: {
    fontSize: 17,
    fontWeight: '400',
    color: '#FFFFFFCC',
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : undefined,
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
    shadowRadius: 16,
    elevation: 6,
  },
  glow: {
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const HIT_SLOP = { top: 10, bottom: 10, left: 10, right: 10 };
export const MIN_TOUCH_SIZE = 44;
