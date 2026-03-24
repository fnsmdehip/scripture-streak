import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import { Card } from '../components/Card';
import { StorageService } from '../services/storage';
import { UserSettings } from '../types';
import { TRANSLATIONS } from '../constants/bible';

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

  const loadSettings = useCallback(async () => {
    const data = await StorageService.getUserSettings();
    setSettings(data);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = async <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await StorageService.saveUserSettings(updated);
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
            const defaultSettings: UserSettings = {
              notificationTime: '08:00',
              preferredTranslation: 'NIV',
              streakReminders: true,
              dailyGoalVerses: 1,
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

  if (!settings) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.md }]}
    >
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your reading experience</Text>

      <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
      <Card style={styles.sectionCard}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Streak Reminders</Text>
            <Text style={styles.settingDescription}>
              Get a daily reminder to keep your streak alive
            </Text>
          </View>
          <Switch
            value={settings.streakReminders}
            onValueChange={(val) => updateSetting('streakReminders', val)}
            trackColor={{ false: Colors.border, true: Colors.accentLight }}
            thumbColor={settings.streakReminders ? Colors.primary : Colors.textMuted}
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
            <Text style={styles.chevron}>{showTimePicker ? '\u2303' : '\u2304'}</Text>
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
            <Text style={styles.chevron}>{showTranslationPicker ? '\u2303' : '\u2304'}</Text>
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

      <Text style={styles.sectionHeader}>DATA</Text>
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

      <View style={styles.footer}>
        <Text style={styles.footerText}>Scripture Streak v1.0.0</Text>
        <Text style={styles.footerText}>Made with love for daily devotion</Text>
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
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
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
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  settingValueText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 14,
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
  },
  pickerItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pickerItemText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  pickerItemTextActive: {
    color: Colors.surface,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 20,
  },
  counterValue: {
    ...Typography.h3,
    minWidth: 24,
    textAlign: 'center',
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
});
