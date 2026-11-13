import { WeeklyEntry } from '../types';
import { formatShortDate } from './dateUtils';

export type ReportRange = '4w' | '8w' | '12w' | 'all';

export interface MonthlySummary {
  monthKey: string; // YYYY-MM
  label: string; // e.g. "Nov 2026"
  weeksLogged: number;
  endingFollowers: number;
  netFollowerChange: number;
  totalReach: number;
  avgWeeklyReach: number;
  totalLikes: number;
  totalPosts: number;
  avgScore: number;
}

export interface MonthlyComparison {
  currentMonth: MonthlySummary | null;
  previousMonth: MonthlySummary | null;
  followerChangeDelta: number | null;
  avgReachDeltaPercent: number | null;
  postsDelta: number | null;
  avgScoreDelta: number | null;
  reflection: string;
}

export interface WeeklyChartPoint {
  id: string;
  weekStart: string;
  label: string;
  followers: number;
  reach: number;
  likes: number;
  posts: number;
  score: number;
  followerDelta: number | null;
}

export interface ReportHighlights {
  totalWeeks: number;
  totalPosts: number;
  netFollowerGain: number;
  avgWeeklyReach: number;
  bestReachWeek: WeeklyEntry | null;
  bestScoreWeek: WeeklyEntry | null;
}

export function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return monthKey;
  }
  const dt = new Date(year, month - 1, 1);
  return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function buildMonthlySummaries(entries: WeeklyEntry[]): MonthlySummary[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  const grouped = new Map<string, WeeklyEntry[]>();
  for (const entry of sorted) {
    const monthKey = entry.weekStart.slice(0, 7);
    const list = grouped.get(monthKey);
    if (list) {
      list.push(entry);
    } else {
      grouped.set(monthKey, [entry]);
    }
  }

  const monthKeys = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b));
  const summaries: MonthlySummary[] = [];

  for (let i = 0; i < monthKeys.length; i++) {
    const key = monthKeys[i];
    const group = grouped.get(key) ?? [];
    const endingFollowers = group[group.length - 1].followers;
    const prevSummary = i > 0 ? summaries[i - 1] : null;
    const baselineFollowers = prevSummary
      ? prevSummary.endingFollowers
      : group[0].followers;
    const totalReach = group.reduce((sum, e) => sum + e.reach, 0);
    const totalLikes = group.reduce((sum, e) => sum + e.likes, 0);
    const totalPosts = group.reduce((sum, e) => sum + e.posts, 0);
    const totalScore = group.reduce((sum, e) => sum + e.score, 0);

    summaries.push({
      monthKey: key,
      label: formatMonthLabel(key),
      weeksLogged: group.length,
      endingFollowers,
      netFollowerChange: endingFollowers - baselineFollowers,
      totalReach,
      avgWeeklyReach: Math.round(totalReach / group.length),
      totalLikes,
      totalPosts,
      avgScore: Math.round(totalScore / group.length),
    });
  }

  return summaries;
}

export function buildMonthlyComparison(entries: WeeklyEntry[]): MonthlyComparison {
  const summaries = buildMonthlySummaries(entries);
  if (summaries.length === 0) {
    return {
      currentMonth: null,
      previousMonth: null,
      followerChangeDelta: null,
      avgReachDeltaPercent: null,
      postsDelta: null,
      avgScoreDelta: null,
      reflection:
        'Log your first weekly check-in to start building your monthly growth overview.',
    };
  }

  const currentMonth = summaries[summaries.length - 1];
  const previousMonth = summaries.length >= 2 ? summaries[summaries.length - 2] : null;

  if (!previousMonth) {
    return {
      currentMonth,
      previousMonth: null,
      followerChangeDelta: null,
      avgReachDeltaPercent: null,
      postsDelta: null,
      avgScoreDelta: null,
      reflection: `Your ${currentMonth.label} baseline is underway with ${currentMonth.weeksLogged} ${
        currentMonth.weeksLogged === 1 ? 'week' : 'weeks'
      } logged. Next month's comparison will appear automatically.`,
    };
  }

  const followerChangeDelta = currentMonth.endingFollowers - previousMonth.endingFollowers;
  const avgReachDeltaPercent =
    previousMonth.avgWeeklyReach > 0
      ? Math.round(
          ((currentMonth.avgWeeklyReach - previousMonth.avgWeeklyReach) /
            previousMonth.avgWeeklyReach) *
            100
        )
      : currentMonth.avgWeeklyReach > 0
      ? 100
      : 0;
  const postsDelta = currentMonth.totalPosts - previousMonth.totalPosts;
  const avgScoreDelta = currentMonth.avgScore - previousMonth.avgScore;

  let reflection: string;
  if (avgReachDeltaPercent >= 10 || followerChangeDelta > 0) {
    reflection = `Masha'Allah, ${currentMonth.label} built on ${previousMonth.label} with steady community momentum.`;
  } else if (currentMonth.totalPosts >= previousMonth.totalPosts) {
    reflection = `Your posting rhythm stayed steady into ${currentMonth.label}. Consistency brings quiet barakah even when reach fluctuates.`;
  } else {
    reflection = `Every season has its own pace. A few intentional posts this month will gently lift your ${currentMonth.label} numbers.`;
  }

  return {
    currentMonth,
    previousMonth,
    followerChangeDelta,
    avgReachDeltaPercent,
    postsDelta,
    avgScoreDelta,
    reflection,
  };
}

export function buildWeeklyChartSeries(
  entries: WeeklyEntry[],
  range: ReportRange
): WeeklyChartPoint[] {
  if (entries.length === 0) return [];
  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  const withDelta: WeeklyChartPoint[] = sorted.map((entry, idx) => ({
    id: entry.id,
    weekStart: entry.weekStart,
    label: formatShortDate(entry.weekStart),
    followers: entry.followers,
    reach: entry.reach,
    likes: entry.likes,
    posts: entry.posts,
    score: entry.score,
    followerDelta: idx > 0 ? entry.followers - sorted[idx - 1].followers : null,
  }));

  if (range === 'all') return withDelta;
  const limit = range === '4w' ? 4 : range === '8w' ? 8 : 12;
  return withDelta.slice(-limit);
}

export function buildReportHighlights(entries: WeeklyEntry[]): ReportHighlights {
  if (entries.length === 0) {
    return {
      totalWeeks: 0,
      totalPosts: 0,
      netFollowerGain: 0,
      avgWeeklyReach: 0,
      bestReachWeek: null,
      bestScoreWeek: null,
    };
  }

  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const totalPosts = sorted.reduce((sum, e) => sum + e.posts, 0);
  const totalReach = sorted.reduce((sum, e) => sum + e.reach, 0);
  const netFollowerGain = sorted[sorted.length - 1].followers - sorted[0].followers;

  let bestReachWeek = sorted[0];
  let bestScoreWeek = sorted[0];
  for (const entry of sorted) {
    if (entry.reach > bestReachWeek.reach) {
      bestReachWeek = entry;
    }
    if (
      entry.score > bestScoreWeek.score ||
      (entry.score === bestScoreWeek.score && entry.weekStart > bestScoreWeek.weekStart)
    ) {
      bestScoreWeek = entry;
    }
  }

  return {
    totalWeeks: sorted.length,
    totalPosts,
    netFollowerGain,
    avgWeeklyReach: Math.round(totalReach / sorted.length),
    bestReachWeek,
    bestScoreWeek,
  };
}
