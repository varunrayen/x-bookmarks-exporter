'use client';

import { useState, useEffect } from 'react';

export default function Sidebar() {
  const [activeView, setActiveView] = useState('recent');

  useEffect(() => {
    const handleViewChange = (event) => {
      setActiveView(event.detail);
    };
    window.addEventListener('switchView', handleViewChange);
    return () => window.removeEventListener('switchView', handleViewChange);
  }, []);

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 px-3">Bookmarks</h2>
        <nav className="space-y-2">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('switchView', { detail: 'recent' }));
            }}
            className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors group
              ${activeView === 'recent' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            <svg className={`w-5 h-5 mr-3 ${activeView === 'recent' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent Bookmarks
          </a>
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('switchView', { detail: 'search' }));
            }}
            className={`flex items-center px-3 py-2.5 rounded-md cursor-pointer transition-colors group
              ${activeView === 'search' 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            <svg className={`w-5 h-5 mr-3 ${activeView === 'search' ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </a>
        </nav>
      </div>
    </aside>
  );
}
