'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Same API used by EventForm.tsx
import {
  listUpcoming as listUpcomingEvents,
  listPast as listPastEvents,
  type Event as APIEvent,
} from '@/lib/events';

// --- UI Type Definitions ---
interface Profile {
  id: string;
  fullName: string;
  skills: string[];
  availability: string[]; // ISO dates
  preferredLocations: string[];
  role: 'Volunteer' | 'Admin';
}

interface Volunteer {
  id: string;
  fullName: string;
  skills: string[];
  availability: string[];
  preferredLocations: string[];
}

interface Event {
  id: string;
  name: string;
  requiredSkills: string[];
  urgency: 'High' | 'Medium' | 'Low';
  date: string; // YYYY-MM-DD
  location: string;
}

const urgencyOptions: Event['urgency'][] = ['High', 'Medium', 'Low'];

const urgencyRank: Record<Event['urgency'], number> = {
  High: 1,
  Medium: 2,
  Low: 3,
};

// Map backend -> UI (defensive)
function toUI(e: APIEvent): Event {
  const u = (e.urgency || '').toLowerCase();
  const urgency: Event['urgency'] =
    u === 'high' ? 'High' : u === 'medium' ? 'Medium' : 'Low';

  const loc = [e.city, e.state_id].filter(Boolean).join(', ');
  const iso = e.date ?? '';
  const date = iso.length >= 10 ? iso.slice(0, 10) : iso;

  return {
    id: String(e.event_id),
    name: e.name ?? 'Untitled',
    requiredSkills: [], // plug in later when an endpoint exists
    urgency,
    date,
    location: loc,
  };
}

export default function MatchingDashboard() {
  // Temporary mock profile/volunteers so the page renders
  const [profile] = useState<Profile>({
    id: 'u1',
    fullName: 'Demo Volunteer',
    skills: ['Cleaning'],
    availability: ['2025-07-10', '2025-07-11'],
    preferredLocations: ['Houston, TX'],
    role: 'Volunteer',
  });

  const [volunteers] = useState<Volunteer[]>([
    {
      id: 'v1',
      fullName: 'Alice Johnson',
      skills: ['Cleaning'],
      availability: ['2025-07-10'],
      preferredLocations: ['Houston, TX'],
    },
    {
      id: 'v2',
      fullName: 'Bob Smith',
      skills: ['Cooking'],
      availability: ['2025-07-11'],
      preferredLocations: ['Austin, TX'],
    },
  ]);

  // Events from backend
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<Event['urgency'] | ''>('');
  const [skillsFilter, setSkillsFilter] = useState('');

  // Admin form bits
  const eventForm = useForm<{ eventId: string }>({ defaultValues: { eventId: '' } });
  const selectedEventId = eventForm.watch('eventId');
  const [matchedVolunteers, setMatchedVolunteers] = useState<Volunteer[]>([]);

  // Load events (robust to one endpoint failing)
  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [upRes, pastRes] = await Promise.allSettled([
          listUpcomingEvents(),
          listPastEvents(),
        ]);

        let rows: APIEvent[] = [];
        if (upRes.status === 'fulfilled') rows = rows.concat(upRes.value);
        if (pastRes.status === 'fulfilled') rows = rows.concat(pastRes.value);

        const mapped = rows.map(toUI).sort((a, b) => a.date.localeCompare(b.date));

        if (alive) {
          setEvents(mapped);
          console.log('Loaded events:', mapped.length, mapped);
        }
      } catch (err: any) {
        if (alive) setError(err?.message || 'Failed to load events.');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  // Compute matched volunteers for selected event (local demo logic)
  useEffect(() => {
    if (!selectedEventId) {
      setMatchedVolunteers([]);
      return;
    }
    const event = events.find((e) => e.id === selectedEventId);
    if (!event) {
      setMatchedVolunteers([]);
      return;
    }
    const matches = volunteers.filter(
      (v) =>
        event.requiredSkills.every((skill) => v.skills.includes(skill)) &&
        v.availability.includes(event.date) &&
        v.preferredLocations.includes(event.location),
    );
    setMatchedVolunteers(matches);
  }, [selectedEventId, events, volunteers]);

  // Handle event→volunteer match submission (demo)
  const onEventSubmit = (data: { eventId: string }) => {
    console.log('Event matches saved for:', data.eventId, matchedVolunteers);
    alert(`Assigned ${matchedVolunteers.length} volunteers to event ${data.eventId}`);
  };

  // Loading / error states
  if (loading) return <main className="min-h-screen p-6">Loading events…</main>;

  // ───────────────────────────────────────────────────────────────────
  // Volunteer view: SHOW ALL EVENTS first, then apply UI filters only.
  // ───────────────────────────────────────────────────────────────────
  if (profile.role === 'Volunteer') {
    const recommended = [...events].sort(
      (a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency],
    );

    const skillsArray = skillsFilter.split(',').map((s) => s.trim()).filter(Boolean);

    const filtered = recommended.filter((e) => {
      if (dateFilter && e.date !== dateFilter) return false;
      if (locationFilter && !e.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (urgencyFilter && e.urgency !== urgencyFilter) return false;
      if (skillsArray.length && !skillsArray.every((sk) => e.requiredSkills.includes(sk))) return false;
      return true;
    });

    return (
      <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-6">
        {error && <p className="text-red-600 mb-4">Error loading some events: {error}</p>}

        <h1 className="text-3xl font-bold text-[var(--color-charcoal-100)] mb-4">Recommended Events</h1>

        {/* Filter Panel */}
        <div className="mb-6 p-4 bg-[var(--color-white)] rounded-xl shadow">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">Filter by Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">Filter by Location</label>
              <input
                type="text"
                placeholder="e.g. Houston"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">Filter by Urgency</label>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as Event['urgency'] | '')}
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

            <div>
              <label className="block text-sm font-medium text-[var(--color-charcoal-300)]">Filter by Skills</label>
              <input
                type="text"
                placeholder="Comma-separated"
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mt-4 text-right">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDateFilter('');
                setLocationFilter('');
                setUrgencyFilter('');
                setSkillsFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((e) => (
            <Card key={e.id} className="bg-[var(--color-white)] shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle>{e.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Date:</strong> {e.date}</p>
                <p><strong>Location:</strong> {e.location || '—'}</p>
                <p><strong>Urgency:</strong> {e.urgency}</p>
                <p><strong>Skills:</strong> {e.requiredSkills.length ? e.requiredSkills.join(', ') : '—'}</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => {
                    console.log('Applied to event', e.id);
                    alert(`Applied to event ${e.name}`);
                  }}
                >
                  Apply
                </Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-center col-span-full">
              {events.length === 0 ? 'No events yet.' : 'No events match your filters.'}
            </p>
          )}
        </div>
      </main>
    );
  }

  // Admin view
  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-6">
      <Card className="max-w-lg mx-auto bg-[var(--color-white)] shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle>Event → Volunteer Matching</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={eventForm.handleSubmit(onEventSubmit)} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]">Select Event</label>
              <div className="grid gap-2">
                {events.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => eventForm.setValue('eventId', e.id)}
                    className={`w-full text-left p-2 border rounded-lg focus:outline-none ${
                      selectedEventId === e.id
                        ? 'border-[var(--color-cambridge_blue-500)] bg-[var(--color-cambridge_blue-50)]'
                        : 'border-[var(--color-ash_gray-400)] bg-[var(--color-white)]'
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            </div>

            {matchedVolunteers.length > 0 && (
              <div className="p-4 bg-[var(--color-white)] border border-[var(--color-ash_gray-300)] rounded-lg">
                <h2 className="font-semibold mb-2">Matched Volunteers</h2>
                <ul className="list-disc list-inside space-y-1">
                  {matchedVolunteers.map((v) => (
                    <li key={v.id}>{v.fullName}</li>
                  ))}
                </ul>
              </div>
            )}

            <Button type="submit" className="w-full">
              Save Matches
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
