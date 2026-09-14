import Link from 'next/link';
import { Sprout, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        
        <div className="relative mb-8 inline-block">
          <div className="text-9xl font-black text-gray-200">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Sprout className="w-12 h-12 text-primary-600" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-500 mb-8 font-medium">
          Oops! The page you're looking for seems to have been moved or no longer exists.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-sm">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <Link href="/search"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <Search className="w-4 h-4" /> Browse Products
          </Link>
        </div>

      </div>
    </div>
  );
}
