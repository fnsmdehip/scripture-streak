import { BibleBook, Verse } from '../types';
import { BIBLE_BOOKS } from '../constants/bible';
import { getVerseOfTheDay as getVOTD, formatVerseRef, formatVerseForSharing } from '../data/verses';

export const VerseService = {
  getVerseOfTheDay(): Verse {
    return getVOTD();
  },

  formatReference(verse: Verse): string {
    return formatVerseRef(verse);
  },

  formatForSharing(verse: Verse): string {
    return formatVerseForSharing(verse);
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
        translation: 'KJV',
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
    'Genesis-1-1': 'In the beginning God created the heaven and the earth.',
    'Genesis-1-2': 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
    'Genesis-1-3': 'And God said, Let there be light: and there was light.',
    'Genesis-1-4': 'And God saw the light, that it was good: and God divided the light from the darkness.',
    'Genesis-1-5': 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
    'John-1-1': 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    'John-1-2': 'The same was in the beginning with God.',
    'John-1-3': 'All things were made by him; and without him was not any thing made that was made.',
    'John-3-16': 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
    'Psalms-23-1': 'The LORD is my shepherd; I shall not want.',
    'Psalms-23-2': 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.',
    'Psalms-23-3': 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\'s sake.',
  };

  const key = `${book}-${chapter}-${verse}`;
  if (sampleTexts[key]) {
    return sampleTexts[key];
  }

  return `${book} ${chapter}:${verse} \u2014 Open your Bible to read this verse. Connect with a Bible API for full text.`;
}
