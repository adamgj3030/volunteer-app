import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import {
  listUpcoming,
  listPast,
  createEvent,
  updateEvent,
  type Event as APIEvent,
  type EventPayload,
} from "@/lib/events"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"

// ─────────────────────────────────────────────────────────────────────────
// local‑form typings
// ─────────────────────────────────────────────────────────────────────────
type EventFormValues = {
  name: string
  description: string
  address: string
  city: string
  state_id: string
  zipcode: string
  urgency: "low" | "medium" | "high"
  date: Date | null            // react‑hook‑form keeps a Date obj
}

const defaultValues: EventFormValues = {
  name: "",
  description: "",
  address: "",
  city: "",
  state_id: "",
  zipcode: "",
  urgency: "low",
  date: null,
}

// quick‑n‑dirty local state buckets
type Bucket = {
  upcoming: APIEvent[]
  past: APIEvent[]
}

// ╭──────────────────────────────────────────────────────────────────────╮
// │  COMPONENT                                                          │
// ╰──────────────────────────────────────────────────────────────────────╯
export default function EventForm() {
  const form = useForm<EventFormValues>({ defaultValues })
  const { control, handleSubmit, reset, formState: { errors } } = form

  const [bucket, setBucket] = useState<Bucket>({ upcoming: [], past: [] })
  const [editing, setEditing] = useState<null | APIEvent>(null)

  // ───────── initial load ─────────
  useEffect(() => {
    Promise.all([listUpcoming(), listPast()]).then(([upcoming, past]) =>
      setBucket({ upcoming, past }),
    )
  }, [])

  // ───────── submit handler ─────────
  async function onSubmit(data: EventFormValues) {
    const payload: EventPayload = {
      ...data,
      date: data.date!.toISOString(),       // ! – we validate required
    }

    if (editing) {
      await updateEvent(editing.event_id, payload)
      // optimistic update
      setBucket((b) => ({
        upcoming: b.upcoming.map((e) =>
          e.event_id === editing.event_id ? { ...e, ...payload } : e),
        past: b.past,
      }))
    } else {
      const { event_id } = await createEvent(payload)
      setBucket((b) => ({
        upcoming: [...b.upcoming, { event_id, ...payload }],
        past: b.past,
      }))
    }

    reset(defaultValues)
    setEditing(null)
  }

  // ───────── click upcoming → edit ─────────
  function startEdit(ev: APIEvent) {
    setEditing(ev)
    reset({
      ...ev,
      date: new Date(ev.date),
    })
  }

  // ───────── render helpers ─────────
  const label = "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]"
  const input =
    "w-full p-2 border border-[var(--color-ash_gray-400)] bg-white text-black rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50"
  const errorBorder = "border-red-500 focus-visible:ring-red-200"
  const selectTrigger = `${input} py-2`
  const btn =
    "px-6 py-3 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50 rounded-lg text-white mx-auto flex justify-center"

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-4 flex justify-center">
      <div className="mt-16 max-w-2xl w-full bg-white p-6 rounded-lg shadow-md">
        {/* ─────── form ─────── */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* name */}
            <FormField
              control={control}
              name="name"
              rules={{ required: "Event name required", maxLength: 100 }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>Event Name</FormLabel>
                  <FormControl>
                    <Input {...field}
                      className={`${input} ${errors.name ? errorBorder : ""}`}
                      placeholder="Beach Cleanup" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* description */}
            <FormField
              control={control}
              name="description"
              rules={{ required: "Description required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field}
                      className={`${input} resize-none ${errors.description ? errorBorder : ""}`}
                      placeholder="Explain what volunteers will do…" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* address + city */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name="address"
                rules={{ required: "Address required" }}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={label}>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field}
                        className={`${input} ${errors.address ? errorBorder : ""}`}
                        placeholder="123 Main St" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="city"
                rules={{ required: "City required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={label}>City</FormLabel>
                    <FormControl>
                      <Input {...field}
                        className={`${input} ${errors.city ? errorBorder : ""}`}
                        placeholder="Houston" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="state_id"
                rules={{ required: "State required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={label}>State</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={`${selectTrigger} ${errors.state_id ? errorBorder : ""}`}>
                          <SelectValue placeholder="State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* zipcode */}
            <FormField
              control={control}
              name="zipcode"
              rules={{ required: "ZIP required", pattern: { value: /^\d{5}$/, message: "5 digits" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>ZIP</FormLabel>
                  <FormControl>
                    <Input {...field}
                      className={`${input} ${errors.zipcode ? errorBorder : ""}`}
                      placeholder="77005" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* urgency */}
            <FormField
              control={control}
              name="urgency"
              rules={{ required: true }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>Urgency</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={`${selectTrigger} ${errors.urgency ? errorBorder : ""}`}>
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* date */}
            <FormField
              control={control}
              name="date"
              rules={{ required: "Pick a date" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>Event Date</FormLabel>
                  <FormControl>
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className={btn}>
              {editing ? "Update Event" : "Create Event"}
            </Button>

            {editing && (
              <Button type="button" variant="outline" className="w-full"
                onClick={() => { reset(defaultValues); setEditing(null) }}>
                Cancel Edit
              </Button>
            )}
          </form>
        </Form>

        {/* ─────── lists ─────── */}
        <section className="mt-10 space-y-6">
          {/* upcoming */}
          <div>
            <h2 className="text-xl font-bold mb-2">Upcoming Events</h2>
            {bucket.upcoming.length === 0
              ? <p className="text-sm text-black/60">No upcoming events.</p>
              : (
                <ul className="space-y-2">
                  {bucket.upcoming.map((e) => (
                    <li key={e.event_id}
                        className="cursor-pointer p-3 border rounded hover:bg-gray-100 transition"
                        onClick={() => startEdit(e)}>
                      <strong>{e.name}</strong><br/>
                      <span className="text-sm">
                        ({new Date(e.date).toLocaleString()}) &mdash;
                        {` ${e.city}, ${e.state_id}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* past */}
          <div>
            <h2 className="text-xl font-bold mb-2">Past Events</h2>
            {bucket.past.length === 0
              ? <p className="text-sm text-black/60">No past events.</p>
              : (
                <ul className="space-y-2 opacity-70">
                  {bucket.past.map((e) => (
                    <li key={e.event_id} className="p-3 border rounded">
                      <strong>{e.name}</strong><br/>
                      <span className="text-sm">
                        ({new Date(e.date).toLocaleString()}) &mdash;
                        {` ${e.city}, ${e.state_id}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </section>
      </div>
    </main>
  )
}

// hard‑coded list of states – keep near bottom so it’s easy to edit later
const US_STATES = [
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
]
