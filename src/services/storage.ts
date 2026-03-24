import AsyncStorage from '@react-native-async-storage/async-storage';
import { StreakData, UserSettings, BookmarkEntry, ReadingProgress } from '../types';

const KEYS = {
  STREAK_DATA: '@scripture_streak_data',
  USER_SETTINGS: '@scripture_user_settings',
  BOOKMARKS: '@scripture_bookmarks',
  READING_PROGRESS: '@scripture_reading_progress',
  LAST_VERSE_INDEX: '@scripture_last_verse_index',
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
};

const DEFAULT_PROGRESS: ReadingProgress = {
  currentBook: 'Genesis',
  currentChapter: 1,
  completedBooks: [],
  completedChapters: {},
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

  async getUserSettings(): Promise<UserSettings> {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER_SETTINGS);
      if (!json) return { ...DEFAULT_SETTINGS };
      return JSON.parse(json) as UserSettings;
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  async saveUserSettings(settings: UserSettings): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_SETTINGS, JSON.stringify(settings));
  },

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
};
