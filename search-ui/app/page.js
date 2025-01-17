'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from './components/ResultCard';
import Pagination from './components/Pagination';
import InfiniteBookmarks from './components/InfiniteBookmarks';
import Spinner from './components/Spinner';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('search'); // 'search' or 'recent'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0
  });

  const handleSearch = useCallback(async (page = 1) => {
    if (!query.trim() && page === 1) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/search?query=${encodeURIComponent(query)}&page=${page}`);
      const data = await response.json();
      setResults(data.results || []);
      setPagination({
        currentPage: data.page,
        totalPages: data.total_pages,
        total: data.total
      });
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
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

  const switchView = (newView) => {
    setView(newView);
    if (newView === 'search') {
      setResults([]);
      setQuery('');
    }
  };

  useEffect(() => {
    const handleViewSwitch = (event) => {
      switchView(event.detail);
    };

    window.addEventListener('switchView', handleViewSwitch);
    return () => window.removeEventListener('switchView', handleViewSwitch);
  }, []);

  return (
    <div className="p-8">
      <main className="max-w-4xl mx-auto">
        {view === 'search' ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Search Bookmarks</h2>
            <div className="relative mb-8">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your bookmarks..."
                className="w-full p-2 border rounded-lg"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Spinner size="sm" />
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="text-sm text-gray-500 mb-4">
                Found {pagination.total.toLocaleString()} results
              </div>
            )}

            <div className="space-y-4">
              {results.map((result, index) => (
                <ResultCard key={`${result.tweet_id}-${index}`} result={result} />
              ))}
              {query && results.length === 0 && !loading && (
                <p className="text-gray-600 text-center">No bookmarks found</p>
              )}
            </div>

            {results.length > 0 && pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <InfiniteBookmarks />
        )}
      </main>
    </div>
  );
}
