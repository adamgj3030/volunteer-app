// src/app/register/page.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type RegisterFormValues = {
  email: string;
  password: string;
};

export default function RegisterPage() {
  const form = useForm<RegisterFormValues>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: RegisterFormValues) => {
    // TODO: hook up to your /api/register
    console.log('Register data:', values);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold text-center mb-6">Create an Account</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Email"
                      className="
                        border-gray-300
                        placeholder-gray-400
                        focus:border-[#2FBF71]
                        focus:ring-2 focus:ring-[#2FBF71]
                        bg-white
                      "
                    />
                  </FormControl>
                  <FormDescription>Enter your email address</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Minimum length is 6 characters' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Password"
                      className="
                        border-gray-300
                        placeholder-gray-400
                        focus:border-[#2FBF71]
                        focus:ring-2 focus:ring-[#2FBF71]
                        bg-white
                      "
                    />
                  </FormControl>
                  <FormDescription>Enter your password</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Register Button */}
            <Button
              type="submit"
              className="
                w-full
                bg-[#2FBF71]
                hover:bg-[#27a669]
                text-white
                shadow-sm
              "
            >
              Register
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
