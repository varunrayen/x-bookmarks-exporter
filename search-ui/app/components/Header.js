'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#213363] shadow-lg z-50">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white hover:text-white/90 transition-colors duration-200">
              X Bookmarks 🔖
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
