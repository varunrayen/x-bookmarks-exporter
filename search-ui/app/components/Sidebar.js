'use client';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="px-4 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h2>
        <nav className="space-y-2">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('switchView', { detail: 'recent' }));
            }}
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            Recent Bookmarks
          </a>
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('switchView', { detail: 'search' }));
            }}
            className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            Search
          </a>
          <div className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Categories</h3>
            <div className="space-y-2">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Technology
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                News
              </a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                Entertainment
              </a>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
