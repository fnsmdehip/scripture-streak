import { ReadingPlan } from '../types';

export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'genesis-30',
    title: 'Journey Through Genesis',
    description: 'Read through the book of beginnings in 30 days. Discover creation, the patriarchs, and God\'s promises.',
    book: 'Genesis',
    totalChapters: 50,
    durationDays: 30,
    icon: '\uD83C\uDF0D',
  },
  {
    id: 'psalms-30',
    title: 'Psalms of Praise',
    description: 'Immerse yourself in 30 days of Psalms. Find comfort, praise, and wisdom in Israel\'s songbook.',
    book: 'Psalms',
    totalChapters: 150,
    durationDays: 30,
    icon: '\uD83C\uDFB5',
  },
  {
    id: 'proverbs-31',
    title: 'Wisdom for Every Day',
    description: 'One chapter of Proverbs each day. Practical wisdom for daily living.',
    book: 'Proverbs',
    totalChapters: 31,
    durationDays: 31,
    icon: '\uD83D\uDCA1',
  },
  {
    id: 'john-21',
    title: 'The Gospel of John',
    description: 'Walk with Jesus through the beloved Gospel. One chapter a day for 21 days.',
    book: 'John',
    totalChapters: 21,
    durationDays: 21,
    icon: '\u2728',
  },
  {
    id: 'romans-16',
    title: 'Romans Deep Dive',
    description: 'Explore the foundations of faith. One chapter a day through Paul\'s masterwork.',
    book: 'Romans',
    totalChapters: 16,
    durationDays: 16,
    icon: '\uD83D\uDCDC',
  },
  {
    id: 'matthew-28',
    title: 'Walk with Matthew',
    description: 'Follow the life of Christ from birth to resurrection through Matthew\'s account.',
    book: 'Matthew',
    totalChapters: 28,
    durationDays: 28,
    icon: '\u2B50',
  },
];

export const ENCOURAGING_MESSAGES = [
  'Every verse plants a seed of faith.',
  'Your daily devotion makes a difference.',
  'God meets you in the pages of Scripture.',
  'Consistency builds spiritual strength.',
  'Each day in the Word is a step closer to wisdom.',
  'Your faithfulness inspires others.',
  'The Word is a lamp unto your feet.',
  'Keep going \u2014 your streak matters to your growth.',
];

export const EMPTY_STATE_MESSAGES = {
  noBookmarks: {
    title: 'No Bookmarks Yet',
    message: 'Save verses that speak to your heart. Tap the bookmark icon on any verse to save it here.',
    icon: '\uD83D\uDD16',
  },
  noStreak: {
    title: 'Start Your Journey',
    message: 'Read today\'s verse and mark it as read to begin building your streak.',
    icon: '\uD83C\uDF31',
  },
  noPlans: {
    title: 'Choose a Reading Plan',
    message: 'Start a guided journey through Scripture. Pick a plan that speaks to you.',
    icon: '\uD83D\uDCDA',
  },
  noPlanProgress: {
    title: 'Ready to Begin',
    message: 'Tap "Start Plan" to begin your reading journey. One chapter at a time.',
    icon: '\uD83D\uDE80',
  },
};
