import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  Download,
  Droplets,
  Eraser,
  Lock,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { BadgeCollection } from '../components/badges/BadgeCollection';
import { ConfirmDialog } from '../components/dialogs/ConfirmDialog';
import { TreePreviewIllustration } from '../components/tree/TreePreviewIllustration';
import { validateDisplayName } from '../lib/calculations';
import { formatShortDate } from '../lib/dateUtils';
import {
  AppTab,
  Badge,
  PlanType,
  Profile as ProfileModel,
  TREE_LEVEL_NAMES,
  TREE_TYPES,
  TreeState,
  TreeType,
  WeeklyEntry,
} from '../types';

interface ProfilePageProps {
  profile: ProfileModel;
  treeState: TreeState;
  entries: WeeklyEntry[];
  badges: Badge[];
  onSaveProfile: (next: ProfileModel) => void;
  onSetPlan: (plan: PlanType) => void;
  onOpenUpgrade: (featureName?: string) => void;
  onExportData: () => void;
  onResetData: () => void;
  onLoadDemoData: () => void;
  onAddFakeWeek: (kind: 'good' | 'average' | 'thirsty') => {
    entry: WeeklyEntry;
    treeState: TreeState;
  };
  onClearDemoData: () => void;
  onNavigate: (tab: AppTab) => void;
}

export function ProfilePage({
  profile,
  treeState,
  entries,
  badges,
  onSaveProfile,
  onSetPlan,
  onOpenUpgrade,
  onExportData,
  onResetData,
  onLoadDemoData,
  onAddFakeWeek,
  onClearDemoData,
  onNavigate,
}: ProfilePageProps) {
  const [nameInput, setNameInput] = useState(profile.displayName);
  const [nameError, setNameError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    setNameInput(profile.displayName);
  }, [profile.displayName]);

  const demoEntriesCount = entries.filter((e) => e.isDemo).length;
  const realEntriesCount = entries.length - demoEntriesCount;
  const activeTreeDef =
    TREE_TYPES.find((t) => t.id === profile.treeType) ?? TREE_TYPES[0];

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateDisplayName(nameInput);
    if (err) {
      setNameError(err);
      return;
    }
    setNameError(null);
    onSaveProfile({ ...profile, displayName: nameInput.trim() });
    setFeedback('Display name saved to this browser.');
  };

  const handleTreeSelect = (treeId: TreeType, isPaidTree: boolean) => {
    if (isPaidTree && profile.plan === 'free') {
      const def = TREE_TYPES.find((t) => t.id === treeId);
      onOpenUpgrade(def?.name ?? 'Extra tree varieties');
      return;
    }
    onSaveProfile({ ...profile, treeType: treeId });
    const def = TREE_TYPES.find((t) => t.id === treeId);
    setFeedback(`Selected ${def?.name ?? treeId}.`);
  };

  const handleFakeWeek = (kind: 'good' | 'average' | 'thirsty') => {
    const res = onAddFakeWeek(kind);
    const label =
      kind === 'good'
        ? 'Good week'
        : kind === 'average'
        ? 'Average week'
        : 'Thirsty week';
    setFeedback(
      `Added sample ${label} (${formatShortDate(res.entry.weekStart)}): score ${res.entry.score}/100 · Level ${res.treeState.level} (${TREE_LEVEL_NAMES[res.treeState.level]})${res.treeState.isThirsty ? ' · Thirsty' : ''}.`
    );
  };

  return (
    <div className="space-y-14">
      {/* Page Heading */}
      <header className="flex flex-col gap-4 border-b border-sand pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-forest">
            {activeTreeDef.name} · {profile.plan === 'paid' ? 'Paid ($4/month)' : 'Free plan'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Profile &amp; Settings
          </h1>
          <p className="mt-2 text-sm text-ink-secondary">
            {profile.displayName} · Stored privately on this device.
          </p>
        </div>

        <div className="text-xs text-muted tabular-nums">
          {realEntriesCount} your {realEntriesCount === 1 ? 'week' : 'weeks'}
          {demoEntriesCount > 0 ? ` · ${demoEntriesCount} demo weeks` : ''}
        </div>
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

      {/* Group 1: Creator Profile & Subscription */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Creator Profile + Subscription */}
        <div className="space-y-8 lg:col-span-5">
          <section className="rounded-2xl border border-sand bg-secondary p-6 sm:p-7">
            <h2 className="font-display text-lg font-medium text-ink">
              Creator profile
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Stored privately in this browser. No account or login needed.
            </p>

            <form onSubmit={handleNameSubmit} className="mt-5 space-y-3" noValidate>
              <div>
                <label
                  htmlFor="creator-display-name"
                  className="block text-sm font-medium text-ink"
                >
                  Display name
                </label>
                <div className="mt-2 flex flex-col gap-2.5 sm:flex-row">
                  <input
                    id="creator-display-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => {
                      setNameInput(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    maxLength={40}
                    placeholder="Your name or Instagram handle"
                    className="min-h-[46px] w-full rounded-xl border border-white/[0.1] bg-field px-3.5 py-2 text-base text-ink outline-none transition-colors focus:border-forest"
                  />
                  <button
                    type="submit"
                    className="min-h-[46px] shrink-0 rounded-xl bg-forest px-5 py-2 text-sm font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap"
                  >
                    Save name
                  </button>
                </div>
                {nameError && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-bark">
                    {nameError}
                  </p>
                )}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-sand bg-secondary p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-medium text-ink">
                  Subscription
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  Current plan:{' '}
                  <span className="font-medium text-forest">
                    {profile.plan === 'paid' ? 'Paid ($4/month)' : 'Free'}
                  </span>
                </p>
              </div>
              {profile.plan === 'free' && (
                <button
                  type="button"
                  onClick={() => onOpenUpgrade()}
                  className="min-h-[42px] shrink-0 rounded-xl bg-bark px-4 py-2 text-xs font-semibold text-on-accent hover:opacity-90 whitespace-nowrap"
                >
                  Upgrade
                </button>
              )}
            </div>

            <ul className="mt-5 space-y-2 border-t border-sand pt-5 text-sm text-ink-secondary">
              {profile.plan === 'paid' ? (
                <>
                  <li>· All 4 tree types across all 5 growth stages</li>
                  <li>· Weekly reports, charts &amp; Islamic content calendar</li>
                  <li>· 4 Story card designs &amp; up to 5 active goals</li>
                </>
              ) : (
                <>
                  <li>· Olive tree across all 5 growth stages</li>
                  <li>· Weekly tracking, basic badges &amp; monthly report</li>
                  <li>· 1 shareable Story card &amp; 1 active goal</li>
                </>
              )}
            </ul>
          </section>
        </div>

        {/* Right Column: Tree Selection with Botanical Previews */}
        <section className="rounded-2xl border border-sand bg-secondary p-6 sm:p-7 lg:col-span-7">
          <div className="border-b border-sand pb-4">
            <h2 className="font-display text-lg font-medium text-ink">
              Tree selection
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Choose the botanical species that grows with your consistency.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
            {TREE_TYPES.map((tree) => {
              const isSelected = profile.treeType === tree.id;
              const isLocked = tree.isPaid && profile.plan === 'free';

              return (
                <button
                  key={tree.id}
                  type="button"
                  onClick={() => handleTreeSelect(tree.id, tree.isPaid)}
                  aria-pressed={isSelected}
                  className={`group flex h-full min-h-[126px] w-full items-center gap-4 rounded-xl border p-4 text-left ${
                    isSelected
                      ? 'border-forest bg-botanical'
                      : isLocked
                      ? 'border-sand bg-surface/65 hover:bg-surface'
                      : 'border-sand bg-surface hover:border-forest/45'
                  }`}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-sand bg-canvas">
                    <TreePreviewIllustration
                      treeType={tree.id}
                      className={`h-14 w-14 ${isLocked ? 'opacity-65' : ''}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-medium text-ink">
                        {tree.name}
                      </span>
                      {isLocked ? (
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-elevated text-bark"
                          aria-label="Paid plan required"
                        >
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      ) : isSelected ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-forest text-on-accent">
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                      {tree.shortNote}
                    </p>
                    <p className="mt-1.5 text-[11px] font-medium text-bark">
                      {tree.isPaid ? 'Paid' : 'Free'} · Harvest: {tree.fruitLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Group 2: Milestones & Badges (Clean Hairline Section) */}
      <section className="border-t border-sand pt-12">
        <BadgeCollection badges={badges} />
      </section>

      {/* Group 3: Your Data + Testing Tools */}
      <div className="grid grid-cols-1 gap-10 border-t border-sand pt-12 lg:grid-cols-12">
        {/* Your Data */}
        <section className="lg:col-span-5">
          <h2 className="font-display text-xl font-medium text-ink">Your data</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
            Everything stays in your browser. Export a JSON copy anytime or reset
            to begin fresh.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={onExportData}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-forest/35 bg-botanical px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/20 whitespace-nowrap"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export my data
            </button>

            <button
              type="button"
              onClick={() => setIsResetOpen(true)}
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-sand bg-surface px-4 py-2.5 text-sm font-medium text-bark hover:bg-white/[0.06] whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset all data
            </button>
          </div>
        </section>

        {/* Testing Tools */}
        <section
          aria-labelledby="testing-section-heading"
          className="rounded-2xl border border-sand bg-secondary p-6 sm:p-7 lg:col-span-7"
        >
          <div className="flex flex-col gap-1 border-b border-sand pb-4 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h2
                id="testing-section-heading"
                className="font-display text-lg font-medium text-ink"
              >
                Testing tools
              </h2>
              <p className="mt-1 text-sm text-ink-secondary">
                Preview Free vs Paid features and test weekly tree states. Demo
                entries are marked separately from your real entries.
              </p>
            </div>
            <p className="text-xs font-medium text-bark tabular-nums shrink-0">
              Lv.{treeState.level} {TREE_LEVEL_NAMES[treeState.level]} ·{' '}
              {treeState.growthPoints} pts
              {treeState.isThirsty ? ' · Thirsty' : ''}
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {/* Plan Switch */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-ink">Plan switch</span>
              <div
                role="group"
                aria-label="Plan switch"
                className="inline-flex w-full rounded-xl border border-sand bg-canvas p-1 sm:w-56"
              >
                <button
                  type="button"
                  onClick={() => {
                    onSetPlan('free');
                    setFeedback('Switched to Free plan.');
                  }}
                  aria-pressed={profile.plan === 'free'}
                  className={`min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    profile.plan === 'free'
                      ? 'bg-forest text-on-accent font-semibold'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSetPlan('paid');
                    setFeedback('Switched to Paid plan.');
                  }}
                  aria-pressed={profile.plan === 'paid'}
                  className={`min-h-[38px] flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                    profile.plan === 'paid'
                      ? 'bg-forest text-on-accent font-semibold'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {/* Demo Data Controls */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">Demo history</p>
                <p className="text-xs text-muted tabular-nums">
                  {demoEntriesCount} demo {demoEntriesCount === 1 ? 'week' : 'weeks'} loaded
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLoadDemoData();
                    setFeedback('Loaded 8 weeks of sample demo data.');
                  }}
                  className="min-h-[44px] rounded-xl bg-bark px-4 py-2 text-sm font-semibold text-on-accent hover:opacity-90 whitespace-nowrap"
                >
                  Load demo data
                </button>
                {demoEntriesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      onClearDemoData();
                      setFeedback('Cleared demo data while keeping your own entries.');
                    }}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-sand bg-surface px-3.5 py-2 text-sm font-medium text-ink hover:bg-white/[0.06] whitespace-nowrap"
                  >
                    <Eraser className="h-4 w-4 text-bark" aria-hidden="true" />
                    Clear demo
                  </button>
                )}
              </div>
            </div>

            {/* Fake Week Triggers */}
            <div>
              <p className="text-sm font-medium text-ink">Add fake week</p>
              <div className="mt-2.5 grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleFakeWeek('good')}
                  className="min-h-[44px] rounded-xl bg-forest px-3 py-2 text-xs font-semibold text-on-accent hover:bg-forest-deep sm:text-sm"
                >
                  Good week
                </button>
                <button
                  type="button"
                  onClick={() => handleFakeWeek('average')}
                  className="min-h-[44px] rounded-xl border border-forest/35 bg-surface px-3 py-2 text-xs font-medium text-forest hover:bg-botanical sm:text-sm"
                >
                  Average
                </button>
                <button
                  type="button"
                  onClick={() => handleFakeWeek('thirsty')}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-bark/40 bg-surface px-3 py-2 text-xs font-medium text-bark hover:bg-white/[0.06] sm:text-sm"
                >
                  <Droplets className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Thirsty</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Group 4: Calendar, Pricing & Legal Shortcuts (Hairline Section) */}
      <section className="border-t border-sand pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-medium text-ink">
              Islamic Calendar, Pricing &amp; Privacy
            </h2>
            <p className="mt-1 text-sm text-ink-secondary">
              Browse Jummah &amp; Ramadan prompts, join the $4/month waitlist,
              or review privacy and terms.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => onNavigate('calendar')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-forest/35 bg-botanical px-4 py-2 text-sm font-medium text-forest hover:bg-forest/20 whitespace-nowrap"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>Islamic Calendar</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-sand bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-white/[0.06] whitespace-nowrap"
            >
              <ShieldCheck className="h-4 w-4 text-forest" aria-hidden="true" />
              <span>About, Pricing &amp; Privacy</span>
            </button>
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={isResetOpen}
        title="Reset all data?"
        description="This removes all weekly entries, badges, goals, and custom profile settings from this browser. You cannot undo this."
        confirmLabel="Yes, reset everything"
        onConfirm={() => {
          onResetData();
          setIsResetOpen(false);
          setFeedback('All data has been reset to defaults.');
        }}
        onCancel={() => setIsResetOpen(false)}
      />
    </div>
  );
}
