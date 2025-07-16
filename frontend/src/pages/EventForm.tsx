import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

type EventFormValues = {
  eventName: string
  eventDescription: string
  location: string
  requiredSkills: string[]
  urgency: string
  eventDate: Date | null
}

const SKILLS = [
  "Leadership",
  "Communication",
  "Organization",
  "Technical",
  "Fundraising",
]
const URGENCY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]

// Reusable classes
const labelClass =
  "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]"
const errorInputClass = "border-red-500 focus-visible:ring-red-200"

// Force all typed text to be black
const inputClass =
  "w-full p-2 border border-[var(--color-ash_gray-400)] bg-white text-black rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50"
const textareaClass = `${inputClass} resize-none`
const selectTriggerClass = `${inputClass} py-2`

// Button styles (with centered text)
const buttonClass =
  "px-6 py-3 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50 rounded-lg text-white mx-auto flex justify-center"

const defaultValues: EventFormValues = {
  eventName: "",
  eventDescription: "",
  location: "",
  requiredSkills: [],
  urgency: "",
  eventDate: null,
}

export default function EventForm() {
  const form = useForm<EventFormValues>({ defaultValues })
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form

  const [events, setEvents] = useState<EventFormValues[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const onSubmit = (vals: EventFormValues) => {
    if (editingIndex !== null) {
      setEvents((prev) => {
        const copy = [...prev]
        copy[editingIndex] = vals
        return copy
      })
    } else {
      setEvents((prev) => [...prev, vals])
    }
    reset(defaultValues)
    setEditingIndex(null)
  }

  function onEdit(idx: number) {
    const ev = events[idx]
    setEditingIndex(idx)
    reset(ev)
  }

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] flex items-center justify-center p-4">
      <div className="mt-16 max-w-2xl w-full mx-auto p-6 bg-[var(--color-white)] rounded-lg shadow-md">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. Event Name */}
            <FormField
              control={control}
              name="eventName"
              rules={{
                required: "Event Name is required",
                maxLength: { value: 100, message: "Max 100 characters" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Event Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My Awesome Event"
                      className={`${inputClass} ${
                        errors.eventName ? errorInputClass : ""
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 2. Description */}
            <FormField
              control={control}
              name="eventDescription"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Event Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the event..."
                      className={`${textareaClass} ${
                        errors.eventDescription ? errorInputClass : ""
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3. Location */}
            <FormField
              control={control}
              name="location"
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Location</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="123 Main St, City, State"
                      className={`${textareaClass} ${
                        errors.location ? errorInputClass : ""
                      }`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 4. Required Skills */}
            <FormField
              control={control}
              name="requiredSkills"
              rules={{ required: "Select at least one skill" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Required Skills</FormLabel>
                  <FormControl>
                    <Select
                      multiple
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className={`${selectTriggerClass} ${
                          errors.requiredSkills ? errorInputClass : ""
                        }`}
                      >
                        <SelectValue placeholder="Choose skills..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILLS.map((skill) => (
                          <SelectItem key={skill} value={skill}>
                            {skill}
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
              control={control}
              name="urgency"
              rules={{ required: "Urgency is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Urgency</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        className={`${selectTriggerClass} ${
                          errors.urgency ? errorInputClass : ""
                        }`}
                      >
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
              control={control}
              name="eventDate"
              rules={{ required: "Event date is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Event Date</FormLabel>
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

            <Button type="submit" className={buttonClass}>
              {editingIndex !== null ? "Update Event" : "Save Event"}
            </Button>
          </form>
        </Form>

        {/* Saved Events List */}
<div className="mt-8">
  <h2 className="text-xl font-bold mb-2">Saved Events</h2>
  {events.length === 0 ? (
    <p className="text-sm text-black">
      No events yet.
    </p>
  ) : (
    <ul className="space-y-2">
      {events.map((e, i) => (
        <li
          key={i}
          onClick={() => onEdit(i)}
          className="cursor-pointer p-3 border rounded hover:bg-gray-100 transition-colors duration-150"
        >
          <strong>{e.eventName}</strong>{" "}
          {/* make date darker: */}
          <span className="text-sm font-semibold text-black">
            ({e.eventDate?.toLocaleDateString()})
          </span>
        </li>
      ))}
    </ul>
  )}
</div>
      </div>
    </main>
  )
}
