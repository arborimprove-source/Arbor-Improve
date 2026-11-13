import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_REFLECTION_PRESETS,
  buildInstagramCaption,
  buildStoryCardPayload,
  getAccessibleStoryTemplate,
  isStoryTemplateUnlocked,
} from './storyCards';
import { Profile, TreeState, WeeklyEntry } from '../types';

const FREE_PROFILE: Profile = {
  displayName: 'Amina Creates',
  plan: 'free',
  treeType: 'olive',
};

const PAID_PROFILE: Profile = {
  displayName: 'Amina Creates',
  plan: 'paid',
  treeType: 'pomegranate',
};

const TREE_STATE: TreeState = {
  level: 4,
  growthPoints: 13,
  isThirsty: false,
};

const ENTRIES: WeeklyEntry[] = [
  {
    id: 'w1',
    weekStart: '2026-11-02',
    followers: 480,
    reach: 1200,
    likes: 95,
    posts: 4,
    score: 84,
  },
  {
    id: 'w2',
    weekStart: '2026-11-09',
    followers: 525,
    reach: 1620,
    likes: 132,
    posts: 4,
    score: 92,
  },
];

test('Story card templates enforce Free vs Paid gating', () => {
  assert.equal(isStoryTemplateUnlocked('botanical-root', 'free'), true);
  assert.equal(isStoryTemplateUnlocked('emerald-harvest', 'free'), false);
  assert.equal(isStoryTemplateUnlocked('emerald-harvest', 'paid'), true);

  assert.equal(
    getAccessibleStoryTemplate('milestone-scroll', 'free').id,
    'botanical-root'
  );
  assert.equal(
    getAccessibleStoryTemplate('milestone-scroll', 'paid').id,
    'milestone-scroll'
  );
});

test('buildStoryCardPayload respects privacy visibility toggles and fallback note', () => {
  const hiddenMetricsPayload = buildStoryCardPayload({
    templateId: 'emerald-harvest',
    profile: FREE_PROFILE,
    treeState: TREE_STATE,
    entries: ENTRIES,
    badges: [{ badgeKey: 'first_entry', earnedAt: '2026-11-02T00:00:00Z' }],
    goals: [],
    visibility: {
      showFollowers: false,
      showReach: false,
      showStreak: true,
    },
    customNote: '   ',
  });

  assert.equal(hiddenMetricsPayload.template.id, 'botanical-root');
  assert.equal(hiddenMetricsPayload.followers, null);
  assert.equal(hiddenMetricsPayload.weeklyReach, null);
  assert.equal(hiddenMetricsPayload.streakWeeks, 2);
  assert.equal(hiddenMetricsPayload.note, STORY_REFLECTION_PRESETS[0]);

  const paidPayload = buildStoryCardPayload({
    templateId: 'milestone-scroll',
    profile: PAID_PROFILE,
    treeState: TREE_STATE,
    entries: ENTRIES,
    badges: [{ badgeKey: 'first_entry', earnedAt: '2026-11-02T00:00:00Z' }],
    goals: [],
    visibility: {
      showFollowers: true,
      showReach: true,
      showStreak: true,
    },
    customNote: 'Grateful for another steady week.',
  });

  assert.equal(paidPayload.template.id, 'milestone-scroll');
  assert.equal(paidPayload.followers, 525);
  assert.equal(paidPayload.weeklyReach, 1620);

  const caption = buildInstagramCaption(paidPayload);
  assert.ok(caption.includes('Pomegranate Tree'));
  assert.ok(caption.includes('525 followers'));
});

test('buildStoryCardPayload preserves selected treeType across all four botanical species', () => {
  const species: Array<{ id: Profile['treeType']; name: string }> = [
    { id: 'olive', name: 'Olive Tree' },
    { id: 'datePalm', name: 'Date Palm' },
    { id: 'pomegranate', name: 'Pomegranate Tree' },
    { id: 'fig', name: 'Fig Tree' },
  ];

  const seenNames = new Set<string>();
  const seenTypes = new Set<string>();

  for (const item of species) {
    const payload = buildStoryCardPayload({
      templateId: 'botanical-root',
      profile: { ...PAID_PROFILE, treeType: item.id },
      treeState: { level: 1, growthPoints: 0, isThirsty: false },
      entries: [],
      badges: [],
      goals: [],
      visibility: { showFollowers: true, showReach: true, showStreak: true },
      customNote: '',
    });

    assert.equal(payload.treeType, item.id);
    assert.equal(payload.treeName, item.name);
    seenTypes.add(payload.treeType);
    seenNames.add(payload.treeName);

    const caption = buildInstagramCaption(payload);
    assert.ok(caption.includes(item.name));
  }

  assert.equal(seenTypes.size, 4);
  assert.equal(seenNames.size, 4);
});
