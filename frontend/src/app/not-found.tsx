import Link from 'next/link';
import { getButtonClasses } from '@/components/ui/button';
import { Sprout, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-earth-50 px-4 font-sans animate-in fade-in duration-500">
      <div className="text-center max-w-md">
        
        <div className="relative mb-8 inline-block">
          <div className="text-9xl font-black text-earth-200 tracking-tighter">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white p-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-earth-100">
              <Sprout className="w-12 h-12 text-primary-600" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-black text-earth-900 mb-4 tracking-tight font-display">Page Not Found</h1>
        <p className="text-earth-500 mb-10 font-medium text-lg leading-relaxed">
          Oops! The page you're looking for seems to have been moved or no longer exists.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className={getButtonClasses('primary', 'md', false, 'w-full sm:w-auto justify-center shadow-[0_4px_20px_rgba(21,128,61,0.2)]')}>
            <Home className="w-5 h-5" /> Go Home
          </Link>
          <Link href="/marketplace" className="btn-secondary w-full sm:w-auto justify-center">
            <Search className="w-5 h-5" /> Browse Products
          </Link>
        </div>

      </div>
    </div>
  );
}
