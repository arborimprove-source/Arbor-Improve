import { Lock, Sprout, X } from 'lucide-react';

interface UpgradeDialogProps {
  isOpen: boolean;
  featureName?: string;
  onClose: () => void;
  onEnablePaidPreview?: () => void;
  onOpenAbout?: () => void;
}

export function UpgradeDialog({
  isOpen,
  featureName,
  onClose,
  onEnablePaidPreview,
  onOpenAbout,
}: UpgradeDialogProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-dialog-title"
    >
      <div className="arbor-enter arbor-tree-horizon w-full max-w-md rounded-2xl border border-sand bg-secondary p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-botanical text-forest">
              <Sprout className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="upgrade-dialog-title"
                className="font-display text-lg font-medium text-ink"
              >
                Arbor Paid — Coming soon
              </h2>
              <p className="text-sm text-ink-secondary">
                $4/month · Optional supporter tier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted hover:bg-white/[0.06] hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {featureName && (
          <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-sand bg-surface px-4 py-3 text-sm text-ink">
            <Lock className="h-4 w-4 shrink-0 text-bark" aria-hidden="true" />
            <span>
              <strong className="font-medium">{featureName}</strong> is
              included in the Paid plan.
            </span>
          </div>
        )}

        <p className="mt-5 text-sm leading-relaxed text-ink-secondary">
          Payments are not connected in this version. When Arbor Paid launches,
          it will unlock:
        </p>

        <ul className="mt-3.5 space-y-2.5 text-sm text-ink">
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-forest">·</span>
            <span>All 4 tree varieties (Olive, Date Palm, Pomegranate, Fig)</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-forest">·</span>
            <span>Weekly growth reports with reach and follower charts</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-forest">·</span>
            <span>Full Ramadan, Eid &amp; Jummah content calendar</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="font-semibold text-forest">·</span>
            <span>4 shareable Story card designs &amp; up to 5 active goals</span>
          </li>
        </ul>

        <div className="mt-7 flex flex-col-reverse gap-2.5 border-t border-sand pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
          {onOpenAbout && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAbout();
              }}
              className="min-h-[44px] rounded-xl border border-sand bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-white/[0.08]"
            >
              Pricing &amp; waitlist
            </button>
          )}
          {onEnablePaidPreview && (
            <button
              type="button"
              onClick={() => {
                onEnablePaidPreview();
                onClose();
              }}
              className="min-h-[44px] rounded-xl border border-sand bg-surface px-4 py-2 text-sm font-medium text-bark hover:bg-white/[0.08]"
            >
              Preview Paid in Testing
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-xl bg-forest px-5 py-2 text-sm font-semibold text-on-accent hover:bg-forest-deep"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
