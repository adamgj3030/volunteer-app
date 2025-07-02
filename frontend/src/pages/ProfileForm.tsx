// frontend/src/components/forms/ProfileForm.tsx

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

type ProfileFormValues = {
  fullName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  skills: string[];
  preferences?: string;
  availability: Date[];
};

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

const SKILLS = [
  "Leadership",
  "Communication",
  "Organization",
  "Technical",
  "Fundraising",
  "Design"
];

export default function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      skills: [],
      preferences: "",
      availability: [],
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    console.log("Profile submitted:", values);
    // TODO: send to your backend
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          rules={{
            required: "Full Name is required",
            maxLength: { value: 50, message: "Max 50 characters" },
          }}
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
          rules={{
            required: "Address is required",
            maxLength: { value: 100, message: "Max 100 characters" },
          }}
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
          rules={{
            maxLength: { value: 100, message: "Max 100 characters" },
          }}
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
          rules={{
            required: "City is required",
            maxLength: { value: 100, message: "Max 100 characters" },
          }}
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

        {/* State (dropdown) */}
        <FormField
          control={form.control}
          name="state"
          rules={{ required: "State is required" }}
          render={({ field }) => (
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
                    {STATES.map((code) => (
                      <SelectItem key={code} value={code}>
                        {code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Zip Code */}
        <FormField
          control={form.control}
          name="zip"
          rules={{
            required: "Zip code is required",
            minLength: { value: 5, message: "At least 5 digits" },
            maxLength: { value: 9, message: "Max 9 digits" },
          }}
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

        {/* Skills (multi-select) */}
        <FormField
          control={form.control}
          name="skills"
          rules={{ required: "Select at least one skill" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
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
        <FormField
          control={form.control}
          name="availability"
          rules={{ required: "Pick at least one date" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Availability</FormLabel>
              <FormControl>
                <Calendar
                  mode="multiple"
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  );
}
