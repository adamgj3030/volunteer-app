// frontend/src/components/forms/ProfileForm.tsx

import React from "react";
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
import { Select } from "@/components/ui/select";
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

export function ProfileForm() {
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
    // TODO: call your backend API
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          rules={{ required: "Full Name is required", maxLength: 50 }}
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
          rules={{ required: "Address 1 is required", maxLength: 100 }}
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

        {/* …repeat for each field… */}

        <Button type="submit">Save Profile</Button>
      </form>
    </Form>
  );
}
