import { Goal, INPUT_LIMITS, PlanType } from '../types';
import { daysRemainingFrom } from './dateUtils';

export const MAX_ACTIVE_GOALS_FREE = 1;
export const MAX_ACTIVE_GOALS_PAID = 5;
export const GOAL_TITLE_MAX_LENGTH = 80;
export const GOAL_DAYS_MAX = 1095;

export function getActiveGoalLimit(plan: PlanType): number {
  return plan === 'paid' ? MAX_ACTIVE_GOALS_PAID : MAX_ACTIVE_GOALS_FREE;
}

export function canActivateAnotherGoal(goals: Goal[], plan: PlanType): boolean {
  const activeCount = goals.filter((g) => g.status === 'active').length;
  return activeCount < getActiveGoalLimit(plan);
}

export interface GoalValidationResult {
  valid: boolean;
  errors: {
    title?: string;
    targetFollowers?: string;
    days?: string;
  };
}

export function validateGoalInput(
  raw: {
    title: string;
    targetFollowers: string | number;
    days: string | number;
  },
  options?: {
    currentFollowers?: number;
    requireAboveCurrent?: boolean;
  }
): GoalValidationResult {
  const errors: GoalValidationResult['errors'] = {};
  const trimmedTitle = raw.title.trim();

  if (!trimmedTitle) {
    errors.title = 'Please enter a goal title.';
  } else if (trimmedTitle.length > GOAL_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${GOAL_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  const rawTarget =
    typeof raw.targetFollowers === 'string'
      ? raw.targetFollowers.trim()
      : raw.targetFollowers;

  if (rawTarget === '' || rawTarget === null || rawTarget === undefined) {
    errors.targetFollowers = 'Please enter your follower target.';
  } else {
    const targetNum = typeof rawTarget === 'number' ? rawTarget : Number(rawTarget);
    if (!Number.isFinite(targetNum) || !Number.isInteger(targetNum)) {
      errors.targetFollowers = 'Target followers must be a whole number.';
    } else if (targetNum < 1) {
      errors.targetFollowers = 'Target followers must be at least 1.';
    } else if (targetNum > INPUT_LIMITS.followersMax) {
      errors.targetFollowers = `Target cannot exceed ${INPUT_LIMITS.followersMax.toLocaleString()}.`;
    } else if (
      options?.requireAboveCurrent !== false &&
      typeof options?.currentFollowers === 'number' &&
      options.currentFollowers > 0 &&
      targetNum <= options.currentFollowers
    ) {
      errors.targetFollowers = `Target must be higher than your current ${options.currentFollowers.toLocaleString()} followers.`;
    }
  }

  const rawDays = typeof raw.days === 'string' ? raw.days.trim() : raw.days;
  if (rawDays === '' || rawDays === null || rawDays === undefined) {
    errors.days = 'Please choose a timeframe in days.';
  } else {
    const daysNum = typeof rawDays === 'number' ? rawDays : Number(rawDays);
    if (!Number.isFinite(daysNum) || !Number.isInteger(daysNum)) {
      errors.days = 'Timeframe must be a whole number of days.';
    } else if (daysNum < 1) {
      errors.days = 'Timeframe must be at least 1 day.';
    } else if (daysNum > GOAL_DAYS_MAX) {
      errors.days = `Timeframe cannot exceed ${GOAL_DAYS_MAX} days (3 years).`;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export interface GoalProgressStats {
  currentFollowers: number;
  gainedSinceStart: number;
  totalNeededFromStart: number;
  remainingFollowers: number;
  percent: number;
  daysRemaining: number;
  isReached: boolean;
  isPastDue: boolean;
  pacePerWeekNeeded: number | null;
}

export function computeGoalProgress(
  goal: Goal,
  latestFollowers: number,
  today: Date = new Date()
): GoalProgressStats {
  const currentFollowers = Math.max(0, Math.round(latestFollowers));
  const totalNeededFromStart = Math.max(1, goal.targetFollowers - goal.startFollowers);
  const gainedSinceStart = Math.max(0, currentFollowers - goal.startFollowers);
  const remainingFollowers = Math.max(0, goal.targetFollowers - currentFollowers);
  const isReached =
    goal.status === 'completed' || currentFollowers >= goal.targetFollowers;

  const percent = isReached
    ? 100
    : Math.min(
        100,
        Math.max(0, Math.round((gainedSinceStart / totalNeededFromStart) * 100))
      );

  const daysRemaining = daysRemainingFrom(goal.endDate, today);
  const isPastDue = !isReached && daysRemaining === 0;

  let pacePerWeekNeeded: number | null = null;
  if (!isReached && remainingFollowers > 0 && daysRemaining > 0) {
    const weeksLeft = Math.max(1 / 7, daysRemaining / 7);
    pacePerWeekNeeded = Math.max(1, Math.ceil(remainingFollowers / weeksLeft));
  }

  return {
    currentFollowers,
    gainedSinceStart,
    totalNeededFromStart,
    remainingFollowers,
    percent,
    daysRemaining,
    isReached,
    isPastDue,
    pacePerWeekNeeded,
  };
}
