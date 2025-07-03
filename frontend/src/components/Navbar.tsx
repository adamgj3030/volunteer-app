import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import logoImage from '@/images/logo.png'; // Add your image path here

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Volunteer', href: '/volunteer' },
  { name: 'Register', href: '/register' }, // Replace with profile when logged in
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="bg-white border-b border-gray-200 px-12 py-3 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-3 text-3xl font-semibold text-gray-900 hover:opacity-90">
        <img src={logoImage} alt="Logo" className="h-8 w-8 object-contain" />
        CowConnect
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-10">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`text-lg font-medium transition-colors ${
              isActive(item.href)
                ? 'text-primary underline underline-offset-4'
                : 'text-gray-700 hover:text-primary'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
              <Menu className="h-6 w-6 text-gray-800" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="bg-white">
            <nav className="flex flex-col gap-6 mt-10 px-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-lg font-medium ${
                    isActive(item.href)
                      ? 'text-primary underline underline-offset-4'
                      : 'text-gray-800 hover:text-primary'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
