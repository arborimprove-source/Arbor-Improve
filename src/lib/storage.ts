import {
  ArborExportData,
  Badge,
  Goal,
  PlanType,
  Profile,
  StoredAppState,
  TreeLevel,
  TreeState,
  TreeType,
  WeeklyEntry,
} from '../types';
import { computeAllEarnedBadgeKeys } from './badges';
import {
  calculateWeeklyScore,
  recalculateTreeStateFromEntries,
  validateEmail,
} from './calculations';
import { addDaysISO, formatDateISO, getMondayISO } from './dateUtils';

const STORAGE_VERSION = 1;
const STORAGE_KEY = 'arbor_improve_state_v2';

// Previous/legacy storage keys cleared on fresh start or reset
const LEGACY_KEYS = [
  'arbor_improve_state_v1',
  'arbor_improve_profile_v1',
  'arbor_improve_entries_v1',
  'arbor_improve_tree_state_v1',
  'arbor_improve_badges_v1',
  'arbor_improve_goals_v1',
  'arbor_improve_waitlist_v1',
] as const;

const DEFAULT_PROFILE: Profile = {
  displayName: 'Creator',
  plan: 'free',
  treeType: 'olive',
};

const DEFAULT_TREE_STATE: TreeState = {
  level: 1,
  growthPoints: 0,
  isThirsty: false,
};

function createEmptyState(): StoredAppState {
  return {
    version: STORAGE_VERSION,
    profile: { ...DEFAULT_PROFILE },
    weeklyEntries: [],
    treeState: { ...DEFAULT_TREE_STATE },
    badges: [],
    goals: [],
    waitlistEmails: [],
    savedCalendarIds: [],
  };
}

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function normalizeTreeType(raw: unknown): TreeType {
  if (raw === 'palm' || raw === 'datePalm') return 'datePalm';
  if (raw === 'pomegranate') return 'pomegranate';
  if (raw === 'fig') return 'fig';
  return 'olive';
}

function sanitizeProfile(raw: unknown): Profile {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROFILE };
  const obj = raw as Record<string, unknown>;
  const displayName =
    typeof obj.displayName === 'string' && obj.displayName.trim()
      ? obj.displayName.trim().slice(0, 40)
      : DEFAULT_PROFILE.displayName;
  const plan: PlanType = obj.plan === 'paid' ? 'paid' : 'free';
  const treeType = normalizeTreeType(obj.treeType);
  return {
    displayName,
    plan,
    treeType: plan === 'free' ? 'olive' : treeType,
  };
}

function sanitizeNumber(val: unknown, fallback = 0): number {
  if (typeof val !== 'number' || !Number.isFinite(val) || val < 0) return fallback;
  return Math.round(val);
}

function sanitizeEntry(raw: unknown): WeeklyEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.weekStart !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(obj.weekStart)) {
    return null;
  }
  return {
    id: typeof obj.id === 'string' && obj.id ? obj.id : createId('wk'),
    weekStart: obj.weekStart,
    followers: sanitizeNumber(obj.followers),
    reach: sanitizeNumber(obj.reach),
    likes: sanitizeNumber(obj.likes),
    posts: sanitizeNumber(obj.posts),
    score: Math.min(100, sanitizeNumber(obj.score)),
    isDemo: Boolean(obj.isDemo),
  };
}

function sanitizeTreeState(raw: unknown): TreeState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_TREE_STATE };
  const obj = raw as Record<string, unknown>;
  const rawLevel = sanitizeNumber(obj.level, 1);
  const level = Math.min(5, Math.max(1, rawLevel)) as TreeLevel;
  return {
    level,
    growthPoints: sanitizeNumber(obj.growthPoints, 0),
    isThirsty: Boolean(obj.isThirsty),
  };
}

function sanitizeBadge(raw: unknown): Badge | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.badgeKey !== 'string' || !obj.badgeKey) return null;
  return {
    badgeKey: obj.badgeKey,
    earnedAt:
      typeof obj.earnedAt === 'string' && obj.earnedAt
        ? obj.earnedAt
        : new Date().toISOString(),
  };
}

function sanitizeGoal(raw: unknown): Goal | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.title !== 'string' || !obj.title.trim()) return null;
  const status =
    obj.status === 'completed' || obj.status === 'paused' ? obj.status : 'active';
  return {
    id: typeof obj.id === 'string' && obj.id ? obj.id : createId('goal'),
    title: obj.title.trim(),
    targetFollowers: Math.max(1, sanitizeNumber(obj.targetFollowers, 100)),
    startFollowers: sanitizeNumber(obj.startFollowers, 0),
    startDate:
      typeof obj.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.startDate)
        ? obj.startDate
        : formatDateISO(new Date()),
    endDate:
      typeof obj.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(obj.endDate)
        ? obj.endDate
        : addDaysISO(formatDateISO(new Date()), 60),
    status,
    isDemo: Boolean(obj.isDemo),
  };
}

function clearLegacyKeys(): void {
  try {
    LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Ignore storage access errors
  }
}

function readState(): StoredAppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      clearLegacyKeys();
      return createEmptyState();
    }
    const parsed = JSON.parse(raw) as Partial<StoredAppState>;
    if (!parsed || typeof parsed !== 'object') {
      return createEmptyState();
    }

    const entries = Array.isArray(parsed.weeklyEntries)
      ? parsed.weeklyEntries
          .map(sanitizeEntry)
          .filter((e): e is WeeklyEntry => e !== null)
          .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
      : [];

    const badgesRaw = Array.isArray(parsed.badges)
      ? parsed.badges.map(sanitizeBadge).filter((b): b is Badge => b !== null)
      : [];
    // Deduplicate badges cleanly
    const seenBadges = new Set<string>();
    const badges: Badge[] = [];
    for (const b of badgesRaw) {
      if (!seenBadges.has(b.badgeKey)) {
        seenBadges.add(b.badgeKey);
        badges.push(b);
      }
    }

    const goals = Array.isArray(parsed.goals)
      ? parsed.goals.map(sanitizeGoal).filter((g): g is Goal => g !== null)
      : [];

    const waitlistEmails = Array.isArray(parsed.waitlistEmails)
      ? Array.from(
          new Set(
            parsed.waitlistEmails
              .filter((e): e is string => typeof e === 'string')
              .map((e) => e.trim().toLowerCase())
              .filter(Boolean)
          )
        )
      : [];

    const savedCalendarIds = Array.isArray(parsed.savedCalendarIds)
      ? Array.from(
          new Set(
            parsed.savedCalendarIds.filter(
              (id): id is string => typeof id === 'string' && Boolean(id.trim())
            )
          )
        )
      : [];

    return {
      version: STORAGE_VERSION,
      profile: sanitizeProfile(parsed.profile),
      weeklyEntries: entries,
      treeState: sanitizeTreeState(parsed.treeState),
      badges,
      goals,
      waitlistEmails,
      savedCalendarIds,
    };
  } catch {
    return createEmptyState();
  }
}

function writeState(state: StoredAppState): void {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      version: STORAGE_VERSION,
    })
  );
}

function recomputeAndPersist(state: StoredAppState): {
  state: StoredAppState;
  newlyEarnedBadges: Badge[];
} {
  const sorted = [...state.weeklyEntries].sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );
  const recalculatedEntries: WeeklyEntry[] = [];

  for (const item of sorted) {
    const breakdown = calculateWeeklyScore(
      {
        followers: item.followers,
        reach: item.reach,
        likes: item.likes,
        posts: item.posts,
      },
      recalculatedEntries
    );
    recalculatedEntries.push({
      ...item,
      score: breakdown.score,
    });
  }

  const treeState = recalculateTreeStateFromEntries(recalculatedEntries);

  const existingKeys = new Set(state.badges.map((b) => b.badgeKey));
  const earnedKeys = computeAllEarnedBadgeKeys(recalculatedEntries, treeState);
  const now = new Date().toISOString();
  const nextBadges = [...state.badges];
  const newlyEarnedBadges: Badge[] = [];

  for (const key of earnedKeys) {
    if (!existingKeys.has(key)) {
      const badge: Badge = { badgeKey: key, earnedAt: now };
      nextBadges.push(badge);
      newlyEarnedBadges.push(badge);
    }
  }

  const latestFollowers =
    recalculatedEntries.length > 0
      ? recalculatedEntries[recalculatedEntries.length - 1].followers
      : null;

  const updatedGoals =
    latestFollowers === null
      ? state.goals
      : state.goals.map((g) =>
          g.status === 'active' && latestFollowers >= g.targetFollowers
            ? { ...g, status: 'completed' as const }
            : g
        );

  const nextState: StoredAppState = {
    ...state,
    weeklyEntries: recalculatedEntries,
    treeState,
    badges: nextBadges,
    goals: updatedGoals,
  };

  writeState(nextState);
  return { state: nextState, newlyEarnedBadges };
}

export function getCurrentWeekMonday(): string {
  return getMondayISO(new Date());
}

export function getProfile(): Profile {
  return readState().profile;
}

export function saveProfile(nextProfile: Profile): Profile {
  const state = readState();
  const sanitized = sanitizeProfile(nextProfile);
  writeState({ ...state, profile: sanitized });
  return sanitized;
}

export function setPlan(plan: PlanType): Profile {
  const current = getProfile();
  return saveProfile({
    ...current,
    plan,
    treeType: plan === 'free' ? 'olive' : current.treeType,
  });
}

export function getEntries(): WeeklyEntry[] {
  return readState().weeklyEntries;
}

export function saveEntry(input: {
  weekStart: string;
  followers: number;
  reach: number;
  likes: number;
  posts: number;
  isDemo?: boolean;
}): {
  entry: WeeklyEntry;
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  newlyEarnedBadges: Badge[];
} {
  const state = readState();
  const entries = [...state.weeklyEntries];
  const idx = entries.findIndex((e) => e.weekStart === input.weekStart);

  const id = idx >= 0 ? entries[idx].id : createId('wk');
  const nextEntry: WeeklyEntry = {
    id,
    weekStart: input.weekStart,
    followers: Math.max(0, Math.round(input.followers)),
    reach: Math.max(0, Math.round(input.reach)),
    likes: Math.max(0, Math.round(input.likes)),
    posts: Math.max(0, Math.round(input.posts)),
    score: 0,
    isDemo: Boolean(input.isDemo),
  };

  if (idx >= 0) {
    entries[idx] = nextEntry;
  } else {
    entries.push(nextEntry);
  }

  const synced = recomputeAndPersist({ ...state, weeklyEntries: entries });
  const saved =
    synced.state.weeklyEntries.find((e) => e.weekStart === input.weekStart) || nextEntry;

  return {
    entry: saved,
    entries: synced.state.weeklyEntries,
    treeState: synced.state.treeState,
    badges: synced.state.badges,
    newlyEarnedBadges: synced.newlyEarnedBadges,
  };
}

export function updateEntry(
  id: string,
  patch: Partial<Pick<WeeklyEntry, 'followers' | 'reach' | 'likes' | 'posts'>>
): {
  entry: WeeklyEntry | null;
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  newlyEarnedBadges: Badge[];
} {
  const state = readState();
  const idx = state.weeklyEntries.findIndex((e) => e.id === id);
  if (idx < 0) {
    return {
      entry: null,
      entries: state.weeklyEntries,
      treeState: state.treeState,
      badges: state.badges,
      newlyEarnedBadges: [],
    };
  }

  const current = state.weeklyEntries[idx];
  const updated: WeeklyEntry = {
    ...current,
    followers:
      typeof patch.followers === 'number'
        ? Math.max(0, Math.round(patch.followers))
        : current.followers,
    reach:
      typeof patch.reach === 'number'
        ? Math.max(0, Math.round(patch.reach))
        : current.reach,
    likes:
      typeof patch.likes === 'number'
        ? Math.max(0, Math.round(patch.likes))
        : current.likes,
    posts:
      typeof patch.posts === 'number'
        ? Math.max(0, Math.round(patch.posts))
        : current.posts,
    isDemo: false,
  };

  const entries = [...state.weeklyEntries];
  entries[idx] = updated;

  const synced = recomputeAndPersist({ ...state, weeklyEntries: entries });
  const saved = synced.state.weeklyEntries.find((e) => e.id === id) || updated;

  return {
    entry: saved,
    entries: synced.state.weeklyEntries,
    treeState: synced.state.treeState,
    badges: synced.state.badges,
    newlyEarnedBadges: synced.newlyEarnedBadges,
  };
}

export function getTreeState(): TreeState {
  return readState().treeState;
}

export function saveTreeState(treeState: TreeState): TreeState {
  const state = readState();
  const sanitized = sanitizeTreeState(treeState);
  writeState({ ...state, treeState: sanitized });
  return sanitized;
}

export function getBadges(): Badge[] {
  return readState().badges;
}

export function saveBadge(badgeKey: string): Badge[] {
  const state = readState();
  if (state.badges.some((b) => b.badgeKey === badgeKey)) {
    return state.badges;
  }
  const nextBadges: Badge[] = [
    ...state.badges,
    { badgeKey, earnedAt: new Date().toISOString() },
  ];
  writeState({ ...state, badges: nextBadges });
  return nextBadges;
}

export function getGoals(): Goal[] {
  return readState().goals;
}

export function saveGoal(goalInput: {
  id?: string;
  title: string;
  targetFollowers: number;
  startFollowers?: number;
  days?: number;
  startDate?: string;
  endDate?: string;
  status?: Goal['status'];
  isDemo?: boolean;
}): Goal[] {
  const state = readState();
  const goals = [...state.goals];
  const entries = state.weeklyEntries;
  const latestFollowers = entries.length > 0 ? entries[entries.length - 1].followers : 0;

  const today = formatDateISO(new Date());
  const startDate = goalInput.startDate || today;
  const endDate =
    goalInput.endDate ||
    addDaysISO(startDate, Math.max(1, Math.round(goalInput.days ?? 60)));

  const startFollowers =
    typeof goalInput.startFollowers === 'number'
      ? Math.max(0, Math.round(goalInput.startFollowers))
      : latestFollowers;
  const targetFollowers = Math.max(1, Math.round(goalInput.targetFollowers));
  const status: Goal['status'] =
    goalInput.status ?? (latestFollowers >= targetFollowers ? 'completed' : 'active');

  if (goalInput.id) {
    const idx = goals.findIndex((g) => g.id === goalInput.id);
    if (idx >= 0) {
      const existing = goals[idx];
      const preservedStartDate = goalInput.startDate || existing.startDate;
      const preservedEndDate =
        goalInput.endDate ||
        addDaysISO(preservedStartDate, Math.max(1, Math.round(goalInput.days ?? 60)));
      const preservedStartFollowers =
        typeof goalInput.startFollowers === 'number'
          ? Math.max(0, Math.round(goalInput.startFollowers))
          : existing.startFollowers;
      const nextStatus: Goal['status'] =
        goalInput.status ??
        (latestFollowers >= targetFollowers ? 'completed' : existing.status);

      goals[idx] = {
        ...existing,
        title: goalInput.title.trim(),
        targetFollowers,
        startFollowers: preservedStartFollowers,
        startDate: preservedStartDate,
        endDate: preservedEndDate,
        status: nextStatus,
        isDemo: goalInput.isDemo ?? existing.isDemo,
      };
      writeState({ ...state, goals });
      return goals;
    }
  }

  const newGoal: Goal = {
    id: createId('goal'),
    title: goalInput.title.trim(),
    targetFollowers,
    startFollowers,
    startDate,
    endDate,
    status,
    isDemo: Boolean(goalInput.isDemo),
  };
  goals.unshift(newGoal);
  writeState({ ...state, goals });
  return goals;
}

export function deleteGoal(goalId: string): Goal[] {
  const state = readState();
  const goals = state.goals.filter((g) => g.id !== goalId);
  writeState({ ...state, goals });
  return goals;
}

export function getWaitlistEmails(): string[] {
  return readState().waitlistEmails;
}

export function saveWaitlistEmail(email: string): {
  ok: boolean;
  error?: string;
  emails: string[];
} {
  const err = validateEmail(email);
  const state = readState();
  if (err) {
    return { ok: false, error: err, emails: state.waitlistEmails };
  }
  const normalized = email.trim().toLowerCase();
  if (state.waitlistEmails.includes(normalized)) {
    return {
      ok: false,
      error: 'This email is already on the waitlist.',
      emails: state.waitlistEmails,
    };
  }
  const nextEmails = [...state.waitlistEmails, normalized];
  writeState({ ...state, waitlistEmails: nextEmails });
  return { ok: true, emails: nextEmails };
}

export function getSavedCalendarIds(): string[] {
  return readState().savedCalendarIds;
}

export function toggleSavedCalendarId(calendarId: string): string[] {
  const state = readState();
  const exists = state.savedCalendarIds.includes(calendarId);
  const nextIds = exists
    ? state.savedCalendarIds.filter((id) => id !== calendarId)
    : [...state.savedCalendarIds, calendarId];
  writeState({ ...state, savedCalendarIds: nextIds });
  return nextIds;
}

export function exportAllData(): ArborExportData {
  const state = readState();
  return {
    version: state.version,
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    weeklyEntries: state.weeklyEntries,
    treeState: state.treeState,
    badges: state.badges,
    goals: state.goals,
    waitlistEmails: state.waitlistEmails,
    savedCalendarIds: state.savedCalendarIds,
  };
}

export function resetAllData(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  LEGACY_KEYS.forEach((k) => window.localStorage.removeItem(k));
}

export function loadDemoData(): {
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  goals: Goal[];
} {
  const state = readState();
  const currentMonday = getCurrentWeekMonday();

  const sampleWeeks = [
    { offsetWeeks: -7, followers: 320, reach: 640, likes: 48, posts: 2 },
    { offsetWeeks: -6, followers: 342, reach: 780, likes: 62, posts: 3 },
    { offsetWeeks: -5, followers: 368, reach: 890, likes: 71, posts: 3 },
    { offsetWeeks: -4, followers: 395, reach: 1050, likes: 89, posts: 4 },
    { offsetWeeks: -3, followers: 430, reach: 1240, likes: 104, posts: 4 },
    { offsetWeeks: -2, followers: 445, reach: 960, likes: 78, posts: 2 },
    { offsetWeeks: -1, followers: 488, reach: 1480, likes: 132, posts: 4 },
    { offsetWeeks: 0, followers: 524, reach: 1620, likes: 149, posts: 4 },
  ];

  const demoEntries: WeeklyEntry[] = sampleWeeks.map((item, idx) => ({
    id: `wk_demo_${idx + 1}`,
    weekStart: addDaysISO(currentMonday, item.offsetWeeks * 7),
    followers: item.followers,
    reach: item.reach,
    likes: item.likes,
    posts: item.posts,
    score: 0,
    isDemo: true,
  }));

  const today = formatDateISO(new Date());
  const demoGoal: Goal = {
    id: 'goal_demo_1',
    title: 'Reach 1,000 followers with consistent Jummah & reflection reels',
    targetFollowers: 1000,
    startFollowers: 320,
    startDate: addDaysISO(today, -28),
    endDate: addDaysISO(today, 32),
    status: 'active',
    isDemo: true,
  };

  // Preserve any real user-created goals, replace only prior demo goals/entries
  const realGoals = state.goals.filter((g) => !g.isDemo);

  const synced = recomputeAndPersist({
    ...state,
    weeklyEntries: demoEntries,
    badges: [],
    goals: [demoGoal, ...realGoals],
  });

  return {
    entries: synced.state.weeklyEntries,
    treeState: synced.state.treeState,
    badges: synced.state.badges,
    goals: synced.state.goals,
  };
}

export function addFakeWeek(kind: 'good' | 'average' | 'thirsty'): {
  entry: WeeklyEntry;
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  newlyEarnedBadges: Badge[];
} {
  const existing = getEntries();
  const latest = existing[existing.length - 1];
  const weekStart = latest ? addDaysISO(latest.weekStart, 7) : getCurrentWeekMonday();

  const baseFollowers = latest ? latest.followers : 250;
  const recentAvgReach =
    existing.length > 0
      ? Math.round(
          existing.slice(-4).reduce((sum, e) => sum + e.reach, 0) /
            Math.min(4, existing.length)
        )
      : 800;

  let followers = baseFollowers;
  let reach = recentAvgReach;
  let likes = 60;
  let posts = 2;

  if (kind === 'good') {
    followers = Math.max(baseFollowers + 12, Math.round(baseFollowers * 1.035));
    reach = Math.round(recentAvgReach * 1.3);
    likes = Math.max(85, Math.round(reach * 0.09));
    posts = 4;
  } else if (kind === 'average') {
    followers = baseFollowers + Math.max(2, Math.round(baseFollowers * 0.008));
    reach = Math.round(recentAvgReach * 0.9);
    likes = Math.max(40, Math.round(reach * 0.07));
    posts = 2;
  } else {
    followers = Math.max(0, baseFollowers - 2);
    reach = Math.max(40, Math.round(recentAvgReach * 0.35));
    likes = Math.max(5, Math.round(reach * 0.04));
    posts = 0;
  }

  return saveEntry({
    weekStart,
    followers,
    reach,
    likes,
    posts,
    isDemo: true,
  });
}

export function clearDemoData(): {
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  goals: Goal[];
} {
  const state = readState();
  const realEntries = state.weeklyEntries.filter((e) => !e.isDemo);
  const realGoals = state.goals.filter((g) => !g.isDemo);

  const synced = recomputeAndPersist({
    ...state,
    weeklyEntries: realEntries,
    badges: [],
    goals: realGoals,
  });

  return {
    entries: synced.state.weeklyEntries,
    treeState: synced.state.treeState,
    badges: synced.state.badges,
    goals: synced.state.goals,
  };
}
