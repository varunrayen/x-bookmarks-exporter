'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from '../components/ResultCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search?query=${encodeURIComponent(query)}&page=${page}`);
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        handleSearch(1);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  const handlePageChange = (newPage) => {
    handleSearch(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-12 relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your bookmarks by title, content, or URL..."
            className="w-full pl-10 p-3 text-lg bg-white/50 rounded-xl border-0 ring-1 ring-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
        {!query && !loading && (
          <p className="mt-2 text-sm text-gray-500 pl-3">
            Try searching for topics, websites, or specific content you remember
          </p>
        )}
      </div>
      
      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
              </p>
            </div>
          )}
          <div className="space-y-6">
            {results.map((result) => (
              <ResultCard key={result.tweet_id} result={result} />
            ))}
          </div>
          {results.length > 0 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
