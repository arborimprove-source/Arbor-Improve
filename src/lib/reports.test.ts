import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildMonthlyComparison,
  buildMonthlySummaries,
  buildReportHighlights,
  buildWeeklyChartSeries,
} from './reports';
import { WeeklyEntry } from '../types';

const SAMPLE_ENTRIES: WeeklyEntry[] = [
  {
    id: 'w1',
    weekStart: '2026-10-05',
    followers: 300,
    reach: 600,
    likes: 40,
    posts: 2,
    score: 64,
  },
  {
    id: 'w2',
    weekStart: '2026-10-12',
    followers: 320,
    reach: 800,
    likes: 60,
    posts: 3,
    score: 76,
  },
  {
    id: 'w3',
    weekStart: '2026-11-02',
    followers: 350,
    reach: 1100,
    likes: 90,
    posts: 4,
    score: 88,
  },
  {
    id: 'w4',
    weekStart: '2026-11-09',
    followers: 390,
    reach: 1300,
    likes: 110,
    posts: 4,
    score: 94,
  },
];

test('buildMonthlySummaries groups entries chronologically and computes net followers', () => {
  const summaries = buildMonthlySummaries(SAMPLE_ENTRIES);
  assert.equal(summaries.length, 2);
  assert.equal(summaries[0].monthKey, '2026-10');
  assert.equal(summaries[0].weeksLogged, 2);
  assert.equal(summaries[0].endingFollowers, 320);
  assert.equal(summaries[0].netFollowerChange, 20);
  assert.equal(summaries[0].avgWeeklyReach, 700);

  assert.equal(summaries[1].monthKey, '2026-11');
  assert.equal(summaries[1].endingFollowers, 390);
  assert.equal(summaries[1].netFollowerChange, 70); // 390 - Oct ending 320
  assert.equal(summaries[1].totalPosts, 8);
  assert.equal(summaries[1].avgScore, 91);
});

test('buildMonthlyComparison compares latest month against previous month', () => {
  const empty = buildMonthlyComparison([]);
  assert.equal(empty.currentMonth, null);
  assert.equal(empty.previousMonth, null);

  const singleMonth = buildMonthlyComparison(SAMPLE_ENTRIES.slice(0, 2));
  assert.ok(singleMonth.currentMonth);
  assert.equal(singleMonth.previousMonth, null);

  const twoMonths = buildMonthlyComparison(SAMPLE_ENTRIES);
  assert.equal(twoMonths.followerChangeDelta, 70);
  assert.equal(twoMonths.avgReachDeltaPercent, 71); // (1200 - 700) / 700 = 71%
  assert.equal(twoMonths.postsDelta, 3);
  assert.equal(twoMonths.avgScoreDelta, 21);
});

test('buildWeeklyChartSeries slices range cleanly and computes week-over-week deltas', () => {
  const all = buildWeeklyChartSeries(SAMPLE_ENTRIES, 'all');
  assert.equal(all.length, 4);
  assert.equal(all[0].followerDelta, null);
  assert.equal(all[1].followerDelta, 20);
  assert.equal(all[3].followerDelta, 40);

  const lastTwo = buildWeeklyChartSeries(
    [
      ...SAMPLE_ENTRIES,
      {
        id: 'w5',
        weekStart: '2026-11-16',
        followers: 420,
        reach: 1400,
        likes: 120,
        posts: 3,
        score: 82,
      },
    ],
    '4w'
  );
  assert.equal(lastTwo.length, 4);
  assert.equal(lastTwo[0].id, 'w2');
});

test('buildReportHighlights picks best reach and best score weeks', () => {
  const highlights = buildReportHighlights(SAMPLE_ENTRIES);
  assert.equal(highlights.totalWeeks, 4);
  assert.equal(highlights.totalPosts, 13);
  assert.equal(highlights.netFollowerGain, 90);
  assert.equal(highlights.bestReachWeek?.id, 'w4');
  assert.equal(highlights.bestScoreWeek?.id, 'w4');
});
