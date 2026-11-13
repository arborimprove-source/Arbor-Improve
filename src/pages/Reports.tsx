import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, Lock, Share2 } from 'lucide-react';
import { StoryCardStudio } from '../components/reports/StoryCardStudio';
import { WeeklyTrendChart } from '../components/reports/WeeklyTrendChart';
import { formatShortDate } from '../lib/dateUtils';
import {
  ReportRange,
  buildMonthlyComparison,
  buildMonthlySummaries,
  buildReportHighlights,
  buildWeeklyChartSeries,
} from '../lib/reports';
import {
  AppTab,
  Badge,
  Goal,
  Profile,
  TREE_TYPES,
  TreeState,
  TreeType,
  WeeklyEntry,
} from '../types';

export type ReportsSection = 'reports' | 'cards';

interface ReportsPageProps {
  initialSection?: ReportsSection;
  currentWeekMonday: string;
  profile: Profile;
  entries: WeeklyEntry[];
  treeState: TreeState;
  badges: Badge[];
  goals: Goal[];
  onNavigate: (tab: AppTab) => void;
  onSelectTree: (treeType: TreeType) => void;
  onOpenUpgrade: (featureName?: string) => void;
}

function formatDelta(value: number | null, suffix = ''): string {
  if (value === null) return 'First month';
  if (value === 0) return `0${suffix} vs prior month`;
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toLocaleString()}${suffix} vs prior month`;
}

export function ReportsPage({
  initialSection = 'reports',
  currentWeekMonday,
  profile,
  entries,
  treeState,
  badges,
  goals,
  onNavigate,
  onSelectTree,
  onOpenUpgrade,
}: ReportsPageProps) {
  const [section, setSection] = useState<ReportsSection>(initialSection);
  const [range, setRange] = useState<ReportRange>('8w');

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const treeDef =
    TREE_TYPES.find((t) => t.id === profile.treeType) ?? TREE_TYPES[0];
  const monthlySummaries = buildMonthlySummaries(entries);
  const comparison = buildMonthlyComparison(entries);
  const weeklySeries = buildWeeklyChartSeries(entries, range);
  const highlights = buildReportHighlights(entries);
  const sortedNewestFirst = [...entries].sort((a, b) =>
    b.weekStart.localeCompare(a.weekStart)
  );

  return (
    <div className="space-y-12 lg:space-y-16">
      {/* Header + Segmented Section Switch */}
      <header className="flex flex-col gap-6 border-b border-sand pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-forest tabular-nums">
            {entries.length} {entries.length === 1 ? 'week' : 'weeks'} logged ·{' '}
            {treeDef.name} ·{' '}
            {profile.plan === 'paid' ? 'Paid plan' : 'Free plan'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-medium tracking-tight text-ink sm:text-4xl">
            {section === 'reports' ? 'Growth Reports' : 'Shareable Story Cards'}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-secondary">
            {section === 'reports'
              ? 'Calm monthly comparisons and weekly momentum without external pressure.'
              : 'Turn your growing tree and consistency into a 9:16 Instagram Story card.'}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Reports view"
          className="inline-flex self-start rounded-xl border border-sand bg-surface p-1 sm:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={section === 'reports'}
            onClick={() => setSection('reports')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap ${
              section === 'reports'
                ? 'bg-forest text-on-accent font-semibold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Growth Reports</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'cards'}
            onClick={() => setSection('cards')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap ${
              section === 'cards'
                ? 'bg-forest text-on-accent font-semibold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Story Cards</span>
          </button>
        </div>
      </header>

      {section === 'cards' ? (
        <StoryCardStudio
          profile={profile}
          treeState={treeState}
          entries={entries}
          badges={badges}
          goals={goals}
          onSelectTree={onSelectTree}
          onOpenUpgrade={onOpenUpgrade}
        />
      ) : entries.length === 0 ? (
        <div className="space-y-12">
          <section
            aria-label="Fresh report baseline"
            className="grid grid-cols-2 gap-8 border-b border-sand pb-10 lg:grid-cols-4"
          >
            {[
              { label: 'Ending followers', value: '0' },
              { label: 'Avg weekly reach', value: '0' },
              { label: 'Posts published', value: '0' },
              { label: 'Average score', value: '0/100' },
            ].map((item) => (
              <div key={item.label} className="tabular-nums">
                <p className="text-xs font-medium text-muted">{item.label}</p>
                <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                  {item.value}
                </p>
                <p className="mt-1.5 text-xs text-ink-secondary">0 weeks logged</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-sand bg-secondary p-8 text-center sm:p-12">
            <BarChart3 className="mx-auto h-7 w-7 text-forest" aria-hidden="true" />
            <h2 className="mt-4 font-display text-2xl font-medium text-ink">
              No weekly check-ins logged yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-secondary">
              Log your first week of Followers, Reach, Likes, and Posts to generate
              calm monthly comparisons and growth charts.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('add')}
              className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep"
            >
              <span>Log your first week</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </section>
        </div>
      ) : (
        <div className="space-y-14">
          {/* Monthly Comparison (Unlocked on Free & Paid) */}
          {comparison.currentMonth && (
            <section aria-label="Monthly comparison" className="space-y-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-forest">
                    Monthly overview · Free &amp; Paid
                  </p>
                  <h2 className="mt-1.5 font-display text-2xl font-medium text-ink">
                    {comparison.previousMonth
                      ? `${comparison.currentMonth.label} vs ${comparison.previousMonth.label}`
                      : `${comparison.currentMonth.label} baseline`}
                  </h2>
                </div>
                <p className="text-xs text-ink-secondary tabular-nums">
                  {comparison.currentMonth.weeksLogged}{' '}
                  {comparison.currentMonth.weeksLogged === 1 ? 'week' : 'weeks'} logged
                  this month
                </p>
              </div>

              {/* Clean Hairline Stat Strip */}
              <div className="grid grid-cols-2 gap-8 border-y border-sand py-8 lg:grid-cols-4">
                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Ending followers</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                    {comparison.currentMonth.endingFollowers.toLocaleString()}
                  </p>
                  <p
                    className={`mt-1.5 text-xs font-medium ${
                      comparison.followerChangeDelta !== null &&
                      comparison.followerChangeDelta > 0
                        ? 'text-forest'
                        : 'text-ink-secondary'
                    }`}
                  >
                    {formatDelta(comparison.followerChangeDelta)}
                  </p>
                </div>

                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Avg weekly reach</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                    {comparison.currentMonth.avgWeeklyReach.toLocaleString()}
                  </p>
                  <p
                    className={`mt-1.5 text-xs font-medium ${
                      comparison.avgReachDeltaPercent !== null &&
                      comparison.avgReachDeltaPercent > 0
                        ? 'text-forest'
                        : 'text-ink-secondary'
                    }`}
                  >
                    {formatDelta(comparison.avgReachDeltaPercent, '%')}
                  </p>
                </div>

                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Posts published</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                    {comparison.currentMonth.totalPosts}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-ink-secondary">
                    {formatDelta(comparison.postsDelta)}
                  </p>
                </div>

                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Average score</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-forest">
                    {comparison.currentMonth.avgScore}/100
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-ink-secondary">
                    {formatDelta(comparison.avgScoreDelta, ' pts')}
                  </p>
                </div>
              </div>

              <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
                {comparison.reflection}
              </p>

              {/* Monthly Breakdown Table */}
              {monthlySummaries.length > 0 && (
                <div className="overflow-x-auto border-t border-sand">
                  <table className="w-full min-w-[520px] text-left text-sm tabular-nums">
                    <thead>
                      <tr className="border-b border-sand text-xs font-medium text-muted">
                        <th className="py-3.5 pr-4 font-medium">Month</th>
                        <th className="py-3.5 px-3 text-right font-medium">Weeks</th>
                        <th className="py-3.5 px-3 text-right font-medium">Followers</th>
                        <th className="py-3.5 px-3 text-right font-medium">Net gain</th>
                        <th className="py-3.5 px-3 text-right font-medium">Avg reach</th>
                        <th className="py-3.5 px-3 text-right font-medium">Posts</th>
                        <th className="py-3.5 pl-3 text-right font-medium">Avg score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand">
                      {[...monthlySummaries].reverse().map((m) => (
                        <tr key={m.monthKey} className="hover:bg-surface/45">
                          <td className="py-3.5 pr-4 font-medium text-ink">
                            {m.label}
                          </td>
                          <td className="py-3.5 px-3 text-right text-ink-secondary">
                            {m.weeksLogged}
                          </td>
                          <td className="py-3.5 px-3 text-right text-ink-secondary">
                            {m.endingFollowers.toLocaleString()}
                          </td>
                          <td
                            className={`py-3.5 px-3 text-right ${
                              m.netFollowerChange > 0 ? 'text-forest font-medium' : 'text-ink-secondary'
                            }`}
                          >
                            {m.netFollowerChange > 0 ? '+' : ''}
                            {m.netFollowerChange.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right text-ink-secondary">
                            {m.avgWeeklyReach.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-3 text-right text-ink-secondary">
                            {m.totalPosts}
                          </td>
                          <td className="py-3.5 pl-3 text-right font-medium text-forest">
                            {m.avgScore}/100
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Weekly Reach & Follower Charts (Paid Plan Feature) */}
          {profile.plan === 'paid' ? (
            <div className="space-y-8">
              {/* Highlights Strip */}
              <section
                aria-label="Weekly highlights"
                className="grid grid-cols-2 gap-8 border-t border-sand pt-10 lg:grid-cols-4"
              >
                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Net follower growth</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-forest">
                    {highlights.netFollowerGain > 0 ? '+' : ''}
                    {highlights.netFollowerGain.toLocaleString()}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-secondary">
                    Across {highlights.totalWeeks} logged weeks
                  </p>
                </div>

                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Avg weekly reach</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                    {highlights.avgWeeklyReach.toLocaleString()}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-secondary">
                    Your personal baseline
                  </p>
                </div>

                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Best reach week</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                    {highlights.bestReachWeek
                      ? highlights.bestReachWeek.reach.toLocaleString()
                      : '—'}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-secondary">
                    {highlights.bestReachWeek
                      ? `Week of ${formatShortDate(highlights.bestReachWeek.weekStart)}`
                      : ''}
                  </p>
                </div>

                <div className="tabular-nums">
                  <p className="text-xs font-medium text-muted">Total posts logged</p>
                  <p className="mt-2 font-display-num text-3xl font-medium text-ink">
                    {highlights.totalPosts.toLocaleString()}
                  </p>
                  <p className="mt-1.5 text-xs text-ink-secondary">
                    {highlights.bestScoreWeek
                      ? `Top score ${highlights.bestScoreWeek.score}/100`
                      : ''}
                  </p>
                </div>
              </section>

              <WeeklyTrendChart
                points={weeklySeries}
                range={range}
                onRangeChange={setRange}
              />
            </div>
          ) : (
            <section
              aria-label="Weekly charts locked preview"
              className="rounded-2xl border border-sand bg-secondary p-7 sm:p-9"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-xl">
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-bark">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Paid feature</span>
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-medium text-ink">
                    Weekly reach &amp; follower charts
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    Visualize your weekly reach curves, follower trajectory over 4,
                    8, or 12 weeks, and best-week highlights with Arbor Paid.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenUpgrade('Weekly growth reports & charts')}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-bark px-5 py-2.5 text-sm font-semibold text-on-accent hover:opacity-90 whitespace-nowrap shrink-0"
                >
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  <span>Unlock weekly charts</span>
                </button>
              </div>
            </section>
          )}

          {/* Complete Check-in History Table */}
          <section aria-label="All weekly check-ins" className="border-t border-sand pt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-medium text-ink">
                All weekly check-ins ({sortedNewestFirst.length})
              </h2>
              <button
                type="button"
                onClick={() => setSection('cards')}
                className="inline-flex min-h-[42px] items-center gap-2 text-xs font-medium text-forest hover:text-forest-deep whitespace-nowrap"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Create a Story card from these stats</span>
              </button>
            </div>

            <div className="mt-5 overflow-x-auto border-t border-sand">
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
                  {sortedNewestFirst.map((item) => {
                    const isCurrent = item.weekStart === currentWeekMonday;
                    return (
                      <tr key={item.id} className="hover:bg-surface/45">
                        <td className="py-3.5 pr-4 font-medium text-ink">
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
                        <td className="py-3.5 px-3 text-right text-ink-secondary">
                          {item.followers.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right text-ink-secondary">
                          {item.reach.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right text-ink-secondary">
                          {item.likes.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 text-right text-ink-secondary">
                          {item.posts}
                        </td>
                        <td
                          className={`py-3.5 pl-3 text-right font-medium ${
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
        </div>
      )}
    </div>
  );
}
