import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BADGE_DEFINITIONS,
  computeAllEarnedBadgeKeys,
  getBadgeByKey,
  getNextSuggestedMilestone,
} from './badges';
import { TreeState, WeeklyEntry } from '../types';

test('BADGE_DEFINITIONS exposes all 12 milestone definitions', () => {
  assert.equal(BADGE_DEFINITIONS.length, 12);
  assert.equal(getBadgeByKey('first_entry')?.title, 'First Seed Planted');
  assert.equal(getBadgeByKey('non_existent'), undefined);
});

test('computeAllEarnedBadgeKeys handles empty entries cleanly', () => {
  const keys = computeAllEarnedBadgeKeys([], { level: 1, growthPoints: 0, isThirsty: false });
  assert.deepEqual(keys, []);
});

test('computeAllEarnedBadgeKeys requires strict improvement for best_reach and consecutive weeks for streak_4', () => {
  const tiedOrGapped: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 90, reach: 500, likes: 20, posts: 1, score: 70 },
    { id: '2', weekStart: '2026-09-14', followers: 95, reach: 500, likes: 20, posts: 1, score: 70 },
    { id: '3', weekStart: '2026-09-21', followers: 99, reach: 450, likes: 20, posts: 0, score: 20 },
    { id: '4', weekStart: '2026-09-28', followers: 99, reach: 500, likes: 20, posts: 2, score: 65 },
  ];
  const keys = computeAllEarnedBadgeKeys(tiedOrGapped, {
    level: 1,
    growthPoints: 3,
    isThirsty: false,
  });
  assert.ok(keys.includes('first_entry'));
  assert.ok(!keys.includes('best_reach'));
  assert.ok(!keys.includes('streak_4'));
  assert.ok(!keys.includes('followers_100'));
});

test('computeAllEarnedBadgeKeys unlocks all follower and tree level milestones when reached', () => {
  const entries: WeeklyEntry[] = [
    { id: '1', weekStart: '2026-09-07', followers: 400, reach: 800, likes: 40, posts: 2, score: 75 },
    { id: '2', weekStart: '2026-09-14', followers: 1200, reach: 1400, likes: 90, posts: 3, score: 85 },
    { id: '3', weekStart: '2026-09-21', followers: 5200, reach: 2000, likes: 150, posts: 4, score: 90 },
    { id: '4', weekStart: '2026-09-28', followers: 10500, reach: 3000, likes: 220, posts: 4, score: 95 },
  ];
  const tree: TreeState = { level: 5, growthPoints: 18, isThirsty: false };
  const keys = computeAllEarnedBadgeKeys(entries, tree);
  assert.equal(keys.length, 12);
});

test('getNextSuggestedMilestone suggests the next unearned milestone and null when all earned', () => {
  const first = getNextSuggestedMilestone([]);
  assert.equal(first?.key, 'first_entry');

  const afterFirst = getNextSuggestedMilestone([
    { badgeKey: 'first_entry', earnedAt: '2026-11-01T00:00:00.000Z' },
  ]);
  assert.equal(afterFirst?.key, 'level_2');

  const allEarned = BADGE_DEFINITIONS.map((b) => ({
    badgeKey: b.key,
    earnedAt: '2026-11-01T00:00:00.000Z',
  }));
  assert.equal(getNextSuggestedMilestone(allEarned), null);
});
