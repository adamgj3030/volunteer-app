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

// List of US states for the State dropdown
type StateOption = { value: string; label: string }
const US_STATES: StateOption[] = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
]

// Other constants
type EventFormValues = {
  eventName: string
  eventDescription: string
  address: string
  city: string
  state: string
  zipcode: string
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

const labelClass =
  "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]"
const errorInputClass = "border-red-500 focus-visible:ring-red-200"
const inputClass =
  "w-full p-2 border border-[var(--color-ash_gray-400)] bg-white text-black rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50"
const textareaClass = `${inputClass} resize-none`
const selectTriggerClass = `${inputClass} py-2`
const buttonClass =
  "px-6 py-3 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50 rounded-lg text-white mx-auto flex justify-center"

const defaultValues: EventFormValues = {
  eventName: "",
  eventDescription: "",
  address: "",
  city: "",
  state: "",
  zipcode: "",
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
    setEditingIndex(idx)
    reset(events[idx])
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
                      className={`${inputClass} ${errors.eventName ? errorInputClass : ""}`}
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
                      className={`${textareaClass} ${errors.eventDescription ? errorInputClass : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3a. Street Address */}
            <FormField
              control={control}
              name="address"
              rules={{ required: "Street address is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Street Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="123 Main St"
                      className={`${inputClass} ${errors.address ? errorInputClass : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3b. City */}
            <FormField
              control={control}
              name="city"
              rules={{ required: "City is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>City</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Houston"
                      className={`${inputClass} ${errors.city ? errorInputClass : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3c. State */}
            <FormField
              control={control}
              name="state"
              rules={{ required: "State is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>State</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`${selectTriggerClass} ${errors.state ? errorInputClass : ""}`}>   
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((st) => (
                          <SelectItem key={st.value} value={st.value}>
                            {st.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 3d. ZIP Code */}
            <FormField
              control={control}
              name="zipcode"
              rules={{
                required: "ZIP code is required",
                pattern: { value: /^\d{5}$/, message: "Must be 5 digits" },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>ZIP Code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="77005"
                      className={`${inputClass} ${errors.zipcode ? errorInputClass : ""}`}
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
                    <Select multiple value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`${selectTriggerClass} ${errors.requiredSkills ? errorInputClass : ""}`}>   
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
                      <SelectTrigger className={`${selectTriggerClass} ${errors.urgency ? errorInputClass : ""}`}>   
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
            <p className="text-sm text-black">No events yet.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e, i) => (
                <li
                  key={i}
                  onClick={() => onEdit(i)}
                  className="cursor-pointer p-3 border rounded hover:bg-gray-100 transition-colors duration-150"
                >
                  <strong>{e.eventName}</strong> <br />
                  <span className="text-sm font-semibold text-black">
                    ({e.eventDate?.toLocaleDateString()}) &mdash; {e.address}, {e.city}, {e.state} {e.zipcode}
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
