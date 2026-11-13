import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ISLAMIC_CALENDAR_ENTRIES,
  filterCalendarEntries,
  getDaysUntilEntry,
  getDaysUntilNextJummah,
  getIslamicDateLabel,
  getNextUpcomingCalendarHighlight,
  isCalendarEntryUnlocked,
} from './calendar';

test('getIslamicDateLabel returns a readable Hijri date string', () => {
  const label = getIslamicDateLabel(new Date('2026-11-13T12:00:00Z'));
  assert.ok(label.length > 4);
});

test('filterCalendarEntries filters by category and search query cleanly', () => {
  const ramadanOnly = filterCalendarEntries(
    ISLAMIC_CALENDAR_ENTRIES,
    'ramadan_eid',
    ''
  );
  assert.ok(ramadanOnly.length >= 4);
  assert.ok(ramadanOnly.every((e) => e.category === 'ramadan_eid'));

  const jummahSearch = filterCalendarEntries(
    ISLAMIC_CALENDAR_ENTRIES,
    'all',
    'kahf'
  );
  assert.equal(jummahSearch.length, 1);
  assert.equal(jummahSearch[0].id, 'weekly-jummah');
});

test('isCalendarEntryUnlocked enforces Free starter vs Paid full calendar', () => {
  const jummah = ISLAMIC_CALENDAR_ENTRIES.find((e) => e.id === 'weekly-jummah')!;
  const ramadan = ISLAMIC_CALENDAR_ENTRIES.find((e) => e.id === 'ramadan-week-1')!;

  assert.equal(isCalendarEntryUnlocked(jummah, 'free'), true);
  assert.equal(isCalendarEntryUnlocked(ramadan, 'free'), false);
  assert.equal(isCalendarEntryUnlocked(ramadan, 'paid'), true);
});

test('getDaysUntilNextJummah and getNextUpcomingCalendarHighlight compute deterministic timing', () => {
  const friday = new Date(2026, 10, 13); // Nov 13 2026 is Friday
  assert.equal(getDaysUntilNextJummah(friday), 0);

  const highlightOnFriday = getNextUpcomingCalendarHighlight(friday);
  assert.equal(highlightOnFriday.timingLabel, 'Jummah today');

  const dec1 = new Date(2026, 11, 1);
  const rajab = ISLAMIC_CALENDAR_ENTRIES.find((e) => e.id === 'rajab-renewal')!;
  assert.equal(getDaysUntilEntry(rajab, dec1), 10);

  const highlightBeforeRajab = getNextUpcomingCalendarHighlight(dec1);
  assert.equal(highlightBeforeRajab.entry.id, 'rajab-renewal');
  assert.equal(highlightBeforeRajab.timingLabel, 'In 10 days');
});
