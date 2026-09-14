'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { TrendingUp, IndianRupee, Package, Clock, Loader2, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const PERIODS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'quarter', label: 'Last 3 Months' }
];

// Helper to generate mock chart data based on orders since API might not return timeseries
const generateChartData = (orders: any[]) => {
  if (!orders || orders.length === 0) return [];
  
  // Group by date
  const grouped = orders.reduce((acc: any, order: any) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!acc[date]) acc[date] = 0;
    acc[date] += parseFloat(order.total_amount);
    return acc;
  }, {});

  return Object.keys(grouped).map(date => ({
    name: date,
    revenue: grouped[date]
  })).reverse(); // chronological
};

function EarningsContent() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/farmer/earnings?period=${period}`)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period]);

  const chartData = generateChartData(data?.orders || []);

  const formatPrice = (price: string | number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(price as string));

  return (
    <div className="space-y-8 pb-12 animate-enter">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-900 tracking-tight">Earnings & Analytics</h1>
          <p className="text-sm text-earth-500 mt-1">Track your farm's performance and revenue.</p>
        </div>

        {/* Period selector */}
        <div className="flex gap-2 bg-earth-100 p-1.5 rounded-xl border border-earth-200 w-fit shrink-0">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                period === p.key
                  ? 'bg-white text-primary-700 shadow-sm border border-earth-200'
                  : 'text-earth-600 hover:text-earth-900 hover:bg-earth-200/50'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-earth-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: formatPrice(data?.summary?.totalEarned || 0), icon: IndianRupee, color: 'text-primary-700 bg-primary-50', border: 'border-primary-100' },
              { label: 'Pending Cash', value: formatPrice(data?.summary?.pendingAmount || 0), icon: Clock, color: 'text-amber-700 bg-amber-50', border: 'border-amber-100' },
              { label: 'Total Orders', value: data?.summary?.totalOrders || 0, icon: Package, color: 'text-blue-700 bg-blue-50', border: 'border-blue-100' },
              { label: 'Paid Orders', value: data?.summary?.paidOrders || 0, icon: TrendingUp, color: 'text-primary-700 bg-primary-50', border: 'border-primary-100' }
            ].map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className={`card p-6 border ${s.border} hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 shadow-sm border ${s.border} ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-3xl font-black text-earth-900 tracking-tight">{s.value}</p>
                  <p className="text-xs font-bold text-earth-500 mt-2 uppercase tracking-wider">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 card p-6 h-96 flex flex-col">
              <h2 className="text-lg font-bold text-earth-900 mb-6 tracking-tight">Revenue Trends</h2>
              <div className="flex-1 w-full h-full min-h-0">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f7942" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4f7942" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [formatPrice(value), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#4f7942" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-earth-400">
                    <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
                    <p className="font-medium text-sm">Not enough data to display trends.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Earnings List inside Chart row */}
            <div className="lg:col-span-1 card p-0 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-earth-100 bg-white">
                <h2 className="text-lg font-bold text-earth-900 tracking-tight">Recent Transactions</h2>
              </div>
              <div className="flex-1 overflow-y-auto max-h-80 bg-earth-50/30">
                {data?.orders?.length === 0 ? (
                   <div className="p-12 text-center">
                     <CreditCard className="w-10 h-10 text-earth-300 mx-auto mb-3" />
                     <p className="text-earth-500 text-sm font-medium">No transactions yet.</p>
                   </div>
                ) : (
                  <div className="divide-y divide-earth-100">
                    {data?.orders?.slice(0, 10).map((order: any) => (
                      <div key={order.id} className="p-5 hover:bg-white transition-colors bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-earth-900">{order.order_number}</p>
                          <p className="font-black text-primary-700">{formatPrice(order.total_amount)}</p>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-earth-500 font-medium">{new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                          <span className={`px-2 py-1 rounded-md font-bold uppercase tracking-wider ${
                            order.payment_status === 'paid' 
                              ? 'bg-primary-50 text-primary-700' 
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default function EarningsPage() {
  return (
    <ProtectedRoute allowedRoles={['farmer']} redirectTo="/farmer/login">
      <EarningsContent />
    </ProtectedRoute>
  );
}
