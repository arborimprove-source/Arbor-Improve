import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyScoreToTreeState,
  calculateBestStreak,
  calculatePostingStreak,
  calculateWeeklyScore,
  getLatestWeekComparison,
  getTreeLevelProgress,
  recalculateTreeStateFromEntries,
  validateDisplayName,
  validateEmail,
  validateWeeklyNumbers,
} from './calculations';
import { computeAllEarnedBadgeKeys } from './badges';
import { TreeState, WeeklyEntry } from '../types';

test('validateWeeklyNumbers rejects empty, negative, decimal, and oversized numbers', () => {
  const empty = validateWeeklyNumbers({ followers: '', reach: 100, likes: 10, posts: 2 });
  assert.equal(empty.valid, false);
  assert.ok(empty.errors.followers);

  const negative = validateWeeklyNumbers({ followers: 100, reach: -5, likes: 10, posts: 2 });
  assert.equal(negative.valid, false);
  assert.ok(negative.errors.reach);

  const decimal = validateWeeklyNumbers({ followers: 100, reach: 200, likes: 10.5, posts: 2 });
  assert.equal(decimal.valid, false);
  assert.ok(decimal.errors.likes);

  const ok = validateWeeklyNumbers({ followers: 0, reach: 0, likes: 0, posts: 0 });
  assert.equal(ok.valid, true);
});

test('validateDisplayName and validateEmail enforce clean formats', () => {
  assert.ok(validateDisplayName('   '));
  assert.ok(validateDisplayName('a'.repeat(41)));
  assert.equal(validateDisplayName('Amina'), null);

  assert.ok(validateEmail(''));
  assert.ok(validateEmail('not-an-email'));
  assert.equal(validateEmail('amina@example.com'), null);
});

test('calculateWeeklyScore calibrates during first 1 to 3 weeks and skips reach', () => {
  const week1 = calculateWeeklyScore({ followers: 120, reach: 50, likes: 10, posts: 4 }, []);
  assert.equal(week1.isCalibrating, true);
  assert.equal(week1.reachPoints, null);
  assert.equal(week1.score, 88);
});

test('calculateWeeklyScore enforces consistency protection (4+ posts => min score 60)', () => {
  const prior: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 500, reach: 2000, likes: 100, posts: 3, score: 75 },
    { id: '2', weekStart: '2026-09-14', followers: 510, reach: 2000, likes: 100, posts: 3, score: 80 },
    { id: '3', weekStart: '2026-09-21', followers: 520, reach: 2000, likes: 100, posts: 3, score: 80 },
  ];

  const res = calculateWeeklyScore({ followers: 515, reach: 100, likes: 5, posts: 4 }, prior);
  assert.equal(res.isCalibrating, false);
  assert.equal(res.consistencyApplied, true);
  assert.equal(res.score, 60);
});

test('tree growth levels up every 4 points, becomes thirsty below 40, never drops level, and recovers', () => {
  let state: TreeState = { level: 1, growthPoints: 0, isThirsty: false };
  state = applyScoreToTreeState(state, 80);
  assert.equal(state.growthPoints, 2);
  assert.equal(state.level, 1);

  state = applyScoreToTreeState(state, 75);
  assert.equal(state.growthPoints, 4);
  assert.equal(state.level, 2);

  state = applyScoreToTreeState(state, 20);
  assert.equal(state.growthPoints, 4);
  assert.equal(state.level, 2);
  assert.equal(state.isThirsty, true);

  state = applyScoreToTreeState(state, 45);
  assert.equal(state.growthPoints, 5);
  assert.equal(state.level, 2);
  assert.equal(state.isThirsty, false);
});

test('recalculateTreeStateFromEntries, streaks, and badges compute accurately', () => {
  const entries: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 90, reach: 400, likes: 20, posts: 1, score: 70 },
    { id: '2', weekStart: '2026-09-14', followers: 110, reach: 500, likes: 30, posts: 2, score: 75 },
    { id: '3', weekStart: '2026-09-21', followers: 130, reach: 450, likes: 25, posts: 3, score: 80 },
    { id: '4', weekStart: '2026-09-28', followers: 150, reach: 700, likes: 50, posts: 4, score: 90 },
  ];

  const treeState = recalculateTreeStateFromEntries(entries);
  assert.equal(treeState.growthPoints, 8);
  assert.equal(treeState.level, 3);
  assert.equal(calculatePostingStreak(entries), 4);
  assert.equal(calculateBestStreak(entries), 4);

  const badges = computeAllEarnedBadgeKeys(entries, treeState);
  assert.ok(badges.includes('first_entry'));
  assert.ok(badges.includes('followers_100'));
  assert.ok(badges.includes('best_reach'));
  assert.ok(badges.includes('streak_4'));
  assert.ok(badges.includes('level_2'));
  assert.ok(badges.includes('level_3'));
});

test('validateWeeklyNumbers catches whitespace-only and oversized values', () => {
  const spaces = validateWeeklyNumbers({ followers: '   ', reach: 100, likes: 10, posts: 1 });
  assert.equal(spaces.valid, false);
  assert.ok(spaces.errors.followers);

  const oversized = validateWeeklyNumbers({ followers: 100, reach: 100, likes: 10, posts: 501 });
  assert.equal(oversized.valid, false);
  assert.ok(oversized.errors.posts);
});

test('editing an entry recalculates tree state deterministically without duplicate growth points', () => {
  const initial: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 100, reach: 500, likes: 40, posts: 4, score: 88 },
  ];
  const firstState = recalculateTreeStateFromEntries(initial);
  assert.equal(firstState.growthPoints, 2);

  // Edit same week to a lower score (45 -> +1 point instead of +2)
  const edited: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 100, reach: 500, likes: 10, posts: 1, score: 45 },
  ];
  const editedState = recalculateTreeStateFromEntries(edited);
  assert.equal(editedState.growthPoints, 1);
  assert.equal(editedState.level, 1);
});

test('reach interpolation hits reference anchors smoothly', () => {
  const prior: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 100, reach: 1000, likes: 50, posts: 3, score: 80 },
    { id: '2', weekStart: '2026-09-14', followers: 110, reach: 1000, likes: 50, posts: 3, score: 80 },
    { id: '3', weekStart: '2026-09-21', followers: 120, reach: 1000, likes: 50, posts: 3, score: 80 },
  ];

  const exactOne = calculateWeeklyScore({ followers: 122, reach: 1000, likes: 50, posts: 4 }, prior);
  assert.equal(exactOne.reachPoints, 80);

  const pointEight = calculateWeeklyScore({ followers: 122, reach: 800, likes: 50, posts: 4 }, prior);
  assert.equal(pointEight.reachPoints, 60);

  const pointNine = calculateWeeklyScore({ followers: 122, reach: 900, likes: 50, posts: 4 }, prior);
  assert.equal(pointNine.reachPoints, 70);
});

test('getTreeLevelProgress and getLatestWeekComparison compute dashboard metrics cleanly', () => {
  const lvl2 = getTreeLevelProgress({ level: 2, growthPoints: 6, isThirsty: false });
  assert.equal(lvl2.pointsInLevel, 2);
  assert.equal(lvl2.percent, 50);
  assert.equal(lvl2.pointsToNext, 2);
  assert.equal(lvl2.isMaxLevel, false);

  const lvl5 = getTreeLevelProgress({ level: 5, growthPoints: 20, isThirsty: false });
  assert.equal(lvl5.isMaxLevel, true);
  assert.equal(lvl5.percent, 100);
  assert.equal(lvl5.pointsToNext, 0);

  const emptyComp = getLatestWeekComparison([]);
  assert.equal(emptyComp.latest, null);
  assert.equal(emptyComp.followerDelta, null);

  const comp = getLatestWeekComparison([
    { id: '2', weekStart: '2026-09-14', followers: 340, reach: 800, likes: 60, posts: 3, score: 82 },
    { id: '1', weekStart: '2026-09-07', followers: 320, reach: 650, likes: 45, posts: 2, score: 74 },
  ]);
  assert.equal(comp.latest?.id, '2');
  assert.equal(comp.followerDelta, 20);
  assert.equal(comp.reachDelta, 150);
});
