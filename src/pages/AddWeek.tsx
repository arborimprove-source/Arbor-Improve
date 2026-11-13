import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Droplets,
  Edit3,
  Sprout,
} from 'lucide-react';
import { TreeIllustration } from '../components/tree/TreeIllustration';
import { BADGE_DEFINITIONS } from '../lib/badges';
import {
  ScoreBreakdown,
  getEncouragingMessage,
  getGrowthDeltaForScore,
  getScoreBreakdownForWeek,
  validateWeeklyNumbers,
} from '../lib/calculations';
import { formatShortDate } from '../lib/dateUtils';
import {
  Badge,
  INPUT_LIMITS,
  Profile,
  TREE_LEVEL_NAMES,
  TREE_TYPES,
  TreeState,
  WeeklyEntry,
} from '../types';

interface AddWeekPageProps {
  currentWeekMonday: string;
  profile: Profile;
  entries: WeeklyEntry[];
  treeState: TreeState;
  onSaveWeek: (input: {
    weekStart: string;
    followers: number;
    reach: number;
    likes: number;
    posts: number;
  }) => {
    entry: WeeklyEntry;
    entries: WeeklyEntry[];
    treeState: TreeState;
    badges: Badge[];
    newlyEarnedBadges: Badge[];
  };
  onGoToHome: () => void;
  onGoToProfile: () => void;
}

interface SavedSummary {
  entry: WeeklyEntry;
  treeState: TreeState;
  breakdown: ScoreBreakdown;
  newlyEarnedBadges: Badge[];
  wasEdit: boolean;
}

export function AddWeekPage({
  currentWeekMonday,
  profile,
  entries,
  treeState,
  onSaveWeek,
  onGoToHome,
  onGoToProfile,
}: AddWeekPageProps) {
  const currentWeekEntry = entries.find((e) => e.weekStart === currentWeekMonday) ?? null;
  const priorEntries = entries
    .filter((e) => e.weekStart < currentWeekMonday)
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const previousWeekEntry =
    priorEntries.length > 0 ? priorEntries[priorEntries.length - 1] : null;

  const [followers, setFollowers] = useState<string>(() =>
    currentWeekEntry
      ? String(currentWeekEntry.followers)
      : previousWeekEntry
      ? String(previousWeekEntry.followers)
      : ''
  );
  const [reach, setReach] = useState<string>(() =>
    currentWeekEntry ? String(currentWeekEntry.reach) : ''
  );
  const [likes, setLikes] = useState<string>(() =>
    currentWeekEntry ? String(currentWeekEntry.likes) : ''
  );
  const [posts, setPosts] = useState<string>(() =>
    currentWeekEntry ? String(currentWeekEntry.posts) : ''
  );
  const [errors, setErrors] = useState<
    Partial<Record<'followers' | 'reach' | 'likes' | 'posts', string>>
  >({});
  const [savedSummary, setSavedSummary] = useState<SavedSummary | null>(null);

  // Sync form defaults if entries are loaded/reset from Testing tools
  useEffect(() => {
    if (entries.length === 0) {
      setSavedSummary(null);
      setFollowers('');
      setReach('');
      setLikes('');
      setPosts('');
      setErrors({});
      return;
    }

    if (currentWeekEntry) {
      setFollowers(String(currentWeekEntry.followers));
      setReach(String(currentWeekEntry.reach));
      setLikes(String(currentWeekEntry.likes));
      setPosts(String(currentWeekEntry.posts));
    } else if (previousWeekEntry) {
      setFollowers((prev) => (prev === '' ? String(previousWeekEntry.followers) : prev));
    }
  }, [
    entries.length,
    currentWeekEntry?.id,
    currentWeekEntry?.followers,
    currentWeekEntry?.reach,
    currentWeekEntry?.likes,
    currentWeekEntry?.posts,
    previousWeekEntry?.followers,
  ]);

  const isEditing = Boolean(currentWeekEntry);
  const treeDef = TREE_TYPES.find((t) => t.id === profile.treeType) ?? TREE_TYPES[0];
  const isCalibratingPreview = priorEntries.length < 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWeeklyNumbers({ followers, reach, likes, posts });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const numericInput = {
      followers: Number(followers.trim()),
      reach: Number(reach.trim()),
      likes: Number(likes.trim()),
      posts: Number(posts.trim()),
    };

    const wasEdit = Boolean(currentWeekEntry);
    const result = onSaveWeek({
      weekStart: currentWeekMonday,
      ...numericInput,
    });

    const breakdown = getScoreBreakdownForWeek(
      currentWeekMonday,
      numericInput,
      result.entries
    );

    setSavedSummary({
      entry: result.entry,
      treeState: result.treeState,
      breakdown,
      newlyEarnedBadges: result.newlyEarnedBadges,
      wasEdit,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (savedSummary) {
    const message = getEncouragingMessage(
      savedSummary.entry.score,
      savedSummary.breakdown.isCalibrating
    );
    const pointsAdded = getGrowthDeltaForScore(savedSummary.entry.score);
    const levelProgress =
      savedSummary.treeState.level >= 5
        ? 4
        : savedSummary.treeState.growthPoints % 4;

    return (
      <div className="mx-auto max-w-3xl space-y-10">
        <section
          aria-live="polite"
          className={`arbor-choreo-1 rounded-2xl border border-sand p-7 sm:p-10 ${
            message.tone === 'thirsty'
              ? 'arbor-tree-horizon-thirsty bg-secondary'
              : 'arbor-tree-horizon bg-secondary'
          }`}
        >
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-sand bg-canvas">
                <TreeIllustration
                  treeType={profile.treeType}
                  level={savedSummary.treeState.level}
                  isThirsty={savedSummary.treeState.isThirsty}
                  className="h-20 w-20"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-ink-secondary">
                  {savedSummary.wasEdit ? 'Updated check-in' : 'Saved check-in'} · Week of{' '}
                  {formatShortDate(savedSummary.entry.weekStart)}
                </p>
                <h1 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                  {message.headline}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {message.subtext}
                </p>
              </div>
            </div>

            <div className="arbor-choreo-2 shrink-0 text-left sm:text-right">
              <p className="text-xs font-medium text-muted">Weekly score</p>
              <p
                className={`mt-1 font-display-num text-4xl font-medium tracking-tight ${
                  message.tone === 'thirsty' ? 'text-bark' : 'text-forest'
                }`}
              >
                {savedSummary.entry.score}
                <span className="text-base font-normal text-muted"> / 100</span>
              </p>
            </div>
          </div>

          {/* Calibration / Consistency / Thirsty Callouts */}
          {(savedSummary.breakdown.isCalibrating ||
            savedSummary.breakdown.consistencyApplied ||
            savedSummary.treeState.isThirsty) && (
            <div className="mt-7 flex flex-wrap gap-3 text-xs font-medium">
              {savedSummary.breakdown.isCalibrating && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-sand bg-surface px-3.5 py-2 text-ink-secondary">
                  <Sprout className="h-3.5 w-3.5 text-forest" aria-hidden="true" />
                  Your tree is getting to know you.
                </span>
              )}
              {savedSummary.breakdown.consistencyApplied && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-sand bg-surface px-3.5 py-2 text-forest">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Consistency protection: 4+ posts kept your score at 60+.
                </span>
              )}
              {savedSummary.treeState.isThirsty && (
                <span className="inline-flex items-center gap-2 rounded-lg border border-sand bg-surface px-3.5 py-2 text-bark">
                  <Droplets className="h-3.5 w-3.5 text-thirsty" aria-hidden="true" />
                  Thirsty week — level stayed safe at Level {savedSummary.treeState.level}.
                </span>
              )}
            </div>
          )}

          {/* Hairline Tree State & Breakdown */}
          <div className="arbor-choreo-3 mt-8 grid grid-cols-1 gap-8 border-t border-sand pt-7 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted">Tree progress</p>
              <p className="mt-1.5 font-display text-lg font-medium text-ink">
                {treeDef.name} · Level {savedSummary.treeState.level} (
                {TREE_LEVEL_NAMES[savedSummary.treeState.level]})
              </p>
              <p className="mt-1.5 text-xs text-ink-secondary tabular-nums">
                +{pointsAdded} growth {pointsAdded === 1 ? 'point' : 'points'} this week ·{' '}
                {savedSummary.treeState.level >= 5
                  ? `Max stage reached (${savedSummary.treeState.growthPoints} total pts)`
                  : `${levelProgress} / 4 pts toward Level ${savedSummary.treeState.level + 1}`}
              </p>
              <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-forest transition-all"
                  style={{ width: `${(levelProgress / 4) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted">Score breakdown</p>
              <dl className="mt-2.5 space-y-2 text-sm tabular-nums">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">
                    Reach {savedSummary.breakdown.isCalibrating ? '(calibrating)' : '(50%)'}
                  </dt>
                  <dd className="font-medium text-ink">
                    {savedSummary.breakdown.reachPoints === null
                      ? 'Skipped (< 3 wks)'
                      : `${savedSummary.breakdown.reachPoints} / 100`}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">
                    Posts ({savedSummary.breakdown.isCalibrating ? '60%' : '30%'})
                  </dt>
                  <dd className="font-medium text-ink">
                    {savedSummary.breakdown.postsPoints} / 100
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-secondary">
                    Follower growth ({savedSummary.breakdown.isCalibrating ? '40%' : '20%'})
                  </dt>
                  <dd className="font-medium text-ink">
                    {savedSummary.breakdown.followerPoints} / 100
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Newly Unlocked Badges Preview */}
          {savedSummary.newlyEarnedBadges.length > 0 && (
            <div className="mt-7 border-t border-sand pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-forest">
                <Award className="h-4 w-4" aria-hidden="true" />
                <span>
                  Unlocked {savedSummary.newlyEarnedBadges.length}{' '}
                  {savedSummary.newlyEarnedBadges.length === 1 ? 'milestone' : 'milestones'}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-ink-secondary">
                {savedSummary.newlyEarnedBadges
                  .map(
                    (b) =>
                      BADGE_DEFINITIONS.find((d) => d.key === b.badgeKey)?.title ??
                      b.badgeKey
                  )
                  .join(' · ')}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 border-t border-sand pt-6 sm:flex-row">
            <button
              type="button"
              onClick={onGoToHome}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep"
            >
              <span>View my tree</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setSavedSummary(null)}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-sand bg-surface-elevated px-4 py-2.5 text-sm font-medium text-ink hover:bg-white/[0.08]"
            >
              <Edit3 className="h-4 w-4 text-bark" aria-hidden="true" />
              <span>Edit this week&apos;s numbers</span>
            </button>
            <button
              type="button"
              onClick={onGoToProfile}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-forest hover:bg-surface"
            >
              Profile &amp; Badges
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Page Heading */}
      <header className="border-b border-sand pb-7">
        <p className="text-xs font-medium text-forest tabular-nums">
          Week of {formatShortDate(currentWeekMonday)} ·{' '}
          {isEditing ? 'Editing current week' : 'Weekly check-in'}
        </p>
        <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          {isEditing ? "Update this week's progress" : "Log this week's progress"}
        </h1>
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-secondary">
          Enter your four numbers from Instagram Insights. It takes under 30
          seconds.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* Form Column */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-7 rounded-2xl border border-sand bg-secondary p-6 sm:p-8 lg:col-span-7"
        >
          {/* 1. Followers */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="input-followers"
                className="block text-sm font-medium text-ink"
              >
                Followers (total now)
              </label>
              {previousWeekEntry && !isEditing && (
                <span className="text-xs text-muted tabular-nums">
                  Last week: {previousWeekEntry.followers.toLocaleString()}
                </span>
              )}
            </div>
            <input
              id="input-followers"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={followers}
              onChange={(e) => {
                setFollowers(e.target.value);
                if (errors.followers) setErrors((prev) => ({ ...prev, followers: undefined }));
              }}
              placeholder="0"
              aria-invalid={Boolean(errors.followers)}
              aria-describedby="hint-followers"
              className={`mt-2 min-h-[54px] w-full rounded-xl border bg-field px-4 py-3 text-lg font-medium text-ink tabular-nums outline-none transition-colors ${
                errors.followers
                  ? 'border-bark focus:border-bark'
                  : 'border-white/[0.1] focus:border-forest'
              }`}
            />
            <p id="hint-followers" className="mt-2 text-xs text-muted">
              Instagram → Professional dashboard → Total followers (max{' '}
              {INPUT_LIMITS.followersMax.toLocaleString()}).
            </p>
            {errors.followers && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                {errors.followers}
              </p>
            )}
          </div>

          {/* 2. Reach */}
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor="input-reach"
                className="block text-sm font-medium text-ink"
              >
                Reach (this week)
              </label>
              {previousWeekEntry && (
                <span className="text-xs text-muted tabular-nums">
                  Last week: {previousWeekEntry.reach.toLocaleString()}
                </span>
              )}
            </div>
            <input
              id="input-reach"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={reach}
              onChange={(e) => {
                setReach(e.target.value);
                if (errors.reach) setErrors((prev) => ({ ...prev, reach: undefined }));
              }}
              placeholder="0"
              aria-invalid={Boolean(errors.reach)}
              aria-describedby="hint-reach"
              className={`mt-2 min-h-[54px] w-full rounded-xl border bg-field px-4 py-3 text-lg font-medium text-ink tabular-nums outline-none transition-colors ${
                errors.reach
                  ? 'border-bark focus:border-bark'
                  : 'border-white/[0.1] focus:border-forest'
              }`}
            />
            <p id="hint-reach" className="mt-2 text-xs text-muted">
              Insights → Accounts reached over the last 7 days.
            </p>
            {errors.reach && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                {errors.reach}
              </p>
            )}
          </div>

          {/* 3. Likes */}
          <div>
            <label
              htmlFor="input-likes"
              className="block text-sm font-medium text-ink"
            >
              Likes (this week)
            </label>
            <input
              id="input-likes"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={likes}
              onChange={(e) => {
                setLikes(e.target.value);
                if (errors.likes) setErrors((prev) => ({ ...prev, likes: undefined }));
              }}
              placeholder="0"
              aria-invalid={Boolean(errors.likes)}
              aria-describedby="hint-likes"
              className={`mt-2 min-h-[54px] w-full rounded-xl border bg-field px-4 py-3 text-lg font-medium text-ink tabular-nums outline-none transition-colors ${
                errors.likes
                  ? 'border-bark focus:border-bark'
                  : 'border-white/[0.1] focus:border-forest'
              }`}
            />
            <p id="hint-likes" className="mt-2 text-xs text-muted">
              Insights → Content interactions → Likes this week.
            </p>
            {errors.likes && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                {errors.likes}
              </p>
            )}
          </div>

          {/* 4. Posts */}
          <div>
            <label
              htmlFor="input-posts"
              className="block text-sm font-medium text-ink"
            >
              Posts published (this week)
            </label>
            <input
              id="input-posts"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={posts}
              onChange={(e) => {
                setPosts(e.target.value);
                if (errors.posts) setErrors((prev) => ({ ...prev, posts: undefined }));
              }}
              placeholder="0"
              aria-invalid={Boolean(errors.posts)}
              aria-describedby="hint-posts"
              className={`mt-2 min-h-[54px] w-full rounded-xl border bg-field px-4 py-3 text-lg font-medium text-ink tabular-nums outline-none transition-colors ${
                errors.posts
                  ? 'border-bark focus:border-bark'
                  : 'border-white/[0.1] focus:border-forest'
              }`}
            />

            {/* Quick post count buttons for fast mobile entry */}
            <div
              role="group"
              aria-label="Quick select posts count"
              className="mt-3 grid grid-cols-6 gap-2 sm:flex sm:flex-wrap"
            >
              {[0, 1, 2, 3, 4, 5].map((count) => {
                const isSelected = posts.trim() === String(count);
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => {
                      setPosts(String(count));
                      if (errors.posts) setErrors((prev) => ({ ...prev, posts: undefined }));
                    }}
                    aria-pressed={isSelected}
                    className={`min-h-[44px] sm:min-w-[48px] rounded-xl border px-3 py-1.5 font-display-num text-sm font-medium ${
                      isSelected
                        ? 'border-forest bg-botanical text-forest'
                        : 'border-sand bg-surface-elevated text-ink-secondary hover:text-ink hover:bg-white/[0.06]'
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>

            <p id="hint-posts" className="mt-2 text-xs text-muted">
              Reels, carousels, or feed posts shared since Monday. Posting 4+
              times protects your score at 60 or higher.
            </p>
            {errors.posts && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                {errors.posts}
              </p>
            )}
          </div>

          <div className="border-t border-sand pt-6">
            <button
              type="submit"
              className="min-h-[52px] w-full rounded-xl bg-forest px-6 py-3 text-base font-semibold text-on-accent hover:bg-forest-deep"
            >
              {isEditing ? 'Update this week' : 'Save & water my tree'}
            </button>
          </div>
        </form>

        {/* Right Context Column (Open Editorial Layout) */}
        <aside className="space-y-8 lg:col-span-5">
          <div className="rounded-2xl border border-sand bg-surface p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-sand bg-canvas">
                <TreeIllustration
                  treeType={profile.treeType}
                  level={treeState.level}
                  isThirsty={treeState.isThirsty}
                  className="h-14 w-14"
                />
              </div>
              <div>
                <p className="font-display text-base font-medium text-ink">
                  {treeDef.name} · Level {treeState.level}
                </p>
                <p className="mt-0.5 text-xs text-ink-secondary tabular-nums">
                  {TREE_LEVEL_NAMES[treeState.level]} · {treeState.growthPoints} growth pts
                  {treeState.isThirsty ? ' · Thirsty' : ''}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-sand pt-5 text-sm leading-relaxed text-ink-secondary">
              {isCalibratingPreview ? (
                <p>
                  <strong className="font-medium text-forest">
                    Your tree is getting to know you.
                  </strong>{' '}
                  During your first three weeks, scoring focuses only on your
                  posts and follower growth while your reach baseline builds.
                </p>
              ) : (
                <p>
                  Your score compares this week{' '}
                  <strong className="font-medium text-ink">only to your own past</strong>:
                  Reach vs your 4-week average (50%), Posts published (30%), and
                  Follower growth (20%).
                </p>
              )}
            </div>
          </div>

          {priorEntries.length > 0 && (
            <div className="border-t border-sand pt-7">
              <h2 className="font-display text-lg font-medium text-ink">
                Recent weeks logged
              </h2>
              <ul className="mt-4 divide-y divide-sand text-xs tabular-nums">
                {[...priorEntries]
                  .reverse()
                  .slice(0, 4)
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="font-medium text-ink">
                        {formatShortDate(item.weekStart)}
                        {item.isDemo ? ' · demo' : ''}
                      </span>
                      <span className="text-ink-secondary">
                        {item.followers.toLocaleString()} followers · {item.posts}{' '}
                        posts
                      </span>
                      <span className="font-medium text-forest">
                        {item.score}/100
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
