'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const Navbar = ({ onSearch }: NavbarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onSearch?.('');
  };

  return (
    <nav className="fixed w-full top-0 bg-white shadow-md z-[100]">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/images/logo_hosmony.png"
            alt="RSE News Logo"
            width={70}
            height={70}
            className="h-10 w-auto"
          />
        </Link>

        {/* Navigation Links + Search */}
        <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-end">

          <Link href="/" className="text-gray-700 hover:text-green-600 text-sm md:text-base">
            Home
          </Link>

          {/* About Us — page non disponible, lien désactivé */}
          <span
            className="text-gray-400 text-sm md:text-base select-none cursor-default"
            title="Page bientôt disponible"
          >
            About Us
          </span>

          {/* Contact Us — page non disponible, lien désactivé */}
          <span
            className="text-gray-400 text-sm md:text-base select-none cursor-default"
            title="Page bientôt disponible"
          >
            Contact Us
          </span>

          {/* Barre de recherche */}
          {isSearchOpen ? (
            <div className="flex items-center border border-gray-300 rounded-full px-4 py-1 bg-white shadow-sm">
              <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Rechercher un article..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="outline-none text-gray-700 text-sm w-36 sm:w-48 md:w-60 bg-transparent"
              />
              <button
                onClick={handleCloseSearch}
                aria-label="Fermer la recherche"
                className="ml-2 flex-shrink-0"
              >
                <X size={18} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Ouvrir la recherche"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              <Search size={22} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
