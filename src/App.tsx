import { useCallback, useState } from 'react';
import { CelebrationDialog } from './components/badges/CelebrationDialog';
import { UpgradeDialog } from './components/dialogs/UpgradeDialog';
import { AppShell } from './components/navigation/AppShell';
import { downloadExportJson } from './lib/export';
import {
  addFakeWeek,
  clearDemoData,
  deleteGoal,
  exportAllData,
  getBadges,
  getCurrentWeekMonday,
  getEntries,
  getGoals,
  getProfile,
  getSavedCalendarIds,
  getTreeState,
  getWaitlistEmails,
  loadDemoData,
  resetAllData,
  saveEntry,
  saveGoal,
  saveProfile,
  saveWaitlistEmail,
  setPlan,
  toggleSavedCalendarId,
} from './lib/storage';
import { AboutLandingPage } from './pages/AboutLanding';
import { AddWeekPage } from './pages/AddWeek';
import { CalendarPage } from './pages/Calendar';
import { GoalsPage } from './pages/Goals';
import { HomePage } from './pages/Home';
import { ProfilePage } from './pages/Profile';
import { ReportsPage, ReportsSection } from './pages/Reports';
import {
  AppTab,
  Badge,
  Goal,
  PlanType,
  Profile,
  TreeLevel,
  TreeState,
  TreeType,
  WeeklyEntry,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [reportsSection, setReportsSection] = useState<ReportsSection>('reports');
  const [profile, setProfileState] = useState<Profile>(() => getProfile());
  const [entries, setEntriesState] = useState<WeeklyEntry[]>(() => getEntries());
  const [treeState, setTreeState] = useState<TreeState>(() => getTreeState());
  const [badges, setBadgesState] = useState<Badge[]>(() => getBadges());
  const [goals, setGoalsState] = useState<Goal[]>(() => getGoals());
  const [savedCalendarIds, setSavedCalendarIds] = useState<string[]>(() =>
    getSavedCalendarIds()
  );
  const [waitlistEmails, setWaitlistEmails] = useState<string[]>(() =>
    getWaitlistEmails()
  );

  const [upgradeDialog, setUpgradeDialog] = useState<{
    open: boolean;
    featureName?: string;
  }>({ open: false });

  const [celebration, setCelebration] = useState<{
    open: boolean;
    newBadges: Badge[];
    leveledUp: boolean;
    level: TreeLevel;
  }>({
    open: false,
    newBadges: [],
    leveledUp: false,
    level: 1,
  });

  const currentWeekMonday = getCurrentWeekMonday();

  const refreshFromStorage = useCallback(() => {
    setProfileState(getProfile());
    setEntriesState(getEntries());
    setTreeState(getTreeState());
    setBadgesState(getBadges());
    setGoalsState(getGoals());
    setSavedCalendarIds(getSavedCalendarIds());
    setWaitlistEmails(getWaitlistEmails());
  }, []);

  const handleSelectTab = (tab: AppTab) => {
    if (tab === 'reports') {
      setReportsSection('reports');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleOpenStoryCards = () => {
    setReportsSection('cards');
    setActiveTab('reports');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSaveProfile = (next: Profile) => {
    const saved = saveProfile(next);
    setProfileState(saved);
  };

  const handleSetPlan = (plan: PlanType) => {
    const updated = setPlan(plan);
    setProfileState(updated);
  };

  const handleSelectTree = (treeType: TreeType) => {
    const saved = saveProfile({ ...profile, treeType });
    setProfileState(saved);
  };

  const handleSaveWeek = (input: {
    weekStart: string;
    followers: number;
    reach: number;
    likes: number;
    posts: number;
  }) => {
    const prevLevel = treeState.level;
    const result = saveEntry({
      ...input,
      isDemo: false,
    });
    setEntriesState(result.entries);
    setTreeState(result.treeState);
    setBadgesState(result.badges);
    setGoalsState(getGoals());

    const leveledUp = result.treeState.level > prevLevel;
    if (result.newlyEarnedBadges.length > 0 || leveledUp) {
      setCelebration({
        open: true,
        newBadges: result.newlyEarnedBadges,
        leveledUp,
        level: result.treeState.level,
      });
    }

    return result;
  };

  const handleExportData = () => {
    const data = exportAllData();
    downloadExportJson(data);
  };

  const handleResetData = () => {
    resetAllData();
    setCelebration({ open: false, newBadges: [], leveledUp: false, level: 1 });
    refreshFromStorage();
  };

  const handleLoadDemoData = () => {
    loadDemoData();
    refreshFromStorage();
  };

  const handleClearDemoData = () => {
    clearDemoData();
    refreshFromStorage();
  };

  const handleAddFakeWeek = (kind: 'good' | 'average' | 'thirsty') => {
    const prevLevel = treeState.level;
    const result = addFakeWeek(kind);
    refreshFromStorage();
    const leveledUp = result.treeState.level > prevLevel;
    if (result.newlyEarnedBadges.length > 0 || leveledUp) {
      setCelebration({
        open: true,
        newBadges: result.newlyEarnedBadges,
        leveledUp,
        level: result.treeState.level,
      });
    }
    return {
      entry: result.entry,
      treeState: result.treeState,
    };
  };

  const openUpgrade = (featureName?: string) => {
    setUpgradeDialog({ open: true, featureName });
  };

  const handleSaveGoal = (input: {
    id?: string;
    title: string;
    targetFollowers: number;
    startFollowers?: number;
    days?: number;
    startDate?: string;
    endDate?: string;
    status?: Goal['status'];
  }) => {
    const nextGoals = saveGoal(input);
    setGoalsState(nextGoals);
  };

  const handleDeleteGoal = (goalId: string) => {
    const nextGoals = deleteGoal(goalId);
    setGoalsState(nextGoals);
  };

  const handleToggleSavedCalendar = (calendarId: string) => {
    const nextIds = toggleSavedCalendarId(calendarId);
    setSavedCalendarIds(nextIds);
  };

  const handleJoinWaitlist = (email: string) => {
    const result = saveWaitlistEmail(email);
    setWaitlistEmails(result.emails);
    return result;
  };

  return (
    <AppShell
      activeTab={activeTab}
      profile={profile}
      onSelectTab={handleSelectTab}
      onOpenUpgrade={() => openUpgrade()}
    >
      {activeTab === 'home' && (
        <HomePage
          currentWeekMonday={currentWeekMonday}
          profile={profile}
          entries={entries}
          treeState={treeState}
          badges={badges}
          goals={goals}
          onNavigate={handleSelectTab}
          onShareCard={handleOpenStoryCards}
        />
      )}

      {activeTab === 'add' && (
        <AddWeekPage
          currentWeekMonday={currentWeekMonday}
          profile={profile}
          entries={entries}
          treeState={treeState}
          onSaveWeek={handleSaveWeek}
          onGoToHome={() => handleSelectTab('home')}
          onGoToProfile={() => handleSelectTab('profile')}
        />
      )}

      {activeTab === 'reports' && (
        <ReportsPage
          initialSection={reportsSection}
          currentWeekMonday={currentWeekMonday}
          profile={profile}
          entries={entries}
          treeState={treeState}
          badges={badges}
          goals={goals}
          onNavigate={handleSelectTab}
          onSelectTree={handleSelectTree}
          onOpenUpgrade={openUpgrade}
        />
      )}

      {activeTab === 'goals' && (
        <GoalsPage
          profile={profile}
          entries={entries}
          goals={goals}
          onSaveGoal={handleSaveGoal}
          onDeleteGoal={handleDeleteGoal}
          onOpenUpgrade={openUpgrade}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarPage
          profile={profile}
          savedCalendarIds={savedCalendarIds}
          onToggleSaved={handleToggleSavedCalendar}
          onOpenUpgrade={openUpgrade}
        />
      )}

      {activeTab === 'about' && (
        <AboutLandingPage
          profile={profile}
          waitlistEmails={waitlistEmails}
          onJoinWaitlist={handleJoinWaitlist}
          onSetPlan={handleSetPlan}
          onNavigate={handleSelectTab}
        />
      )}

      {activeTab === 'profile' && (
        <ProfilePage
          profile={profile}
          treeState={treeState}
          entries={entries}
          badges={badges}
          onSaveProfile={handleSaveProfile}
          onSetPlan={handleSetPlan}
          onOpenUpgrade={openUpgrade}
          onExportData={handleExportData}
          onResetData={handleResetData}
          onLoadDemoData={handleLoadDemoData}
          onAddFakeWeek={handleAddFakeWeek}
          onClearDemoData={handleClearDemoData}
          onNavigate={handleSelectTab}
        />
      )}

      <UpgradeDialog
        isOpen={upgradeDialog.open}
        featureName={upgradeDialog.featureName}
        onClose={() => setUpgradeDialog({ open: false })}
        onEnablePaidPreview={() => handleSetPlan('paid')}
        onOpenAbout={() => handleSelectTab('about')}
      />

      <CelebrationDialog
        isOpen={celebration.open}
        treeType={profile.treeType}
        level={celebration.level}
        leveledUp={celebration.leveledUp}
        newBadges={celebration.newBadges}
        onClose={() =>
          setCelebration((prev) => ({ ...prev, open: false }))
        }
        onViewBadges={() => {
          setCelebration((prev) => ({ ...prev, open: false }));
          handleSelectTab('profile');
        }}
      />
    </AppShell>
  );
}
