import { useMemo, useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Lock,
  Search,
  X,
} from 'lucide-react';
import {
  CALENDAR_CATEGORY_LABELS,
  CalendarCategory,
  ISLAMIC_CALENDAR_ENTRIES,
  filterCalendarEntries,
  getDaysUntilEntry,
  getIslamicDateLabel,
  getNextUpcomingCalendarHighlight,
  isCalendarEntryUnlocked,
} from '../lib/calendar';
import { formatShortDate } from '../lib/dateUtils';
import { PlanType, Profile } from '../types';

interface CalendarPageProps {
  profile: Profile;
  savedCalendarIds: string[];
  onToggleSaved: (calendarId: string) => void;
  onOpenUpgrade: (featureName?: string) => void;
}

const CATEGORIES: CalendarCategory[] = [
  'all',
  'weekly',
  'ramadan_eid',
  'sacred_months',
];

function formatCountdown(days: number | null): string | null {
  if (days === null) return null;
  if (days < 0) return 'Completed season';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export function CalendarPage({
  profile,
  savedCalendarIds,
  onToggleSaved,
  onOpenUpgrade,
}: CalendarPageProps) {
  const [category, setCategory] = useState<CalendarCategory>('all');
  const [query, setQuery] = useState('');
  const [savedOnly, setSavedOnly] = useState(false);

  const today = useMemo(() => new Date(), []);
  const hijriToday = useMemo(() => getIslamicDateLabel(today), [today]);
  const highlight = useMemo(() => getNextUpcomingCalendarHighlight(today), [today]);

  const filtered = useMemo(() => {
    const base = filterCalendarEntries(ISLAMIC_CALENDAR_ENTRIES, category, query);
    if (!savedOnly) return base;
    return base.filter((e) => savedCalendarIds.includes(e.id));
  }, [category, query, savedOnly, savedCalendarIds]);

  const unlockedCount = useMemo(
    () =>
      ISLAMIC_CALENDAR_ENTRIES.filter((e) =>
        isCalendarEntryUnlocked(e, profile.plan as PlanType)
      ).length,
    [profile.plan]
  );

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex flex-col gap-6 border-b border-sand pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-emerald tabular-nums">
            {hijriToday} · {unlockedCount} of {ISLAMIC_CALENDAR_ENTRIES.length}{' '}
            guides unlocked
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            Islamic Content Calendar
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">
            Plan Jummah, Ramadan, and sacred seasons ahead so your worship stays
            unhurried.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSavedOnly((prev) => !prev)}
          aria-pressed={savedOnly}
          className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium whitespace-nowrap shrink-0 self-start sm:self-auto ${
            savedOnly
              ? 'border-forest bg-botanical text-forest'
              : 'border-sand bg-surface text-ink-secondary hover:text-ink hover:bg-white/[0.06]'
          }`}
        >
          <Bookmark className="h-4 w-4" aria-hidden="true" />
          <span>Saved plan ({savedCalendarIds.length})</span>
        </button>
      </header>

      {/* Next Up Spotlight */}
      <section
        aria-label="Upcoming occasion spotlight"
        className="arbor-tree-horizon rounded-2xl border border-sand bg-secondary p-6 sm:p-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-forest">
              Next up · {highlight.timingLabel} · {highlight.entry.hijriLabel}
            </p>
            <h2 className="mt-1.5 font-display text-2xl font-medium text-ink">
              {highlight.entry.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              {highlight.entry.summary}
            </p>
          </div>
          {profile.plan === 'free' && (
            <button
              type="button"
              onClick={() =>
                onOpenUpgrade('Full Ramadan, Eid & Jummah content calendar')
              }
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-bark px-4 py-2 text-xs font-semibold text-on-accent hover:opacity-90 whitespace-nowrap shrink-0"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Unlock full year</span>
            </button>
          )}
        </div>
      </section>

      {/* Filter Tabs + Search Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter calendar by season"
          className="flex flex-wrap gap-1.5 rounded-xl border border-sand bg-secondary p-1"
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={active}
                className={`min-h-[40px] rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                  active
                    ? 'bg-forest text-on-accent font-semibold'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {CALENDAR_CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:max-w-xs">
          <label htmlFor="calendar-search" className="sr-only">
            Search Islamic calendar prompts
          </label>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            id="calendar-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Ramadan, Jummah, Eid..."
            className="min-h-[46px] w-full rounded-xl border border-white/[0.1] bg-field pl-10 pr-9 py-2 text-base text-ink outline-none transition-colors focus:border-forest"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Cards */}
      {filtered.length === 0 ? (
        <section className="rounded-2xl border border-sand bg-secondary p-8 text-center">
          <CalendarDays className="mx-auto h-6 w-6 text-forest" aria-hidden="true" />
          <h2 className="mt-3 font-display text-lg font-medium text-ink">
            No matching calendar occasions
          </h2>
          <p className="mt-1.5 text-sm text-ink-secondary">
            Try clearing your search or switching back to all occasions.
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('all');
              setQuery('');
              setSavedOnly(false);
            }}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl border border-forest/35 bg-botanical px-4 py-2 text-xs font-medium text-forest hover:bg-forest/20"
          >
            Reset filters
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((item) => {
            const unlocked = isCalendarEntryUnlocked(item, profile.plan);
            const isSaved = savedCalendarIds.includes(item.id);
            const daysUntil = getDaysUntilEntry(item, today);
            const countdown = formatCountdown(daysUntil);

            return (
              <article
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl border p-6 sm:p-7 ${
                  unlocked
                    ? 'border-sand bg-secondary'
                    : 'border-sand bg-secondary/60'
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium text-emerald tabular-nums">
                      {item.hijriLabel}
                      {item.approxDateISO
                        ? ` · Est. ${formatShortDate(item.approxDateISO)}`
                        : ''}
                    </p>
                    <span className="text-xs text-muted tabular-nums">
                      {countdown ?? 'Every week'}
                    </span>
                  </div>

                  <h2 className="mt-2 font-display text-xl font-medium text-ink">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {item.summary}
                  </p>

                  {unlocked ? (
                    <>
                      <div className="mt-5 border-t border-sand pt-5">
                        <p className="text-xs font-medium text-muted">
                          Content ideas ({item.prepLeadDays}d prep lead)
                        </p>
                        <ul className="mt-3 space-y-2.5 text-sm text-ink/90">
                          {item.contentPrompts.map((prompt, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="font-display-num text-xs font-medium text-forest mt-0.5">
                                0{idx + 1}.
                              </span>
                              <span>{prompt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-bark">
                        {item.toneNote}
                      </p>
                    </>
                  ) : (
                    <div className="mt-5 border-t border-sand pt-5">
                      <p className="inline-flex items-center gap-1.5 text-xs font-medium text-bark">
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Paid seasonal prompts</span>
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink-secondary">
                        Unlock 3 curated Reel, Carousel &amp; Story ideas plus{' '}
                        {item.prepLeadDays}-day advance batching guidance.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-sand pt-5">
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => onToggleSaved(item.id)}
                      aria-pressed={isSaved}
                      className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium ${
                        isSaved
                          ? 'border-forest bg-botanical text-forest'
                          : 'border-sand bg-surface text-ink hover:bg-white/[0.06]'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                          <span>Saved to my plan</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" aria-hidden="true" />
                          <span>Save to my plan</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenUpgrade(
                          'Full Ramadan, Eid & Jummah content calendar'
                        )
                      }
                      className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-bark px-4 py-2 text-xs font-semibold text-on-accent hover:opacity-90"
                    >
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Unlock seasonal guide</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
