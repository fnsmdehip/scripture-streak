import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { UserSettings } from '../types';
import { TRANSLATIONS } from '../constants/bible';
import { NotificationService } from '../services/notifications';

const PRIVACY_URL = 'https://printmaxx.com/privacy';
const TERMS_URL = 'https://printmaxx.com/tos';
const SUPPORT_URL = 'https://printmaxx.com/apps/scripture-streak/support';

const NOTIFICATION_TIMES = [
  { label: '6:00 AM', value: '06:00' },
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '8:00 PM', value: '20:00' },
  { label: '9:00 PM', value: '21:00' },
];

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTranslationPicker, setShowTranslationPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    const data = await StorageService.getUserSettings();
    setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await StorageService.saveUserSettings(updated);

    // Reschedule notification when time changes
    if (key === 'notificationTime' && updated.streakReminders) {
      await NotificationService.scheduleDailyReminder(updated.notificationTime);
    }
  };

  const handleToggle = async (key: 'streakReminders' | 'isPremium', value: boolean) => {
    if (!settings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await StorageService.saveUserSettings(updated);

    // Schedule or cancel notifications based on toggle
    if (key === 'streakReminders') {
      if (value) {
        await NotificationService.scheduleDailyReminder(updated.notificationTime);
      } else {
        await NotificationService.cancelAllScheduled();
      }
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase all your streak data, bookmarks, and reading progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await StorageService.resetAllData();
            const defaultSettings: UserSettings = {
              notificationTime: '08:00',
              preferredTranslation: 'NIV',
              streakReminders: true,
              dailyGoalVerses: 1,
              isPremium: false,
            };
            setSettings(defaultSettings);
            await StorageService.saveUserSettings(defaultSettings);
            Alert.alert('Done', 'All data has been reset.');
          },
        },
      ]
    );
  };

  const getTimeLabel = (value: string): string => {
    const match = NOTIFICATION_TIMES.find((t) => t.value === value);
    return match ? match.label : value;
  };

  if (loading || !settings) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + Spacing.md }]}>
        <View style={styles.content}>
          <View style={styles.skeletonLine} />
          <View style={[styles.skeletonLine, { width: '50%' }]} />
          <View style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your experience</Text>

      {/* Subscription */}
      <Text style={styles.sectionHeader}>SUBSCRIPTION</Text>
      <Card style={styles.sectionCard}>
        <View style={styles.subscriptionRow}>
          <View style={styles.subscriptionInfo}>
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionBadgeText}>
                {settings.isPremium ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>
            <Text style={styles.subscriptionDesc}>
              {settings.isPremium
                ? 'You have full access to all features'
                : 'Upgrade for full Bible, unlimited bookmarks, and reading plans'}
            </Text>
          </View>
        </View>
        {!settings.isPremium && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  'Upgrade to Premium',
                  'Premium includes full Bible access, unlimited bookmarks, reading plans, and more for $19.99/year.',
                  [
                    { text: 'Maybe Later', style: 'cancel' },
                    {
                      text: 'Upgrade',
                      onPress: () => handleToggle('isPremium', true),
                    },
                  ]
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={20} color={Colors.gold} style={{ marginRight: Spacing.sm }} />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              <Text style={styles.upgradePrice}>$19.99/yr</Text>
            </TouchableOpacity>
          </>
        )}
        {settings.isPremium && (
          <>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                Alert.alert(
                  'Manage Subscription',
                  'To manage your subscription, visit your device settings.',
                  [{ text: 'OK' }]
                );
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Manage Subscription</Text>
                <Text style={styles.settingDescription}>
                  Change plan or cancel
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                Alert.alert('Restore Purchases', 'Checking for previous purchases...');
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Restore Purchases</Text>
                <Text style={styles.settingDescription}>
                  Recover a previous subscription
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </Card>

      {/* Notifications */}
      <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
      <Card style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Streak Reminders</Text>
            <Text style={styles.settingDescription}>
              Get a daily reminder to read
            </Text>
          </View>
          <Switch
            value={settings.streakReminders}
            onValueChange={(val) => handleToggle('streakReminders', val)}
            trackColor={{ false: Colors.border, true: Colors.goldLight }}
            thumbColor={settings.streakReminders ? Colors.gold : Colors.textMuted}
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowTimePicker(!showTimePicker)}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Reminder Time</Text>
            <Text style={styles.settingDescription}>
              When to receive your daily reminder
            </Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>
              {getTimeLabel(settings.notificationTime)}
            </Text>
            <Ionicons name={showTimePicker ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>

        {showTimePicker && (
          <View style={styles.pickerContainer}>
            {NOTIFICATION_TIMES.map((time) => (
              <TouchableOpacity
                key={time.value}
                style={[
                  styles.pickerItem,
                  settings.notificationTime === time.value && styles.pickerItemActive,
                ]}
                onPress={() => {
                  updateSetting('notificationTime', time.value);
                  setShowTimePicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    settings.notificationTime === time.value && styles.pickerItemTextActive,
                  ]}
                >
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>

      {/* Reading Preferences */}
      <Text style={styles.sectionHeader}>READING PREFERENCES</Text>
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setShowTranslationPicker(!showTranslationPicker)}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Preferred Translation</Text>
            <Text style={styles.settingDescription}>
              Your default Bible translation
            </Text>
          </View>
          <View style={styles.settingValue}>
            <Text style={styles.settingValueText}>
              {settings.preferredTranslation}
            </Text>
            <Ionicons name={showTranslationPicker ? 'chevron-up' : 'chevron-down'} size={14} color={Colors.textMuted} />
          </View>
        </TouchableOpacity>

        {showTranslationPicker && (
          <View style={styles.pickerContainer}>
            {TRANSLATIONS.map((trans) => (
              <TouchableOpacity
                key={trans}
                style={[
                  styles.pickerItem,
                  settings.preferredTranslation === trans && styles.pickerItemActive,
                ]}
                onPress={() => {
                  updateSetting('preferredTranslation', trans);
                  setShowTranslationPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    settings.preferredTranslation === trans && styles.pickerItemTextActive,
                  ]}
                >
                  {trans}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Goal</Text>
            <Text style={styles.settingDescription}>
              Verses to read each day
            </Text>
          </View>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                if (settings.dailyGoalVerses > 1) {
                  updateSetting('dailyGoalVerses', settings.dailyGoalVerses - 1);
                }
              }}
            >
              <Text style={styles.counterButtonText}>{'\u2212'}</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>{settings.dailyGoalVerses}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => {
                if (settings.dailyGoalVerses < 10) {
                  updateSetting('dailyGoalVerses', settings.dailyGoalVerses + 1);
                }
              }}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>

      {/* Data & Privacy */}
      <Text style={styles.sectionHeader}>DATA & PRIVACY</Text>
      <Card style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={handleResetData}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, { color: Colors.error }]}>
              Reset All Data
            </Text>
            <Text style={styles.settingDescription}>
              Erase streaks, bookmarks, and progress
            </Text>
          </View>
        </TouchableOpacity>
      </Card>

      {/* About */}
      <Text style={styles.sectionHeader}>ABOUT</Text>
      <Card style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.settingRow}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Rate the App</Text>
            <Text style={styles.settingDescription}>
              Leave a review on the App Store
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Linking.openURL(PRIVACY_URL)}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Linking.openURL(TERMS_URL)}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => Linking.openURL(SUPPORT_URL)}
          activeOpacity={0.7}
        >
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Support</Text>
            <Text style={styles.settingDescription}>
              Get help or send feedback
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Scripture Streak v1.0.0</Text>
        <Text style={styles.footerText}>Build your daily Scripture habit</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
    fontWeight: '300',
    lineHeight: 24,
  },
  sectionHeader: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    marginTop: 24,
    paddingLeft: Spacing.xs,
    color: Colors.textMuted,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    minHeight: 56,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.bodySmall,
    fontSize: 13,
    fontWeight: '300',
    lineHeight: 24,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  settingValueText: {
    ...Typography.body,
    color: Colors.gold,
    fontWeight: '600',
  },
  versionText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: Spacing.md,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    paddingTop: 0,
    gap: Spacing.sm,
  },
  pickerItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 36,
    justifyContent: 'center',
  },
  pickerItemActive: {
    backgroundColor: Colors.gold,
    borderColor: Colors.gold,
  },
  pickerItemText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  pickerItemTextActive: {
    color: Colors.navy,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.navy,
    lineHeight: 20,
  },
  counterValue: {
    ...Typography.h3,
    minWidth: 24,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  // Subscription
  subscriptionRow: {
    padding: Spacing.md,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionBadge: {
    backgroundColor: Colors.gold,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  subscriptionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.navy,
    letterSpacing: 1,
  },
  subscriptionDesc: {
    ...Typography.bodySmall,
    lineHeight: 24,
    fontWeight: '300',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.accentMuted,
    minHeight: 56,
  },
  upgradeButtonText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gold,
    flex: 1,
  },
  upgradePrice: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.gold,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  footerText: {
    ...Typography.bodySmall,
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  // Skeleton
  skeletonLine: {
    height: 20,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    width: '60%',
  },
  skeletonCard: {
    height: 120,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
});
