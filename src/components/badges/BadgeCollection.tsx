import { useState } from 'react';
import { Award, Flame, Lock, Sprout, TrendingUp, Users } from 'lucide-react';
import { BADGE_CATEGORY_LABELS, BADGE_DEFINITIONS } from '../../lib/badges';
import { Badge, BadgeDefinition } from '../../types';

interface BadgeCollectionProps {
  badges: Badge[];
}

type BadgeFilter = 'all' | 'earned' | 'locked';

function BadgeCategoryIcon({ category }: { category: BadgeDefinition['category'] }) {
  switch (category) {
    case 'start':
      return <Sprout className="h-4 w-4" aria-hidden="true" />;
    case 'followers':
      return <Users className="h-4 w-4" aria-hidden="true" />;
    case 'consistency':
      return <Flame className="h-4 w-4" aria-hidden="true" />;
    case 'tree':
      return <TrendingUp className="h-4 w-4" aria-hidden="true" />;
    default:
      return <Award className="h-4 w-4" aria-hidden="true" />;
  }
}

export function BadgeCollection({ badges }: BadgeCollectionProps) {
  const [filter, setFilter] = useState<BadgeFilter>('all');
  const earnedMap = new Map(badges.map((b) => [b.badgeKey, b.earnedAt]));
  const totalCount = BADGE_DEFINITIONS.length;
  const earnedCount = BADGE_DEFINITIONS.filter((b) => earnedMap.has(b.key)).length;
  const lockedCount = totalCount - earnedCount;
  const progressPercent = Math.round((earnedCount / totalCount) * 100);

  const visibleBadges = BADGE_DEFINITIONS.filter((badge) => {
    const isEarned = earnedMap.has(badge.key);
    if (filter === 'earned') return isEarned;
    if (filter === 'locked') return !isEarned;
    return true;
  });

  return (
    <div>
      <div className="flex flex-col gap-5 border-b border-sand pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-medium text-ink">
              Milestones &amp; Badges
            </h2>
            <p className="font-display-num text-sm font-medium text-forest">
              {earnedCount} of {totalCount} earned
            </p>
          </div>
          <p className="mt-1 text-sm text-ink-secondary">
            Every small step is remembered here.
          </p>
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Milestones earned progress"
            className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]"
          >
            <div
              className="h-full rounded-full bg-forest transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Interactive filter control */}
        <div
          role="group"
          aria-label="Filter milestones"
          className="inline-flex rounded-xl border border-sand bg-secondary p-1 shrink-0"
        >
          {(
            [
              { id: 'all', label: `All (${totalCount})` },
              { id: 'earned', label: `Earned (${earnedCount})` },
              { id: 'locked', label: `Locked (${lockedCount})` },
            ] as const
          ).map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={active}
                className={`min-h-[38px] rounded-lg px-3.5 py-1 text-xs font-medium whitespace-nowrap tabular-nums ${
                  active
                    ? 'bg-surface-elevated text-forest'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleBadges.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-secondary">
          {filter === 'earned'
            ? 'No milestones earned yet. Log your first week to plant your first seed.'
            : 'Masha’Allah — you have unlocked every milestone!'}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleBadges.map((badge) => {
            const earnedAt = earnedMap.get(badge.key);
            const isEarned = Boolean(earnedAt);

            return (
              <div
                key={badge.key}
                className={`flex items-start gap-3.5 rounded-xl border p-4 transition-colors ${
                  isEarned
                    ? 'border-forest/35 bg-botanical'
                    : 'border-sand bg-secondary/70'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isEarned
                      ? 'bg-forest text-on-accent'
                      : 'bg-surface-elevated text-muted'
                  }`}
                >
                  {isEarned ? (
                    <BadgeCategoryIcon category={badge.category} />
                  ) : (
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-medium text-muted">
                    {BADGE_CATEGORY_LABELS[badge.category]}
                  </p>
                  <p
                    className={`mt-0.5 font-display text-sm font-medium ${
                      isEarned ? 'text-ink' : 'text-ink/80'
                    }`}
                  >
                    {badge.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-secondary">
                    {badge.description}
                  </p>
                  {isEarned && earnedAt && (
                    <p className="mt-2 text-[11px] font-medium text-forest">
                      Earned{' '}
                      {new Date(earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
