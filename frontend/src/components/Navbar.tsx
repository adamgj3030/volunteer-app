'use client';

import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Menu, X} from 'lucide-react';
import {Sheet, SheetContent, SheetTrigger} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';


const navItems = [
    {name: "Home", href: "/"},
    {name: "Volunteer", href: "/volunteer"},
    {name: "Register", href: "/register"}, // replace with profile when logged in
];

export default function Navbar() {
    return (
        <header className = "bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
            <Link to="/" className = "text-black text-xl font-bold">
                Logo
            </Link>

            {/* Desktop Navigation */} 

            <nav className = "hidden md:flex gap-6">
                {navItems.map((item) => (
                    <Link 
                        key={item.name}
                        to={item.href}
                        className="text-black hover:underline transition"
                        >
                            {item.name}
                            
                        </Link>
                ))}

            </nav>


    {/* Mobile Navigation */} 
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6 text-black" />
                    </Button>
                </SheetTrigger>

                <SheetContent side="right" className="bg-white">
                    <div className = "flex flex-col gap-4 mt-10 px-6">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className="text-black hover:underline transition"
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </SheetContent>


            </Sheet>
        </div>

        </header>

    )
}