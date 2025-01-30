'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-full w-56 bg-white border-r border-gray-100 overflow-y-auto">
      <div className="py-4">
        <nav className="space-y-1">
          <Link 
            href="/"
            className={`flex items-center px-4 py-2 text-sm transition-colors
              ${pathname === '/' 
                ? 'bg-blue-50/50 text-blue-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <svg className={`w-4 h-4 mr-3 ${pathname === '/' ? 'text-blue-500' : 'text-gray-400'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent
          </Link>
          <Link 
            href="/search"
            className={`flex items-center px-4 py-2 text-sm transition-colors
              ${pathname === '/search' 
                ? 'bg-blue-50/50 text-blue-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <svg className={`w-4 h-4 mr-3 ${pathname === '/search' ? 'text-blue-500' : 'text-gray-400'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </Link>
          <Link 
            href="/analytics"
            className={`flex items-center px-4 py-2 text-sm transition-colors
              ${pathname === '/analytics' 
                ? 'bg-blue-50/50 text-blue-600 font-medium' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <svg className={`w-4 h-4 mr-3 ${pathname === '/analytics' ? 'text-blue-500' : 'text-gray-400'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
        </nav>
      </div>
    </aside>
  );
}
