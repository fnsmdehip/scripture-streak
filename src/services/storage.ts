import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StreakData,
  UserSettings,
  BookmarkEntry,
  ReadingProgress,
  OnboardingState,
  ReadingPlanProgress,
} from '../types';

const KEYS = {
  STREAK_DATA: '@ss_streak_data',
  USER_SETTINGS: '@ss_user_settings',
  BOOKMARKS: '@ss_bookmarks',
  READING_PROGRESS: '@ss_reading_progress',
  LAST_VERSE_INDEX: '@ss_last_verse_index',
  ONBOARDING: '@ss_onboarding',
  READING_PLANS: '@ss_reading_plans',
} as const;

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalDaysRead: 0,
  readDates: [],
  lastReadDate: null,
};

const DEFAULT_SETTINGS: UserSettings = {
  notificationTime: '08:00',
  preferredTranslation: 'NIV',
  streakReminders: true,
  dailyGoalVerses: 1,
  isPremium: false,
};

const DEFAULT_PROGRESS: ReadingProgress = {
  currentBook: 'Genesis',
  currentChapter: 1,
  completedBooks: [],
  completedChapters: {},
};

const DEFAULT_ONBOARDING: OnboardingState = {
  completed: false,
  translation: 'NIV',
  dailyGoal: 'verse',
  customGoalCount: 1,
  notificationTime: '08:00',
  notificationsEnabled: true,
};

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getYesterday(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
}

export const StorageService = {
  // Onboarding
  async getOnboardingState(): Promise<OnboardingState> {
    try {
      const json = await AsyncStorage.getItem(KEYS.ONBOARDING);
      if (!json) return { ...DEFAULT_ONBOARDING };
      return JSON.parse(json) as OnboardingState;
    } catch {
      return { ...DEFAULT_ONBOARDING };
    }
  },

  async saveOnboardingState(state: OnboardingState): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING, JSON.stringify(state));
  },

  async completeOnboarding(state: OnboardingState): Promise<void> {
    const completed = { ...state, completed: true };
    await AsyncStorage.setItem(KEYS.ONBOARDING, JSON.stringify(completed));
    const settings: UserSettings = {
      notificationTime: state.notificationTime,
      preferredTranslation: state.translation,
      streakReminders: state.notificationsEnabled,
      dailyGoalVerses: state.dailyGoal === 'custom' ? state.customGoalCount : 1,
      isPremium: false,
    };
    await this.saveUserSettings(settings);
  },

  // Streaks
  async getStreakData(): Promise<StreakData> {
    try {
      const json = await AsyncStorage.getItem(KEYS.STREAK_DATA);
      if (!json) return { ...DEFAULT_STREAK };
      return JSON.parse(json) as StreakData;
    } catch {
      return { ...DEFAULT_STREAK };
    }
  },

  async recordReading(): Promise<StreakData> {
    const data = await this.getStreakData();
    const today = getToday();
    const yesterday = getYesterday();

    if (data.readDates.includes(today)) {
      return data;
    }

    data.readDates.push(today);
    data.totalDaysRead += 1;

    if (data.lastReadDate === yesterday) {
      data.currentStreak += 1;
    } else if (data.lastReadDate !== today) {
      data.currentStreak = 1;
    }

    data.lastReadDate = today;

    if (data.currentStreak > data.longestStreak) {
      data.longestStreak = data.currentStreak;
    }

    await AsyncStorage.setItem(KEYS.STREAK_DATA, JSON.stringify(data));
    return data;
  },

  async hasReadToday(): Promise<boolean> {
    const data = await this.getStreakData();
    return data.readDates.includes(getToday());
  },

  // Settings
  async getUserSettings(): Promise<UserSettings> {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      if (!json) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
  },

  // Bookmarks
  async getBookmarks(): Promise<BookmarkEntry[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.BOOKMARKS);
      if (!json) return [];
      return JSON.parse(json) as BookmarkEntry[];
    } catch {
      return [];
    }
  },

  async addBookmark(entry: BookmarkEntry): Promise<void> {
    const bookmarks = await this.getBookmarks();
    bookmarks.unshift(entry);
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  async removeBookmark(id: string): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter((b) => b.id !== id);
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(filtered));
  },

  // Reading Progress
  async getReadingProgress(): Promise<ReadingProgress> {
    try {
      const json = await AsyncStorage.getItem(KEYS.READING_PROGRESS);
      if (!json) return { ...DEFAULT_PROGRESS };
      return JSON.parse(json) as ReadingProgress;
    } catch {
      return { ...DEFAULT_PROGRESS };
    }
  },

  async saveReadingProgress(progress: ReadingProgress): Promise<void> {
    await AsyncStorage.setItem(KEYS.READING_PROGRESS, JSON.stringify(progress));
  },

  // Verse Index
  async getLastVerseIndex(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(KEYS.LAST_VERSE_INDEX);
      return value ? parseInt(value, 10) : 0;
    } catch {
      return 0;
    }
  },

  async saveLastVerseIndex(index: number): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_VERSE_INDEX, String(index));
  },

  // Reading Plans
  async getReadingPlanProgress(planId: string): Promise<ReadingPlanProgress | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.READING_PLANS);
      if (!json) return null;
      const allPlans = JSON.parse(json) as Record<string, ReadingPlanProgress>;
      return allPlans[planId] || null;
    } catch {
      return null;
    }
  },

  async saveReadingPlanProgress(progress: ReadingPlanProgress): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(KEYS.READING_PLANS);
      const allPlans = json ? JSON.parse(json) : {};
      allPlans[progress.planId] = progress;
      await AsyncStorage.setItem(KEYS.READING_PLANS, JSON.stringify(allPlans));
    } catch {
      const allPlans: Record<string, ReadingPlanProgress> = {};
      allPlans[progress.planId] = progress;
      await AsyncStorage.setItem(KEYS.READING_PLANS, JSON.stringify(allPlans));
    }
  },

  async getAllReadingPlanProgress(): Promise<Record<string, ReadingPlanProgress>> {
    try {
      const json = await AsyncStorage.getItem(KEYS.READING_PLANS);
      if (!json) return {};
      return JSON.parse(json);
    } catch {
      return {};
    }
  },

  // Reset
  async resetAllData(): Promise<void> {
    const keys = Object.values(KEYS);
    await AsyncStorage.multiRemove(keys);
  },
};
