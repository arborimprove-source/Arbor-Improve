import { useEffect } from 'react';
import { Award, Flame, Sprout, TrendingUp, Users, X } from 'lucide-react';
import { BADGE_CATEGORY_LABELS, getBadgeByKey } from '../../lib/badges';
import {
  Badge,
  BadgeDefinition,
  TREE_LEVEL_NAMES,
  TREE_TYPES,
  TreeLevel,
  TreeType,
} from '../../types';
import { TreeIllustration } from '../tree/TreeIllustration';

interface CelebrationDialogProps {
  isOpen: boolean;
  treeType: TreeType;
  level: TreeLevel;
  leveledUp: boolean;
  newBadges: Badge[];
  onClose: () => void;
  onViewBadges: () => void;
}

const LEAF_PARTICLES = [
  { left: '8%', delay: '0s', color: '#b6ed65', size: 12 },
  { left: '20%', delay: '0.35s', color: '#20b889', size: 14 },
  { left: '33%', delay: '0.15s', color: '#d7a85e', size: 10 },
  { left: '48%', delay: '0.55s', color: '#b6ed65', size: 13 },
  { left: '62%', delay: '0.2s', color: '#20b889', size: 12 },
  { left: '76%', delay: '0.45s', color: '#a4df4e', size: 11 },
  { left: '89%', delay: '0.1s', color: '#b6ed65', size: 14 },
];

function MilestoneIcon({ category }: { category: BadgeDefinition['category'] }) {
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

export function CelebrationDialog({
  isOpen,
  treeType,
  level,
  leveledUp,
  newBadges,
  onClose,
  onViewBadges,
}: CelebrationDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const treeDef = TREE_TYPES.find((t) => t.id === treeType) ?? TREE_TYPES[0];
  const levelName = TREE_LEVEL_NAMES[level];

  const resolvedBadges = newBadges
    .map((b) => ({
      badge: b,
      def: getBadgeByKey(b.badgeKey),
    }))
    .filter((item): item is { badge: Badge; def: BadgeDefinition } =>
      Boolean(item.def)
    );

  const heading = leveledUp
    ? `Masha'Allah! Level ${level} reached`
    : resolvedBadges.length > 1
    ? `${resolvedBadges.length} milestones unlocked`
    : 'Milestone unlocked';

  const subtitle = leveledUp
    ? `Your ${treeDef.name} grew into a ${levelName}. Steady effort carries barakah.`
    : 'Every quiet week you show up strengthens your roots.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-dialog-title"
    >
      <div className="arbor-enter arbor-tree-horizon relative w-full max-w-md overflow-hidden rounded-2xl border border-sand bg-secondary p-6 shadow-2xl sm:p-7">
        {/* Gentle botanical leaf confetti */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-44 overflow-hidden"
        >
          {LEAF_PARTICLES.map((p, idx) => (
            <svg
              key={idx}
              viewBox="0 0 16 16"
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay,
              }}
              className="animate-arbor-petal absolute top-2 opacity-0"
            >
              <path
                d="M8 1C12 4 14 9 8 15C2 9 4 4 8 1Z"
                fill={p.color}
              />
            </svg>
          ))}
        </div>

        {/* Close button */}
        <div className="relative flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close celebration"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Botanical Tree + Title */}
        <div className="relative -mt-3 flex flex-col items-center text-center">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-sand bg-canvas">
            <TreeIllustration
              treeType={treeType}
              level={level}
              className="h-24 w-24"
            />
          </div>

          <p className="mt-4 text-xs font-medium text-forest">
            {treeDef.name} · Level {level} ({levelName})
          </p>
          <h2
            id="celebration-dialog-title"
            className="mt-1.5 font-display text-2xl font-medium tracking-tight text-ink"
          >
            {heading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
            {subtitle}
          </p>
        </div>

        {/* Unlocked Badges */}
        {resolvedBadges.length > 0 && (
          <ul className="relative mt-6 max-h-56 divide-y divide-sand overflow-y-auto border-y border-sand">
            {resolvedBadges.map(({ def }) => (
              <li key={def.key} className="flex items-start gap-3 py-3.5 text-left">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest text-on-accent">
                  <MilestoneIcon category={def.category} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-display text-sm font-medium text-ink">
                      {def.title}
                    </p>
                    <span className="text-[11px] font-medium text-muted shrink-0">
                      {BADGE_CATEGORY_LABELS[def.category]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-ink-secondary">
                    {def.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="relative mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onViewBadges}
            className="min-h-[44px] rounded-xl border border-sand bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-white/[0.08]"
          >
            View all badges
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-forest px-5 py-2 text-sm font-semibold text-on-accent hover:bg-forest-deep"
          >
            Keep growing
          </button>
        </div>
      </div>
    </div>
  );
}
