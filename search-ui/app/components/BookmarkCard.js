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
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
      <div className="p-5">
        {/* Author Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 group">
            <img
              src={bookmark.author_profile_image_url}
              alt={bookmark.author_name}
              className="w-12 h-12 rounded-full ring-2 ring-transparent group-hover:ring-purple-400 transition-all duration-300"
            />
          </div>
          <div className="ml-4">
            <div className="flex items-center">
              <span className="font-semibold text-gray-900 hover:text-purple-600 transition-colors duration-200">
                {bookmark.author_name}
              </span>
              <span className="text-gray-500 text-sm ml-2 hover:text-gray-700 transition-colors duration-200">
                @{bookmark.author_screen_name}
              </span>
            </div>
            <div>
              <time 
                dateTime={tweetDate.toISOString()}
                className="text-sm text-gray-500 hover:text-purple-600 transition-colors duration-200 cursor-default"
                title={format(tweetDate, 'h:mm a · MMM d, yyyy')}
              >
                {format(tweetDate, 'h:mm a · MMM d, yyyy')}
              </time>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">{bookmark.text}</p>
          </div>
          
          {/* Media Content */}
          {bookmark.media_source && (
            <div className="flex-shrink-0 w-56">
              {bookmark.media_type === 'video' ? (
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-md">
                  <video 
                    controls
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    poster={bookmark.media_source.replace('.mp4', '_thumb.jpg')}
                  >
                    <source src={bookmark.media_source} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="relative rounded-lg overflow-hidden shadow-md">
                  <img 
                    src={bookmark.media_source} 
                    alt="Tweet media"
                    className="w-56 h-56 object-cover cursor-zoom-in hover:scale-105 transition-transform duration-300"
                    onClick={handleImageClick}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image Popup */}
        {isImagePopupOpen && bookmark.media_source && bookmark.media_type !== 'video' && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setIsImagePopupOpen(false)}
          >
            <div className="max-w-[95vw] max-h-[95vh] relative">
              <img 
                src={bookmark.media_source} 
                alt="Tweet media"
                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
              />
              <button 
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2.5 hover:bg-black/75 transition-colors duration-200 backdrop-blur-sm"
                onClick={() => setIsImagePopupOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tweet Link */}
        <div className="flex items-center pt-4">
          <a 
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-purple-600 text-sm flex items-center transition-all duration-200 group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on X
          </a>
        </div>
      </div>
      
      <div className="bg-gray-50/80 px-5 py-3.5 border-t border-gray-200">
        <div className="flex justify-end items-center relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-700 hover:text-purple-600 text-sm flex items-center transition-all duration-200 group"
          >
            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Add Category
          </button>
          
          {isDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black/5 transform origin-bottom-right transition-all duration-200">
              <div className="py-1.5" role="menu" aria-orientation="vertical">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200"
                    role="menuitem"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
