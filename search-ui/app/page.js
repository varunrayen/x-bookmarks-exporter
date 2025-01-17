'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from './components/ResultCard';
import Pagination from './components/Pagination';
import InfiniteBookmarks from './components/InfiniteBookmarks';
import Spinner from './components/Spinner';
import Analytics from './components/Analytics';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('recent'); // 'search', 'recent', or 'analytics'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0
  });

  const handleSearch = useCallback(async (page = 1) => {
    if (!query.trim() && page === 1) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/search?query=${encodeURIComponent(query)}&page=${page}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Search failed: ${response.statusText}`);
      }
      
      setResults(data.results || []);
      setPagination({
        currentPage: data.page,
        totalPages: data.total_pages,
        total: data.total
      });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError(error.message);
      setResults([]);
      setPagination({
        currentPage: 1,
        totalPages: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(1);
      } else {
        setResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleViewChange = (event) => {
      setView(event.detail);
    };
    window.addEventListener('switchView', handleViewChange);
    return () => window.removeEventListener('switchView', handleViewChange);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        {view === 'search' && (
          <div className="w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your bookmarks..."
              className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-8"
            />
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                {results.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      Found {pagination.total} results
                    </p>
                  </div>
                )}
                <div className="space-y-4">
                  {results.map((result) => (
                    <ResultCard key={result.tweet_id} result={result} />
                  ))}
                </div>
                {results.length > 0 && (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={(page) => handlePageChange(page)}
                  />
                )}
              </>
            )}
          </div>
        )}
        
        {view === 'recent' && (
          <InfiniteBookmarks />
        )}

        {view === 'analytics' && (
          <Analytics />
        )}
      </div>
    </main>
  );
}
