import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-700">
      <Header />
      
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-8">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar / Quick Info */}
          <div className="md:col-span-1">
            <Card className="border border-stone-200 shadow-sm rounded-xl bg-white p-6 text-center">
              <div className="w-24 h-24 bg-stone-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
                👤
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">Ramesh Kumar</h2>
              <p className="text-stone-500 mb-6">Customer</p>
              
              <Button className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 shadow-sm mb-3">
                Edit Profile
              </Button>
              <Button className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm">
                Sign Out
              </Button>
            </Card>
          </div>

          {/* Main Info */}
          <div className="md:col-span-2 space-y-8">
            <Card className="border border-stone-200 shadow-sm rounded-xl bg-white p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-serif text-stone-900 border-b border-stone-100 pb-4">
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Full Name</p>
                    <p className="font-medium text-stone-900">Ramesh Kumar</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Email</p>
                    <p className="font-medium text-stone-900">ramesh@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Phone Number</p>
                    <p className="font-medium text-stone-900">+91 98765 43210</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 mb-1">Location</p>
                    <p className="font-medium text-stone-900">Mysore, Karnataka</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-stone-200 shadow-sm rounded-xl bg-white p-8">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-serif text-stone-900 border-b border-stone-100 pb-4">
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center py-8 text-stone-500">
                  <p>You haven't placed any orders yet.</p>
                  <Button className="mt-4 bg-emerald-800 hover:bg-emerald-900 text-white px-6">
                    Start Shopping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
