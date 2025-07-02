// frontend/src/components/forms/EventForm.tsx

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

type EventFormValues = {
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: Date | null;
};

const SKILLS = [
  "Leadership",
  "Communication",
  "Organization",
  "Technical",
  "Fundraising",
];
const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export function EventForm() {
  const form = useForm<EventFormValues>({
    defaultValues: {
      eventName: "",
      eventDescription: "",
      location: "",
      requiredSkills: [],
      urgency: "",
      eventDate: null,
    },
  });

  const onSubmit = (values: EventFormValues) => {
    console.log("Event submitted:", values);
    // TODO: call your backend API
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Event Name */}
        <FormField
          control={form.control}
          name="eventName"
          rules={{
            required: "Event Name is required",
            maxLength: { value: 100, message: "Max 100 characters" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="My Awesome Event" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. Description */}
        <FormField
          control={form.control}
          name="eventDescription"
          rules={{ required: "Description is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe the event..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 3. Location */}
        <FormField
          control={form.control}
          name="location"
          rules={{ required: "Location is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="123 Main St, City, State"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 4. Required Skills */}
        <FormField
          control={form.control}
          name="requiredSkills"
          rules={{ required: "Select at least one skill" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <Select
                  multiple
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose skills..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILLS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 5. Urgency */}
        <FormField
          control={form.control}
          name="urgency"
          rules={{ required: "Urgency is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgency</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    {URGENCY_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 6. Event Date */}
        <FormField
          control={form.control}
          name="eventDate"
          rules={{ required: "Event date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Event</Button>
      </form>
    </Form>
  );
}
