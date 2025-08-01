/*
 *  frontend/src/pages/MatchingDashboard.tsx
 *  ────────────────────────────────────────
 *  Volunteer-side event-matching dashboard with filter panel.
 *  Skills are loaded at runtime from GET /skills/.
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/context/AuthContext';
import {
  fetchMyProfile,
  fetchSkills,
  saveVolunteerMatch,
} from '@/lib/api';
import type { VolunteerProfile, SkillOption } from '@/types/profile';

import {
  listUpcoming as listUpcomingEvents,
  listPast as listPastEvents,
  type Event as APIEvent,
} from '@/lib/events';

import {
  Popover, PopoverTrigger, PopoverContent,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDownIcon } from 'lucide-react';

/* ───────────────────────── Helpers ───────────────────────── */
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

/* ───────────────────────── Types ───────────────────────── */
interface ProfileDerived {
  city: string;
  state: string;
  zipcode: string;
  availability: string[];
  skillIds: number[];
  skillNames: string[];
  role: 'Volunteer' | 'Admin';
}

interface EventUI {
  id: string;
  name: string;
  requiredSkills: string[];
  urgency: 'High' | 'Medium' | 'Low';
  date: string;          // yyyy-mm-dd
  city: string;
  state: string;
  zipcode: string;
}

const STATE_OPTIONS = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV',
  'WI','WY',
] as const;

const urgencyOptions: EventUI['urgency'][] = ['High', 'Medium', 'Low'];

/* ───────────────────────── Component ─────────────────────── */
export default function MatchingDashboard() {
  const { token, user } = useAuth(); // assumes useAuth exposes current user with .id
  const [rawProfile, setRawProfile] = useState<any>(null);

  /* skills master list & id→name map */
  const [skillOpts, setSkillOpts] = useState<SkillOption[]>([]);
  const skillMap = useMemo(
    () => new Map<number, string>(skillOpts.map((s) => [s.id, s.name])),
    [skillOpts],
  );
  const allSkills = useMemo(() => skillOpts.map((s) => s.name), [skillOpts]);
  const allSkillsCt = allSkills.length;

  /* profile derived */
  const [profile, setProfile] = useState<ProfileDerived>({
    city: '', state: '', zipcode: '', availability: [],
    skillIds: [], skillNames: [], role: 'Volunteer',
  });

  /* events */
  const [events, setEvents] = useState<EventUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  /* apply state */
  const [applyingSet, setApplyingSet] = useState<Set<string>>(new Set());
  const [appliedEventIds, setAppliedEventIds] = useState<Set<string>>(new Set());

  /* raw (editable) filters */
  const [rawDates,    setRawDates]    = useState<Date[]>([]);
  const [rawCity,     setRawCity]     = useState('');
  const [rawState,    setRawState]    = useState('');
  const [rawZip,      setRawZip]      = useState('');
  const [rawUrgency,  setRawUrgency]  = useState<EventUI['urgency'] | ''>('');
  const [rawSkills,   setRawSkills]   = useState<string[]>([]);

  /* applied filters */
  const [datesFilter,   setDatesFilter]   = useState<Set<string>>(new Set());
  const [cityFilter,    setCityFilter]    = useState('');
  const [stateFilter,   setStateFilter]   = useState('');
  const [zipFilter,     setZipFilter]     = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<EventUI['urgency'] | ''>('');
  const [skillsFilter,  setSkillsFilter]  = useState<string[]>([]);

  /* popovers */
  const [datesOpen,  setDatesOpen]  = useState(false);
  const [skillsOpen, setSkillsOpen] = useState(false);

  /* ─────────── Load skills, then profile + events ─────────── */
  useEffect(() => {
    (async () => {
      try {
        /* 1. skills (needed to decode profile + events) */
        const skills = await fetchSkills();
        setSkillOpts(skills as SkillOption[]);

        /* build a local map once so we can use it immediately */
        const localMap = new Map<number, string>(
          (skills as SkillOption[]).map((s) => [s.id, s.name]),
        );

        /* 2. profile (if logged in) */
        const prof = token ? await fetchMyProfile(token) : null;
        setRawProfile(prof);
        const p = prof as VolunteerProfile | null;

        const availISO = (p?.availability ?? []).map((d) =>
          String(d).slice(0, 10),
        );
        const firstAvail = availISO[0] ?? iso(new Date());

        const skillNames = (p?.skills ?? [])
          .map((id: number) => localMap.get(id) || '')
          .filter(Boolean);

        setProfile({
          city: p?.city ?? '',
          state: (p?.state ?? '').toUpperCase(),
          zipcode: p?.zipcode ?? '',
          availability: availISO,
          skillIds: (p?.skills ?? []) as number[],
          skillNames,
          role: p?.role === 'Admin' ? 'Admin' : 'Volunteer',
        });

        /* initialise RAW + applied filters from profile */
        setRawDates([new Date(firstAvail)]);
        setRawSkills(skillNames.filter((s) => allSkills.includes(s)));
        setRawCity(p?.city ?? '');
        setRawState((p?.state ?? '').toUpperCase());
        setRawZip(p?.zipcode ?? '');

        setDatesFilter(new Set([firstAvail]));
        setSkillsFilter(skillNames.filter((s) => allSkills.includes(s)));
        setCityFilter(p?.city ?? '');
        setStateFilter((p?.state ?? '').toUpperCase());
        setZipFilter(p?.zipcode ?? '');

        setProfileLoaded(true);

        /* 3. events (needs skills to translate IDs→names) */
        setLoading(true);
        const [u, pa] = await Promise.all([
          listUpcomingEvents(),
          listPastEvents(),
        ]);

        const toUI = (e: APIEvent): EventUI => {
          const ids = Array.isArray((e as any).skills)
            ? (e as any).skills as number[]
            : [];
          const names = ids
            .map((id) => localMap.get(id) || '')
            .filter(Boolean);

          return {
            id: String(e.event_id),
            name: e.name ?? 'Untitled',
            requiredSkills: names,
            urgency:
              (e.urgency || '').toLowerCase() === 'high'
                ? 'High'
                : (e.urgency || '').toLowerCase() === 'medium'
                ? 'Medium'
                : 'Low',
            date: (e.date ?? '').slice(0, 10),
            city: e.city ?? '',
            state: (e.state_id ?? '').toUpperCase(),
            zipcode: e.zipcode ?? '',
          };
        };

        setEvents([...u, ...pa].map(toUI));
      } finally {
        setLoading(false);
      }
    })();
  }, [token]); // runs once per session

  /* datalists */
  const uniqueCities = useMemo(
    () =>
      [...new Set(events.map((e) => e.city.trim()))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [events],
  );
  const uniqueZips = useMemo(
    () =>
      [...new Set(events.map((e) => e.zipcode.trim()))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [events],
  );

  /* visible list (never show past events) */
  const visibleEvents = useMemo(() => {
    const todayISO = iso(new Date());

    return events.filter((e) => {
      if (e.date < todayISO) return false; // hide past
      if (datesFilter.size && !datesFilter.has(e.date)) return false;
      if (cityFilter && e.city.toLowerCase() !== cityFilter.toLowerCase())
        return false;
      if (stateFilter && e.state !== stateFilter) return false;
      if (zipFilter && e.zipcode !== zipFilter) return false;
      if (urgencyFilter && e.urgency !== urgencyFilter) return false;
      if (
        skillsFilter.length &&
        skillsFilter.length < allSkillsCt &&
        !skillsFilter.some((s) =>
          e.requiredSkills
            .map((x) => x.toLowerCase().trim())
            .includes(s.toLowerCase().trim()),
        )
      )
        return false;
      return true;
    });
  }, [
    events,
    datesFilter,
    cityFilter,
    stateFilter,
    zipFilter,
    urgencyFilter,
    skillsFilter,
    allSkillsCt,
  ]);

  /* actions */
  const applyFilters = () => {
    setDatesFilter(new Set(rawDates.map(iso)));
    setCityFilter(rawCity);
    setStateFilter(rawState);
    setZipFilter(rawZip);
    setUrgencyFilter(rawUrgency);
    setSkillsFilter(rawSkills);
  };

  const clearAll = () => {
    setRawDates([]);
    setRawCity('');
    setRawState('');
    setRawZip('');
    setRawUrgency('');
    setRawSkills([]);
    setDatesFilter(new Set());
    setCityFilter('');
    setStateFilter('');
    setZipFilter('');
    setUrgencyFilter('');
    setSkillsFilter([]);
  };

  /* field helpers */
  const toggleSkill = (s: string) =>
    setRawSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const dateLabel =
    rawDates.length === 0
      ? 'Any'
      : rawDates.length === 1
      ? iso(rawDates[0])
      : `${rawDates.length} dates`;

  const skillLabel =
    rawSkills.length === 0
      ? 'Any'
      : rawSkills.length === 1
      ? rawSkills[0]
      : rawSkills.length === allSkillsCt
      ? 'Any'
      : `${rawSkills.length} selected`;

  /* ---------- apply to event ---------- */
  const getVolunteerId = (): number | null => {
    // prefer authenticated user object, fallback to profile payload
    const raw = (user as any)?.id ?? rawProfile?.user_id ?? rawProfile?.id;
    const num = Number(raw);
    return isNaN(num) ? null : num;
  };

  const applyToEvent = async (e: EventUI) => {
    if (!token) {
      alert('You must be logged in to apply.');
      return;
    }
    const volunteerId = getVolunteerId();
    if (!volunteerId) {
      console.error('Could not resolve volunteer ID from auth/profile', {
        user,
        rawProfile,
      });
      alert('Unable to determine your user identity. Try refreshing or re-logging in.');
      return;
    }

    if (appliedEventIds.has(e.id)) {
      return; // already applied
    }

    if (applyingSet.has(e.id)) {
      return; // in-flight
    }

    setApplyingSet((prev) => new Set(prev).add(e.id));
    try {
      await saveVolunteerMatch({
        eventId: Number(e.id),
        volunteerId,
      });
      setAppliedEventIds((prev) => new Set(prev).add(e.id));
      alert(`Successfully applied to ${e.name}`); // you can swap this for a toast
    } catch (err) {
      console.error('Failed to apply to event', err);
      alert('Failed to apply. Please try again.'); 
    } finally {
      setApplyingSet((prev) => {
        const copy = new Set(prev);
        copy.delete(e.id);
        return copy;
      });
    }
  };

  if (loading || !profileLoaded) return <main className="p-6">Loading…</main>;

  /* ───────────────────────── UI ───────────────────────── */
  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-6">
      <h1 className="text-3xl font-bold mb-4 text-[var(--color-charcoal-100)]">
        Event Matches
      </h1>

      {/* Filter panel */}
      <div className="mb-6 bg-white shadow rounded-xl p-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Dates */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">
              Dates
            </label>
            <Popover open={datesOpen} onOpenChange={setDatesOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1 w-full justify-between">
                  {dateLabel}
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0" align="start">
                <Calendar
                  mode="multiple"
                  selected={rawDates}
                  onSelect={(d) => setRawDates(d ?? [])}
                  className="border rounded-md p-2"
                />
                {rawDates.length > 0 && (
                  <div className="border-t text-xs px-3 py-2 flex justify-between">
                    <span>{rawDates.map(iso).join(', ')}</span>
                    <button
                      className="text-[var(--color-cambridge_blue-700)]"
                      onClick={() => setRawDates([])}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">
              City
            </label>
            <input
              list="city-list"
              value={rawCity}
              onChange={(e) => setRawCity(e.target.value)}
              placeholder="e.g. Houston"
              className="mt-1 block w-full p-2 border rounded-lg"
            />
            <datalist id="city-list">
              {uniqueCities.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">
              State
            </label>
            <select
              value={rawState}
              onChange={(e) => setRawState(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value="">Any</option>
              {STATE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Zip */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">
              Zip Code
            </label>
            <input
              list="zip-list"
              value={rawZip}
              onChange={(e) => setRawZip(e.target.value)}
              placeholder="e.g. 77005"
              className="mt-1 block w-full p-2 border rounded-lg"
            />
            <datalist id="zip-list">
              {uniqueZips.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">
              Urgency
            </label>
            <select
              value={rawUrgency}
              onChange={(e) =>
                setRawUrgency(e.target.value as EventUI['urgency'] | '')
              }
              className="mt-1 block w-full p-2 border rounded-lg"
            >
              <option value="">Any</option>
              {urgencyOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">
              Skills
            </label>
            <Popover open={skillsOpen} onOpenChange={setSkillsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1 w-full justify-between">
                  {skillLabel}
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 flex flex-col gap-1">
                <label
                  className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() => setRawSkills([])}
                >
                  <Checkbox checked={rawSkills.length === 0} />
                  <span>Any</span>
                </label>
                <hr className="my-1" />
                {allSkills.map((sk) => (
                  <label
                    key={sk}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={rawSkills.includes(sk)}
                      onCheckedChange={() => toggleSkill(sk)}
                    />
                    <span>{sk}</span>
                  </label>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* buttons */}
        <div className="flex justify-end gap-2">
          <Button size="sm" onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button size="sm" variant="outline" onClick={clearAll}>
            Clear Filters
          </Button>
        </div>
      </div>

      {/* results */}
      <div className="grid gap-6 md:grid-cols-2">
        {visibleEvents.map((e) => (
          <Card key={e.id} className="bg-white shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle>{e.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Date:</strong> {e.date}
              </p>
              <p>
                <strong>Location:</strong>{' '}
                {`${e.city}, ${e.state}`}  {e.zipcode}
              </p>
              <p>
                <strong>Urgency:</strong> {e.urgency}
              </p>
              <p>
                <strong>Skills:</strong>{' '}
                {e.requiredSkills.length ? e.requiredSkills.join(', ') : '—'}
              </p>
              <Button
                className="mt-4 w-full"
                onClick={() => applyToEvent(e)}
                disabled={
                  applyingSet.has(e.id) || appliedEventIds.has(e.id)
                }
              >
                {applyingSet.has(e.id)
                  ? 'Applying…'
                  : appliedEventIds.has(e.id)
                  ? 'Applied'
                  : 'Apply'}
              </Button>
            </CardContent>
          </Card>
        ))}
        {visibleEvents.length === 0 && (
          <p className="text-center col-span-full">
            No events match the filters.
          </p>
        )}
      </div>
    </main>
  );
}
