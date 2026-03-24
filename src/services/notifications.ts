// Smart Notification Service
// Schedules daily verse reminders with actual verse text.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getVerseForDay, formatVerseRef } from '../data/verses';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  /**
   * Request notification permissions.
   * Returns true if granted.
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  /**
   * Schedule a daily verse notification at the specified time.
   * @param timeStr Time in "HH:MM" format (e.g., "08:00")
   */
  async scheduleDailyReminder(timeStr: string): Promise<void> {
    if (Platform.OS === 'web') return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Cancel existing scheduled notifications first
    await this.cancelAllScheduled();

    const [hours, minutes] = timeStr.split(':').map(Number);

    // Get tomorrow's verse for the notification
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.getFullYear(), 0, 0);
    const diff = tomorrow.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const verse = getVerseForDay(dayOfYear);
    const ref = formatVerseRef(verse);

    // Truncate verse text for notification preview
    const maxLen = 120;
    const preview = verse.text.length > maxLen
      ? verse.text.substring(0, maxLen).trim() + '...'
      : verse.text;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Today's Verse: ${ref}`,
        body: `"${preview}"`,
        subtitle: 'Scripture Streak',
        data: { type: 'daily_verse', verseRef: ref },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
  },

  /**
   * Send a streak milestone notification.
   */
  async sendMilestoneNotification(days: number, tier: string): Promise<void> {
    if (Platform.OS === 'web') return;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const tierEmoji: Record<string, string> = {
      bronze: '',
      silver: '',
      gold: '',
      diamond: '',
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${tierEmoji[tier] || ''} ${days}-Day Milestone!`,
        body: `You've read Scripture for ${days} days! Your faithfulness is a testimony.`,
        data: { type: 'milestone', days, tier },
        sound: true,
      },
      trigger: null, // immediate
    });
  },

  /**
   * Cancel all scheduled notifications.
   */
  async cancelAllScheduled(): Promise<void> {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Get all pending scheduled notifications (for debugging/settings).
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') return [];
    return Notifications.getAllScheduledNotificationsAsync();
  },
};
