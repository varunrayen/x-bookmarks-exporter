'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-full mb-8">
      <ul className="flex space-x-4 justify-center">
        <li>
          <Link 
            href="/search"
            className={`px-4 py-2 rounded-lg ${
              pathname === '/search' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Search
          </Link>
        </li>
        <li>
          <Link 
            href="/"
            className={`px-4 py-2 rounded-lg ${
              pathname === '/' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Recent
          </Link>
        </li>
        <li>
          <Link 
            href="/analytics"
            className={`px-4 py-2 rounded-lg ${
              pathname === '/analytics' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Analytics
          </Link>
        </li>
      </ul>
    </nav>
  );
}
