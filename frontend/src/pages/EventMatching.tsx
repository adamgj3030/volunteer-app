`use client`;

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// --- Type Definitions ---
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
  date: string; // ISO date
  location: string;
}

const urgencyOptions: Event['urgency'][] = ['High', 'Medium', 'Low'];

// Urgency ranking for sorting events
const urgencyRank: Record<Event['urgency'], number> = {
  High: 1,
  Medium: 2,
  Low: 3,
};

export default function MatchingDashboard() {
  // --- Mock Data for Demo ---
  const mockProfile: Profile = {
    id: 'u1',
    fullName: 'Demo Volunteer',
    skills: ['Cleaning'],
    availability: ['2025-07-10', '2025-07-11'],
    preferredLocations: ['Houston, TX'],
    role: 'Volunteer',
  };

  const mockVolunteers: Volunteer[] = [
    { id: 'v1', fullName: 'Alice Johnson', skills: ['Cleaning'], availability: ['2025-07-10'], preferredLocations: ['Houston, TX'] },
    { id: 'v2', fullName: 'Bob Smith', skills: ['Cooking'], availability: ['2025-07-11'], preferredLocations: ['Austin, TX'] },
  ];

  const mockEvents: Event[] = [
    { id: 'e1', name: 'Community Clean-Up', requiredSkills: ['Cleaning'], urgency: 'High', date: '2025-07-10', location: 'Houston, TX' },
    { id: 'e2', name: 'Food Drive', requiredSkills: ['Cooking'], urgency: 'Medium', date: '2025-07-11', location: 'Austin, TX' },
    { id: 'e3', name: 'Park Painting', requiredSkills: ['Painting'], urgency: 'Low', date: '2025-07-12', location: 'Houston, TX' },
  ];

  // State initialized with mock data
  const [profile] = useState<Profile>(mockProfile);
  const [volunteers] = useState<Volunteer[]>(mockVolunteers);
  const [events] = useState<Event[]>(mockEvents);

  // Filters
  const [dateFilter, setDateFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [urgencyFilter, setUrgencyFilter] = useState<Event['urgency'] | ''>('');
  const [skillsFilter, setSkillsFilter] = useState<string>('');

  // Admin form for event→volunteer matching
  const eventForm = useForm<{ eventId: string }>({ defaultValues: { eventId: '' } });
  const selectedEventId = eventForm.watch('eventId');
  const [matchedVolunteers, setMatchedVolunteers] = useState<Volunteer[]>([]);

  // Compute matched volunteers for selected event (Admin view)
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

    const matches = volunteers.filter((v) =>
      event.requiredSkills.every((skill) => v.skills.includes(skill)) &&
      v.availability.includes(event.date) &&
      v.preferredLocations.includes(event.location)
    );

    setMatchedVolunteers(matches);
  }, [selectedEventId, events, volunteers]);

  // Handle event→volunteer match submission (demo)
  const onEventSubmit = (data: { eventId: string }) => {
    console.log('Event matches saved for:', data.eventId, matchedVolunteers);
    alert(`Assigned ${matchedVolunteers.length} volunteers to event ${data.eventId}`);
  };

  // Volunteer view: show recommended events
  if (profile.role === 'Volunteer') {
    // Base recommendations from profile
    const recommended = events
      .filter(
        (e) =>
          e.requiredSkills.every((skill) => profile.skills.includes(skill)) &&
          profile.availability.includes(e.date) &&
          profile.preferredLocations.includes(e.location)
      )
      .sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);

    // Apply UI filters
    const skillsArray = skillsFilter
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const filtered = recommended.filter((e) => {
      if (dateFilter && e.date !== dateFilter) return false;
      if (locationFilter && !e.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (urgencyFilter && e.urgency !== urgencyFilter) return false;
      if (skillsArray.length && !skillsArray.every((sk) => e.requiredSkills.includes(sk))) return false;
      return true;
    });

    return (
      <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-6">
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
                  <option key={u} value={u}>{u}</option>
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
                <p><strong>Location:</strong> {e.location}</p>
                <p><strong>Urgency:</strong> {e.urgency}</p>
                <p><strong>Skills:</strong> {e.requiredSkills.join(', ')}</p>
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
            <p className="text-center col-span-full">No events match your filters.</p>
          )}
        </div>
      </main>
    );
  }

  // Admin view: event→volunteer matching
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

