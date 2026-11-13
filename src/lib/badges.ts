import { Badge, BadgeDefinition, TreeState, WeeklyEntry } from '../types';
import { addDaysISO } from './dateUtils';

export const BADGE_CATEGORY_LABELS: Record<BadgeDefinition['category'], string> = {
  start: 'First step',
  consistency: 'Consistency',
  followers: 'Community',
  tree: 'Tree growth',
};

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: 'first_entry',
    title: 'First Seed Planted',
    description: 'Logged your very first weekly check-in.',
    category: 'start',
  },
  {
    key: 'streak_4',
    title: 'Four-Week Posting Streak',
    description: 'Posted at least once a week for four weeks in a row.',
    category: 'consistency',
  },
  {
    key: 'best_reach',
    title: 'Best Reach Ever',
    description: 'Surpassed your previous highest weekly reach.',
    category: 'consistency',
  },
  {
    key: 'followers_100',
    title: '100 Followers',
    description: 'Reached 100 people in your community.',
    category: 'followers',
  },
  {
    key: 'followers_500',
    title: '500 Followers',
    description: 'Reached 500 followers.',
    category: 'followers',
  },
  {
    key: 'followers_1000',
    title: '1,000 Followers',
    description: "Crossed 1,000 followers — masha'Allah.",
    category: 'followers',
  },
  {
    key: 'followers_5000',
    title: '5,000 Followers',
    description: 'Reached 5,000 followers.',
    category: 'followers',
  },
  {
    key: 'followers_10000',
    title: '10,000 Followers',
    description: 'Reached 10,000 followers.',
    category: 'followers',
  },
  {
    key: 'level_2',
    title: 'Sapling Stage',
    description: 'Your tree sprouted into a Sapling.',
    category: 'tree',
  },
  {
    key: 'level_3',
    title: 'Healthy Leaves',
    description: 'Your tree grew full green leaves.',
    category: 'tree',
  },
  {
    key: 'level_4',
    title: 'Blooming Tree',
    description: 'Your tree blossomed with flowers.',
    category: 'tree',
  },
  {
    key: 'level_5',
    title: 'Fruitful Harvest',
    description: 'Your tree reached Level 5 and bore fruit.',
    category: 'tree',
  },
];

export function getBadgeByKey(key: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.key === key);
}

export function computeAllEarnedBadgeKeys(
  entries: WeeklyEntry[],
  treeState: TreeState
): string[] {
  const earned = new Set<string>();
  const sorted = [...entries].sort((a, b) => a.weekStart.localeCompare(b.weekStart));

  if (sorted.length >= 1) {
    earned.add('first_entry');
  }

  const maxFollowers = sorted.reduce((max, e) => Math.max(max, e.followers), 0);
  if (maxFollowers >= 100) earned.add('followers_100');
  if (maxFollowers >= 500) earned.add('followers_500');
  if (maxFollowers >= 1000) earned.add('followers_1000');
  if (maxFollowers >= 5000) earned.add('followers_5000');
  if (maxFollowers >= 10000) earned.add('followers_10000');

  if (sorted.length >= 2) {
    let priorBest = sorted[0].reach;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].reach > priorBest) {
        earned.add('best_reach');
        break;
      }
      priorBest = Math.max(priorBest, sorted[i].reach);
    }
  }

  let consecutive = 0;
  let lastWeek: string | null = null;
  for (const e of sorted) {
    if (e.posts >= 1 && (lastWeek === null || addDaysISO(lastWeek, 7) === e.weekStart)) {
      consecutive += 1;
      if (consecutive >= 4) {
        earned.add('streak_4');
        break;
      }
    } else if (e.posts >= 1) {
      consecutive = 1;
    } else {
      consecutive = 0;
    }
    lastWeek = e.weekStart;
  }

  if (treeState.level >= 2) earned.add('level_2');
  if (treeState.level >= 3) earned.add('level_3');
  if (treeState.level >= 4) earned.add('level_4');
  if (treeState.level >= 5) earned.add('level_5');

  return Array.from(earned);
}

export function getNextSuggestedMilestone(earnedBadges: Badge[]): BadgeDefinition | null {
  const earnedSet = new Set(earnedBadges.map((b) => b.badgeKey));
  const priorityOrder = [
    'first_entry',
    'level_2',
    'streak_4',
    'best_reach',
    'followers_100',
    'level_3',
    'followers_500',
    'level_4',
    'followers_1000',
    'level_5',
    'followers_5000',
    'followers_10000',
  ];
  for (const key of priorityOrder) {
    if (!earnedSet.has(key)) {
      return getBadgeByKey(key) ?? null;
    }
  }
  return null;
}
