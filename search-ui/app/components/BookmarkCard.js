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
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100">
      <div className="p-4">
        {/* Author Header */}
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <img
              src={bookmark.author_profile_image_url}
              alt={bookmark.author_name}
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{bookmark.author_name}</span>
              <span className="text-gray-500 text-sm ml-2">@{bookmark.author_screen_name}</span>
            </div>
            <div>
              <time 
                dateTime={tweetDate.toISOString()}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-default"
                title={format(tweetDate, 'h:mm a · MMM d, yyyy')}
              >
                {format(tweetDate, 'h:mm a · MMM d, yyyy')}
              </time>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-4">
          <div className="flex-1 space-y-3">
            <p className="text-gray-800 text-base whitespace-pre-wrap">{bookmark.text}</p>
          </div>
          
          {/* Media Content */}
          {bookmark.media_source && (
            <div className="flex-shrink-0 w-48">
              {bookmark.media_type === 'video' ? (
                <div className="relative aspect-video">
                  <video 
                    controls
                    className="absolute inset-0 w-full h-full object-contain rounded-lg"
                    poster={bookmark.media_source.replace('.mp4', '_thumb.jpg')}
                  >
                    <source src={bookmark.media_source} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={bookmark.media_source} 
                    alt="Tweet media"
                    className="w-48 h-48 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
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
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setIsImagePopupOpen(false)}
          >
            <div className="max-w-[90vw] max-h-[90vh] relative">
              <img 
                src={bookmark.media_source} 
                alt="Tweet media"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button 
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
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
        <div className="flex items-center pt-2">
          <a 
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-blue-600 text-sm flex items-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View on X
          </a>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <div className="flex justify-end items-center relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-600 hover:text-purple-600 text-sm flex items-center transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Add Category
          </button>
          
          {isDropdownOpen && (
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
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
