import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/button';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-700">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-stone-900">Fresh Marketplace</h1>
          <Button className="bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm font-sans">
            Filter Products
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Mock Product Card 1 */}
          <Card className="border border-stone-200 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
            <div className="h-48 bg-stone-200 flex items-center justify-center text-5xl">
              🥬
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-900 font-serif text-xl">Fresh Tomatoes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-emerald-800 font-bold text-lg mb-2">₹40 / kg</p>
              <div className="text-sm text-stone-600 mb-4 space-y-1">
                <p>👨‍🌾 Farmer: Ramesh</p>
                <p>📍 Location: Mysore (2.5 km)</p>
              </div>
              <Button className="w-full mt-auto bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300">
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          {/* Mock Product Card 2 */}
          <Card className="border border-stone-200 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
            <div className="h-48 bg-stone-200 flex items-center justify-center text-5xl">
              🥕
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-900 font-serif text-xl">Organic Carrots</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-emerald-800 font-bold text-lg mb-2">₹60 / kg</p>
              <div className="text-sm text-stone-600 mb-4 space-y-1">
                <p>👨‍🌾 Farmer: Suresh</p>
                <p>📍 Location: Mandya (15 km)</p>
              </div>
              <Button className="w-full mt-auto bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300">
                Add to Cart
              </Button>
            </CardContent>
          </Card>
          
          {/* Mock Product Card 3 */}
          <Card className="border border-stone-200 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
            <div className="h-48 bg-stone-200 flex items-center justify-center text-5xl">
              🧅
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-900 font-serif text-xl">Red Onions</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-emerald-800 font-bold text-lg mb-2">₹35 / kg</p>
              <div className="text-sm text-stone-600 mb-4 space-y-1">
                <p>👨‍🌾 Farmer: Lakshmi</p>
                <p>📍 Location: Hubli (8 km)</p>
              </div>
              <Button className="w-full mt-auto bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300">
                Add to Cart
              </Button>
            </CardContent>
          </Card>

          {/* Mock Product Card 4 */}
          <Card className="border border-stone-200 shadow-sm rounded-xl bg-white overflow-hidden flex flex-col">
            <div className="h-48 bg-stone-200 flex items-center justify-center text-5xl">
              🥔
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-stone-900 font-serif text-xl">Potatoes</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <p className="text-emerald-800 font-bold text-lg mb-2">₹45 / kg</p>
              <div className="text-sm text-stone-600 mb-4 space-y-1">
                <p>👨‍🌾 Farmer: Kumar</p>
                <p>📍 Location: Belgaum (12 km)</p>
              </div>
              <Button className="w-full mt-auto bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300">
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}