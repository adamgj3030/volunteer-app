import React, { useRef } from 'react';
import bannerImage from '@/images/williamslake.jpg';
import gunnisonImage from '@/images/gunnison.jpg';
import pikesImage from '@/images/pikespeak.jpg';
import bearmanImage from '@/images/bearman.jpg';
import windowImage from '@/images/window.jpg';
import gardenImage from '@/images/garden.jpg';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarCheck, Heart} from 'lucide-react';
import { motion } from 'framer-motion';
import Slider, { Settings } from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/landingPage.css';
const LandingPage: React.FC = () => {
  const sliderRef = useRef<Slider>(null);

  const showcaseSettings: Settings = {
    dots: true,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    pauseOnDotsHover: true,
    pauseOnFocus: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768,  settings: { slidesToShow: 2 } },
      { breakpoint: 480,  settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--color-ash_gray-500)] text-[var(--color-dark_slate_gray-900)]">
      {/* Hero Section */}
      <header
        className="relative h-[80vh] flex items-center justify-center"
        style={{
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        aria-label="Main banner"
      >
        <div className="absolute inset-0 bg-[var(--color-dark_slate_gray-700)]/50" />
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
      </header>

      {/* How It Works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-[var(--color-charcoal-300)]">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { Icon: Users, title: 'Find Events', desc: 'Browse volunteer opportunities near you.' },
            { Icon: CalendarCheck, title: 'Sign Up', desc: 'Register and choose shifts that fit your schedule.' },
            { Icon: Heart, title: 'Make Impact', desc: 'Help communities and track your contributions.' },
          ].map(({ Icon, title, desc }, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              <Card className="text-center p-6 border border-[var(--color-hookers_green-300)]">
                <Icon className="mx-auto mb-4 text-[var(--color-hookers_green-500)]" size={48} />
                <CardHeader>
                  <CardTitle className="text-[var(--color-charcoal-400)]">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
            <p className="mt-2 text-black">Events</p>
          </div>
          <div className="text-center">
            <Badge
              variant="outline"
              className="text-2xl border-[var(--color-cambridge_blue-500)] text-[var(--color-cambridge_blue-500)]"
            >
              15
            </Badge>
            <p className="mt-2 text-black">Cities</p>
          </div>
        </div>
      </section>

      {/* Image Showcase Carousel */}
      <section className="py-16 px-6 ">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-black">
            Our Volunteers in Action
          </h2>
          <div className="relative">
            <Slider ref={sliderRef} {...showcaseSettings} className="space-x-4">
              {[
                { src: windowImage, alt: 'Volunteer hiking' },
                { src: gardenImage, alt: 'Volunteer in the garden' },
                { src: pikesImage, alt: 'Volunteers on Pikes Peak' },
                { src: bearmanImage, alt: 'Volunteer with a bear' },
                { src: gunnisonImage, alt: 'Scenic view of Gunnison River' },
              ].map((img, i) => (
                <div key={i} className="px-2">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-6 text-center bg-[var(--color-ash_gray-700)]">
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

      {/* Footer */}
      <footer className="py-8 px-6 text-sm text-center text-[var(--color-dark_slate_gray-300)]">
        <p>© {new Date().getFullYear()} ADAMJOHNSON. All rights reserved.</p>
      </footer>
    </main>
  );
};

export default LandingPage;
