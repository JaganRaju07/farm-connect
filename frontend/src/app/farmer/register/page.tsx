'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Sprout, ArrowRight, Loader2, Tractor, TrendingUp, ShieldCheck } from 'lucide-react';
import { AuroraBackground } from '@/components/reactbits/AuroraBackground';

type Step = 'details' | 'otp';

export default function FarmerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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
        userType: 'farmer',
        action: 'register'
      });
      setStep('otp');
      startResendTimer();
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
        userType: 'farmer',
        name: formData.name
      });

      const { token, user } = res.data.data;
      login(token, user, 'farmer');
      router.push('/complete-profile');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP. Try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    if (newOtp.every(d => d) && index === 5) handleVerifyOTP(newOtp.join(''));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
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

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setError('');
    try {
      await axios.post(`${API}/auth/send-otp`, { phone: formData.phone, userType: 'farmer', action: 'register' });
      startResendTimer();
    } catch {
      setError('Failed to resend OTP');
    }
  };

  return (
    <AuroraBackground className="w-full flex-row items-stretch bg-earth-50 p-0">
      
      {/* ── Left Side: Beautiful Visual ── */}
      <div className="hidden lg:flex w-1/2 bg-earth-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] opacity-30 mix-blend-overlay object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-earth-900 via-transparent to-earth-900/50" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <Sprout className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight">Farm Connect Portal</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-semibold text-white mb-6 leading-tight">
            Grow your business, directly.
          </h1>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Keep 100% of the profits</h3>
                <p className="text-earth-300 text-sm mt-1 leading-relaxed">No middlemen. You set your prices and sell directly to consumers.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Tractor className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Easy Inventory Management</h3>
                <p className="text-earth-300 text-sm mt-1 leading-relaxed">Update your available stock from your phone, right from the field.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="text-white font-medium">Guaranteed Payments</h3>
                <p className="text-earth-300 text-sm mt-1 leading-relaxed">Secure, fast payouts directly to your linked bank account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Auth Form ── */}
      <div className="flex-1 flex flex-col relative bg-white/80 backdrop-blur-xl">
        <div className="lg:hidden sticky top-0 z-50 w-full bg-white px-6 py-4 border-b border-earth-100 flex items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary-600" />
            <span className="text-lg font-bold text-earth-900 font-display">Farm Connect</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 py-8 lg:py-0">
          <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-earth-900 mb-2">
              {step === 'details' ? 'Join as a Farmer' : 'Check your phone'}
            </h2>
            <p className="text-earth-500 text-sm">
              {step === 'details'
                ? 'Create your digital farm front today.'
                : `We sent a 6-digit verification code to ${formData.phone}.`}
            </p>
          </div>

          {/* ── Details Step ── */}
          {step === 'details' && (
            <form onSubmit={handleSendOTP} className="space-y-5 animate-enter">
              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-800">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Farmer Name"
                  className="input-field"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-800">Mobile Number</label>
                <div className="relative flex flex-row items-center bg-white border border-earth-300 rounded-xl overflow-hidden focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-600/20 transition-all shadow-sm">
                  <div className="flex shrink-0 items-center justify-center bg-earth-50 px-4 py-3 border-r border-earth-200">
                    <span className="text-earth-600 font-semibold">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                    className="w-full bg-transparent px-4 py-3 outline-none text-earth-900 font-medium tracking-wide"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 animate-enter">
                  {error}
                  {error.includes('already registered') && (
                    <Link href="/farmer/login" className="block mt-1 font-semibold underline underline-offset-2 hover:text-red-700 transition-colors">
                      Log in instead
                    </Link>
                  )}
                </div>
              )}

              <button type="submit" disabled={formData.phone.length !== 10 || formData.name.trim().length < 2 || loading} className="btn-primary w-full h-11">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Sending code...' : 'Continue'}
              </button>
            </form>
          )}

          {/* ── OTP Step ── */}
          {step === 'otp' && (
            <div className="space-y-6 animate-enter">
              <div className="space-y-2">
                <label className="text-sm font-medium text-earth-800">Verification Code</label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      disabled={loading}
                      className="w-12 h-14 text-center text-xl font-semibold border border-earth-300 rounded-lg focus:border-primary-600 focus:ring-1 focus:ring-primary-600 outline-none transition-all disabled:bg-earth-50"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 text-center animate-enter">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => { setStep('details'); setOtp(['', '', '', '', '', '']); setError(''); }}
                  className="text-sm text-earth-500 hover:text-earth-800 font-medium transition-colors"
                >
                  ← Edit number
                </button>

                {resendTimer > 0 ? (
                  <span className="text-sm text-earth-400">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button onClick={handleResend} className="text-sm text-primary-700 hover:text-primary-900 font-medium transition-colors">
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-earth-100">
            <p className="text-sm text-earth-500 text-center">
              Already have an account?{' '}
              <Link href="/farmer/login" className="text-earth-900 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </AuroraBackground>
  );
}
