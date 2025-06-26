// src/app/volunteer-matching/page.tsx
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type VolunteerMatchFormValues = {
  volunteerName: string;
  matchedEvent: string;
};

export default function VolunteerMatchingPage() {
  // mock data – replace with your real API calls
  const volunteers = [
    { id: 'v1', name: 'Alice Johnson' },
    { id: 'v2', name: 'Bob Smith' },
    { id: 'v3', name: 'Carol Lee' },
  ];
  const bestEventFor: Record<string, string> = {
    v1: 'Community Clean-Up',
    v2: 'Food Drive',
    v3: 'Tree Planting',
  };

  const form = useForm<VolunteerMatchFormValues>({
    defaultValues: { volunteerName: '', matchedEvent: '' },
  });

  // auto‐fill matchedEvent when volunteerName changes
  const selected = form.watch('volunteerName');
  useEffect(() => {
    form.setValue(
      'matchedEvent',
      selected ? bestEventFor[selected] || 'No match found' : ''
    );
  }, [selected, form]);

  const onSubmit = (data: VolunteerMatchFormValues) => {
    console.log('Saving match:', data);
    // TODO: POST to /api/match
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-6 text-black">
          Volunteer Matching
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Volunteer selector (native <select>) */}
            <FormField
              control={form.control}
              name="volunteerName"
              rules={{ required: 'Please select a volunteer' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Volunteer</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="
                        w-full
                        border border-black
                        bg-white text-black
                        p-2 rounded
                      "
                    >
                      <option value="">-- Select a volunteer --</option>
                      {volunteers.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Matched Event (auto‐filled) */}
            <FormField
              control={form.control}
              name="matchedEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Matched Event</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      placeholder="Select a volunteer first"
                      className="border border-black bg-gray-50 text-black"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-black text-white hover:opacity-90"
            >
              Save Match
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
