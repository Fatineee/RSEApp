'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="fixed w-full top-0 bg-white shadow-md z-10">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo on the Left */}
        <Link href="/">
          <Image
            src="/images/logo_hosmony.png"
            alt="RSE News Logo"
            width={50}
            height={50}
            className="h-10 w-auto"
          />
        </Link>

        {/* Centered Navigation Links + Search Bar */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-gray-700 hover:text-green-600">Home</Link>
          <Link href="/about" className="text-gray-700 hover:text-green-600">About Us</Link>
          <Link href="/contact" className="text-gray-700 hover:text-green-600">Contact Us</Link>

          {/* Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center border rounded-full px-4 py-1">
              <input
                type="text"
                placeholder="Rechercher..."
                className="outline-none text-gray-700 w-40 md:w-60"
              />
              <button onClick={() => setIsSearchOpen(false)}>
                <X size={20} className="text-gray-600 hover:text-gray-800 ml-2" />
              </button>
            </div>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="text-gray-700 hover:text-green-600">
              <Search size={22} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
