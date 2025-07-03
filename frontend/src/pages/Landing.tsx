// src/app/page.tsx  (or src/pages/index.tsx)
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-5xl font-bold text-black mb-4 text-center">
        Volunteer Management
      </h1>
      <p className="text-lg text-black mb-8 text-center max-w-lg">
        Welcome to your one-stop app for creating events, matching volunteers, and tracking participation.
      </p>

      <div className="flex space-x-4">
        {/* Both buttons now share the same filled style */}
        <Button asChild className="bg-black text-white hover:opacity-90">
          <a href="/login">Log In</a>
        </Button>
        <Button asChild className="bg-black text-white hover:opacity-90">
          <a href="/register">Sign Up</a>
        </Button>
      </div>
    </div>
  );
}
