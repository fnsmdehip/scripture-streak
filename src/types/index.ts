export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
}

export interface DailyReading {
  date: string;
  verse: Verse;
  completed: boolean;
  bookmarked: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalDaysRead: number;
  readDates: string[];
  lastReadDate: string | null;
}

export interface ReadingProgress {
  currentBook: string;
  currentChapter: number;
  completedBooks: string[];
  completedChapters: Record<string, number[]>;
}

export interface UserSettings {
  notificationTime: string;
  preferredTranslation: string;
  streakReminders: boolean;
  dailyGoalVerses: number;
}

export interface BibleBook {
  name: string;
  chapters: number;
  testament: 'old' | 'new';
}

export interface BookmarkEntry {
  id: string;
  verse: Verse;
  date: string;
  note?: string;
}

export type RootTabParamList = {
  Daily: undefined;
  Streaks: undefined;
  Bible: undefined;
  Settings: undefined;
};

export type BibleStackParamList = {
  BibleHome: undefined;
  ChapterView: { book: string; chapter: number };
};
