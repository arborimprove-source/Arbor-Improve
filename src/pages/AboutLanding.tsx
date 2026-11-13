import React, { useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Mail,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { TreeIllustration } from '../components/tree/TreeIllustration';
import { AppTab, PlanType, Profile } from '../types';

type LegalTab = 'privacy' | 'terms' | 'contact';

interface AboutLandingPageProps {
  profile: Profile;
  waitlistEmails: string[];
  onJoinWaitlist: (email: string) => {
    ok: boolean;
    error?: string;
    emails: string[];
  };
  onSetPlan: (plan: PlanType) => void;
  onNavigate: (tab: AppTab) => void;
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: '30-second weekly check-in',
    body: 'Type your Followers, Reach, Likes, and Posts from Instagram Insights once a week. No passwords or Meta logins.',
  },
  {
    step: '02',
    title: 'Personal baseline scoring',
    body: 'Your weekly score compares you only against your own recent 4-week reach and posting rhythm — never against viral accounts.',
  },
  {
    step: '03',
    title: 'A tree that keeps your level',
    body: 'Steady weeks grow your Olive, Date Palm, Pomegranate, or Fig tree across 5 stages. Quiet weeks turn it thirsty without erasing your level.',
  },
  {
    step: '04',
    title: 'Halal-friendly planning & sharing',
    body: 'Plan Jummah and Ramadan ahead with the Islamic Content Calendar and export privacy-conscious 9:16 Story cards.',
  },
];

const FREE_FEATURES = [
  'Olive tree across all 5 growth stages',
  'Weekly check-ins & personal baseline score',
  'All 12 creator milestones & streak tracking',
  'Calm monthly comparison report',
  '1 active follower goal & 1 Story card design',
  'Weekly Jummah & Rajab starter calendar',
];

const PAID_FEATURES = [
  'All 4 botanical trees (Olive, Date Palm, Pomegranate, Fig)',
  'Weekly reach, follower & score trend charts (4W–All)',
  'Up to 5 active follower goals at once',
  'All 4 shareable 1080×1920 Story card designs',
  'Full Ramadan, Eid, Dhul Hijjah & Muharram calendar',
  'Supports calm, ad-free Muslim creator tooling',
];

export function AboutLandingPage({
  profile,
  waitlistEmails,
  onJoinWaitlist,
  onSetPlan,
  onNavigate,
}: AboutLandingPageProps) {
  const [email, setEmail] = useState('');
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState<string | null>(null);
  const [legalTab, setLegalTab] = useState<LegalTab>('privacy');

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onJoinWaitlist(email);
    if (!res.ok) {
      setWaitlistError(res.error ?? 'Please enter a valid email address.');
      setWaitlistSuccess(null);
      return;
    }
    setWaitlistError(null);
    setWaitlistSuccess(
      `JazakAllahu khayran — ${email.trim().toLowerCase()} is saved to the early-access waitlist on this device.`
    );
    setEmail('');
  };

  return (
    <div className="space-y-16 lg:space-y-20">
      {/* Hero Section */}
      <section className="arbor-tree-horizon rounded-2xl border border-sand bg-secondary p-8 sm:p-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium text-forest">
              Arbor Improve · For Muslim Instagram Creators
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Grow your Instagram steadily, without burnout or comparison.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary">
              A calm weekly growth companion that turns your Instagram Insights
              into a living botanical tree. Designed for small Muslim creators
              who value consistency, privacy, and barakah over hustle culture.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('add')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap"
              >
                <span>Log this week</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('calendar')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-sand bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:bg-white/[0.06] whitespace-nowrap"
              >
                <CalendarDays className="h-4 w-4 text-emerald" aria-hidden="true" />
                <span>Explore Islamic calendar</span>
              </button>
            </div>
          </div>

          <div className="pointer-events-none select-none flex flex-col items-center justify-center rounded-2xl border border-sand bg-canvas/80 p-8 lg:col-span-5 arbor-tree-horizon">
            <TreeIllustration
              treeType={profile.treeType}
              level={5}
              className="h-52 w-56"
            />
            <p className="mt-4 text-xs font-medium text-forest">
              Level 05 · Fruitful Stage
            </p>
          </div>
        </div>
      </section>

      {/* How Arbor Works — Editorial Numbered Rows */}
      <section aria-label="How Arbor Improve works" className="space-y-8">
        <div>
          <p className="text-xs font-medium text-emerald">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">
            Built for 30 seconds a week
          </h2>
        </div>

        <ol className="divide-y divide-sand border-y border-sand">
          {HOW_IT_WORKS.map((item) => (
            <li
              key={item.step}
              className="grid grid-cols-1 gap-3 py-7 sm:grid-cols-12 sm:items-baseline"
            >
              <span className="font-display-num text-sm font-medium text-forest sm:col-span-2">
                {item.step}
              </span>
              <h3 className="font-display text-lg font-medium text-ink sm:col-span-4">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink-secondary sm:col-span-6">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pricing Matrix */}
      <section aria-label="Pricing plans" className="space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium text-forest">Simple pricing</p>
            <h2 className="mt-2 font-display text-2xl font-medium text-ink sm:text-3xl">
              Start free forever, or preview Paid tools
            </h2>
          </div>
          <p className="text-xs text-ink-secondary">
            Current preview mode:{' '}
            <strong className="font-medium text-ink">
              {profile.plan === 'paid' ? 'Paid ($4/mo)' : 'Free ($0)'}
            </strong>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* Free Tier */}
          <article className="flex flex-col justify-between rounded-2xl border border-sand bg-secondary p-7 sm:p-8">
            <div>
              <p className="text-xs font-medium text-muted">For getting started</p>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-medium text-ink">
                  Arbor Free
                </h3>
                <p className="font-display-num text-3xl font-medium text-ink">
                  $0{' '}
                  <span className="font-sans text-xs font-normal text-muted">
                    / forever
                  </span>
                </p>
              </div>
              <ul className="mt-6 space-y-3 border-t border-sand pt-6 text-sm text-ink-secondary">
                {FREE_FEATURES.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald"
                      aria-hidden="true"
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                onSetPlan('free');
                onNavigate('home');
              }}
              className="mt-8 min-h-[46px] w-full rounded-xl border border-sand bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-white/[0.06]"
            >
              {profile.plan === 'free'
                ? 'Active on Free — Back to Home'
                : 'Switch to Free preview'}
            </button>
          </article>

          {/* Paid Tier */}
          <article className="arbor-tree-horizon flex flex-col justify-between rounded-2xl border border-forest/40 bg-secondary p-7 sm:p-8">
            <div>
              <p className="text-xs font-medium text-forest">
                For growing Muslim creators
              </p>
              <div className="mt-2 flex items-baseline justify-between gap-2">
                <h3 className="font-display text-xl font-medium text-ink">
                  Arbor Paid
                </h3>
                <p className="font-display-num text-3xl font-medium text-forest">
                  $4{' '}
                  <span className="font-sans text-xs font-normal text-muted">
                    / month (Coming soon)
                  </span>
                </p>
              </div>
              <ul className="mt-6 space-y-3 border-t border-sand pt-6 text-sm text-ink/90">
                {PAID_FEATURES.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <Sprout
                      className="mt-0.5 h-4 w-4 shrink-0 text-forest"
                      aria-hidden="true"
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                onSetPlan('paid');
                onNavigate('home');
              }}
              className="mt-8 min-h-[46px] w-full rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep"
            >
              {profile.plan === 'paid'
                ? 'Active Paid preview — Back to Home'
                : 'Preview Paid features now'}
            </button>
          </article>
        </div>
      </section>

      {/* Waitlist Form */}
      <section
        aria-labelledby="waitlist-heading"
        className="rounded-2xl border border-sand bg-secondary p-7 sm:p-9"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium text-bark">Early access waitlist</p>
            <h2
              id="waitlist-heading"
              className="mt-2 font-display text-2xl font-medium text-ink"
            >
              Get notified when Arbor Paid ($4/month) launches
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
              No spam or drip campaigns. In this local version, your waitlist
              entry is saved privately in your browser ({waitlistEmails.length}{' '}
              {waitlistEmails.length === 1 ? 'email' : 'emails'} saved locally).
            </p>
          </div>

          <form
            onSubmit={handleWaitlistSubmit}
            noValidate
            className="space-y-3 lg:col-span-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address for Paid waitlist
              </label>
              <input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (waitlistError) setWaitlistError(null);
                }}
                placeholder="you@example.com"
                aria-invalid={Boolean(waitlistError)}
                className={`min-h-[48px] w-full rounded-xl border bg-field px-4 py-2.5 text-base text-ink outline-none transition-colors ${
                  waitlistError
                    ? 'border-bark focus:border-bark'
                    : 'border-white/[0.1] focus:border-forest'
                }`}
              />
              <button
                type="submit"
                className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                <span>Join waitlist</span>
              </button>
            </div>

            {waitlistError && (
              <p role="alert" className="text-xs font-medium text-bark">
                {waitlistError}
              </p>
            )}
            {waitlistSuccess && (
              <p
                role="status"
                className="rounded-xl border border-forest/35 bg-botanical px-4 py-2.5 text-xs font-medium text-ink"
              >
                {waitlistSuccess}
              </p>
            )}
          </form>
        </div>
      </section>

      {/* Privacy, Terms & Contact (Open Hairline Section) */}
      <section
        aria-label="Privacy, Terms, and Contact"
        className="border-t border-sand pt-10"
      >
        <div className="flex flex-col gap-4 border-b border-sand pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-forest" aria-hidden="true" />
            <h2 className="font-display text-xl font-medium text-ink">
              Privacy, Terms &amp; Transparency
            </h2>
          </div>

          <div
            role="tablist"
            aria-label="Legal sections"
            className="inline-flex self-start rounded-xl border border-sand bg-secondary p-1 sm:self-auto"
          >
            {(
              [
                { id: 'privacy', label: 'Privacy' },
                { id: 'terms', label: 'Terms' },
                { id: 'contact', label: 'Contact' },
              ] as const
            ).map((tab) => {
              const active = legalTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setLegalTab(tab.id)}
                  className={`min-h-[38px] rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap ${
                    active
                      ? 'bg-forest text-on-accent font-semibold'
                      : 'text-ink-secondary hover:text-ink'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 max-w-3xl space-y-3 text-sm leading-relaxed text-ink-secondary">
          {legalTab === 'privacy' && (
            <>
              <p className="font-medium text-ink">
                100% browser-local storage — zero tracking or Instagram logins.
              </p>
              <p>
                Arbor Improve Version 1 stores your weekly metrics, tree state,
                goals, badges, calendar bookmarks, and local waitlist emails
                strictly inside your browser&apos;s{' '}
                <span className="font-medium text-ink">localStorage</span>.
                Nothing is transmitted to an external server, analytics pixel, or
                AI model.
              </p>
              <p>
                You can download a complete JSON backup of your data or reset
                everything at any time from the Profile page.
              </p>
            </>
          )}

          {legalTab === 'terms' && (
            <>
              <p className="font-medium text-ink">
                Personal creator companion terms
              </p>
              <p>
                Arbor Improve is an independent self-tracking tool for Instagram
                creators. It is not affiliated with, endorsed by, or connected
                to Instagram or Meta, and does not access private Instagram APIs
                or automate account actions.
              </p>
              <p>
                All Paid tier previews in this version are free to test locally.
                No billing, card collection, or subscriptions are active yet.
              </p>
            </>
          )}

          {legalTab === 'contact' && (
            <>
              <p className="font-medium text-ink">
                Questions, feedback, or community suggestions
              </p>
              <p>
                Reach out anytime at{' '}
                <a
                  href="mailto:arborimprove@gmail.com"
                  className="font-medium text-forest underline underline-offset-4 hover:text-forest-deep"
                >
                  arborimprove@gmail.com
                </a>
                .
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
