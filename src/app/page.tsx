import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Button from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-700">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-serif font-bold tracking-tight text-stone-900 mb-6">
            Fresh From Farm to Your Table
          </h1>
          <p className="text-xl font-sans text-stone-700 mb-10 leading-relaxed">
            Welcome to the Farm Connect platform. We eliminate middlemen by connecting
            farmers directly with consumers for fresh, hyperlocal produce at fair prices.
          </p>
        </section>

        {/* Highlight Sections */}
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <Card className="border border-stone-200 shadow-sm rounded-xl bg-white p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-stone-900 font-serif text-3xl">Marketplace</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="font-sans text-stone-700 mb-8 text-lg">
                Discover a wide variety of fresh vegetables, fruits, and organic products
                sourced directly from local farmers in your area. Buy fresh, buy local.
              </p>
              <Link href="/marketplace" className="inline-block w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm font-sans">
                  Explore Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-stone-200 shadow-sm rounded-xl bg-white p-8">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-stone-900 font-serif text-3xl">Farmer Portal</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="font-sans text-stone-700 mb-8 text-lg">
                Are you a farmer? Join our network to list your produce, manage orders, 
                and reach customers directly without any intermediaries.
              </p>
              <Link href="/farmer/dashboard" className="inline-block w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm font-sans border-none">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}