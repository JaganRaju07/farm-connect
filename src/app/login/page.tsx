import React from 'react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-700">
      <Header />
      
      <main className="flex-1 w-full max-w-md mx-auto px-6 py-20 flex flex-col items-center justify-center">
        <Card className="w-full border border-stone-200 shadow-sm rounded-xl bg-white p-8">
          <CardHeader className="text-center p-0 mb-8">
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">Welcome Back</h1>
            <p className="text-stone-600">Sign in to your Farm Connect account</p>
          </CardHeader>
          
          <CardContent className="p-0 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="email">
                  Email Address
                </label>
                <input 
                  type="email" 
                  id="email"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="password">
                  Password
                </label>
                <input 
                  type="password" 
                  id="password"
                  className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-stone-600">
                <input type="checkbox" className="mr-2 rounded text-emerald-800 focus:ring-emerald-800" />
                Remember me
              </label>
              <a href="#" className="text-emerald-800 hover:text-emerald-900 font-medium">
                Forgot password?
              </a>
            </div>

            <Button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white py-3 rounded-lg font-medium shadow-sm">
              Sign In
            </Button>

            <div className="text-center mt-6 text-sm text-stone-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-emerald-800 hover:text-emerald-900 font-medium">
                Create one now
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
