'use client, use /admin/matching';

// src/pages/MatchVolunteers.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { fetchVolunteerMatching } from "@/lib/api";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import type { Volunteer, Event } from "@/types/type";

type VolunteerMatchFormValues = {
  matchedEventId: string;
  volunteerId: string;
};

export default function VolunteerMatchingPage() {
  // suggested volunteers state
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);

  // static events (could also be fetched)
  const [events] = useState<Event[]>([
    { id: "e1", name: "Community Clean-Up", requiredSkills: ["Cleaning"], urgency: "High",   date: "2025-07-10" },
    { id: "e2", name: "Food Drive",         requiredSkills: ["Cooking"],  urgency: "Medium", date: "2025-07-11" },
    { id: "e3", name: "Tree Planting",      requiredSkills: ["Planting"], urgency: "Low",    date: "2025-07-12" },
    // …more events
  ]);

  const form = useForm<VolunteerMatchFormValues>({
    defaultValues: { matchedEventId: "", volunteerId: "" },
  });
  const selectedEventId = form.watch("matchedEventId");

  // fetch & rank volunteers when event changes
  useEffect(() => {
    if (!selectedEventId) {
      setVolunteers([]);
      form.setValue("volunteerId", "");
      return;
    }
    fetchVolunteerMatching(selectedEventId)
      .then((list) => {
        setVolunteers(list);
        form.setValue("volunteerId", list[0]?.id || "");
      })
      .catch((err) => console.error(err));
  }, [selectedEventId, form]);

  const onSubmit = (data: VolunteerMatchFormValues) => {
    console.log("Saving match:", data);
    // TODO: POST to backend
  };

  // find objects to display details
  const selectedEvent     = events.find((e) => e.id === selectedEventId);
  const selectedVolunteer = volunteers.find((v) => v.id === form.getValues("volunteerId"));

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white shadow-xl rounded-2xl">
        <CardHeader className="py-6 text-center">
          <CardTitle className="text-3xl font-extrabold">Volunteer Matching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Event selection */}
              <FormField
                control={form.control}
                name="matchedEventId"
                rules={{ required: "Please select an event" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event</FormLabel>
                    <FormControl>
                      <div className="grid gap-2">
                        {events.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            onClick={() => field.onChange(e.id)}
                            className={`w-full p-3 text-left border rounded-lg ${
                              field.value === e.id
                                ? "border-green-600 bg-green-50"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {e.name} ({e.urgency}) — {e.date}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Event details */}
              {selectedEvent && (
                <div className="p-4 bg-white border rounded-lg">
                  <p><strong>Required Skills:</strong> {selectedEvent.requiredSkills.join(", ")}</p>
                  <p><strong>Urgency:</strong> {selectedEvent.urgency}</p>
                  <p><strong>Date:</strong> {selectedEvent.date}</p>
                </div>
              )}

              {/* Suggested volunteers in a scrollable table */}
              <FormField
                control={form.control}
                name="volunteerId"
                rules={{ required: "Please select a volunteer" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suggested Volunteers</FormLabel>
                    <FormControl>
                      <div className="border rounded-lg max-h-60 overflow-y-auto">
                        <Table>
                          <TableCaption className="sr-only">
                            Suggested volunteers list (click to select)
                          </TableCaption>
                          <TableHeader>
                            <TableRow className="bg-gray-100">
                              <TableHead>Name</TableHead>
                              <TableHead>Skills</TableHead>
                              <TableHead>Availability</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {volunteers.map((v) => (
                              <TableRow
                                key={v.id}
                                onClick={() => field.onChange(v.id)}
                                className={`cursor-pointer ${
                                  field.value === v.id
                                    ? "bg-green-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <TableCell className="font-medium">{v.fullName}</TableCell>
                                <TableCell>{v.skills.join(", ")}</TableCell>
                                <TableCell>{v.availability.join(", ")}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Volunteer details */}
              {selectedVolunteer && (
                <div className="p-4 bg-white border rounded-lg">
                  <p><strong>Skills:</strong> {selectedVolunteer.skills.join(", ")}</p>
                  <p><strong>Availability:</strong> {selectedVolunteer.availability.join(", ")}</p>
                </div>
              )}

              <Button type="submit" className="w-full">
                Save Match
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
