import { useEffect, useState } from 'react';
import { ReportRange, WeeklyChartPoint } from '../../lib/reports';

type ChartMetric = 'reach' | 'followers' | 'score';

interface WeeklyTrendChartProps {
  points: WeeklyChartPoint[];
  range: ReportRange;
  onRangeChange: (range: ReportRange) => void;
}

const RANGE_OPTIONS: { id: ReportRange; label: string }[] = [
  { id: '4w', label: '4W' },
  { id: '8w', label: '8W' },
  { id: '12w', label: '12W' },
  { id: 'all', label: 'All' },
];

const METRIC_OPTIONS: { id: ChartMetric; label: string }[] = [
  { id: 'reach', label: 'Weekly reach' },
  { id: 'followers', label: 'Followers' },
  { id: 'score', label: 'Score' },
];

function formatCompactAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${Math.round(value / 1_000)}k`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export function WeeklyTrendChart({
  points,
  range,
  onRangeChange,
}: WeeklyTrendChartProps) {
  const [metric, setMetric] = useState<ChartMetric>('reach');
  const [selectedIndex, setSelectedIndex] = useState<number>(
    Math.max(0, points.length - 1)
  );

  useEffect(() => {
    setSelectedIndex(Math.max(0, points.length - 1));
  }, [points.length, range]);

  const activePoint =
    points.length > 0
      ? points[Math.min(selectedIndex, points.length - 1)]
      : null;

  const values = points.map((p) =>
    metric === 'reach' ? p.reach : metric === 'followers' ? p.followers : p.score
  );

  const rawMin = values.length > 0 ? Math.min(...values) : 0;
  const rawMax = values.length > 0 ? Math.max(...values) : 100;

  let yMin = 0;
  let yMax = 100;
  if (metric === 'score') {
    yMin = 0;
    yMax = 100;
  } else if (metric === 'followers') {
    const spread = Math.max(10, rawMax - rawMin);
    yMin = Math.max(0, Math.floor(rawMin - spread * 0.25));
    yMax = Math.ceil(rawMax + spread * 0.15);
  } else {
    yMin = 0;
    yMax = Math.max(100, Math.ceil(rawMax * 1.15));
  }

  const ySpan = Math.max(1, yMax - yMin);

  const svgW = 680;
  const svgH = 240;
  const padL = 48;
  const padR = 20;
  const padT = 20;
  const padB = 34;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const coords = points.map((pt, idx) => {
    const val =
      metric === 'reach'
        ? pt.reach
        : metric === 'followers'
        ? pt.followers
        : pt.score;
    const x =
      points.length === 1
        ? padL + plotW / 2
        : padL + (idx / (points.length - 1)) * plotW;
    const y = padT + (1 - (val - yMin) / ySpan) * plotH;
    return { x, y, val, pt, idx };
  });

  const linePath =
    coords.length > 1
      ? coords
          .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
          .join(' ')
      : '';

  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(
          1
        )} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`
      : '';

  const gridTicks = [0, 0.5, 1].map((t) => ({
    y: padT + (1 - t) * plotH,
    label: formatCompactAxis(yMin + t * ySpan),
  }));

  const xLabelStep = points.length > 7 ? 2 : 1;

  return (
    <section
      aria-label="Weekly growth trend chart"
      className="rounded-2xl border border-sand bg-secondary p-6 sm:p-8"
    >
      {/* Controls Row */}
      <div className="flex flex-col gap-4 border-b border-sand pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Chart metric"
          className="inline-flex rounded-xl border border-sand bg-canvas p-1"
        >
          {METRIC_OPTIONS.map((opt) => {
            const active = metric === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMetric(opt.id)}
                aria-pressed={active}
                className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap ${
                  active
                    ? 'bg-forest text-on-accent font-semibold'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Timeframe range"
          className="inline-flex self-start rounded-xl border border-sand bg-canvas p-1 sm:self-auto"
        >
          {RANGE_OPTIONS.map((opt) => {
            const active = range === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onRangeChange(opt.id)}
                aria-pressed={active}
                className={`min-h-[38px] min-w-[44px] rounded-lg px-3 py-1.5 font-display-num text-xs font-medium whitespace-nowrap ${
                  active
                    ? 'bg-surface-elevated text-ink'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Point Summary Bar */}
      {activePoint && (
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-emerald">
              Week of {activePoint.label}
            </p>
            <p className="mt-1 font-display-num text-2xl font-medium text-ink sm:text-3xl">
              {metric === 'reach'
                ? `${activePoint.reach.toLocaleString()} reach`
                : metric === 'followers'
                ? `${activePoint.followers.toLocaleString()} followers`
                : `${activePoint.score} / 100 score`}
            </p>
          </div>

          <p className="text-xs text-ink-secondary tabular-nums">
            {activePoint.likes.toLocaleString()} likes · {activePoint.posts}{' '}
            {activePoint.posts === 1 ? 'post' : 'posts'} · score{' '}
            <span className={activePoint.score < 40 ? 'text-thirsty' : 'text-forest font-medium'}>
              {activePoint.score}/100
            </span>
          </p>
        </div>
      )}

      {/* SVG Trend Canvas */}
      <div className="mt-6">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Weekly ${metric} chart across ${points.length} logged weeks`}
        >
          <defs>
            <linearGradient id="arbor-chart-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#20b889" stopOpacity="0.24" />
              <stop offset="65%" stopColor="#b6ed65" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#20b889" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle Horizontal Gridlines + Y-axis labels */}
          {gridTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padL}
                y1={tick.y}
                x2={svgW - padR}
                y2={tick.y}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray={i === 0 ? undefined : '4 4'}
              />
              <text
                x={padL - 10}
                y={tick.y + 4}
                textAnchor="end"
                fill="#70776f"
                fontSize="11"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Area & Line */}
          {areaPath && <path d={areaPath} fill="url(#arbor-chart-fill)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#b6ed65"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points & X-axis labels */}
          {coords.map((c) => {
            const isSelected = activePoint?.id === c.pt.id;
            const showXLabel =
              c.idx === 0 ||
              c.idx === coords.length - 1 ||
              c.idx % xLabelStep === 0;
            return (
              <g key={c.pt.id}>
                {isSelected && (
                  <line
                    x1={c.x}
                    y1={padT}
                    x2={c.x}
                    y2={padT + plotH}
                    stroke="rgba(182, 237, 101, 0.35)"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#b6ed65' : '#090b09'}
                  stroke="#b6ed65"
                  strokeWidth={isSelected ? 3 : 2}
                  className="cursor-pointer"
                  onClick={() => setSelectedIndex(c.idx)}
                />
                {showXLabel && (
                  <text
                    x={c.x}
                    y={svgH - 8}
                    textAnchor="middle"
                    fill={isSelected ? '#f3f5f0' : '#70776f'}
                    fontSize="11"
                    fontFamily="Inter, system-ui, sans-serif"
                  >
                    {c.pt.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible Week Selector Strip */}
      {points.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-sand pt-4">
          <span className="mr-1 text-xs font-medium text-muted">Inspect week:</span>
          {points.map((pt, idx) => {
            const selected = activePoint?.id === pt.id;
            return (
              <button
                key={pt.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-pressed={selected}
                className={`min-h-[36px] rounded-lg border px-3 py-1 text-xs font-medium tabular-nums whitespace-nowrap ${
                  selected
                    ? 'border-forest/45 bg-botanical text-forest'
                    : 'border-sand bg-surface text-ink-secondary hover:text-ink'
                }`}
              >
                {pt.label}
              </button>
            );
          })}
        </div>
      )}

      {points.length === 1 && (
        <p className="mt-3 text-xs text-muted">
          Log one more week to draw your multi-week trend line.
        </p>
      )}
    </section>
  );
}
