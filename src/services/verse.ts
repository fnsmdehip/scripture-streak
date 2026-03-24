import { BibleBook, Verse } from '../types';
import { DAILY_VERSES, BIBLE_BOOKS } from '../constants/bible';

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export const VerseService = {
  getVerseOfTheDay(): Verse {
    const dayIndex = getDayOfYear() % DAILY_VERSES.length;
    return DAILY_VERSES[dayIndex];
  },

  formatReference(verse: Verse): string {
    return `${verse.book} ${verse.chapter}:${verse.verse}`;
  },

  searchBooks(query: string): BibleBook[] {
    if (!query.trim()) return [...BIBLE_BOOKS];
    const lower = query.toLowerCase();
    return BIBLE_BOOKS.filter((book) =>
      book.name.toLowerCase().includes(lower)
    );
  },

  getChapterVerses(book: string, chapter: number): Verse[] {
    const verseCount = getEstimatedVerseCount(book, chapter);
    const verses: Verse[] = [];
    for (let i = 1; i <= verseCount; i++) {
      verses.push({
        book,
        chapter,
        verse: i,
        text: getSampleVerseText(book, chapter, i),
        translation: 'NIV',
      });
    }
    return verses;
  },

  getBookByName(name: string) {
    return BIBLE_BOOKS.find((b) => b.name === name);
  },
};

function getEstimatedVerseCount(_book: string, _chapter: number): number {
  return 25;
}

function getSampleVerseText(book: string, chapter: number, verse: number): string {
  const sampleTexts: Record<string, string> = {
    'Genesis-1-1': 'In the beginning God created the heavens and the earth.',
    'Genesis-1-2': 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.',
    'Genesis-1-3': 'And God said, "Let there be light," and there was light.',
    'Genesis-1-4': 'God saw that the light was good, and he separated the light from the darkness.',
    'Genesis-1-5': 'God called the light "day," and the darkness he called "night." And there was evening, and there was morning\u2014the first day.',
    'John-1-1': 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    'John-1-2': 'He was with God in the beginning.',
    'John-1-3': 'Through him all things were made; without him nothing was made that has been made.',
    'John-3-16': 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    'Psalms-23-1': 'The Lord is my shepherd, I lack nothing.',
    'Psalms-23-2': 'He makes me lie down in green pastures, he leads me beside quiet waters.',
    'Psalms-23-3': 'He refreshes my soul. He guides me along the right paths for his name\u2019s sake.',
  };

  const key = `${book}-${chapter}-${verse}`;
  if (sampleTexts[key]) {
    return sampleTexts[key];
  }

  return `${book} ${chapter}:${verse} \u2014 Open your Bible to read this verse. Connect with a Bible API for full text.`;
}
