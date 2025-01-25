'use client';

import { useState, useEffect, useCallback } from 'react';
import ResultCard from '../components/ResultCard';
import Pagination from '../components/Pagination';
import Spinner from '../components/Spinner';

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
    <div className="p-4">
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
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
