// Real reading plan schedules with actual chapter-by-chapter breakdown.
// Each plan maps day number -> array of chapter references to read that day.

export interface PlanDay {
  day: number;
  chapters: string[]; // e.g. ["Genesis 1", "Genesis 2"]
  verseCount: number; // estimated verse count for the day
  studyNote?: string; // optional study note (for Romans Deep Dive)
}

export interface ReadingPlanSchedule {
  planId: string;
  days: PlanDay[];
}

// ─── Genesis 30 Days: 50 chapters in 30 days ───
const genesis30: PlanDay[] = [
  { day: 1, chapters: ['Genesis 1', 'Genesis 2'], verseCount: 56 },
  { day: 2, chapters: ['Genesis 3', 'Genesis 4'], verseCount: 50 },
  { day: 3, chapters: ['Genesis 5', 'Genesis 6'], verseCount: 54 },
  { day: 4, chapters: ['Genesis 7', 'Genesis 8'], verseCount: 46 },
  { day: 5, chapters: ['Genesis 9', 'Genesis 10'], verseCount: 61 },
  { day: 6, chapters: ['Genesis 11', 'Genesis 12'], verseCount: 52 },
  { day: 7, chapters: ['Genesis 13', 'Genesis 14'], verseCount: 42 },
  { day: 8, chapters: ['Genesis 15', 'Genesis 16'], verseCount: 37 },
  { day: 9, chapters: ['Genesis 17', 'Genesis 18'], verseCount: 60 },
  { day: 10, chapters: ['Genesis 19'], verseCount: 38 },
  { day: 11, chapters: ['Genesis 20', 'Genesis 21'], verseCount: 52 },
  { day: 12, chapters: ['Genesis 22', 'Genesis 23'], verseCount: 39 },
  { day: 13, chapters: ['Genesis 24'], verseCount: 67 },
  { day: 14, chapters: ['Genesis 25', 'Genesis 26'], verseCount: 69 },
  { day: 15, chapters: ['Genesis 27'], verseCount: 46 },
  { day: 16, chapters: ['Genesis 28', 'Genesis 29'], verseCount: 57 },
  { day: 17, chapters: ['Genesis 30', 'Genesis 31'], verseCount: 97 },
  { day: 18, chapters: ['Genesis 32', 'Genesis 33'], verseCount: 52 },
  { day: 19, chapters: ['Genesis 34', 'Genesis 35'], verseCount: 60 },
  { day: 20, chapters: ['Genesis 36', 'Genesis 37'], verseCount: 79 },
  { day: 21, chapters: ['Genesis 38', 'Genesis 39'], verseCount: 53 },
  { day: 22, chapters: ['Genesis 40', 'Genesis 41'], verseCount: 79 },
  { day: 23, chapters: ['Genesis 42', 'Genesis 43'], verseCount: 72 },
  { day: 24, chapters: ['Genesis 44'], verseCount: 34 },
  { day: 25, chapters: ['Genesis 45', 'Genesis 46'], verseCount: 62 },
  { day: 26, chapters: ['Genesis 47'], verseCount: 31 },
  { day: 27, chapters: ['Genesis 48'], verseCount: 22 },
  { day: 28, chapters: ['Genesis 49'], verseCount: 33 },
  { day: 29, chapters: ['Genesis 50'], verseCount: 26 },
  { day: 30, chapters: ['Genesis 1 (Review)'], verseCount: 31 },
];

// ─── Psalms of Praise: 30 curated Psalms ───
const psalms30: PlanDay[] = [
  { day: 1, chapters: ['Psalm 1'], verseCount: 6 },
  { day: 2, chapters: ['Psalm 8'], verseCount: 9 },
  { day: 3, chapters: ['Psalm 16'], verseCount: 11 },
  { day: 4, chapters: ['Psalm 19'], verseCount: 14 },
  { day: 5, chapters: ['Psalm 23'], verseCount: 6 },
  { day: 6, chapters: ['Psalm 24'], verseCount: 10 },
  { day: 7, chapters: ['Psalm 27'], verseCount: 14 },
  { day: 8, chapters: ['Psalm 29'], verseCount: 11 },
  { day: 9, chapters: ['Psalm 33'], verseCount: 22 },
  { day: 10, chapters: ['Psalm 34'], verseCount: 22 },
  { day: 11, chapters: ['Psalm 37'], verseCount: 40 },
  { day: 12, chapters: ['Psalm 40'], verseCount: 17 },
  { day: 13, chapters: ['Psalm 42'], verseCount: 11 },
  { day: 14, chapters: ['Psalm 46'], verseCount: 11 },
  { day: 15, chapters: ['Psalm 51'], verseCount: 19 },
  { day: 16, chapters: ['Psalm 63'], verseCount: 11 },
  { day: 17, chapters: ['Psalm 84'], verseCount: 12 },
  { day: 18, chapters: ['Psalm 91'], verseCount: 16 },
  { day: 19, chapters: ['Psalm 95'], verseCount: 11 },
  { day: 20, chapters: ['Psalm 96'], verseCount: 13 },
  { day: 21, chapters: ['Psalm 100'], verseCount: 5 },
  { day: 22, chapters: ['Psalm 103'], verseCount: 22 },
  { day: 23, chapters: ['Psalm 119:1-48'], verseCount: 48 },
  { day: 24, chapters: ['Psalm 119:49-104'], verseCount: 56 },
  { day: 25, chapters: ['Psalm 119:105-176'], verseCount: 72 },
  { day: 26, chapters: ['Psalm 121'], verseCount: 8 },
  { day: 27, chapters: ['Psalm 139'], verseCount: 24 },
  { day: 28, chapters: ['Psalm 145'], verseCount: 21 },
  { day: 29, chapters: ['Psalm 148'], verseCount: 14 },
  { day: 30, chapters: ['Psalm 150'], verseCount: 6 },
];

// ─── Proverbs 31: One chapter per day ───
const proverbs31: PlanDay[] = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  chapters: [`Proverbs ${i + 1}`],
  verseCount: [33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31][i],
}));

// ─── Gospel of John: 21 chapters in 21 days ───
const john21: PlanDay[] = [
  { day: 1, chapters: ['John 1'], verseCount: 51 },
  { day: 2, chapters: ['John 2'], verseCount: 25 },
  { day: 3, chapters: ['John 3'], verseCount: 36 },
  { day: 4, chapters: ['John 4'], verseCount: 54 },
  { day: 5, chapters: ['John 5'], verseCount: 47 },
  { day: 6, chapters: ['John 6'], verseCount: 71 },
  { day: 7, chapters: ['John 7'], verseCount: 53 },
  { day: 8, chapters: ['John 8'], verseCount: 59 },
  { day: 9, chapters: ['John 9'], verseCount: 41 },
  { day: 10, chapters: ['John 10'], verseCount: 42 },
  { day: 11, chapters: ['John 11'], verseCount: 57 },
  { day: 12, chapters: ['John 12'], verseCount: 50 },
  { day: 13, chapters: ['John 13'], verseCount: 38 },
  { day: 14, chapters: ['John 14'], verseCount: 31 },
  { day: 15, chapters: ['John 15'], verseCount: 27 },
  { day: 16, chapters: ['John 16'], verseCount: 33 },
  { day: 17, chapters: ['John 17'], verseCount: 26 },
  { day: 18, chapters: ['John 18'], verseCount: 40 },
  { day: 19, chapters: ['John 19'], verseCount: 42 },
  { day: 20, chapters: ['John 20'], verseCount: 31 },
  { day: 21, chapters: ['John 21'], verseCount: 25 },
];

// ─── Romans Deep Dive: 16 chapters with study notes ───
const romans16: PlanDay[] = [
  { day: 1, chapters: ['Romans 1'], verseCount: 32, studyNote: 'Paul introduces himself and the gospel. Key theme: the righteousness of God revealed by faith (v.17).' },
  { day: 2, chapters: ['Romans 2'], verseCount: 29, studyNote: 'God\'s righteous judgment applies to all. No one is exempt — neither Jew nor Gentile.' },
  { day: 3, chapters: ['Romans 3'], verseCount: 31, studyNote: 'All have sinned (v.23). Justification is by faith apart from works of the law.' },
  { day: 4, chapters: ['Romans 4'], verseCount: 25, studyNote: 'Abraham believed God, and it was counted to him as righteousness. Faith, not works.' },
  { day: 5, chapters: ['Romans 5'], verseCount: 21, studyNote: 'Peace with God through faith. Where sin abounded, grace did much more abound.' },
  { day: 6, chapters: ['Romans 6'], verseCount: 23, studyNote: 'Dead to sin, alive to God. The wages of sin is death, but the gift of God is eternal life (v.23).' },
  { day: 7, chapters: ['Romans 7'], verseCount: 25, studyNote: 'The struggle with sin. Paul\'s honest confession of the war between flesh and spirit.' },
  { day: 8, chapters: ['Romans 8'], verseCount: 39, studyNote: 'The greatest chapter in the Bible. No condemnation. Nothing can separate us from God\'s love.' },
  { day: 9, chapters: ['Romans 9'], verseCount: 33, studyNote: 'God\'s sovereign choice. Paul\'s anguish for Israel and the mystery of election.' },
  { day: 10, chapters: ['Romans 10'], verseCount: 21, studyNote: 'Salvation for all who call on the name of the Lord. Faith comes by hearing the word of God.' },
  { day: 11, chapters: ['Romans 11'], verseCount: 36, studyNote: 'God has not rejected Israel. The olive tree metaphor. Oh the depth of the riches of God!' },
  { day: 12, chapters: ['Romans 12'], verseCount: 21, studyNote: 'Living sacrifice. Be transformed. Practical love in the body of Christ.' },
  { day: 13, chapters: ['Romans 13'], verseCount: 14, studyNote: 'Submit to governing authorities. Owe no man anything but love. Put on the Lord Jesus.' },
  { day: 14, chapters: ['Romans 14'], verseCount: 23, studyNote: 'Don\'t judge your brother in disputable matters. Each one will give account to God.' },
  { day: 15, chapters: ['Romans 15'], verseCount: 33, studyNote: 'Christ\'s example of selflessness. Paul\'s mission to the Gentiles.' },
  { day: 16, chapters: ['Romans 16'], verseCount: 27, studyNote: 'Personal greetings and final warnings. The God of peace shall bruise Satan under your feet shortly.' },
];

// ─── Walk with Matthew: 28 chapters in 28 days ───
const matthew28: PlanDay[] = [
  { day: 1, chapters: ['Matthew 1'], verseCount: 25 },
  { day: 2, chapters: ['Matthew 2'], verseCount: 23 },
  { day: 3, chapters: ['Matthew 3'], verseCount: 17 },
  { day: 4, chapters: ['Matthew 4'], verseCount: 25 },
  { day: 5, chapters: ['Matthew 5'], verseCount: 48 },
  { day: 6, chapters: ['Matthew 6'], verseCount: 34 },
  { day: 7, chapters: ['Matthew 7'], verseCount: 29 },
  { day: 8, chapters: ['Matthew 8'], verseCount: 34 },
  { day: 9, chapters: ['Matthew 9'], verseCount: 38 },
  { day: 10, chapters: ['Matthew 10'], verseCount: 42 },
  { day: 11, chapters: ['Matthew 11'], verseCount: 30 },
  { day: 12, chapters: ['Matthew 12'], verseCount: 50 },
  { day: 13, chapters: ['Matthew 13'], verseCount: 58 },
  { day: 14, chapters: ['Matthew 14'], verseCount: 36 },
  { day: 15, chapters: ['Matthew 15'], verseCount: 39 },
  { day: 16, chapters: ['Matthew 16'], verseCount: 28 },
  { day: 17, chapters: ['Matthew 17'], verseCount: 27 },
  { day: 18, chapters: ['Matthew 18'], verseCount: 35 },
  { day: 19, chapters: ['Matthew 19'], verseCount: 30 },
  { day: 20, chapters: ['Matthew 20'], verseCount: 34 },
  { day: 21, chapters: ['Matthew 21'], verseCount: 46 },
  { day: 22, chapters: ['Matthew 22'], verseCount: 46 },
  { day: 23, chapters: ['Matthew 23'], verseCount: 39 },
  { day: 24, chapters: ['Matthew 24'], verseCount: 51 },
  { day: 25, chapters: ['Matthew 25'], verseCount: 46 },
  { day: 26, chapters: ['Matthew 26'], verseCount: 75 },
  { day: 27, chapters: ['Matthew 27'], verseCount: 66 },
  { day: 28, chapters: ['Matthew 28'], verseCount: 20 },
];

// ─── Export all schedules ───
export const READING_PLAN_SCHEDULES: Record<string, PlanDay[]> = {
  'genesis-30': genesis30,
  'psalms-30': psalms30,
  'proverbs-31': proverbs31,
  'john-21': john21,
  'romans-16': romans16,
  'matthew-28': matthew28,
};

/**
 * Get the schedule for a specific plan day.
 */
export function getPlanDaySchedule(planId: string, day: number): PlanDay | null {
  const schedule = READING_PLAN_SCHEDULES[planId];
  if (!schedule) return null;
  return schedule.find((d) => d.day === day) || null;
}

/**
 * Get all days for a plan.
 */
export function getPlanSchedule(planId: string): PlanDay[] {
  return READING_PLAN_SCHEDULES[planId] || [];
}

/**
 * Get total verse count for a plan.
 */
export function getPlanTotalVerses(planId: string): number {
  const schedule = READING_PLAN_SCHEDULES[planId];
  if (!schedule) return 0;
  return schedule.reduce((sum, day) => sum + day.verseCount, 0);
}
