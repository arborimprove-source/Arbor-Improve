import React, { useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Lock,
  PauseCircle,
  PlayCircle,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { formatShortDate } from '../lib/dateUtils';
import {
  GOAL_TITLE_MAX_LENGTH,
  canActivateAnotherGoal,
  computeGoalProgress,
  getActiveGoalLimit,
  validateGoalInput,
} from '../lib/goals';
import { Goal, Profile, WeeklyEntry } from '../types';

interface GoalsPageProps {
  profile: Profile;
  entries: WeeklyEntry[];
  goals: Goal[];
  onSaveGoal: (input: {
    id?: string;
    title: string;
    targetFollowers: number;
    startFollowers?: number;
    days?: number;
    startDate?: string;
    endDate?: string;
    status?: Goal['status'];
  }) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenUpgrade: (featureName?: string) => void;
}

const TIMEFRAME_PRESETS = [30, 60, 90, 180] as const;

function daysBetweenISO(startISO: string, endISO: string): number {
  const [sy, sm, sd] = startISO.split('-').map(Number);
  const [ey, em, ed] = endISO.split('-').map(Number);
  const start = new Date(sy, (sm || 1) - 1, sd || 1);
  const end = new Date(ey, (em || 1) - 1, ed || 1);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

export function GoalsPage({
  profile,
  entries,
  goals,
  onSaveGoal,
  onDeleteGoal,
  onOpenUpgrade,
}: GoalsPageProps) {
  const sortedEntries = [...entries].sort((a, b) =>
    a.weekStart.localeCompare(b.weekStart)
  );
  const latestFollowers =
    sortedEntries.length > 0
      ? sortedEntries[sortedEntries.length - 1].followers
      : 0;

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const pausedGoals = goals.filter((g) => g.status === 'paused');

  const activeLimit = getActiveGoalLimit(profile.plan);
  const canAddActive = canActivateAnotherGoal(goals, profile.plan);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(() => goals.length === 0);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [targetFollowers, setTargetFollowers] = useState(() =>
    latestFollowers > 0 ? String(latestFollowers + 250) : ''
  );
  const [days, setDays] = useState('60');
  const [errors, setErrors] = useState<{
    title?: string;
    targetFollowers?: string;
    days?: string;
  }>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);

  const editingGoal = editingGoalId
    ? goals.find((g) => g.id === editingGoalId) ?? null
    : null;

  const openCreateForm = () => {
    if (!canAddActive) {
      onOpenUpgrade('Up to 5 active goals');
      return;
    }
    setEditingGoalId(null);
    setTitle('');
    setTargetFollowers(latestFollowers > 0 ? String(latestFollowers + 250) : '');
    setDays('60');
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditForm = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setTitle(goal.title);
    setTargetFollowers(String(goal.targetFollowers));
    setDays(String(daysBetweenISO(goal.startDate, goal.endDate)));
    setErrors({});
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateGoalInput(
      { title, targetFollowers, days },
      {
        currentFollowers: latestFollowers,
        requireAboveCurrent: !editingGoal || editingGoal.status === 'active',
      }
    );

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const numericTarget = Number(targetFollowers.trim());
    const numericDays = Number(days.trim());

    if (editingGoal) {
      onSaveGoal({
        id: editingGoal.id,
        title: title.trim(),
        targetFollowers: numericTarget,
        startFollowers: editingGoal.startFollowers,
        startDate: editingGoal.startDate,
        days: numericDays,
        status:
          latestFollowers >= numericTarget ? 'completed' : editingGoal.status,
      });
      setFeedback(`Updated goal "${title.trim()}".`);
    } else {
      onSaveGoal({
        title: title.trim(),
        targetFollowers: numericTarget,
        days: numericDays,
        status: 'active',
      });
      setFeedback(`Added goal "${title.trim()}".`);
    }

    setErrors({});
    setEditingGoalId(null);
    setTitle('');
    setIsFormOpen(false);
  };

  const handleTogglePause = (goal: Goal) => {
    if (goal.status === 'paused') {
      if (!canAddActive) {
        onOpenUpgrade('Up to 5 active goals');
        return;
      }
      onSaveGoal({
        id: goal.id,
        title: goal.title,
        targetFollowers: goal.targetFollowers,
        startFollowers: goal.startFollowers,
        startDate: goal.startDate,
        endDate: goal.endDate,
        status: latestFollowers >= goal.targetFollowers ? 'completed' : 'active',
      });
      setFeedback(`Resumed "${goal.title}".`);
      return;
    }

    onSaveGoal({
      id: goal.id,
      title: goal.title,
      targetFollowers: goal.targetFollowers,
      startFollowers: goal.startFollowers,
      startDate: goal.startDate,
      endDate: goal.endDate,
      status: 'paused',
    });
    setFeedback(`Paused "${goal.title}".`);
  };

  const handleMarkCompleted = (goal: Goal) => {
    onSaveGoal({
      id: goal.id,
      title: goal.title,
      targetFollowers: goal.targetFollowers,
      startFollowers: goal.startFollowers,
      startDate: goal.startDate,
      endDate: goal.endDate,
      status: 'completed',
    });
    setFeedback(`Masha'Allah — marked "${goal.title}" as completed!`);
  };

  return (
    <div className="space-y-12 lg:space-y-14">
      {/* Page Header */}
      <header className="flex flex-col gap-6 border-b border-sand pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-forest tabular-nums">
            {activeGoals.length} of {activeLimit} active{' '}
            {activeLimit === 1 ? 'goal' : 'goals'} · Current followers:{' '}
            {latestFollowers.toLocaleString()}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Creator Goals
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">
            Set steady, realistic follower targets without comparison or pressure.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 self-start sm:self-auto ${
            canAddActive
              ? 'bg-forest text-on-accent hover:bg-forest-deep'
              : 'border border-sand bg-surface-elevated text-bark hover:bg-white/[0.06]'
          }`}
        >
          {canAddActive ? (
            <Plus className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Lock className="h-4 w-4" aria-hidden="true" />
          )}
          <span>New goal</span>
        </button>
      </header>

      {feedback && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-forest/35 bg-botanical px-4 py-3 text-sm font-medium text-ink"
        >
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="min-h-[40px] shrink-0 px-2 text-xs font-medium text-forest underline underline-offset-4 hover:text-forest-deep"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create / Edit Form */}
      {isFormOpen && (
        <section
          aria-labelledby="goal-form-heading"
          className="rounded-2xl border border-sand bg-secondary p-6 sm:p-8"
        >
          <div className="flex items-baseline justify-between gap-2 border-b border-sand pb-4">
            <div>
              <h2
                id="goal-form-heading"
                className="font-display text-xl font-medium text-ink"
              >
                {editingGoal ? 'Edit goal' : 'Set a calm follower goal'}
              </h2>
              <p className="mt-1 text-xs text-ink-secondary">
                Goals update automatically whenever you log your weekly check-in.
              </p>
            </div>
            {(goals.length > 0 || editingGoal) && (
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingGoalId(null);
                  setErrors({});
                }}
                className="min-h-[44px] px-2 text-xs font-medium text-muted hover:text-ink"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
            <div>
              <label
                htmlFor="goal-title"
                className="block text-sm font-medium text-ink"
              >
                Goal title
              </label>
              <input
                id="goal-title"
                type="text"
                maxLength={GOAL_TITLE_MAX_LENGTH}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Grow steadily with weekly reflection reels"
                aria-invalid={Boolean(errors.title)}
                className={`mt-2 min-h-[50px] w-full rounded-xl border bg-field px-4 py-2.5 text-base text-ink outline-none transition-colors ${
                  errors.title
                    ? 'border-bark focus:border-bark'
                    : 'border-white/[0.1] focus:border-forest'
                }`}
              />
              {errors.title && (
                <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <div className="flex items-baseline justify-between gap-2">
                  <label
                    htmlFor="goal-target"
                    className="block text-sm font-medium text-ink"
                  >
                    Target followers
                  </label>
                  {latestFollowers > 0 && (
                    <span className="text-xs text-muted tabular-nums">
                      Now: {latestFollowers.toLocaleString()}
                    </span>
                  )}
                </div>
                <input
                  id="goal-target"
                  type="text"
                  inputMode="numeric"
                  value={targetFollowers}
                  onChange={(e) => {
                    setTargetFollowers(e.target.value);
                    if (errors.targetFollowers) {
                      setErrors((prev) => ({ ...prev, targetFollowers: undefined }));
                    }
                  }}
                  placeholder="0"
                  aria-invalid={Boolean(errors.targetFollowers)}
                  className={`mt-2 min-h-[50px] w-full rounded-xl border bg-field px-4 py-2.5 text-base font-medium text-ink tabular-nums outline-none transition-colors ${
                    errors.targetFollowers
                      ? 'border-bark focus:border-bark'
                      : 'border-white/[0.1] focus:border-forest'
                  }`}
                />
                {errors.targetFollowers && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                    {errors.targetFollowers}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="goal-days"
                  className="block text-sm font-medium text-ink"
                >
                  Timeframe (days)
                </label>
                <input
                  id="goal-days"
                  type="text"
                  inputMode="numeric"
                  value={days}
                  onChange={(e) => {
                    setDays(e.target.value);
                    if (errors.days) setErrors((prev) => ({ ...prev, days: undefined }));
                  }}
                  placeholder="60"
                  aria-invalid={Boolean(errors.days)}
                  className={`mt-2 min-h-[50px] w-full rounded-xl border bg-field px-4 py-2.5 text-base font-medium text-ink tabular-nums outline-none transition-colors ${
                    errors.days
                      ? 'border-bark focus:border-bark'
                      : 'border-white/[0.1] focus:border-forest'
                  }`}
                />
                <div
                  role="group"
                  aria-label="Quick select timeframe"
                  className="mt-2.5 grid grid-cols-4 gap-2"
                >
                  {TIMEFRAME_PRESETS.map((preset) => {
                    const selected = days.trim() === String(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setDays(String(preset));
                          if (errors.days) setErrors((prev) => ({ ...prev, days: undefined }));
                        }}
                        aria-pressed={selected}
                        className={`min-h-[42px] rounded-xl border px-2 py-1 font-display-num text-xs font-medium ${
                          selected
                            ? 'border-forest bg-botanical text-forest'
                            : 'border-sand bg-surface-elevated text-ink-secondary hover:text-ink hover:bg-white/[0.06]'
                        }`}
                      >
                        {preset}d
                      </button>
                    );
                  })}
                </div>
                {errors.days && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                    {errors.days}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-sand pt-5">
              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl bg-forest px-6 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep sm:w-auto"
              >
                {editingGoal ? 'Update goal' : 'Save goal'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Active Goals */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-medium text-ink">
            Active goals ({activeGoals.length})
          </h2>
          {profile.plan === 'free' && (
            <button
              type="button"
              onClick={() => onOpenUpgrade('Up to 5 active goals')}
              className="text-xs font-medium text-bark underline underline-offset-4 hover:text-ink"
            >
              Free plan allows 1 active goal · Upgrade for 5
            </button>
          )}
        </div>

        {activeGoals.length === 0 ? (
          <div className="rounded-2xl border border-sand bg-secondary p-8 text-center sm:p-10">
            <Target className="mx-auto h-6 w-6 text-forest" aria-hidden="true" />
            <p className="mt-3 font-display text-lg font-medium text-ink">
              No active follower goal right now
            </p>
            <p className="mt-1.5 text-sm text-ink-secondary">
              Set a clear target above to track your progress week by week.
            </p>
            {!isFormOpen && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-forest/35 bg-botanical px-5 py-2 text-sm font-medium text-forest hover:bg-forest/20"
              >
                Create a goal
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {activeGoals.map((goal) => {
              const stats = computeGoalProgress(goal, latestFollowers);
              return (
                <article
                  key={goal.id}
                  className="rounded-2xl border border-sand bg-secondary p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-ink-secondary tabular-nums">
                        {stats.isPastDue
                          ? `Target date passed (${formatShortDate(goal.endDate)})`
                          : `${stats.daysRemaining} ${
                              stats.daysRemaining === 1 ? 'day' : 'days'
                            } left · Target ${formatShortDate(goal.endDate)}`}
                        {goal.isDemo ? ' · demo' : ''}
                      </p>
                      <h3 className="mt-1.5 font-display text-xl font-medium text-ink">
                        {goal.title}
                      </h3>
                    </div>

                    <p className="font-display-num text-3xl font-medium text-forest shrink-0">
                      {stats.percent}%
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div
                      role="progressbar"
                      aria-valuenow={stats.percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Progress for ${goal.title}`}
                      className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
                    >
                      <div
                        className="h-full rounded-full bg-forest transition-[width] duration-300"
                        style={{ width: `${stats.percent}%` }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary tabular-nums">
                      <span>
                        Started at {goal.startFollowers.toLocaleString()} · Now{' '}
                        <strong className="font-medium text-ink">
                          {stats.currentFollowers.toLocaleString()}
                        </strong>{' '}
                        / {goal.targetFollowers.toLocaleString()} followers
                      </span>
                      <span>
                        {stats.remainingFollowers > 0
                          ? `${stats.remainingFollowers.toLocaleString()} to go${
                              stats.pacePerWeekNeeded
                                ? ` (~${stats.pacePerWeekNeeded.toLocaleString()}/week)`
                                : ''
                            }`
                          : 'Target reached!'}
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="mt-6 flex flex-wrap gap-2.5 border-t border-sand pt-5">
                    <button
                      type="button"
                      onClick={() => openEditForm(goal)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sand bg-surface px-3.5 py-1.5 text-xs font-medium text-ink hover:bg-white/[0.06]"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-bark" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkCompleted(goal)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-forest/35 bg-botanical px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-forest/20"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mark complete</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePause(goal)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sand bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-secondary hover:bg-white/[0.06] hover:text-ink"
                    >
                      <PauseCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Pause</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(goal)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sand bg-surface px-3.5 py-1.5 text-xs font-medium text-bark hover:bg-white/[0.06]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Paused & Completed Goals (Open Hairline Section) */}
      {(pausedGoals.length > 0 || completedGoals.length > 0) && (
        <section className="border-t border-sand pt-10">
          <h2 className="font-display text-xl font-medium text-ink">
            Completed &amp; Paused
          </h2>
          <ul className="mt-5 divide-y divide-sand border-t border-sand">
            {completedGoals.map((goal) => (
              <li
                key={goal.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-forest">
                    Masha&apos;Allah · Goal reached · Target{' '}
                    {goal.targetFollowers.toLocaleString()} followers
                  </p>
                  <p className="mt-1 font-display text-base font-medium text-ink">
                    {goal.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(goal)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 self-start rounded-xl border border-sand bg-surface px-3.5 py-1.5 text-xs font-medium text-bark hover:bg-white/[0.06] sm:self-center"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Delete</span>
                </button>
              </li>
            ))}

            {pausedGoals.map((goal) => (
              <li
                key={goal.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-muted tabular-nums">
                    Paused · Target {goal.targetFollowers.toLocaleString()} followers
                  </p>
                  <p className="mt-1 font-display text-base font-medium text-ink">
                    {goal.title}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePause(goal)}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-forest/35 bg-botanical px-3.5 py-1.5 text-xs font-medium text-forest hover:bg-forest/20"
                  >
                    <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(goal)}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-sand bg-surface px-3.5 py-1.5 text-xs font-medium text-bark hover:bg-white/[0.06]"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete this goal?"
        description={
          deleteTarget
            ? `Remove "${deleteTarget.title}" from your goals list? Your weekly check-ins and tree progress stay untouched.`
            : ''
        }
        confirmLabel="Delete goal"
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteGoal(deleteTarget.id);
            setFeedback(`Deleted "${deleteTarget.title}".`);
            if (editingGoalId === deleteTarget.id) {
              setEditingGoalId(null);
              setIsFormOpen(false);
            }
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
