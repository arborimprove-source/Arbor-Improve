import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canActivateAnotherGoal,
  computeGoalProgress,
  getActiveGoalLimit,
  validateGoalInput,
} from './goals';
import { Goal } from '../types';

test('getActiveGoalLimit and canActivateAnotherGoal enforce Free (1) vs Paid (5) limits', () => {
  assert.equal(getActiveGoalLimit('free'), 1);
  assert.equal(getActiveGoalLimit('paid'), 5);

  const oneActiveAndOneCompleted: Goal[] = [
    {
      id: 'g1',
      title: 'First 500',
      targetFollowers: 500,
      startFollowers: 200,
      startDate: '2026-10-01',
      endDate: '2026-12-01',
      status: 'completed',
    },
    {
      id: 'g2',
      title: 'Reach 1,000',
      targetFollowers: 1000,
      startFollowers: 500,
      startDate: '2026-10-15',
      endDate: '2026-12-30',
      status: 'active',
    },
  ];

  // Completed goal does not block; 1 active goal hits Free limit
  assert.equal(canActivateAnotherGoal(oneActiveAndOneCompleted, 'free'), false);
  assert.equal(canActivateAnotherGoal(oneActiveAndOneCompleted, 'paid'), true);
});

test('validateGoalInput enforces title, whole-number target above current, and valid days', () => {
  const badEmpty = validateGoalInput(
    { title: '   ', targetFollowers: '', days: '' },
    { currentFollowers: 300 }
  );
  assert.equal(badEmpty.valid, false);
  assert.ok(badEmpty.errors.title);
  assert.ok(badEmpty.errors.targetFollowers);
  assert.ok(badEmpty.errors.days);

  const notAboveCurrent = validateGoalInput(
    { title: 'Grow steady', targetFollowers: '300', days: '60' },
    { currentFollowers: 300 }
  );
  assert.equal(notAboveCurrent.valid, false);
  assert.ok(notAboveCurrent.errors.targetFollowers);

  const badDays = validateGoalInput(
    { title: 'Grow steady', targetFollowers: '500', days: '0' },
    { currentFollowers: 300 }
  );
  assert.equal(badDays.valid, false);
  assert.ok(badDays.errors.days);

  const ok = validateGoalInput(
    { title: 'Reach 1,000 followers', targetFollowers: '1000', days: '60' },
    { currentFollowers: 300 }
  );
  assert.equal(ok.valid, true);
});

test('computeGoalProgress computes percentage, remaining followers, days, and weekly pace', () => {
  const goal: Goal = {
    id: 'g1',
    title: 'Reach 1,000 followers',
    targetFollowers: 1000,
    startFollowers: 200,
    startDate: '2026-11-01',
    endDate: '2026-11-26',
    status: 'active',
  };

  const today = new Date(2026, 10, 12); // Nov 12, 2026 => 14 days remaining (2 weeks)
  const stats = computeGoalProgress(goal, 600, today);
  assert.equal(stats.gainedSinceStart, 400);
  assert.equal(stats.totalNeededFromStart, 800);
  assert.equal(stats.remainingFollowers, 400);
  assert.equal(stats.percent, 50);
  assert.equal(stats.daysRemaining, 14);
  assert.equal(stats.isReached, false);
  assert.equal(stats.pacePerWeekNeeded, 200);

  const reached = computeGoalProgress(goal, 1050, today);
  assert.equal(reached.isReached, true);
  assert.equal(reached.percent, 100);
  assert.equal(reached.remainingFollowers, 0);
  assert.equal(reached.pacePerWeekNeeded, null);
});
