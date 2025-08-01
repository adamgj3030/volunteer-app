import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import logoImage from '@/images/logo.png';
import { useAuth } from '@/context/AuthContext';

interface NavItem { name: string; href: string; }

function getNavForRole(role: string | null): NavItem[] {
  if (!role) {
    return [
      { name: 'Home', href: '/' },
      { name: 'Login', href: '/login' },
      { name: 'Register', href: '/register' },
    ];
  }
  if (role === 'VOLUNTEER') {
    return [
      { name: 'Volunteer Home', href: '/volunteer' },
      { name: 'Tasks', href: '/volunteer/task' },
      { name: 'Profile Management', href: '/volunteer/manage' },
      { name: 'Event Matching', href: '/volunteer/matching' },
    ];
  }
  // ADMIN
  if (role === 'ADMIN') {
    return [
      { name: 'Admin Home', href: '/admin' },
      { name: 'Admin Approval', href: '/admin/approval' },
      { name: 'Volunteer History', href: '/admin/history' },
      { name: 'Event Management', href: '/admin/event/creation' },
      { name: 'Volunteer Matching', href: '/admin/matching' },
      { name: 'Reports', href: '/admin/reports' },       // ← NEW
    ];
  }
  return []; // Fallback (should never hit)
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const items = getNavForRole(user?.role ?? null);

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-[var(--color-ash_gray-900)] border-b border-[var(--color-ash_gray-900)] px-8 py-3 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-3 text-3xl font-semibold text-[--color-dark_slate_gray-400] hover:opacity-90 pl-4 pr-4">
        <img src={logoImage} alt="Logo" className="h-8 w-8 object-contain" />
        HelpingHands
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-4 items-center">
        {items.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`text-lg font-medium transition-colors rounded px-3 py-1 ${
                active
                  ? 'text-[--color-cambridge_blue-500] underline underline-offset-4'
                  : 'text-[var(--color-charcoal-400)] hover:text-[var(--color-cambridge_blue-400)] hover:bg-[var(--color-ash_gray-700)]'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
        {user && (
          <Button onClick={handleLogout} variant="ghost" className="ml-4 text-sm">Logout</Button>
        )}
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
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-lg font-medium rounded px-3 py-2 transition-colors ${
                      active
                        ? 'text-[--color-cambridge_blue-500] underline underline-offset-4'
                        : 'text-[var(--color-dark_slate_gray-300)] hover:text-[var(--color-cambridge_blue-400)] hover:bg-[var(--color-ash_gray-700)]'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              {user && (
                <Button onClick={handleLogout} variant="ghost" className="mt-4 text-sm">Logout</Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
