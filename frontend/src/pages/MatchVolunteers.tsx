'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Simplified types for matching form requirements
interface Volunteer {
  id: string;
  fullName: string;
  skills: string[];
  availability: string[];
}

interface Event {
  id: string;
  name: string;
  requiredSkills: string[];
  urgency: 'High' | 'Medium' | 'Low';
  date: string;
}

type VolunteerMatchFormValues = {
  volunteerId: string;
  matchedEventId: string;
};

// Urgency ranking for sorting recommendations
const urgencyRank: Record<Event['urgency'], number> = {
  High: 1,
  Medium: 2,
  Low: 3,
};

export default function VolunteerMatchingPage() {
  // TODO: replace with real API calls
  const volunteers: Volunteer[] = [
    { id: 'v1', fullName: 'Alice Johnson', skills: ['Cleaning'], availability: ['2025-07-10'] },
    { id: 'v2', fullName: 'Bob Smith', skills: ['Cooking'], availability: ['2025-07-11'] },
    { id: 'v3', fullName: 'Carol Lee', skills: ['Planting'], availability: ['2025-07-12'] },
  ];
  const events: Event[] = [
    { id: 'e1', name: 'Community Clean-Up', requiredSkills: ['Cleaning'], urgency: 'High', date: '2025-07-10' },
    { id: 'e2', name: 'Food Drive', requiredSkills: ['Cooking'], urgency: 'Medium', date: '2025-07-11' },
    { id: 'e3', name: 'Tree Planting', requiredSkills: ['Planting'], urgency: 'Low', date: '2025-07-12' },
  ];

  const form = useForm<VolunteerMatchFormValues>({ defaultValues: { volunteerId: '', matchedEventId: '' } });
  const selectedVolunteerId = form.watch('volunteerId');

  // Auto-pick best matching event whenever volunteer changes
  useEffect(() => {
    const volunteer = volunteers.find((v) => v.id === selectedVolunteerId);
    if (volunteer) {
      const recommended = events
        .filter(
          (e) =>
            e.requiredSkills.every((skill) => volunteer.skills.includes(skill)) &&
            volunteer.availability.includes(e.date)
        )
        .sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);
      form.setValue('matchedEventId', recommended[0]?.id || '');
    } else {
      form.setValue('matchedEventId', '');
    }
  }, [selectedVolunteerId, form]);

  const onSubmit = (data: VolunteerMatchFormValues) => {
    console.log('Matched:', data);
    // TODO: POST data to backend
  };

  // Find objects for display
  const selectedVolunteer = volunteers.find((v) => v.id === form.getValues('volunteerId'));
  const selectedEvent = events.find((e) => e.id === form.getValues('matchedEventId'));

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[var(--color-white)] dark:bg-[var(--color-dark_slate_gray-900)] shadow-xl rounded-2xl p-6 transition-shadow hover:shadow-[0_8px_24px_-4px_rgba(82,121,111,0.1)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-extrabold text-[var(--color-charcoal-100)]">Volunteer Matching</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Volunteer selection via button list */}
              <FormField
                control={form.control}
                name="volunteerId"
                rules={{ required: 'Please select a volunteer' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-charcoal-300)]">Volunteer Name</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        {volunteers.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => field.onChange(v.id)}
                            className={`w-full text-left p-2 border rounded-lg focus:outline-none \
                              ${
                                field.value === v.id
                                  ? 'border-[var(--color-cambridge_blue-500)] bg-[var(--color-cambridge_blue-50)]'
                                  : 'border-[var(--color-ash_gray-400)] bg-[var(--color-white)]'
                              }
                            `}
                          >
                            {v.fullName}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Display selected volunteer details */}
              {selectedVolunteer && (
                <div className="p-4 bg-[var(--color-white)] border border-[var(--color-ash_gray-300)] rounded-lg">
                  <p><strong>Skills:</strong> {selectedVolunteer.skills.join(', ')}</p>
                  <p><strong>Availability:</strong> {selectedVolunteer.availability.join(', ')}</p>
                </div>
              )}

              {/* Event selection via button list */}
              <FormField
                control={form.control}
                name="matchedEventId"
                rules={{ required: 'No matching event found' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[var(--color-charcoal-300)]">Matched Event</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        {events
                          .filter((e) =>
                            selectedVolunteer
                              ? e.requiredSkills.every((skill) => selectedVolunteer.skills.includes(skill)) && selectedVolunteer.availability.includes(e.date)
                              : true
                          )
                          .sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency])
                          .map((e) => (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => field.onChange(e.id)}
                              className={`w-full text-left p-2 border rounded-lg focus:outline-none \
                                ${
                                  field.value === e.id
                                    ? 'border-[var(--color-cambridge_blue-500)] bg-[var(--color-cambridge_blue-50)]'
                                    : 'border-[var(--color-ash_gray-400)] bg-[var(--color-white)]'
                                }
                              `}
                            >
                              {e.name} ({e.urgency}) - {e.date}
                            </button>
                          ))}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-600" />
                  </FormItem>
                )}
              />

              {/* Display selected event details */}
              {selectedEvent && (
                <div className="p-4 bg-[var(--color-white)] border border-[var(--color-ash_gray-300)] rounded-lg">
                  <p><strong>Required Skills:</strong> {selectedEvent.requiredSkills.join(', ')}</p>
                  <p><strong>Urgency:</strong> {selectedEvent.urgency}</p>
                  <p><strong>Date:</strong> {selectedEvent.date}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50"
              >
                Save Match
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
