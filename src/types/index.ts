export type PlanType = 'free' | 'paid';

export type TreeType = 'olive' | 'datePalm' | 'pomegranate' | 'fig';

export type TreeLevel = 1 | 2 | 3 | 4 | 5;

export type AppTab =
  | 'home'
  | 'add'
  | 'reports'
  | 'goals'
  | 'profile'
  | 'calendar'
  | 'about';

export interface Profile {
  displayName: string;
  plan: PlanType;
  treeType: TreeType;
}

export interface WeeklyEntry {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  followers: number;
  reach: number;
  likes: number;
  posts: number;
  score: number;
  isDemo?: boolean;
}

export interface TreeState {
  level: TreeLevel;
  growthPoints: number;
  isThirsty: boolean;
}

export interface Badge {
  badgeKey: string;
  earnedAt: string; // ISO string
}

export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  title: string;
  targetFollowers: number;
  startFollowers: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: GoalStatus;
  isDemo?: boolean;
}

export interface StoredAppState {
  version: number;
  profile: Profile;
  weeklyEntries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  goals: Goal[];
  waitlistEmails: string[];
  savedCalendarIds: string[];
}

export interface ArborExportData {
  version: number;
  exportedAt: string;
  profile: Profile;
  weeklyEntries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  goals: Goal[];
  waitlistEmails: string[];
  savedCalendarIds: string[];
}

export interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  category: 'start' | 'followers' | 'consistency' | 'tree';
}

export interface TreeTypeDefinition {
  id: TreeType;
  name: string;
  fruitLabel: string;
  shortNote: string;
  isPaid: boolean;
}

export const TREE_TYPES: TreeTypeDefinition[] = [
  {
    id: 'olive',
    name: 'Olive Tree',
    fruitLabel: 'Olives',
    shortNote: 'Steady roots and evergreen calm.',
    isPaid: false,
  },
  {
    id: 'datePalm',
    name: 'Date Palm',
    fruitLabel: 'Dates',
    shortNote: 'Tall, resilient, and generous.',
    isPaid: true,
  },
  {
    id: 'pomegranate',
    name: 'Pomegranate Tree',
    fruitLabel: 'Pomegranates',
    shortNote: 'Delicate blossoms and ruby fruit.',
    isPaid: true,
  },
  {
    id: 'fig',
    name: 'Fig Tree',
    fruitLabel: 'Figs',
    shortNote: 'Wide shade and sweet harvest.',
    isPaid: true,
  },
];

export const TREE_LEVEL_NAMES: Record<TreeLevel, string> = {
  1: 'Seed',
  2: 'Sapling',
  3: 'Healthy Tree',
  4: 'Blooming Tree',
  5: 'Fruitful Tree',
};

export const INPUT_LIMITS = {
  followersMax: 100_000_000,
  reachMax: 500_000_000,
  likesMax: 100_000_000,
  postsMax: 500,
  displayNameMax: 40,
} as const;
