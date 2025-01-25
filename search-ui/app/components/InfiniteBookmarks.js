'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import BookmarkCard from './BookmarkCard';

export default function InfiniteBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [totalBookmarks, setTotalBookmarks] = useState(0);
  const observerTarget = useRef(null);

  const fetchBookmarks = useCallback(async (pageNum) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookmarks?page=${pageNum}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setBookmarks(prev => [...prev, ...data.results]);
        setHasMore(true);
        setTotalBookmarks(data.total);
        setPage(pageNum + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to load bookmarks. Please try again later.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchBookmarks(page);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, page, fetchBookmarks]);

  return (
    <div className="space-y-4 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Recent Bookmarks</h2>
        <span className="text-gray-600">Total: {totalBookmarks}</span>
      </div>
      
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setHasMore(true);
              setPage(1);
              setBookmarks([]);
              fetchBookmarks(1);
            }}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-900"
          >
            Try Again
          </button>
        </div>
      )}
      
      {bookmarks.map((bookmark, index) => (
        <BookmarkCard key={`${bookmark.tweet_id}-${index}`} bookmark={bookmark} />
      ))}
      
      <div ref={observerTarget} className="h-10" />
      
      {loading && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-solid border-blue-600 border-r-transparent"></div>
            <span className="text-sm text-gray-700">Loading more...</span>
          </div>
        </div>
      )}
      
      {!hasMore && bookmarks.length > 0 && !error && (
        <p className="text-center text-gray-500 py-4">No more bookmarks to load</p>
      )}
      
      {!hasMore && bookmarks.length === 0 && !error && (
        <p className="text-center text-gray-500 py-4">No bookmarks found</p>
      )}
    </div>
  );
}
