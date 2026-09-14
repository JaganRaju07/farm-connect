'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Sprout, ArrowRight, Loader2, Leaf, ShieldCheck, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '@/components/reactbits/AuroraBackground';

type Step = 'details' | 'otp';

export default function ConsumerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.name.trim().length < 2) {
      setError('Please enter a valid name');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, {
        phone: formData.phone,
        userType: 'consumer',
        action: 'register'
      });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP & Complete Registration ──────────────────────────────
  const handleVerifyOTP = async (otpString: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        phone: formData.phone,
        otp: otpString,
        userType: 'consumer',
        name: formData.name
      });

      const { token, user } = res.data.data;
      login(token, user, 'consumer');
      router.push('/complete-profile');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP. Try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d) && index === 5) handleVerifyOTP(newOtp.join(''));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      handleVerifyOTP(pasted);
    }
  };

  useEffect(() => {
    if (step === 'otp') {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  return (
    <AuroraBackground className="w-full flex-row items-stretch bg-earth-50 p-0">
      
      {/* ── Left Side: Beautiful Visual ── */}
      <div className="hidden lg:flex w-[45%] bg-earth-900 relative overflow-hidden flex-col justify-between p-16 shadow-2xl z-10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-40 mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-accent-500 rounded-full blur-[100px] opacity-20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] opacity-10 mix-blend-overlay object-cover" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white group">
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Sprout className="w-6 h-6 text-primary-300" />
            </div>
            <span className="text-2xl font-bold tracking-tight font-display">Farm Connect</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="font-display text-4xl font-extrabold text-white mb-8 leading-tight">
            Join the local food movement.
          </h1>
          
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-5">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <Leaf className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">100% Organic Options</h3>
                <p className="text-earth-300 text-sm mt-1.5 leading-relaxed">Connect with certified organic farmers in your local community.</p>
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-start gap-5">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <ShieldCheck className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Fair Trade Verified</h3>
                <p className="text-earth-300 text-sm mt-1.5 leading-relaxed">Your purchase goes directly to the farmer. No middleman cuts.</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-5">
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <MapPin className="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Hyperlocal Delivery</h3>
                <p className="text-earth-300 text-sm mt-1.5 leading-relaxed">Food so fresh it was harvested this morning, delivered today.</p>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="relative z-10">
          <p className="text-earth-400 text-sm font-medium">© {new Date().getFullYear()} Farm Connect. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right Side: Auth Form ── */}
      <div className="flex-1 flex flex-col relative bg-white/80 backdrop-blur-xl lg:rounded-l-[2rem] lg:-ml-6 z-20 shadow-[0_0_50px_rgba(0,0,0,0.1)]">
        <div className="lg:hidden sticky top-0 z-50 w-full bg-white px-6 py-4 border-b border-earth-100 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary-600" />
            <span className="text-lg font-bold text-earth-900 font-display">Farm Connect</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center py-12 lg:py-0 px-6 sm:px-12 lg:px-24 xl:px-32">

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <h2 className="font-display text-3xl font-extrabold text-earth-900 mb-3 tracking-tight">
              {step === 'details' ? 'Create an account' : 'Check your phone'}
            </h2>
            <p className="text-earth-500 text-base">
              {step === 'details'
                ? 'Sign up to start buying fresh produce.'
                : `We sent a 6-digit verification code to ${formData.phone}.`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Details Step ── */}
            {step === 'details' && (
              <motion.form 
                key="details"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                onSubmit={handleSendOTP} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-earth-700">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="input-field py-3 text-base"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-earth-700">Mobile Number</label>
                  <div className="relative flex flex-row items-center bg-white border border-earth-300 rounded-xl overflow-hidden focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/20 transition-all shadow-sm">
                    <div className="flex shrink-0 items-center justify-center bg-earth-50 px-4 py-3 border-r border-earth-200 h-full">
                      <span className="text-earth-600 font-semibold">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="98765 43210"
                      className="w-full py-3 px-4 font-medium tracking-wide outline-none bg-transparent"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                    {error}
                    {error.includes('already registered') && (
                      <Link href="/login" className="block mt-1 font-bold underline underline-offset-2 hover:text-red-700 transition-colors">
                        Log in instead
                      </Link>
                    )}
                  </motion.div>
                )}

                <button type="submit" disabled={formData.phone.length !== 10 || formData.name.trim().length < 2 || loading} className="btn-primary w-full h-12 mt-4 text-base shadow-md">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {loading ? 'Sending code...' : 'Continue'}
                </button>
              </motion.form>
            )}

            {/* ── OTP Step ── */}
            {step === 'otp' && (
              <motion.div 
                key="otp"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-earth-700">Verification Code</label>
                  <div className="flex gap-3 justify-between" onPaste={handleOtpPaste}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        disabled={loading}
                        className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl outline-none transition-all duration-200 
                          ${digit ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50 text-primary-900' : 'border-earth-300 bg-white hover:border-earth-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20'}
                          disabled:bg-earth-100 disabled:border-earth-200 border shadow-sm`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium text-center">
                    {error}
                  </motion.div>
                )}

                <div className="flex items-center justify-between mt-8 pt-4 border-t border-earth-100">
                  <button
                    onClick={() => { setStep('details'); setOtp(['', '', '', '', '', '']); setError(''); }}
                    className="text-sm text-earth-500 hover:text-earth-900 font-semibold transition-colors flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    Edit number
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'details' && (
            <div className="mt-10 text-center">
              <p className="text-sm text-earth-500">
                Already have an account?{' '}
                <Link href="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </AuroraBackground>
  );
}
