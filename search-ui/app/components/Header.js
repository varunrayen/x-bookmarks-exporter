export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">X Bookmarks</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">Home</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">Categories</a>
            <a href="#" className="text-white/90 hover:text-white transition-colors duration-200 font-medium">About</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
