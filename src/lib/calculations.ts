import {
  INPUT_LIMITS,
  TreeLevel,
  TreeState,
  WeeklyEntry,
} from '../types';
import { addDaysISO } from './dateUtils';

export interface WeeklyNumbersInput {
  followers: number;
  reach: number;
  likes: number;
  posts: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof WeeklyNumbersInput, string>>;
}

export interface ScoreBreakdown {
  score: number;
  reachPoints: number | null;
  postsPoints: number;
  followerPoints: number;
  isCalibrating: boolean;
  consistencyApplied: boolean;
}

export function validateWeeklyNumbers(raw: {
  followers: string | number;
  reach: string | number;
  likes: string | number;
  posts: string | number;
}): ValidationResult {
  const errors: Partial<Record<keyof WeeklyNumbersInput, string>> = {};

  const checkField = (
    key: keyof WeeklyNumbersInput,
    val: string | number,
    max: number,
    label: string
  ) => {
    if (val === null || val === undefined) {
      errors[key] = `Please enter your ${label}.`;
      return;
    }
    const normalized = typeof val === 'string' ? val.trim() : val;
    if (normalized === '') {
      errors[key] = `Please enter your ${label}.`;
      return;
    }
    const num = typeof normalized === 'number' ? normalized : Number(normalized);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
      errors[key] = `${label} must be a whole number.`;
      return;
    }
    if (num < 0) {
      errors[key] = `${label} must be 0 or higher.`;
      return;
    }
    if (num > max) {
      errors[key] = `${label} cannot exceed ${max.toLocaleString()}.`;
    }
  };

  checkField('followers', raw.followers, INPUT_LIMITS.followersMax, 'followers');
  checkField('reach', raw.reach, INPUT_LIMITS.reachMax, 'reach');
  checkField('likes', raw.likes, INPUT_LIMITS.likesMax, 'likes');
  checkField('posts', raw.posts, INPUT_LIMITS.postsMax, 'posts');

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDisplayName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Please enter a display name.';
  }
  if (trimmed.length > INPUT_LIMITS.displayNameMax) {
    return `Name must be ${INPUT_LIMITS.displayNameMax} characters or fewer.`;
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Please enter an email address.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function computeReachPoints(
  currentReach: number,
  priorEntries: WeeklyEntry[]
): number | null {
  if (priorEntries.length < 3) {
    return null;
  }
  const recent = priorEntries.slice(-4);
  const avgReach = recent.reduce((sum, e) => sum + e.reach, 0) / recent.length;

  if (avgReach <= 0) {
    return currentReach > 0 ? 100 : 80;
  }

  const ratio = currentReach / avgReach;
  if (ratio >= 1.2) return 100;
  if (ratio < 0.6) return 20;

  return Math.round(40 + ((ratio - 0.6) / 0.6) * 60);
}

export function computePostsPoints(posts: number): number {
  if (posts >= 4) return 100;
  if (posts === 3) return 75;
  if (posts === 2) return 50;
  if (posts === 1) return 25;
  return 0;
}

export function computeFollowerPoints(
  currentFollowers: number,
  previousWeek?: WeeklyEntry
): number {
  if (!previousWeek) {
    return currentFollowers > 0 ? 70 : 40;
  }
  const prev = previousWeek.followers;
  const diff = currentFollowers - prev;
  if (diff < 0) return 20;
  if (diff === 0) return 40;
  if (prev === 0) return 100;
  const pct = (diff / prev) * 100;
  return pct >= 2 ? 100 : 70;
}

export function calculateWeeklyScore(
  current: WeeklyNumbersInput,
  priorEntries: WeeklyEntry[]
): ScoreBreakdown {
  const sortedPrior = [...priorEntries].sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );
  const previousWeek = sortedPrior[sortedPrior.length - 1];

  const postsPoints = computePostsPoints(current.posts);
  const followerPoints = computeFollowerPoints(current.followers, previousWeek);
  const reachPoints = computeReachPoints(current.reach, sortedPrior);

  const isCalibrating = reachPoints === null;

  let rawScore: number;
  if (reachPoints === null) {
    rawScore = postsPoints * 0.6 + followerPoints * 0.4;
  } else {
    rawScore = reachPoints * 0.5 + postsPoints * 0.3 + followerPoints * 0.2;
  }

  let finalScore = Math.round(Math.max(0, Math.min(100, rawScore)));
  let consistencyApplied = false;

  if (current.posts >= 4 && finalScore < 60) {
    finalScore = 60;
    consistencyApplied = true;
  }

  return {
    score: finalScore,
    reachPoints,
    postsPoints,
    followerPoints,
    isCalibrating,
    consistencyApplied,
  };
}

export function levelFromGrowthPoints(points: number): TreeLevel {
  const level = Math.floor(Math.max(0, points) / 4) + 1;
  return Math.min(5, Math.max(1, level)) as TreeLevel;
}

export function applyScoreToTreeState(prev: TreeState, score: number): TreeState {
  let addedPoints = 0;
  let isThirsty = prev.isThirsty;

  if (score >= 70) {
    addedPoints = 2;
    isThirsty = false;
  } else if (score >= 40) {
    addedPoints = 1;
    isThirsty = false;
  } else {
    addedPoints = 0;
    isThirsty = true;
  }

  const nextPoints = prev.growthPoints + addedPoints;
  const nextLevel = Math.max(prev.level, levelFromGrowthPoints(nextPoints)) as TreeLevel;

  return {
    level: nextLevel,
    growthPoints: nextPoints,
    isThirsty,
  };
}

export function getGrowthDeltaForScore(score: number): number {
  if (score >= 70) return 2;
  if (score >= 40) return 1;
  return 0;
}

export function getScoreBreakdownForWeek(
  weekStart: string,
  input: WeeklyNumbersInput,
  allEntries: WeeklyEntry[]
): ScoreBreakdown {
  const priorBeforeWeek = allEntries
    .filter((e) => e.weekStart < weekStart)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  return calculateWeeklyScore(input, priorBeforeWeek);
}

export function recalculateTreeStateFromEntries(entries: WeeklyEntry[]): TreeState {
  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  let state: TreeState = {
    level: 1,
    growthPoints: 0,
    isThirsty: false,
  };
  for (const entry of sorted) {
    state = applyScoreToTreeState(state, entry.score);
  }
  return state;
}

export function calculatePostingStreak(entries: WeeklyEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
  let streak = 0;
  let expectedWeek: string | null = null;

  for (const entry of sorted) {
    if (entry.posts < 1) {
      break;
    }
    if (expectedWeek === null || entry.weekStart === expectedWeek) {
      streak += 1;
      expectedWeek = addDaysISO(entry.weekStart, -7);
    } else {
      break;
    }
  }
  return streak;
}

export function calculateBestStreak(entries: WeeklyEntry[]): number {
  if (entries.length === 0) return 0;
  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  let best = 0;
  let current = 0;
  let expectedNext: string | null = null;

  for (const entry of sorted) {
    if (entry.posts < 1) {
      current = 0;
      expectedNext = null;
      continue;
    }
    if (expectedNext === null || entry.weekStart === expectedNext) {
      current += 1;
    } else {
      current = 1;
    }
    best = Math.max(best, current);
    expectedNext = addDaysISO(entry.weekStart, 7);
  }
  return best;
}

export function getEncouragingMessage(score: number, isCalibrating: boolean): {
  headline: string;
  subtext: string;
  tone: 'good' | 'average' | 'thirsty';
} {
  if (score >= 70) {
    return {
      headline: "Masha'Allah, your tree is growing!",
      subtext: isCalibrating
        ? 'Your tree is getting to know you. Strong consistency this week (+2 growth points).'
        : 'Strong reach and steady effort this week (+2 growth points).',
      tone: 'good',
    };
  }
  if (score >= 40) {
    return {
      headline: 'Steady and healthy. Keep going.',
      subtext: isCalibrating
        ? 'Your tree is getting to know you. Every post plants barakah (+1 growth point).'
        : 'Quiet consistency builds lasting roots (+1 growth point).',
      tone: 'average',
    };
  }
  return {
    headline: 'Every tree has dry seasons. Post once and water it.',
    subtext: isCalibrating
      ? 'Your tree is getting to know you. No level lost — next week is a fresh start.'
      : 'Your level stays safe. One gentle week brings back green leaves.',
    tone: 'thirsty',
  };
}

export interface TreeLevelProgress {
  pointsInLevel: number;
  pointsPerLevel: number;
  percent: number;
  isMaxLevel: boolean;
  pointsToNext: number;
}

export function getTreeLevelProgress(treeState: TreeState): TreeLevelProgress {
  const pointsPerLevel = 4;
  if (treeState.level >= 5) {
    return {
      pointsInLevel: pointsPerLevel,
      pointsPerLevel,
      percent: 100,
      isMaxLevel: true,
      pointsToNext: 0,
    };
  }
  const thresholdFloor = (treeState.level - 1) * pointsPerLevel;
  const pointsInLevel = Math.max(
    0,
    Math.min(pointsPerLevel, treeState.growthPoints - thresholdFloor)
  );
  return {
    pointsInLevel,
    pointsPerLevel,
    percent: Math.round((pointsInLevel / pointsPerLevel) * 100),
    isMaxLevel: false,
    pointsToNext: Math.max(0, pointsPerLevel - pointsInLevel),
  };
}

export interface LatestWeekComparison {
  latest: WeeklyEntry | null;
  previous: WeeklyEntry | null;
  followerDelta: number | null;
  reachDelta: number | null;
}

export function getLatestWeekComparison(
  entries: WeeklyEntry[]
): LatestWeekComparison {
  if (entries.length === 0) {
    return {
      latest: null,
      previous: null,
      followerDelta: null,
      reachDelta: null,
    };
  }
  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  return {
    latest,
    previous,
    followerDelta: previous ? latest.followers - previous.followers : null,
    reachDelta: previous ? latest.reach - previous.reach : null,
  };
}
