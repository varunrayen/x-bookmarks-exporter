'use client';

import { useState, useEffect, useRef } from 'react';
import BookmarkCard from './BookmarkCard';

export default function InfiniteBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const fetchBookmarks = async (pageNum) => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/bookmarks?page=${pageNum}`);
      const data = await response.json();
      
      if (data.results) {
        setBookmarks(prev => [...prev, ...data.results]);
        setHasMore(data.results.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prevPage => {
            const nextPage = prevPage + 1;
            fetchBookmarks(nextPage);
            return nextPage;
          });
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);

  // Initial load
  useEffect(() => {
    fetchBookmarks(1);
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Recent Bookmarks</h2>
      
      {bookmarks.map((bookmark, index) => (
        <BookmarkCard key={`${bookmark.tweet_id}-${index}`} bookmark={bookmark} />
      ))}
      
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      )}
      
      <div ref={observerTarget} className="h-4" />
      
      {!hasMore && bookmarks.length > 0 && (
        <p className="text-center text-gray-500 py-4">No more bookmarks to load</p>
      )}
      
      {!hasMore && bookmarks.length === 0 && (
        <p className="text-center text-gray-500 py-4">No bookmarks found</p>
      )}
    </div>
  );
}
