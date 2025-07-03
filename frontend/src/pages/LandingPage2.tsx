import React from 'react';
import bannerImage from '@/images/williamslake.jpg';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarCheck, Heart } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)]">
      {/* Hero Section with Background Image */}
      <section
        className="relative h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[var(--color-dark_slate_gray-700)]/50" />

        {/* Content Box */}
        <div className="relative z-10 bg-white/70 dark:bg-[var(--color-dark_slate_gray-900)]/70 p-8 rounded-lg max-w-xl mx-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-[var(--color-charcoal-100)]">
            Make a Difference Today
          </h1>
          <p className="text-lg md:text-xl mb-6 text-[var(--color-charcoal-200)]">
            Join our community of volunteers and impact lives.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-[var(--color-cambridge_blue-500)] hover:bg-[var(--color-cambridge_blue-600)] focus:ring-[var(--color-cambridge_blue-300)]"
          >
            Get Started
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-[var(--color-charcoal-300)]">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 border border-[var(--color-hookers_green-300)]">
            <Users className="mx-auto mb-4 text-[var(--color-hookers_green-500)]" size={48} />
            <CardHeader>
              <CardTitle className="text-[var(--color-charcoal-400)]">Find Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Browse volunteer opportunities near you.</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6 border border-[var(--color-hookers_green-300)]">
            <CalendarCheck className="mx-auto mb-4 text-[var(--color-hookers_green-500)]" size={48} />
            <CardHeader>
              <CardTitle className="text-[var(--color-charcoal-400)]">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Register and choose shifts that fit your schedule.</p>
            </CardContent>
          </Card>
          <Card className="text-center p-6 border border-[var(--color-hookers_green-300)]">
            <Heart className="mx-auto mb-4 text-[var(--color-hookers_green-500)]" size={48} />
            <CardHeader>
              <CardTitle className="text-[var(--color-charcoal-400)]">Make Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Help communities and track your contributions.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Impact Metrics */}
      <section className="py-16 px-6 bg-[var(--color-ash_gray-700)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-around space-y-6 md:space-y-0">
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-2xl border-[var(--color-cambridge_blue-500)] text-[var(--color-cambridge_blue-500)]"
            >
              1,200+
            </Badge>
            <p className="mt-2 text-black">Volunteers</p>
          </div>
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-2xl border-[var(--color-cambridge_blue-500)] text-[var(--color-cambridge_blue-500)]"
            >
              300+
            </Badge>
            <p className="mt-2 text-[var(--color-cambridge_blue-500)]">Events</p>
          </div>
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-2xl border-[var(--color-cambridge_blue-500)] text-[var(--color-cambridge_blue-500)]"
            >
              15
            </Badge>
            <p className="mt-2 text-[var(--color-cambridge_blue-500)]">Cities</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[var(--color-charcoal-300)]">
          Ready to Start?
        </h2>
        <p className="mb-6 text-[var(--color-charcoal-200)]">
          Sign up now and join our volunteer community.
        </p>
        <Button
          size="lg"
          className="bg-[var(--color-hookers_green-500)] hover:bg-[var(--color-hookers_green-600)] focus:ring-[var(--color-hookers_green-300)]"
        >
          Join Now
        </Button>
      </section>

      {/* Image Showcase */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-black">
            Our Volunteers in Action
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <img
              src="/images/volunteer1.jpg"
              alt="Volunteer helping community"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
            <img
              src="/images/volunteer2.jpg"
              alt="Group of volunteers"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
            <img
              src="/images/volunteer3.jpg"
              alt="Smiling volunteer"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-sm text-center text-[var(--color-dark_slate_gray-300)]">
        <p>© {new Date().getFullYear()} VolunteerConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;