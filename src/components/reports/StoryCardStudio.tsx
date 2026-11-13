import { useState } from 'react';
import { Check, Copy, Download, Eye, EyeOff, Lock } from 'lucide-react';
import { formatDateISO } from '../../lib/dateUtils';
import {
  STORY_CAPTION_MAX_LENGTH,
  STORY_CARD_TEMPLATES,
  STORY_REFLECTION_PRESETS,
  StoryCardTemplateId,
  StoryCardVisibility,
  buildInstagramCaption,
  buildStoryCardPayload,
  isStoryTemplateUnlocked,
  renderStoryCardToCanvas,
} from '../../lib/storyCards';
import {
  Badge,
  Goal,
  Profile,
  TREE_TYPES,
  TreeState,
  TreeType,
  WeeklyEntry,
} from '../../types';
import { TreeIllustration } from '../tree/TreeIllustration';
import { TreePreviewIllustration } from '../tree/TreePreviewIllustration';

interface StoryCardStudioProps {
  profile: Profile;
  treeState: TreeState;
  entries: WeeklyEntry[];
  badges: Badge[];
  goals: Goal[];
  onSelectTree: (treeType: TreeType) => void;
  onOpenUpgrade: (featureName?: string) => void;
}

export function StoryCardStudio({
  profile,
  treeState,
  entries,
  badges,
  goals,
  onSelectTree,
  onOpenUpgrade,
}: StoryCardStudioProps) {
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<StoryCardTemplateId>('botanical-root');
  const [visibility, setVisibility] = useState<StoryCardVisibility>({
    showFollowers: true,
    showReach: true,
    showStreak: true,
  });
  const [customNote, setCustomNote] = useState<string>(
    STORY_REFLECTION_PRESETS[0]
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [downloadPulseKey, setDownloadPulseKey] = useState(0);

  const payload = buildStoryCardPayload({
    templateId: selectedTemplateId,
    profile,
    treeState,
    entries,
    badges,
    goals,
    visibility,
    customNote,
  });

  const handleTreeChange = (treeId: TreeType, isPaid: boolean) => {
    if (isPaid && profile.plan === 'free') {
      const def = TREE_TYPES.find((t) => t.id === treeId);
      onOpenUpgrade(def?.name ?? 'All 4 botanical tree varieties');
      return;
    }
    onSelectTree(treeId);
    const def = TREE_TYPES.find((t) => t.id === treeId);
    setFeedback(`Switched Story card tree to ${def?.name ?? treeId}.`);
  };

  const handleSelectTemplate = (id: StoryCardTemplateId) => {
    if (!isStoryTemplateUnlocked(id, profile.plan)) {
      onOpenUpgrade('4 shareable Story card designs');
      return;
    }
    setSelectedTemplateId(id);
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    renderStoryCardToCanvas(canvas, payload);
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `arbor-improve-story-${payload.treeType}-${payload.template.id}-${formatDateISO(
      new Date()
    )}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadPulseKey((prev) => prev + 1);
    setFeedback(
      `Downloaded 1080×1920 PNG for ${payload.treeName} (${payload.template.name}).`
    );
  };

  const handleCopyCaption = async () => {
    const caption = buildInstagramCaption(payload);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(caption);
        setFeedback('Copied Instagram caption to your clipboard.');
        return;
      }
    } catch {
      // Fall through to gentle fallback message
    }
    setFeedback(`Caption ready: ${caption}`);
  };

  const activeTemplate = payload.template;

  // Build visible preview tiles matching canvas export
  const previewMetrics: { label: string; value: string }[] = [
    {
      label: 'Tree stage',
      value: `Lv.${payload.level} ${payload.levelName}`,
    },
  ];
  if (payload.streakWeeks > 0) {
    previewMetrics.push({
      label: 'Posting streak',
      value: `${payload.streakWeeks} ${payload.streakWeeks === 1 ? 'wk' : 'wks'}`,
    });
  }
  if (payload.followers !== null) {
    previewMetrics.push({
      label: 'Followers',
      value: payload.followers.toLocaleString(),
    });
  }
  if (payload.weeklyReach !== null) {
    previewMetrics.push({
      label: 'Weekly reach',
      value: payload.weeklyReach.toLocaleString(),
    });
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        {/* Left Controls Column */}
        <div className="space-y-8 lg:col-span-7">
          {/* Tree Species Picker */}
          <section className="rounded-2xl border border-sand bg-secondary p-6 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sand pb-4">
              <div>
                <h2 className="font-display text-lg font-medium text-ink">
                  Tree variety
                </h2>
                <p className="mt-1 text-xs text-ink-secondary">
                  Switch your botanical tree before exporting your Story card.
                </p>
              </div>
              <span className="text-xs font-medium text-muted">
                {profile.plan === 'paid' ? '4 of 4 unlocked' : '1 of 4 free'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TREE_TYPES.map((tree) => {
                const isSelected = profile.treeType === tree.id;
                const isLocked = tree.isPaid && profile.plan === 'free';
                return (
                  <button
                    key={tree.id}
                    type="button"
                    onClick={() => handleTreeChange(tree.id, tree.isPaid)}
                    aria-pressed={isSelected}
                    className={`flex min-h-[112px] flex-col items-center justify-between rounded-xl border p-3.5 text-center ${
                      isSelected
                        ? 'border-forest bg-botanical text-ink'
                        : isLocked
                        ? 'border-sand bg-surface/65 text-muted hover:bg-surface'
                        : 'border-sand bg-surface text-ink hover:border-forest/45'
                    }`}
                  >
                    <div className="flex w-full items-center justify-end">
                      {isLocked ? (
                        <Lock className="h-3.5 w-3.5 text-bark" aria-label="Paid plan required" />
                      ) : isSelected ? (
                        <Check className="h-3.5 w-3.5 text-forest" aria-hidden="true" />
                      ) : (
                        <span className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </div>
                    <TreePreviewIllustration
                      treeType={tree.id}
                      className={`h-12 w-12 ${isLocked ? 'opacity-60' : ''}`}
                    />
                    <span className="mt-1.5 text-xs font-medium leading-tight">
                      {tree.name.replace(' Tree', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Card Style Picker */}
          <section className="rounded-2xl border border-sand bg-secondary p-6 sm:p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-sand pb-4">
              <div>
                <h2 className="font-display text-lg font-medium text-ink">
                  Story card design
                </h2>
                <p className="mt-1 text-xs text-ink-secondary">
                  Export a 9:16 card (1080×1920) sized for Instagram Stories.
                </p>
              </div>
              <span className="text-xs font-medium text-muted">
                {profile.plan === 'paid' ? '4 of 4 unlocked' : '1 of 4 free'}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STORY_CARD_TEMPLATES.map((tpl) => {
                const locked = tpl.isPaid && profile.plan === 'free';
                const selected = activeTemplate.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    aria-pressed={selected}
                    className={`flex min-h-[78px] w-full items-center gap-3.5 rounded-xl border p-3.5 text-left ${
                      selected
                        ? 'border-forest bg-botanical'
                        : locked
                        ? 'border-sand bg-surface/65 hover:bg-surface'
                        : 'border-sand bg-surface hover:border-forest/45'
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className="flex h-11 w-8 shrink-0 flex-col justify-between rounded-md border border-white/15 p-1.5"
                      style={{
                        background: `linear-gradient(180deg, ${tpl.bgTop}, ${tpl.bgBottom})`,
                      }}
                    >
                      <span
                        className="block h-1.5 w-full rounded-full"
                        style={{ backgroundColor: tpl.accent }}
                      />
                      <span className="block h-1 w-3/4 rounded-full bg-white/30" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-ink">
                          {tpl.name}
                        </span>
                        {locked ? (
                          <span
                            aria-label="Paid plan required"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-canvas text-bark"
                          >
                            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        ) : selected ? (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-forest text-on-accent">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-ink-secondary">{tpl.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Privacy & Reflection Controls */}
          <section className="space-y-6 rounded-2xl border border-sand bg-secondary p-6 sm:p-7">
            <div>
              <h2 className="font-display text-lg font-medium text-ink">
                Choose what to share
              </h2>
              <p className="mt-1 text-xs text-ink-secondary">
                Hide exact follower or reach counts whenever you prefer to share
                just your tree and consistency.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  {
                    key: 'showFollowers' as const,
                    label: 'Followers',
                    active: visibility.showFollowers,
                  },
                  {
                    key: 'showReach' as const,
                    label: 'Weekly reach',
                    active: visibility.showReach,
                  },
                  {
                    key: 'showStreak' as const,
                    label: 'Posting streak',
                    active: visibility.showStreak,
                  },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    aria-pressed={item.active}
                    onClick={() =>
                      setVisibility((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`inline-flex min-h-[44px] items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium ${
                      item.active
                        ? 'border-forest/50 bg-botanical text-forest'
                        : 'border-sand bg-surface text-ink-secondary hover:text-ink'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.active ? (
                      <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-sand pt-6">
              <div className="flex items-baseline justify-between gap-2">
                <label
                  htmlFor="story-reflection-note"
                  className="text-sm font-medium text-ink"
                >
                  Reflection line
                </label>
                <span className="text-xs text-muted tabular-nums">
                  {customNote.length}/{STORY_CAPTION_MAX_LENGTH}
                </span>
              </div>
              <input
                id="story-reflection-note"
                type="text"
                maxLength={STORY_CAPTION_MAX_LENGTH}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Write a short intention or gratitude note"
                className="mt-2 min-h-[48px] w-full rounded-xl border border-white/[0.1] bg-field px-4 py-2.5 text-base text-ink outline-none transition-colors focus:border-forest"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {STORY_REFLECTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomNote(preset)}
                    className="min-h-[38px] rounded-xl border border-sand bg-surface px-3 py-1.5 text-left text-xs text-ink-secondary hover:border-forest/40 hover:text-ink"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Download & Copy Controls */}
            <div className="space-y-3 border-t border-sand pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap"
                >
                  <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Download PNG (1080×1920)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCaption}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-sand bg-surface-elevated px-4 py-2.5 text-sm font-medium text-ink hover:bg-white/[0.08] whitespace-nowrap"
                >
                  <Copy className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
                  <span>Copy caption</span>
                </button>
              </div>

              {feedback && (
                <div
                  role="status"
                  className="arbor-enter flex items-center justify-between gap-3 rounded-xl border border-forest/35 bg-botanical px-4 py-2.5 text-xs font-medium text-ink"
                >
                  <span>{feedback}</span>
                  <button
                    type="button"
                    onClick={() => setFeedback(null)}
                    className="min-h-[40px] shrink-0 px-2 font-medium text-forest underline underline-offset-4 hover:text-forest-deep"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Live 9:16 Story Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="mx-auto w-full max-w-[330px]">
            <p className="mb-3 text-center text-xs font-medium text-muted">
              Live 9:16 Story preview · {payload.treeName}
            </p>
            <article
              key={`${payload.treeType}-${activeTemplate.id}-${downloadPulseKey}`}
              data-testid="story-card-preview"
              data-template={activeTemplate.id}
              data-tree={payload.treeType}
              className={`relative flex aspect-[9/16] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/15 p-5 shadow-2xl ${
                downloadPulseKey > 0 ? 'arbor-download-flash' : ''
              }`}
              style={{
                background: `linear-gradient(180deg, ${activeTemplate.bgTop} 0%, ${activeTemplate.bgBottom} 100%)`,
                color: activeTemplate.textPrimary,
              }}
            >
              {/* Top Bar */}
              <div>
                <div className="flex items-center justify-between gap-2 text-[11px] font-medium">
                  <span style={{ color: activeTemplate.accent }}>
                    Arbor Improve
                  </span>
                  <span style={{ color: activeTemplate.textMuted }}>
                    {payload.weekLabel}
                  </span>
                </div>

                <h3 className="mt-2.5 font-display text-xl font-semibold leading-tight">
                  {payload.creatorName}
                </h3>
                <p
                  className="mt-0.5 text-xs"
                  style={{ color: activeTemplate.textMuted }}
                >
                  {payload.treeName} · Level {payload.level} ({payload.levelName})
                </p>
              </div>

              {/* Tree Spotlight */}
              <div
                className="pointer-events-none my-2 flex flex-1 select-none items-center justify-center rounded-xl"
                style={{
                  background: payload.isThirsty
                    ? 'radial-gradient(circle, rgba(215, 168, 94, 0.14) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(182, 237, 101, 0.12) 0%, rgba(32, 184, 137, 0.06) 45%, transparent 72%)',
                }}
              >
                <TreeIllustration
                  treeType={payload.treeType}
                  level={payload.level}
                  isThirsty={payload.isThirsty}
                  className="h-44 w-48"
                />
              </div>

              {/* Reflection & Metrics */}
              <div className="space-y-2.5">
                <div
                  className="rounded-xl border border-white/10 px-3.5 py-2.5"
                  style={{ backgroundColor: activeTemplate.cardSurface }}
                >
                  <p
                    className="text-[10px] font-medium"
                    style={{ color: activeTemplate.accent }}
                  >
                    Creator reflection
                  </p>
                  <p className="mt-1 text-xs leading-relaxed">
                    &ldquo;{payload.note}&rdquo;
                  </p>
                </div>

                <div
                  className={`grid gap-2 ${
                    previewMetrics.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                  }`}
                >
                  {previewMetrics.map((m, idx) => (
                    <div
                      key={m.label}
                      className={`rounded-xl border border-white/10 px-3 py-2 tabular-nums ${
                        previewMetrics.length === 3 && idx === 0 ? 'col-span-2' : ''
                      }`}
                      style={{ backgroundColor: activeTemplate.cardSurface }}
                    >
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: activeTemplate.textMuted }}
                      >
                        {m.label}
                      </p>
                      <p className="mt-0.5 font-display text-sm font-semibold leading-snug">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] font-medium">
                  <span style={{ color: activeTemplate.textMuted }}>
                    Growth with barakah
                  </span>
                  <span style={{ color: activeTemplate.accent }}>
                    {payload.badgesCount} milestones
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
