'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { Tractor, MapPin, Leaf, ShieldCheck, Star, Package, CheckCircle2, Navigation, MessageCircle, Heart, ArrowLeft, Info, Calendar, Sprout, ArrowRight } from 'lucide-react';
import { getButtonClasses } from '@/components/ui/button';
import { motion } from 'framer-motion';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function PublicFarmerProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/farmer/${id}`)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full" />
    </div>
  );

  if (!data?.farmer) return (
    <div className="min-h-screen bg-earth-50 flex items-center justify-center">
      <div className="bg-white p-12 rounded-3xl shadow-sm border border-earth-200 text-center max-w-md w-full">
        <Tractor className="w-16 h-16 text-earth-300 mx-auto mb-4" />
        <p className="text-xl font-bold text-earth-900 mb-2">Farmer not found</p>
        <p className="text-earth-500 mb-8">We couldn't locate this farmer in our system.</p>
        <Link href="/marketplace" className={getButtonClasses('primary', 'md', true)}>Return to Marketplace</Link>
      </div>
    </div>
  );

  const { farmer, products } = data;
  const formatPrice = (price: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(price as string));

  return (
    <div className="min-h-screen bg-earth-50 pb-24 font-sans">
      
      {/* ── Top Nav ── */}
      <div className="bg-white/80 backdrop-blur-md border-b border-earth-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-earth-600 hover:text-earth-900 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      {/* Cover & Profile Header */}
      <div className="bg-white border-b border-earth-200">
        <div className="h-48 md:h-64 bg-primary-900 w-full relative overflow-hidden">
          {/* Abstract pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-20 sm:-mt-24">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-40 h-40 sm:w-48 sm:h-48 bg-white rounded-full p-2 shadow-xl relative z-10"
            >
              <div className="w-full h-full rounded-full bg-earth-50 flex items-center justify-center overflow-hidden border border-earth-100 relative">
                {farmer.profile_photo_url ? (
                  <Image src={farmer.profile_photo_url} alt={farmer.name} fill sizes="192px" className="object-cover" />
                ) : (
                  <Tractor className="w-20 h-20 text-earth-300" />
                )}
              </div>
            </motion.div>
            
            <div className="flex-1 text-center sm:text-left mb-2">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-black text-earth-900 tracking-tight"
              >
                {farmer.name}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                className="text-earth-500 font-bold flex items-center justify-center sm:justify-start gap-1.5 mt-2"
              >
                <MapPin className="w-4 h-4 text-primary-600" />
                {farmer.city || 'Location not specified'}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          
          {/* Left Col: Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
              className="card p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-earth-900 mb-6 tracking-tight">About the Farm</h2>
              {farmer.bio && <p className="text-earth-600 leading-relaxed font-medium mb-8">{farmer.bio}</p>}
              
              <div className="space-y-6">
                {farmer.farming_type && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl shrink-0"><Sprout className="w-5 h-5 text-primary-600" /></div>
                    <div>
                      <p className="text-xs text-earth-500 font-bold uppercase tracking-wider mb-0.5">Farming Type</p>
                      <p className="font-bold text-earth-900 capitalize">{farmer.farming_type}</p>
                    </div>
                  </div>
                )}
                {farmer.farm_size_acres && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl shrink-0"><MapPin className="w-5 h-5 text-amber-600" /></div>
                    <div>
                      <p className="text-xs text-earth-500 font-bold uppercase tracking-wider mb-0.5">Farm Size</p>
                      <p className="font-bold text-earth-900">{farmer.farm_size_acres} Acres</p>
                    </div>
                  </div>
                )}
                {farmer.years_of_farming && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl shrink-0"><Calendar className="w-5 h-5 text-blue-600" /></div>
                    <div>
                      <p className="text-xs text-earth-500 font-bold uppercase tracking-wider mb-0.5">Experience</p>
                      <p className="font-bold text-earth-900">{farmer.years_of_farming} Years</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Col: Products */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-black text-earth-900 tracking-tight">Current Produce</h2>
              <span className="bg-primary-100 text-primary-800 border border-primary-200 text-sm font-bold px-3 py-1 rounded-lg">
                {products?.length || 0} Items
              </span>
            </motion.div>

            {(!products || products.length === 0) ? (
              <motion.div 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="bg-white rounded-[2rem] border border-earth-200 p-16 text-center shadow-sm"
              >
                <div className="w-20 h-20 rounded-full bg-earth-50 flex items-center justify-center mx-auto mb-6 border border-earth-100">
                  <Package className="w-10 h-10 text-earth-300" />
                </div>
                <p className="text-lg font-bold text-earth-900 mb-1">No products listed</p>
                <p className="text-earth-500 font-medium">This farmer hasn't added any produce to their storefront yet.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map((p: any, i: number) => (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    key={p.id}
                  >
                    <Link href={`/product/${p.id}`} className="card overflow-hidden group flex h-36 hover:border-primary-300">
                      <div className="w-36 bg-earth-100 overflow-hidden relative shrink-0">
                        {p.primary_image_url ? (
                          <Image src={p.primary_image_url} alt={p.name} fill sizes="144px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <Sprout className="w-8 h-8 text-earth-300 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="p-5 flex flex-col justify-center flex-1 min-w-0">
                        <h3 className="font-bold text-earth-900 truncate group-hover:text-primary-700 transition-colors text-lg mb-1">{p.name}</h3>
                        <p className="text-xl font-black text-primary-700">{formatPrice(p.price)}<span className="text-xs font-medium text-earth-500"> / {p.unit}</span></p>
                        
                        <div className="mt-3 flex items-center justify-between">
                          {p.stock_available > 0 
                            ? <p className="text-xs text-earth-500 font-bold bg-earth-50 px-2 py-1 rounded border border-earth-100">{p.stock_available} available</p>
                            : <p className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">Out of stock</p>
                          }
                          <ArrowRight className="w-4 h-4 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
