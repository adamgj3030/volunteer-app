/*  frontend/src/pages/EventForm.tsx  */
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  listUpcoming,
  listPast,
  createEvent,
  updateEvent,
  type Event as APIEvent,
  type EventPayload,
} from "@/lib/events";
import { fetchSkills } from "@/lib/api";
import type { SkillOption } from "@/types/profile";

import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

/* ───────────────────────── Types ───────────────────────── */
type EventFormValues = {
  name: string;
  description: string;
  address: string;
  city: string;
  state_id: string;
  zipcode: string;
  urgency: "low" | "medium" | "high";
  date: Date | null;
  skills: number[];      // ► store SKILL IDs, not names
};

const defaultValues: EventFormValues = {
  name: "",
  description: "",
  address: "",
  city: "",
  state_id: "",
  zipcode: "",
  urgency: "low",
  date: null,
  skills: [],
};

/* local cache buckets */
type APIEventWithSkills = APIEvent & { skills?: number[] };
type Bucket = { upcoming: APIEventWithSkills[]; past: APIEventWithSkills[] };

/* ───────────────────── Component ───────────────────── */
export default function EventForm() {
  const form = useForm<EventFormValues>({ defaultValues });
  const { control, handleSubmit, reset, formState: { errors } } = form;

  const [bucket, setBucket]   = useState<Bucket>({ upcoming: [], past: [] });
  const [editing, setEditing] = useState<APIEventWithSkills | null>(null);
  const [skillOpts, setSkillOpts] = useState<SkillOption[]>([]);
  const [ready, setReady]     = useState(false);

  /* preload events + skills */
  useEffect(() => {
    (async () => {
      const [upcoming, past, skills] = await Promise.all([
        listUpcoming(),        // backend should include `skills` per event
        listPast(),
        fetchSkills(),
      ]);
      setBucket({ upcoming: upcoming as APIEventWithSkills[], past: past as APIEventWithSkills[] });
      setSkillOpts(skills as SkillOption[]);
      setReady(true);
    })();
  }, []);

  /* helper: id → name */
  const skillDict = useMemo(
    () => Object.fromEntries(skillOpts.map(o => [o.id, o.name])),
    [skillOpts]
  );

  /* submit handler */
  async function onSubmit(data: EventFormValues) {
    const payload: EventPayload & { skills: number[] } = {
      ...data,
      date: data.date!.toISOString(),
      skills: data.skills,
    };

    if (editing) {
      await updateEvent(editing.event_id, payload as any);
      setBucket(b => ({
        upcoming: b.upcoming.map(e =>
          e.event_id === editing.event_id ? { ...e, ...payload } : e),
        past: b.past,
      }));
    } else {
      const { event_id } = await createEvent(payload as any);
      setBucket(b => ({
        upcoming: [...b.upcoming, { event_id, ...payload }],
        past: b.past,
      }));
    }
    reset(defaultValues);
    setEditing(null);
  }

  /* click row → edit */
  function startEdit(ev: APIEventWithSkills) {
    setEditing(ev);
    reset({
      ...ev,
      date: new Date(ev.date),
      skills: ev.skills ?? [],
    });
  }

  /* ui helpers */
  const label         = "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]";
  const input         = "w-full p-2 border border-[var(--color-ash_gray-400)] bg-white text-black rounded-lg shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50";
  const errorBorder   = "border-red-500 focus-visible:ring-red-200";
  const selectTrigger = `${input} py-2`;
  const btn           = "px-6 py-3 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50 rounded-lg text-white mx-auto flex justify-center";

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] p-4 flex justify-center">
      <div className="mt-16 max-w-2xl w-full bg-white p-6 rounded-lg shadow-md">

        {/* ───────────────────────── form ───────────────────────── */}
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
                    <Input {...field} className={`${input} ${errors.name ? errorBorder : ""}`} placeholder="Beach Cleanup" />
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
                    <Textarea {...field} className={`${input} resize-none ${errors.description ? errorBorder : ""}`} placeholder="Explain what volunteers will do…" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* address + city + state */}
            <div className="grid grid-cols-2 gap-4">
              {/* address */}
              <FormField
                control={control}
                name="address"
                rules={{ required: "Address required" }}
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className={label}>Street Address</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} ${errors.address ? errorBorder : ""}`} placeholder="123 Main St" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* city */}
              <FormField
                control={control}
                name="city"
                rules={{ required: "City required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={label}>City</FormLabel>
                    <FormControl>
                      <Input {...field} className={`${input} ${errors.city ? errorBorder : ""}`} placeholder="Houston" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* state */}
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
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
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
              rules={{
                required: "ZIP required",
                pattern: { value: /^\d{5,9}$/, message: "Zip code must be 5–9 digits long." },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>Zip Code (5–9 digits)</FormLabel>
                  <FormControl>
                    <Input {...field} className={`${input} ${errors.zipcode ? errorBorder : ""}`} placeholder="e.g. 770051234" />
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

            {/* skills */}
            <FormField
              control={control}
              name="skills"
              rules={{ validate: v => (v && v.length > 0) || "Pick at least one required skill" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={label}>Required skills</FormLabel>
                  <FormControl>
                    {ready ? (
                      <div className="grid grid-cols-2 gap-2">
                        {skillOpts.map((s) => {
                          const checked = field.value?.includes(s.id) ?? false;
                          return (
                            <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={checked}
                                onChange={(e) => {
                                  const next = new Set(field.value ?? []);
                                  if (e.target.checked) next.add(s.id);
                                  else next.delete(s.id);
                                  field.onChange(Array.from(next));
                                }}
                              />
                              {s.name}
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Loading skills…</p>
                    )}
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
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { reset(defaultValues); setEditing(null); }}
              >
                Cancel Edit
              </Button>
            )}
          </form>
        </Form>

        {/* ───────────────────── lists ───────────────────── */}
        <section className="mt-10 space-y-6">
          {(["upcoming", "past"] as const).map(kind => {
            const list = bucket[kind];
            return (
              <div key={kind}>
                <h2 className="text-xl font-bold mb-2">
                  {kind === "upcoming" ? "Upcoming Events" : "Past Events"}
                </h2>
                {list.length === 0 ? (
                  <p className="text-sm text-black/60">
                    No {kind === "upcoming" ? "upcoming" : "past"} events.
                  </p>
                ) : (
                  <ul className={kind === "past" ? "space-y-2 opacity-70" : "space-y-2"}>
                    {list.map(e => (
                      <li
                        key={e.event_id}
                        className={`p-3 border rounded ${kind === "upcoming" ? "cursor-pointer hover:bg-gray-100 transition" : ""}`}
                        onClick={kind === "upcoming" ? () => startEdit(e) : undefined}
                      >
                        <strong>{e.name}</strong>
                        <br />
                        <span className="text-sm">
                          ({new Date(e.date).toLocaleString()}) &mdash; {`${e.city}, ${e.state_id}`}
                        </span>
                        <div className="text-sm mt-1">
                          <span className="font-medium">Skills:</span>{" "}
                          {e.skills && e.skills.length > 0
                            ? e.skills.map(id => skillDict[id]).join(", ")
                            : "—"}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}

/* hard‑coded list of US states */
const US_STATES = [
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
];
