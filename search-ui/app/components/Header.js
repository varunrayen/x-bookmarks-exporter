'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="max-w-7xl px-4">
        <div className="flex justify-between h-14 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-lg font-medium text-gray-100 hover:text-gray-300 transition-colors">
              X-Marks
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
