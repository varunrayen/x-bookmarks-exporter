'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-3">Bookmarks</h2>
        <nav className="space-y-2">
          <Link 
            href="/"
            className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors group
              ${pathname === '/' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            <svg className={`w-5 h-5 mr-3 ${pathname === '/' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Bookmarks
          </Link>
          <Link 
            href="/search"
            className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors group
              ${pathname === '/search' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            <svg className={`w-5 h-5 mr-3 ${pathname === '/search' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Bookmarks
          </Link>
          <Link 
            href="/analytics"
            className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors group
              ${pathname === '/analytics' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            <svg className={`w-5 h-5 mr-3 ${pathname === '/analytics' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
        </nav>
      </div>
    </aside>
  );
}
