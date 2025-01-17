'use client';

import { useState } from 'react';
import ResultCard from './components/ResultCard';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">X Bookmarks Search</h1>
        
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search your bookmarks..."
            className="flex-1 p-2 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="space-y-4">
          {results.map((result, index) => (
            <ResultCard key={index} result={result} />
          ))}
          {query && results.length === 0 && !loading && (
            <p className="text-gray-600 text-center">No bookmarks found</p>
          )}
        </div>
      </main>
    </div>
  );
}
