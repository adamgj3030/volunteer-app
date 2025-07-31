import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import {
  fetchStates,
  fetchSkills,
  fetchMyProfile,
  saveMyProfile,
  patchMyProfile,
} from "@/lib/api";
import type {
  VolunteerProfile,
  VolunteerProfileInput,
  SkillOption,
  StateOption,
} from "@/types/profile";

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
import { MultiSelect } from "@/components/MultiSelect";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Validation schema (unchanged) --------------------------------------------
// ---------------------------------------------------------------------------
const schema = z.object({
  full_name: z.string().min(1, "Required").max(50, "Max 50 chars"),
  address1: z.string().min(1, "Required").max(100, "Max 100 chars"),
  address2: z
    .string()
    .max(100, "Max 100 chars")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  city: z.string().min(1, "Required").max(100, "Max 100 chars"),
  state: z.string().length(2, "Select state"),
  zipcode: z
    .string()
    .min(5, "At least 5 digits")
    .max(9, "Max 9 digits")
    .regex(/^[0-9-]+$/, "Digits only (dash optional)"),
  preferences: z.string().optional(),
  skills: z.array(z.number()).min(1, "Select at least one skill"),
  availability: z.array(z.date()).min(1, "Pick at least one date"),
});

export type ProfileFormValues = z.infer<typeof schema>;

// ---------------------------------------------------------------------------
// Helpers (unchanged) -------------------------------------------------------
// ---------------------------------------------------------------------------
function toFormValues(p: VolunteerProfile | null): ProfileFormValues {
  if (!p) {
    return {
      full_name: "",
      address1: "",
      address2: undefined,
      city: "",
      state: "",
      zipcode: "",
      preferences: undefined,
      skills: [],
      availability: [],
    };
  }
  return {
    full_name: p.full_name,
    address1: p.address1,
    address2: p.address2 ?? undefined,
    city: p.city,
    state: p.state,
    zipcode: p.zipcode,
    preferences: p.preferences ?? undefined,
    skills: p.skills,
    availability: p.availability.map(ymdToLocalDate),
  };
}

function toPayload(v: ProfileFormValues): VolunteerProfileInput {
  return {
    full_name: v.full_name.trim(),
    address1: v.address1.trim(),
    address2: v.address2?.trim() || undefined,
    city: v.city.trim(),
    state: v.state,
    zipcode: v.zipcode.replace(/[^0-9]/g, ""),
    preferences: v.preferences?.trim() || undefined,
    skills: v.skills,
    availability: v.availability.map(localDateToYMD),
  };
}

// Parse "YYYY-MM-DD" into a local Date (no UTC shift)
function ymdToLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  // Use local constructor and set to noon to avoid DST edge cases
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

// Convert a Date object to "YYYY-MM-DD" using its local calendar date
function localDateToYMD(d: Date): string {
  // Rebuild a local-only date so formatting is stable
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
  return format(local, "yyyy-MM-dd");
}

// ---------------------------------------------------------------------------
// Theme classes (mirroring Login.tsx) --------------------------------------
// ---------------------------------------------------------------------------
const headingClass =
  "text-2xl font-extrabold text-[var(--color-charcoal-100)]";
const labelClass =
  "block mb-1 text-sm font-medium text-[var(--color-charcoal-300)]";
const inputRingClass =
  "focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-500)]/50";
const errorInputClass = "border-red-500 focus-visible:ring-red-200";
const fieldHelpClass = "text-sm text-[var(--color-charcoal-200)]";

// Small helper to know if a field currently has an error (UI-only)
const hasError = (name: keyof ProfileFormValues, errors: any) =>
  Boolean(errors?.[name]);

// ---------------------------------------------------------------------------
// Component (logic unchanged) ----------------------------------------------
// ---------------------------------------------------------------------------
export default function ProfileFormPage() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [states, setStates] = React.useState<StateOption[]>([]);
  const [skills, setSkills] = React.useState<SkillOption[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(null),
  });

  // Load reference data + profile (unchanged)
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [st, sk] = await Promise.all([fetchStates(), fetchSkills()]);
        if (!alive) return;
        setStates(st);
        setSkills(sk);
        if (token) {
          const prof = await fetchMyProfile(token);
          if (!alive) return;
          form.reset(toFormValues(prof));
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile data");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (vals: ProfileFormValues) => {
    if (!token) {
      toast.error("Not authenticated");
      return;
    }
    try {
      const payload = toPayload(vals);
      const saved = await saveMyProfile(token, payload);
      toast.success("Profile saved");
      form.reset(toFormValues(saved));
    } catch (err: any) {
      console.error(err);
      if (err.fields) {
        Object.entries(err.fields).forEach(([k, v]) =>
          form.setError(k as any, { type: "server", message: String(v) })
        );
      }
      toast.error(err.message || "Failed to save profile");
    }
  };

  // Loading UI — themed background to match Login.tsx
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)] flex items-center justify-center">
        <Card className="w-full max-w-md p-6 bg-[var(--color-white)] dark:bg-[var(--color-dark_slate_gray-900)] shadow-xl rounded-2xl">
          <CardContent className="text-center py-8">
            <p className="text-[var(--color-charcoal-200)]">Loading profile…</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { errors } = form.formState;

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)] flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6 bg-[var(--color-white)] dark:bg-[var(--color-dark_slate_gray-900)] shadow-xl rounded-2xl transition-shadow hover:shadow-[0_8px_24px_-4px_rgba(82,121,111,0.1)]">
        <CardHeader className="text-center">
          <CardTitle className={headingClass}>My Volunteer Profile</CardTitle>
          <p className="text-sm text-[var(--color-charcoal-200)]">
            Keep your information up to date to get matched with the right events.
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Jane Doe"
                        className={`${inputRingClass} ${
                          hasError("full_name", errors) ? errorInputClass : ""
                        }`}
                        aria-invalid={hasError("full_name", errors)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              {/* Address 1 */}
              <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Address 1</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123 Main St."
                        className={`${inputRingClass} ${
                          hasError("address1", errors) ? errorInputClass : ""
                        }`}
                        aria-invalid={hasError("address1", errors)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              {/* Address 2 (optional) */}
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Address 2 (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Apt, Suite, etc."
                        className={`${inputRingClass} ${
                          hasError("address2", errors) ? errorInputClass : ""
                        }`}
                        aria-invalid={hasError("address2", errors)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              {/* City */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your City"
                        className={`${inputRingClass} ${
                          hasError("city", errors) ? errorInputClass : ""
                        }`}
                        aria-invalid={hasError("city", errors)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              {/* State */}
              <Controller
                name="state"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>State</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={`${inputRingClass} ${
                            fieldState.error ? errorInputClass : ""
                          }`}
                          aria-invalid={!!fieldState.error}
                        >
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map((s) => (
                            <SelectItem key={s.code} value={s.code}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage className="text-sm text-red-600">
                      {fieldState.error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Zipcode */}
              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Zip Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="12345 or 123456789"
                        className={`${inputRingClass} ${
                          hasError("zipcode", errors) ? errorInputClass : ""
                        }`}
                        aria-invalid={hasError("zipcode", errors)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              {/* Skills multi-select */}
              <Controller
                control={form.control}
                name="skills"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Skills</FormLabel>
                    <FormControl>
                      <div
                        className={`rounded-md ${
                          fieldState.error ? "border border-red-500" : "border border-[var(--color-ash_gray-400)]/40"
                        } bg-white dark:bg-[var(--color-dark_slate_gray-900)] p-1`}
                      >
                        <MultiSelect
                          options={skills.map((s) => ({
                            value: s.id,
                            label: s.name,
                          }))}
                          values={field.value}
                          onChange={(vals) =>
                            field.onChange(vals.map((v) => Number(v))) // ensure numbers (same behavior)
                          }
                          placeholder="Select skills…"
                        />
                      </div>
                    </FormControl>
                    <p className={fieldHelpClass}>Pick one or more skills you can offer.</p>
                    <FormMessage className="text-sm text-red-600">
                      {fieldState.error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              {/* Preferences (optional) */}
              <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Preferences (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Any other notes…"
                        className={`${inputRingClass} ${
                          hasError("preferences", errors) ? errorInputClass : ""
                        }`}
                        aria-invalid={hasError("preferences", errors)}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-600" />
                  </FormItem>
                )}
              />

              {/* Availability (multi-date picker) */}
              <Controller
                control={form.control}
                name="availability"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Availability</FormLabel>
                    <FormControl>
                      <div
                        className={`rounded-md ${
                          fieldState.error ? "border border-red-500" : "border border-[var(--color-ash_gray-400)]/40"
                        } bg-white dark:bg-[var(--color-dark_slate_gray-900)] p-2`}
                      >
                        <Calendar
                          mode="multiple"
                          selected={field.value}
                          onSelect={(dates) => field.onChange(dates ?? [])}
                        />
                      </div>
                    </FormControl>
                    <p className={fieldHelpClass}>Select all dates you can volunteer.</p>
                    <FormMessage className="text-sm text-red-600">
                      {fieldState.error?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--color-ash_gray-400)]/40" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus-visible:ring-2 focus-visible:ring-[var(--color-cambridge_blue-400)] disabled:opacity-50"
              >
                Save Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
