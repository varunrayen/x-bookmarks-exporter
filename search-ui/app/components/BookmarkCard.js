'use client';

import { formatDistanceToNow, format } from 'date-fns';
import { useState } from 'react';

export default function BookmarkCard({ bookmark }) {
  const tweetDate = new Date(bookmark.timestamp);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const categories = ['Work', 'Personal', 'Reading List', 'Inspiration', 'Tech'];

  const handleCategorySelect = (category) => {
    // TODO: Implement category assignment logic
    console.log(`Assigning category: ${category} to bookmark: ${bookmark.id}`);
    setIsDropdownOpen(false);
  };

  const handleImageClick = (e) => {
    e.preventDefault();
    setIsImagePopupOpen(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm mb-3 hover:shadow transition-all duration-300 border border-gray-100">
      <div className="p-4">
        {/* Author Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img
                src={bookmark.author_profile_image_url}
                alt={bookmark.author_name}
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900">
                  {bookmark.author_name}
                </span>
                <span className="text-gray-500 text-sm">
                  @{bookmark.author_screen_name}
                </span>
              </div>
              <time 
                dateTime={tweetDate.toISOString()}
                className="text-sm text-gray-400"
                title={format(tweetDate, 'h:mm a · MMM d, yyyy')}
              >
                {formatDistanceToNow(tweetDate, { addSuffix: true })}
              </time>
            </div>
          </div>
          <a 
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </a>
        </div>

        {/* Content */}
        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-gray-800 text-[15px] leading-relaxed">{bookmark.text}</p>
          </div>
          
          {/* Media Content */}
          {bookmark.media_source && (
            <div className="flex-shrink-0">
              {bookmark.media_type === 'video' ? (
                <div className="relative w-48 aspect-video rounded-lg overflow-hidden bg-gray-50">
                  <video 
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                    poster={bookmark.media_source.replace('.mp4', '_thumb.jpg')}
                  >
                    <source src={bookmark.media_source} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-50">
                  <img 
                    src={bookmark.media_source} 
                    alt="Tweet media"
                    className="w-full h-full object-cover cursor-zoom-in"
                    onClick={handleImageClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Popup */}
      {isImagePopupOpen && bookmark.media_source && bookmark.media_type !== 'video' && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsImagePopupOpen(false)}
        >
          <img 
            src={bookmark.media_source} 
            alt="Tweet media"
            className="max-w-[95vw] max-h-[95vh] object-contain"
          />
        </div>
      )}
    </div>
  );
}
