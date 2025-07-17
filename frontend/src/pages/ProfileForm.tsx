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

// ---------------------------------------------------------------------------
// Validation schema --------------------------------------------------------
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
    availability: p.availability.map((d) => new Date(d)),
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
    availability: v.availability.map((d) => format(d, "yyyy-MM-dd")),
  };
}

export default function ProfileFormPage() {
  const { token } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [states, setStates] = React.useState<StateOption[]>([]);
  const [skills, setSkills] = React.useState<SkillOption[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(null),
  });

  // Load reference data + profile ------------------------------------------
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
  }, [token]);

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

  if (loading) {
    return <p className="p-4">Loading profile…</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Volunteer Profile</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Jane Doe" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address 1 */}
          <FormField
            control={form.control}
            name="address1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address 1</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123 Main St." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address 2 (optional) */}
          <FormField
            control={form.control}
            name="address2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address 2 (optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Apt, Suite, etc." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your City" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* State */}
          <Controller
            name="state"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
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
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Zipcode */}
          <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Zip Code</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="12345 or 123456789" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Skills multi-select */}
          <Controller
            control={form.control}
            name="skills"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Skills</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={skills.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    values={field.value}
                    onChange={(vals) =>
                      field.onChange(
                        vals.map((v) => Number(v)) // ensure numbers
                      )
                    }
                    placeholder="Select skills…"
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          {/* Preferences (optional) */}
          <FormField
            control={form.control}
            name="preferences"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferences (optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Any other notes…" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Availability (multi-date picker) */}
          <Controller
            control={form.control}
            name="availability"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <FormControl>
                  <Calendar
                    mode="multiple"
                    selected={field.value}
                    onSelect={(dates) => field.onChange(dates ?? [])}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

          <Button type="submit">Save Profile</Button>
        </form>
      </Form>
    </div>
  );
}
