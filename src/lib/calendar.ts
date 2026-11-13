import { PlanType } from '../types';

export type CalendarCategory = 'all' | 'weekly' | 'ramadan_eid' | 'sacred_months';

export interface IslamicCalendarEntry {
  id: string;
  title: string;
  hijriLabel: string;
  category: Exclude<CalendarCategory, 'all'>;
  approxDateISO: string | null;
  prepLeadDays: number;
  isPaid: boolean;
  summary: string;
  contentPrompts: string[];
  toneNote: string;
}

export const CALENDAR_CATEGORY_LABELS: Record<CalendarCategory, string> = {
  all: 'All occasions',
  weekly: 'Weekly rhythm',
  ramadan_eid: 'Ramadan & Eid',
  sacred_months: 'Sacred months',
};

export const ISLAMIC_CALENDAR_ENTRIES: IslamicCalendarEntry[] = [
  {
    id: 'weekly-jummah',
    title: 'Weekly Jummah Reflection',
    hijriLabel: 'Every Friday',
    category: 'weekly',
    approxDateISO: null,
    prepLeadDays: 1,
    isPaid: false,
    summary:
      'Anchor your week with a calm Friday reminder, Surah Al-Kahf encouragement, or community dua.',
    contentPrompts: [
      'Share one short ayah or hadith reflection that helped your week.',
      'Carousel: 3 quiet ways to prepare your heart before Jummah prayer.',
      'Story prompt: Invite followers to drop a dua request before Maghrib.',
    ],
    toneNote: 'Keep filming simple on Thursday afternoon so Friday stays peaceful.',
  },
  {
    id: 'weekly-mon-thu-sunnah',
    title: 'Monday & Thursday Sunnah Rhythm',
    hijriLabel: 'Weekly Sunnah',
    category: 'weekly',
    approxDateISO: null,
    prepLeadDays: 1,
    isPaid: false,
    summary:
      'Gentle lifestyle and behind-the-scenes check-ins around fasting, focus, and barakah in work.',
    contentPrompts: [
      'A quiet morning routine reel showing how you start the week with intention.',
      'Carousel: Balancing creative work, worship, and rest without burnout.',
      'Story check-in: Share one small goal you are working toward this week.',
    ],
    toneNote: 'Focus on sincerity over aesthetic perfection.',
  },
  {
    id: 'rajab-renewal',
    title: 'Rajab — Spiritual Reset & Roots',
    hijriLabel: '1 Rajab 1448',
    category: 'sacred_months',
    approxDateISO: '2026-12-11',
    prepLeadDays: 7,
    isPaid: false,
    summary:
      'As one of the four sacred months, Rajab invites creators to plant early seeds before Ramadan.',
    contentPrompts: [
      'Share a personal reflection on slowing down and renewing intentions.',
      'Carousel: 4 gentle habits to start two months before Ramadan.',
      'Reel: How you organize beneficial content without chasing algorithms.',
    ],
    toneNote: 'Unlocked on Free as your seasonal starter guide.',
  },
  {
    id: 'shaban-ramadan-prep',
    title: "Sha'ban — Ramadan Content Batching",
    hijriLabel: "1–15 Sha'ban 1448",
    category: 'ramadan_eid',
    approxDateISO: '2027-01-10',
    prepLeadDays: 14,
    isPaid: true,
    summary:
      "Prepare your Ramadan series during Sha'ban so you can step back from screens during the blessed month.",
    contentPrompts: [
      'Map out 2–3 recurring weekly Ramadan series instead of daily pressure.',
      'Film evergreen reminders and tutorials early in Sha’ban.',
      'Ask your audience what topics would benefit their Ramadan most.',
    ],
    toneNote: 'Batch gently now so your Ramadan nights stay protected.',
  },
  {
    id: 'ramadan-week-1',
    title: 'Ramadan Week 1 — Intention & Welcome',
    hijriLabel: '1 Ramadan 1448',
    category: 'ramadan_eid',
    approxDateISO: '2027-02-08',
    prepLeadDays: 14,
    isPaid: true,
    summary:
      'Welcome your community warmly and set sustainable expectations for your Ramadan content pace.',
    contentPrompts: [
      'Short Reel: One gentle Ramadan intention you are holding onto.',
      'Carousel: Simple Quran or dhikr tracker ideas for busy days.',
      'Suhoor or Iftar reflection Story without over-producing.',
    ],
    toneNote: 'Worship first; consistency protection stays on your side.',
  },
  {
    id: 'ramadan-last-ten',
    title: 'Last 10 Nights — Laylatul Qadr Quiet Mode',
    hijriLabel: '21–29 Ramadan 1448',
    category: 'ramadan_eid',
    approxDateISO: '2027-02-28',
    prepLeadDays: 7,
    isPaid: true,
    summary:
      'Give yourself permission to post minimal pre-scheduled duas or take a restful social break.',
    contentPrompts: [
      'Share a concise Laylatul Qadr dua card followers can save.',
      'Post a calm "offline for worship" Story note to model healthy boundaries.',
      'Highlight a trusted charity or community cause.',
    ],
    toneNote: 'Stepping back for worship never hurts your tree level.',
  },
  {
    id: 'eid-al-fitr',
    title: 'Eid al-Fitr — Gratitude & Celebration',
    hijriLabel: '1 Shawwal 1448',
    category: 'ramadan_eid',
    approxDateISO: '2027-03-10',
    prepLeadDays: 5,
    isPaid: true,
    summary:
      'Celebrate Eid with genuine gratitude, family warmth, and heartfelt Eid Mubarak wishes.',
    contentPrompts: [
      'Share a warm Eid Mubarak photo or Story card with your community.',
      'Reflect on one lesson from Ramadan you want to carry forward.',
      'Highlight a small Muslim business or community tradition.',
    ],
    toneNote: 'Stay present with family; post whenever the moment feels right.',
  },
  {
    id: 'dhul-hijjah-ten-days',
    title: 'First 10 Days of Dhul Hijjah & Arafah',
    hijriLabel: '1–9 Dhul Hijjah 1448',
    category: 'sacred_months',
    approxDateISO: '2027-05-08',
    prepLeadDays: 10,
    isPaid: true,
    summary:
      'The best days of the year — ideal for high-benefit reminders on dhikr, charity, and Arafah dua.',
    contentPrompts: [
      'Carousel: Easy daily acts of worship during the first 10 days.',
      'Day of Arafah reminder with a printable or savable dua list.',
      'Short story explaining why small consistent deeds carry immense reward.',
    ],
    toneNote: 'Keep reminders clear, authentic, and easy to act on.',
  },
  {
    id: 'eid-al-adha',
    title: 'Eid al-Adha — Sacrifice & Generosity',
    hijriLabel: '10 Dhul Hijjah 1448',
    category: 'ramadan_eid',
    approxDateISO: '2027-05-17',
    prepLeadDays: 5,
    isPaid: true,
    summary:
      'Share reflections on Prophet Ibrahim (AS), community generosity, and joyful Eid gatherings.',
    contentPrompts: [
      'Story series sharing Eid morning prep and community spirit.',
      'Reflective post on trusting Allah during uncertain seasons.',
      'Gratitude note thanking your followers for walking with you.',
    ],
    toneNote: 'Warmth and sincerity connect far better than polished ads.',
  },
  {
    id: 'muharram-ashura',
    title: 'Muharram & Day of Ashura',
    hijriLabel: '1–10 Muharram 1449',
    category: 'sacred_months',
    approxDateISO: '2027-06-06',
    prepLeadDays: 7,
    isPaid: true,
    summary:
      'Mark the Islamic New Year with grounded goal-setting and a calm reminder about fasting Ashura.',
    contentPrompts: [
      'Islamic New Year reflection: What roots are you planting this year?',
      'Saveable reminder card for fasting the 9th and 10th of Muharram.',
      'Share an Arbor Story card showing your creator goal for the year ahead.',
    ],
    toneNote: 'Pair your Muharram reflection with a realistic 60-day creator goal.',
  },
  {
    id: 'rabi-al-awwal',
    title: 'Rabi al-Awwal — Prophetic Character',
    hijriLabel: 'Rabi al-Awwal 1449',
    category: 'sacred_months',
    approxDateISO: '2027-08-04',
    prepLeadDays: 7,
    isPaid: true,
    summary:
      'Share gentle Seerah moments, kindness in daily speech, and Prophetic habits for creators.',
    contentPrompts: [
      'Carousel: 3 Prophetic manners for showing up kindly online.',
      'Short Reel retelling a comforting moment from the Seerah.',
      'Reminder to send salawat on Friday and reflect on gentleness.',
    ],
    toneNote: 'Root your creative voice in mercy and truthfulness.',
  },
];

export function getIslamicDateLabel(date: Date = new Date()): string {
  try {
    const formatted = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    if (formatted && !formatted.includes('Invalid')) {
      return formatted;
    }
  } catch {
    // Fallback below if environment lacks islamic-umalqura ICU data
  }
  return 'Hijri calendar 1448 AH';
}

export function getDaysUntilEntry(
  entry: IslamicCalendarEntry,
  today: Date = new Date()
): number | null {
  if (!entry.approxDateISO) return null;
  const [y, m, d] = entry.approxDateISO.split('-').map(Number);
  const target = new Date(y, (m || 1) - 1, d || 1);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round(
    (target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays;
}

export function getDaysUntilNextJummah(today: Date = new Date()): number {
  const day = today.getDay(); // 5 = Friday
  return (5 - day + 7) % 7;
}

export function isCalendarEntryUnlocked(
  entry: IslamicCalendarEntry,
  plan: PlanType
): boolean {
  return !entry.isPaid || plan === 'paid';
}

export function filterCalendarEntries(
  entries: IslamicCalendarEntry[],
  category: CalendarCategory,
  searchQuery: string
): IslamicCalendarEntry[] {
  const q = searchQuery.trim().toLowerCase();
  return entries.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.hijriLabel.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.contentPrompts.some((p) => p.toLowerCase().includes(q))
    );
  });
}

export function getNextUpcomingCalendarHighlight(today: Date = new Date()): {
  entry: IslamicCalendarEntry;
  timingLabel: string;
} {
  const datedUpcoming = ISLAMIC_CALENDAR_ENTRIES.map((entry) => ({
    entry,
    days: getDaysUntilEntry(entry, today),
  }))
    .filter(
      (item): item is { entry: IslamicCalendarEntry; days: number } =>
        item.days !== null && item.days >= 0
    )
    .sort((a, b) => a.days - b.days);

  const daysToJummah = getDaysUntilNextJummah(today);
  const jummahEntry = ISLAMIC_CALENDAR_ENTRIES[0];

  if (datedUpcoming.length > 0 && datedUpcoming[0].days <= 14) {
    const first = datedUpcoming[0];
    return {
      entry: first.entry,
      timingLabel:
        first.days === 0
          ? 'Today'
          : first.days === 1
          ? 'Tomorrow'
          : `In ${first.days} days`,
    };
  }

  return {
    entry: jummahEntry,
    timingLabel:
      daysToJummah === 0
        ? 'Jummah today'
        : daysToJummah === 1
        ? 'Jummah tomorrow'
        : `Jummah in ${daysToJummah} days`,
  };
}
