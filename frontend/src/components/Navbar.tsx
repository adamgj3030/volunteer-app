import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import logoImage from '@/images/logo.png';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Login', href: '/login' },
  { name: 'Register', href: '/register' },
  { name: 'Volunteer', href: '/volunteer' },
  { name: 'VolunteerTask', href: '/volunteer/task' },
  { name: 'VolunteerProfile', href: '/volunteer/manage' },
  { name: 'Admin', href: '/admin' },
  { name: 'AdminApproval', href: '/admin/approval' },
  { name: 'AdminVolunteerHistory', href: '/admin/history' },
  { name: 'AdminEventCreation', href: '/admin/event/creation' },
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-[var(--color-ash_gray-900)] border-b border-[var(--color-ash_gray-900)] px-8 py-3 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-3 text-3xl font-semibold text-[--color-dark_slate_gray-400] hover:opacity-90 pl-4 pr-4">
        <img src={logoImage} alt="Logo" className="h-8 w-8 object-contain" />
        VolunteerApp
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4">
        {navItems.map((item) => {
          const isItemActive = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`text-lg font-medium transition-colors rounded px-3 py-1 ${
                isItemActive
                  ? 'text-[--color-cambridge_blue-500] underline underline-offset-4'
                  : 'text-[var(--color-charcoal-400)] hover:text-[var(--color-cambridge_blue-400)] hover:bg-[var(--color-ash_gray-700)]'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-cambridge_blue-500]">
              <Menu className="h-6 w-6 text-[--color-dark_slate_gray-400]" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="bg-[var(--color-ash_gray-900)] !backdrop-blur-none">
            <nav className="flex flex-col gap-2 mt-10 px-6">
              {navItems.map((item) => {
                const isItemActive = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-lg font-medium rounded px-3 py-2 transition-colors ${
                      isItemActive
                        ? 'text-[--color-cambridge_blue-500] underline underline-offset-4'
                        : 'text-[var(--color-dark_slate_gray-300)] hover:text-[var(--color-cambridge_blue-400)] hover:bg-[var(--color-ash_gray-700)]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
