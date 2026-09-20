'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Heart, Search, ShoppingBag, Store, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getButtonClasses } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

function WishlistContent() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = () => {
    setLoading(true);
    axios.get(`${API}/wishlist`)
      .then(res => setItems(res.data.data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlist(); }, []);

  const mutatingRef = useRef<Set<number>>(new Set());

  const handleRemove = async (productId: number) => {
    if (mutatingRef.current.has(productId)) return;
    mutatingRef.current.add(productId);

    const itemIndex = items.findIndex(item => item.id === productId);
    const itemToRestore = items[itemIndex];
    
    setItems(prev => prev.filter(item => item.id !== productId));

    try {
      await axios.post(`${API}/wishlist`, { productId });
    } catch (err) {
      console.error('Failed to remove item, reverting:', err);
      if (itemToRestore) {
        setItems(prev => {
          const newItems = [...prev];
          // Restore at original position if possible, else push to end
          if (itemIndex >= 0 && itemIndex <= newItems.length) {
            newItems.splice(itemIndex, 0, itemToRestore);
          } else {
            newItems.push(itemToRestore);
          }
          return newItems;
        });
      }
    } finally {
      mutatingRef.current.delete(productId);
    }
  };

  const formatPrice = (price: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(price as string));

  return (
    <div className="min-h-screen bg-earth-50 pt-10 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 shadow-sm">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold font-display text-earth-900 tracking-tight">Saved for Later</h1>
            <p className="text-sm text-earth-500 mt-1 font-medium">Your curated list of farm-fresh favorites.</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card h-72 animate-pulse bg-white border border-earth-200" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="card text-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-earth-50 flex items-center justify-center border border-earth-100 mx-auto mb-6">
              <Heart className="w-10 h-10 text-earth-300" />
            </div>
            <h2 className="text-xl font-bold font-display text-earth-900 mb-2">Your wishlist is empty</h2>
            <p className="text-earth-500 mb-8 font-medium">Find products you love and save them for later.</p>
            <Link href="/marketplace" className={getButtonClasses('primary', 'md', false, 'inline-flex')}>
              <Search className="w-4 h-4" /> Discover Fresh Produce
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {items.map((item: any, i: number) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id} 
                  className="card overflow-hidden group flex flex-col h-full hover:border-primary-300"
                >
                  <div className="relative aspect-square bg-earth-100 overflow-hidden">
                    <Image 
                      src={item.primary_image_url || '/placeholder-product.jpg'} 
                      alt={item.name} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <button onClick={() => handleRemove(item.id)}
                      className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-red-50 transition-colors z-10 border border-earth-100 group/btn">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 text-xs font-bold z-10">
                      <Store className="w-3.5 h-3.5" />
                      <span className="truncate">{item.farmer_name}</span>
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-earth-900 text-lg mb-1 truncate">{item.name}</h3>
                    <p className="text-xl font-black text-primary-700 mb-4">{formatPrice(item.price)}<span className="text-xs text-earth-500 font-medium tracking-wide"> / {item.unit}</span></p>
                    
                    <Link href={`/product/${item.id}`} className={getButtonClasses('primary', 'md', true, 'mt-auto')}>
                      <ShoppingBag className="w-4 h-4" /> View Product
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute allowedRoles={['consumer']} redirectTo="/login">
      <WishlistContent />
    </ProtectedRoute>
  );
}
