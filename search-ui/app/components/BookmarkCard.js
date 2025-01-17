'use client';

import { formatDistanceToNow, format } from 'date-fns';

export default function BookmarkCard({ bookmark }) {
  const tweetDate = new Date(bookmark.created_at);
  
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
                {formatDistanceToNow(tweetDate, { addSuffix: true })}
              </time>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-gray-800 text-base whitespace-pre-wrap">{bookmark.text}</p>
          
          {/* Media Content */}
          {bookmark.media_source && (
            <div className="rounded-xl overflow-hidden bg-gray-50">
              {bookmark.media_type === 'video' ? (
                <div className="relative aspect-video">
                  <video 
                    controls
                    className="absolute inset-0 w-full h-full object-contain"
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
                    className="w-full h-auto rounded-xl"
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                  />
                </div>
              )}
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
      </div>
      
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <button className="text-gray-600 hover:text-blue-600 text-sm flex items-center transition-colors duration-200">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Reply
            </button>
            <button className="text-gray-600 hover:text-green-600 text-sm flex items-center transition-colors duration-200">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retweet
            </button>
            <button className="text-gray-600 hover:text-red-600 text-sm flex items-center transition-colors duration-200">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Like
            </button>
          </div>
          <button className="text-gray-600 hover:text-blue-600 text-sm flex items-center transition-colors duration-200">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
