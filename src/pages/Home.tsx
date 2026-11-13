import {
  ArrowRight,
  CalendarDays,
  Droplets,
  Edit3,
  PlusCircle,
  Share2,
  Target,
} from 'lucide-react';
import { TreeIllustration } from '../components/tree/TreeIllustration';
import { getNextUpcomingCalendarHighlight } from '../lib/calendar';
import {
  BADGE_DEFINITIONS,
  getBadgeByKey,
  getNextSuggestedMilestone,
} from '../lib/badges';
import {
  calculateBestStreak,
  calculatePostingStreak,
  getEncouragingMessage,
  getLatestWeekComparison,
  getTreeLevelProgress,
} from '../lib/calculations';
import { daysRemainingFrom, formatShortDate } from '../lib/dateUtils';
import {
  AppTab,
  Badge,
  Goal,
  Profile,
  TREE_LEVEL_NAMES,
  TREE_TYPES,
  TreeLevel,
  TreeState,
  WeeklyEntry,
} from '../types';

interface HomePageProps {
  currentWeekMonday: string;
  profile: Profile;
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  goals: Goal[];
  onNavigate: (tab: AppTab) => void;
  onShareCard?: () => void;
}

const TREE_STAGE_ORDER: { level: TreeLevel; shortLabel: string }[] = [
  { level: 1, shortLabel: 'Seed' },
  { level: 2, shortLabel: 'Sapling' },
  { level: 3, shortLabel: 'Healthy' },
  { level: 4, shortLabel: 'Blooming' },
  { level: 5, shortLabel: 'Fruitful' },
];

function formatSignedDelta(delta: number | null, unitSuffix = ''): string {
  if (delta === null) return 'First logged week';
  if (delta === 0) return 'Even with prior week';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toLocaleString()}${unitSuffix} vs prior week`;
}

export function HomePage({
  currentWeekMonday,
  profile,
  entries,
  treeState,
  badges,
  goals,
  onNavigate,
  onShareCard,
}: HomePageProps) {
  const treeDef = TREE_TYPES.find((t) => t.id === profile.treeType) ?? TREE_TYPES[0];
  const levelProgress = getTreeLevelProgress(treeState);
  const comparison = getLatestWeekComparison(entries);
  const currentWeekEntry = entries.find((e) => e.weekStart === currentWeekMonday) ?? null;
  const isCalibrating = entries.length > 0 && entries.length <= 3;

  const currentStreak = calculatePostingStreak(entries);
  const bestStreak = calculateBestStreak(entries);
  const nextMilestone = getNextSuggestedMilestone(badges);
  const calendarHighlight = getNextUpcomingCalendarHighlight();
  const badgeProgressPercent = Math.round(
    (badges.length / BADGE_DEFINITIONS.length) * 100
  );
  const recentEarnedBadges = [...badges]
    .reverse()
    .slice(0, 3)
    .map((b) => getBadgeByKey(b.badgeKey))
    .filter((def): def is NonNullable<typeof def> => Boolean(def));

  const activeGoal = goals.find((g) => g.status === 'active') ?? null;
  const completedGoal = !activeGoal
    ? goals.find((g) => g.status === 'completed') ?? null
    : null;

  const latestFollowers = comparison.latest?.followers ?? 0;
  const activeGoalPercent = activeGoal
    ? Math.min(
        100,
        Math.max(
          0,
          activeGoal.targetFollowers <= activeGoal.startFollowers
            ? 100
            : Math.round(
                ((latestFollowers - activeGoal.startFollowers) /
                  (activeGoal.targetFollowers - activeGoal.startFollowers)) *
                  100
              )
        )
      )
    : 0;

  const encouraging = comparison.latest
    ? getEncouragingMessage(comparison.latest.score, isCalibrating)
    : null;

  const recentEntries = [...entries]
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, 5);

  return (
    <div className="space-y-16 lg:space-y-24">
      {/* 1. Welcome Header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm text-ink-secondary tabular-nums">
            Week of {formatShortDate(currentWeekMonday)} ·{' '}
            {entries.length === 0
              ? 'No weeks logged yet'
              : `${entries.length} ${entries.length === 1 ? 'week' : 'weeks'} logged`}
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink sm:text-5xl">
            As-salamu alaykum,{' '}
            <span className="text-ink-secondary">{profile.displayName}</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('add')}
          className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          {currentWeekEntry ? (
            <>
              <Edit3 className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Edit weekly progress</span>
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Log this week</span>
            </>
          )}
        </button>
      </header>

      {/* 2. Signature Botanical Tree Centerpiece */}
      <section
        aria-label="Your performance tree"
        className={`relative overflow-hidden rounded-2xl border border-sand px-6 py-10 sm:px-10 sm:py-14 lg:px-14 ${
          treeState.isThirsty
            ? 'arbor-tree-horizon-thirsty bg-secondary'
            : 'arbor-tree-horizon bg-secondary'
        }`}
      >
        {/* Subtle Luminous Horizon Arc matching reference aesthetic */}
        <svg
          viewBox="0 0 1100 120"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-50 select-none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 110 Q550 10 1100 110"
            stroke={treeState.isThirsty ? 'rgba(215, 168, 94, 0.28)' : 'rgba(182, 237, 101, 0.24)'}
            strokeWidth="1.2"
          />
        </svg>

        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          {/* Generous Botanical Stage */}
          <div className="pointer-events-none flex select-none items-center justify-center lg:col-span-6">
            <TreeIllustration
              treeType={profile.treeType}
              level={treeState.level}
              isThirsty={treeState.isThirsty}
              className="h-60 w-64 sm:h-72 sm:w-80"
            />
          </div>

          {/* Editorial Tree Status & Stage Progression */}
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span
                className={`font-medium ${
                  treeState.isThirsty ? 'text-thirsty' : 'text-forest'
                }`}
              >
                Level {treeState.level} · {treeDef.name}
              </span>
              {treeState.isThirsty ? (
                <span className="inline-flex items-center gap-1.5 text-thirsty font-medium">
                  <Droplets className="h-4 w-4" aria-hidden="true" />
                  <span>Thirsty state</span>
                </span>
              ) : (
                <span className="text-ink-secondary tabular-nums">
                  {treeState.growthPoints} growth pts
                </span>
              )}
            </div>

            <h2 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              {TREE_LEVEL_NAMES[treeState.level]} Stage
            </h2>

            {/* Refined Minimalist Progress Track */}
            <div
              role="progressbar"
              aria-valuenow={levelProgress.percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Growth progress toward next tree level"
              className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
            >
              <div
                className={`h-full rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                  treeState.isThirsty ? 'bg-thirsty' : 'bg-forest'
                }`}
                style={{ width: `${levelProgress.percent}%` }}
              />
            </div>

            <p className="mt-2.5 text-xs text-ink-secondary tabular-nums">
              {levelProgress.isMaxLevel
                ? `Fruitful stage complete · ${treeState.growthPoints} total points`
                : `${levelProgress.pointsInLevel} of ${levelProgress.pointsPerLevel} points toward Level ${treeState.level + 1}`}
            </p>

            {/* 5-Stage Progression Ladder */}
            <div className="mt-6 grid grid-cols-5 gap-2">
              {TREE_STAGE_ORDER.map(({ level: lvl, shortLabel }) => {
                const reached = treeState.level >= lvl;
                const isCurrent = treeState.level === lvl;
                return (
                  <div key={lvl} className="space-y-1.5">
                    <div
                      className={`h-[3px] w-full rounded-full ${
                        reached
                          ? treeState.isThirsty && isCurrent
                            ? 'bg-thirsty'
                            : 'bg-forest'
                          : 'bg-white/[0.08]'
                      }`}
                    />
                    <p
                      className={`text-xs whitespace-nowrap ${
                        isCurrent
                          ? 'font-medium text-ink'
                          : reached
                          ? 'text-emerald'
                          : 'text-muted'
                      }`}
                    >
                      {shortLabel}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Encouraging Reflection */}
            <div className="mt-7 border-t border-sand pt-6 text-sm leading-relaxed text-ink-secondary">
              {entries.length === 0 ? (
                <p>
                  Your {treeDef.name.toLowerCase()} seed is resting in calm soil.
                  Log your first weekly check-in to begin growing with barakah.
                </p>
              ) : treeState.isThirsty ? (
                <div className="space-y-4">
                  <p className="text-bark">
                    Every tree has quiet seasons. Your Level {treeState.level} stays
                    safe — publish one post and log a week to water it.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('add')}
                    className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap"
                  >
                    Water my tree
                  </button>
                </div>
              ) : encouraging ? (
                <p>
                  <span className="font-medium text-ink">{encouraging.headline}</span>{' '}
                  {encouraging.subtext}
                </p>
              ) : null}

              {onShareCard && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={onShareCard}
                    className="inline-flex min-h-[40px] items-center gap-2 text-xs font-medium text-forest hover:text-forest-deep"
                  >
                    <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Share tree Story card</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Key Statistics Strip (Clean hairline editorial grid, not 4 boxed cards) */}
      <section aria-label="Key creator statistics" className="border-y border-sand py-8 sm:py-10">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-10">
          <div>
            <p className="text-xs font-medium text-muted">Followers</p>
            <p className="mt-2 font-display-num text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {(comparison.latest?.followers ?? 0).toLocaleString()}
            </p>
            <p
              className={`mt-2 text-xs tabular-nums ${
                comparison.followerDelta !== null && comparison.followerDelta > 0
                  ? 'text-forest'
                  : 'text-ink-secondary'
              }`}
            >
              {comparison.latest
                ? formatSignedDelta(comparison.followerDelta)
                : 'Ready for week 1'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted">Weekly reach</p>
            <p className="mt-2 font-display-num text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {(comparison.latest?.reach ?? 0).toLocaleString()}
            </p>
            <p
              className={`mt-2 text-xs tabular-nums ${
                entries.length > 3 &&
                comparison.reachDelta !== null &&
                comparison.reachDelta > 0
                  ? 'text-forest'
                  : 'text-ink-secondary'
              }`}
            >
              {!comparison.latest
                ? '0 check-ins logged'
                : entries.length <= 3
                ? 'Baseline building (weeks 1–3)'
                : formatSignedDelta(comparison.reachDelta)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted">Weekly likes</p>
            <p className="mt-2 font-display-num text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {(comparison.latest?.likes ?? 0).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-ink-secondary tabular-nums">
              {comparison.latest
                ? `Score ${comparison.latest.score}/100`
                : 'From Insights'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted">Posts published</p>
            <p className="mt-2 font-display-num text-3xl font-medium tracking-tight text-ink sm:text-4xl">
              {(comparison.latest?.posts ?? 0).toLocaleString()}
            </p>
            <p className="mt-2 text-xs text-ink-secondary tabular-nums">
              {comparison.latest
                ? comparison.latest.posts >= 4
                  ? 'Consistency protected'
                  : '4+ posts shields score'
                : 'This week'}
            </p>
          </div>
        </div>
      </section>

      {/* 4. First-Time Quick Start OR Historical Records */}
      {!comparison.latest ? (
        <section aria-label="Getting started">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium text-forest">How it works</p>
              <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">
                Start in under 30 seconds
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('add')}
              className="inline-flex min-h-[42px] items-center gap-2 text-sm font-medium text-forest hover:text-forest-deep whitespace-nowrap self-start sm:self-auto"
            >
              <span>Log your first week</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <ol className="mt-8 divide-y divide-sand border-t border-sand">
            <li className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-12 sm:items-baseline">
              <span className="font-display-num text-sm font-medium text-muted sm:col-span-2">
                01
              </span>
              <span className="font-display text-lg font-medium text-ink sm:col-span-4">
                Enter four Insights numbers
              </span>
              <span className="text-sm text-ink-secondary sm:col-span-6">
                Type Followers, Reach, Likes, and Posts once a week. No Instagram
                passwords or API logins.
              </span>
            </li>
            <li className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-12 sm:items-baseline">
              <span className="font-display-num text-sm font-medium text-muted sm:col-span-2">
                02
              </span>
              <span className="font-display text-lg font-medium text-ink sm:col-span-4">
                Personal baseline scoring
              </span>
              <span className="text-sm text-ink-secondary sm:col-span-6">
                Your weekly score compares you only against your own recent weeks —
                never against viral accounts.
              </span>
            </li>
            <li className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-12 sm:items-baseline">
              <span className="font-display-num text-sm font-medium text-muted sm:col-span-2">
                03
              </span>
              <span className="font-display text-lg font-medium text-ink sm:col-span-4">
                Steady botanical growth
              </span>
              <span className="text-sm text-ink-secondary sm:col-span-6">
                Earn growth points every week you show up. Your tree level stays safe
                even during quiet weeks.
              </span>
            </li>
          </ol>
        </section>
      ) : (
        <section aria-label="Historical weekly records">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-medium text-ink">
                Historical records
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Your most recent weekly check-ins
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-forest hover:text-forest-deep whitespace-nowrap"
            >
              <span>View full reports</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-6 overflow-x-auto border-t border-sand">
            <table className="w-full min-w-[520px] text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-sand text-xs font-medium text-muted">
                  <th className="py-3.5 pr-4 font-medium">Week</th>
                  <th className="py-3.5 px-3 text-right font-medium">Followers</th>
                  <th className="py-3.5 px-3 text-right font-medium">Reach</th>
                  <th className="py-3.5 px-3 text-right font-medium">Likes</th>
                  <th className="py-3.5 px-3 text-right font-medium">Posts</th>
                  <th className="py-3.5 pl-3 text-right font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {recentEntries.map((item) => {
                  const isCurrent = item.weekStart === currentWeekMonday;
                  return (
                    <tr key={item.id} className="hover:bg-surface/50">
                      <td className="py-4 pr-4 font-medium text-ink">
                        <span>{formatShortDate(item.weekStart)}</span>
                        {isCurrent && (
                          <button
                            type="button"
                            onClick={() => onNavigate('add')}
                            className="ml-2.5 text-xs font-medium text-forest underline underline-offset-4 hover:text-forest-deep"
                          >
                            Edit
                          </button>
                        )}
                        {item.isDemo && (
                          <span className="ml-2 text-xs text-muted">· demo</span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right text-ink-secondary">
                        {item.followers.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right text-ink-secondary">
                        {item.reach.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right text-ink-secondary">
                        {item.likes.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right text-ink-secondary">
                        {item.posts}
                      </td>
                      <td
                        className={`py-4 pl-3 text-right font-medium ${
                          item.score < 40 ? 'text-thirsty' : 'text-forest'
                        }`}
                      >
                        {item.score}/100
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 5. Secondary Creator Context (Two Spacious Hairline Columns) */}
      <section
        aria-label="Milestones, goals, streak, and calendar"
        className="grid grid-cols-1 gap-12 border-t border-sand pt-12 lg:grid-cols-2 lg:gap-16"
      >
        {/* Left: Posting Streak & Milestone Status */}
        <div className="space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-muted">Posting streak</p>
              <p className="mt-2 font-display-num text-3xl font-medium text-forest">
                {currentStreak} {currentStreak === 1 ? 'week' : 'weeks'}
              </p>
              <p className="mt-1 text-xs text-ink-secondary tabular-nums">
                Personal best: {bestStreak} {bestStreak === 1 ? 'week' : 'weeks'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted">Milestones</p>
              <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                {badges.length} / {BADGE_DEFINITIONS.length}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('profile')}
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-forest hover:text-forest-deep"
              >
                <span>View all badges</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-emerald transition-[width] duration-300"
              style={{ width: `${badgeProgressPercent}%` }}
            />
          </div>

          <div className="rounded-xl border border-sand bg-surface p-5">
            {nextMilestone ? (
              <>
                <p className="text-xs font-medium text-forest">Next milestone</p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {nextMilestone.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                  {nextMilestone.description}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-forest">
                Masha&apos;Allah — every milestone unlocked.
              </p>
            )}
          </div>

          {recentEarnedBadges.length > 0 && (
            <div className="space-y-3 border-t border-sand pt-6">
              <p className="text-xs font-medium text-muted">Recent milestones</p>
              <ul className="divide-y divide-sand">
                {recentEarnedBadges.map((badge) => (
                  <li key={badge.key} className="py-2.5">
                    <p className="text-sm font-medium text-ink">{badge.title}</p>
                    <p className="text-xs text-ink-secondary">{badge.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: Follower Goal & Islamic Calendar */}
        <div className="space-y-10">
          {/* Follower Goal */}
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-muted">
                <Target className="h-3.5 w-3.5 text-forest" aria-hidden="true" />
                <span>Follower goal</span>
              </p>
              <button
                type="button"
                onClick={() => onNavigate('goals')}
                className="text-xs font-medium text-forest hover:text-forest-deep whitespace-nowrap"
              >
                {activeGoal || completedGoal ? 'Manage goals' : 'Set a goal'}
              </button>
            </div>

            {activeGoal ? (
              <div className="mt-4">
                <p className="font-display text-lg font-medium text-ink">
                  {activeGoal.title}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-secondary tabular-nums">
                  <span>
                    {latestFollowers.toLocaleString()} /{' '}
                    {activeGoal.targetFollowers.toLocaleString()} followers
                  </span>
                  <span>{daysRemainingFrom(activeGoal.endDate)} days left</span>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-forest transition-[width] duration-300"
                    style={{ width: `${activeGoalPercent}%` }}
                  />
                </div>
              </div>
            ) : completedGoal ? (
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                <span className="font-medium text-forest">
                  Masha&apos;Allah, goal reached:
                </span>{' '}
                {completedGoal.title}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                Set a calm follower target with a realistic timeframe whenever you
                feel ready.
              </p>
            )}
          </div>

          {/* Islamic Calendar Highlight */}
          <div className="border-t border-sand pt-8">
            <div className="flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-muted">
                <CalendarDays className="h-3.5 w-3.5 text-emerald" aria-hidden="true" />
                <span>Islamic calendar</span>
              </p>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="text-xs font-medium text-forest hover:text-forest-deep whitespace-nowrap"
              >
                Open calendar
              </button>
            </div>

            <p className="mt-4 text-xs font-medium text-emerald">
              {calendarHighlight.timingLabel} · {calendarHighlight.entry.hijriLabel}
            </p>
            <p className="mt-1 font-display text-lg font-medium text-ink">
              {calendarHighlight.entry.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
              {calendarHighlight.entry.summary}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
