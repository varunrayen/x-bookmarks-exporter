import { formatDate } from '../utils/date';

export default function ResultCard({ result }) {
  return (
    <div className="p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex gap-2">
        {/* Author Profile Image */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden">
          <img
            src={result.author_profile_image_url}
            alt={result.author_name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Author Info and Timestamp */}
          <div className="flex items-center text-sm gap-1 flex-wrap">
            <span className="font-semibold truncate">{result.author_name}</span>
            <span className="text-gray-500">@{result.author_screen_name}</span>
            <span className="text-gray-400">·</span>
            <span className="text-gray-500 text-xs">
              {formatDate(result.timestamp)}
            </span>
          </div>

          {/* Tweet Text */}
          <p className="text-sm text-gray-900 mt-0.5 break-words">{result.text}</p>

          {/* Media Preview */}
          {result.media_source && result.media_type === 'photo' && (
            <div className="mt-2 rounded-md overflow-hidden border border-gray-100">
              <img
                src={result.media_source}
                alt="Tweet media"
                className="w-full h-auto max-h-64 object-cover"
              />
            </div>
          )}

          {/* Footer */}
          <div className="mt-2 flex items-center gap-3 text-xs">
            <a 
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>View</span>
            </a>
            <div className="flex items-center gap-1 text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              <span>{result.similarity.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
