import React from 'react';
import {
  BarChart3,
  CalendarDays,
  Home,
  PlusCircle,
  Target,
  User,
} from 'lucide-react';
import { AppTab, Profile } from '../../types';

const MOBILE_NAV_ITEMS: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'profile', label: 'Profile', icon: User },
];

const DESKTOP_NAV_ITEMS: { id: AppTab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: User },
];

interface AppShellProps {
  activeTab: AppTab;
  profile: Profile;
  onSelectTab: (tab: AppTab) => void;
  onOpenUpgrade: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  profile,
  onSelectTab,
  onOpenUpgrade,
  children,
}: AppShellProps) {
  return (
    <div className="arbor-ambient-backdrop flex min-h-screen flex-col bg-canvas text-ink">
      {/* Desktop Minimalist Editorial Top Bar */}
      <header className="sticky top-0 z-30 hidden border-b border-sand bg-canvas/85 backdrop-blur-md lg:block">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-8 px-10">
          {/* Zone 1: Brand Mark */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex min-h-[40px] items-center gap-2.5 rounded-lg px-1 text-left font-display text-base font-semibold tracking-tight text-ink whitespace-nowrap shrink-0"
          >
            <svg
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <path
                d="M9 2C12.8 4.2 14.8 7.8 14 12.2C10.2 13.6 6.2 12.4 4 9.2C3.6 5.4 5.8 3.1 9 2Z"
                fill="#b6ed65"
              />
              <path
                d="M9 15.5V7.5"
                stroke="#090b09"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span>Arbor Improve</span>
          </button>

          {/* Zone 2: Primary Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-1"
          >
            {DESKTOP_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-surface-elevated text-forest'
                      : 'text-ink-secondary hover:bg-surface/70 hover:text-ink'
                  }`}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Plan Status / Primary Action */}
          <div className="flex items-center gap-4 shrink-0">
            {profile.plan === 'free' ? (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="min-h-[38px] rounded-lg bg-forest px-4 py-1.5 text-xs font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap shrink-0"
              >
                Upgrade · $4/mo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className="min-h-[38px] rounded-lg border border-sand bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-secondary hover:border-white/15 hover:text-ink whitespace-nowrap shrink-0"
              >
                Creator Pro · $4/mo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Compact Top Bar */}
      <header className="sticky top-0 z-30 border-b border-sand bg-canvas/90 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex h-[52px] max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="flex min-h-[40px] items-center gap-2 rounded-lg text-left font-display text-base font-semibold tracking-tight text-ink whitespace-nowrap shrink-0"
          >
            <svg
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            >
              <path
                d="M9 2C12.8 4.2 14.8 7.8 14 12.2C10.2 13.6 6.2 12.4 4 9.2C3.6 5.4 5.8 3.1 9 2Z"
                fill="#b6ed65"
              />
              <path
                d="M9 15.5V7.5"
                stroke="#090b09"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span>Arbor Improve</span>
          </button>

          <div className="flex items-center shrink-0">
            {profile.plan === 'free' ? (
              <button
                type="button"
                onClick={onOpenUpgrade}
                className="min-h-[36px] rounded-lg bg-forest px-3.5 py-1.5 text-xs font-semibold text-on-accent hover:bg-forest-deep whitespace-nowrap shrink-0"
              >
                Upgrade
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSelectTab('profile')}
                className="min-h-[36px] rounded-lg border border-sand bg-surface px-3 py-1.5 text-xs font-medium text-forest hover:border-white/15 whitespace-nowrap shrink-0"
              >
                Pro · $4/mo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="min-w-0 flex-1 pb-24 lg:pb-12">
        <div
          key={activeTab}
          className="arbor-stage-enter mx-auto max-w-[1160px] px-5 py-8 sm:px-8 sm:py-12 lg:px-10 lg:py-14"
        >
          {children}
        </div>
      </main>

      {/* Subtle Editorial Footer (Desktop & Tablet) */}
      <footer className="hidden border-t border-sand lg:block">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 px-10 py-8 text-xs text-muted">
          <p>
            Arbor Improve · Calm, privacy-first growth tracking saved on your device.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => onSelectTab('calendar')}
              className="hover:text-ink"
            >
              Islamic Calendar
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('about')}
              className="hover:text-ink"
            >
              About, Pricing &amp; Privacy
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile / Tablet Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-sand bg-secondary/95 backdrop-blur-md lg:hidden"
      >
        <div className="grid h-14 grid-cols-5 items-center">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 font-medium ${
                  isActive ? 'text-forest' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon
                  className="h-[19px] w-[19px]"
                  strokeWidth={isActive ? 2.1 : 1.7}
                  aria-hidden="true"
                />
                <span className="text-[11px] leading-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
