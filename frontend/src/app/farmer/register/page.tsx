'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Sprout, ArrowRight, Loader2, Tractor, TrendingUp, ShieldCheck, Store, Users, Package } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/Input';

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
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [demoOtpError, setDemoOtpError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const fetchDemoOtp = async (phoneNumber: string) => {
    if (process.env.NEXT_PUBLIC_OTP_DEMO_MODE === 'true') {
      const demoSecret = process.env.NEXT_PUBLIC_OTP_DEMO_SECRET;
      if (demoSecret) {
        try {
          const demoRes = await axios.get(`${API}/auth/demo-otp/${phoneNumber}`, {
            headers: { 'x-demo-secret': demoSecret }
          });
          if (demoRes.data?.data?.otp_code) {
            setDemoOtp(demoRes.data.data.otp_code);
            setDemoOtpError(null);
          }
        } catch (demoErr) {
          setDemoOtpError('Development OTP unavailable. Check demo configuration.');
        }
      } else {
        setDemoOtpError('Development OTP unavailable. Missing demo secret.');
      }
    }
  };

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
      fetchDemoOtp(formData.phone);
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
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { 
          if (timerRef.current) clearInterval(timerRef.current);
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    setError('');
    setDemoOtp(null);
    setDemoOtpError(null);
    try {
      await axios.post(`${API}/auth/send-otp`, { phone: formData.phone, userType: 'farmer', action: 'register' });
      startResendTimer();
      fetchDemoOtp(formData.phone);
    } catch {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row items-stretch bg-background p-0 font-sans transition-colors duration-200">
      
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
                <div className="text-white font-medium tracking-normal text-lg">Keep 100% of the profits</div>
                <p className="text-earth-300 text-sm mt-1 leading-relaxed">No middlemen. You set your prices and sell directly to consumers.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Tractor className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <div className="text-white font-medium tracking-normal text-lg">Easy Inventory Management</div>
                <p className="text-earth-300 text-sm mt-1 leading-relaxed">Update your available stock from your phone, right from the field.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <ShieldCheck className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <div className="text-white font-medium tracking-normal text-lg">Guaranteed Payments</div>
                <p className="text-earth-300 text-sm mt-1 leading-relaxed">Secure, fast payouts directly to your linked bank account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Side: Auth Form ── */}
      <div className="flex-1 flex flex-col relative bg-surface/80 backdrop-blur-xl transition-colors duration-200">
        <div className="lg:hidden sticky top-0 z-50 w-full bg-surface px-6 py-4 border-b border-border-default flex items-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary-600 dark:text-primary-500" />
            <span className="text-lg font-bold text-foreground font-display">Farm Connect</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32 py-8 lg:py-0">
          <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {step === 'details' ? 'Join as a Farmer' : 'Check your phone'}
            </h2>
            <p className="text-foreground-secondary text-sm">
              {step === 'details'
                ? 'Create your digital farm front today.'
                : `We sent a 6-digit verification code to ${formData.phone}.`}
            </p>
          </div>

          {/* ── Details Step ── */}
          {step === 'details' && (
            <form onSubmit={handleSendOTP} className="space-y-5 animate-enter">
              <div className="space-y-2">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Farmer Name"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary">Mobile Number</label>
                <div className="relative flex flex-row items-center bg-surface border border-border-default rounded-xl overflow-hidden focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all shadow-sm">
                  <div className="flex shrink-0 items-center justify-center bg-surface-muted px-4 py-3 border-r border-border-default">
                    <span className="text-foreground-secondary font-semibold">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                    className="w-full bg-transparent px-4 py-3 outline-none text-foreground font-medium tracking-wide"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-600 dark:text-red-400 animate-enter">
                  {error}
                  {error.includes('already registered') && (
                    <Link href="/farmer/login" className="block mt-1 font-semibold underline underline-offset-2 hover:text-red-700 dark:hover:text-red-300 transition-colors">
                      Log in instead
                    </Link>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={formData.phone.length !== 10 || formData.name.trim().length < 2 || loading}
                isLoading={loading}
                loadingText="Sending code..."
                variant="primary"
                className="w-full h-11"
              >
                Continue
              </Button>
            </form>
          )}

          {/* ── OTP Step ── */}
          {step === 'otp' && (
            <div className="space-y-6 animate-enter">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground-secondary">Verification Code</label>
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
                      className="w-12 h-14 text-center text-xl font-semibold border border-border-default rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all disabled:bg-surface-muted bg-surface text-foreground"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg text-sm text-red-600 dark:text-red-400 text-center animate-enter">
                  {error}
                </div>
              )}

              {process.env.NEXT_PUBLIC_OTP_DEMO_MODE === 'true' && (demoOtp || demoOtpError) && (
                <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl text-center">
                  <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">Development OTP</p>
                  {demoOtp ? (
                    <p className="text-2xl font-bold tracking-widest text-primary-900 dark:text-primary-100 my-1">{demoOtp}</p>
                  ) : (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{demoOtpError}</p>
                  )}
                  <p className="text-xs text-primary-600/80 dark:text-primary-400/80">Demo mode — SMS delivery disabled</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => { setStep('details'); setOtp(['', '', '', '', '', '']); setError(''); }}
                  className="text-sm text-foreground-muted hover:text-foreground font-medium transition-colors"
                >
                  ← Edit number
                </button>

                {resendTimer > 0 ? (
                  <span className="text-sm text-foreground-muted">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button onClick={handleResend} className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors">
                    Resend code
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-border-default">
            <p className="text-sm text-foreground-muted text-center">
              Already have an account?{' '}
              <Link href="/farmer/login" className="text-foreground font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* ── Farmer Value Proposition ── */}
          <div className="mt-12 pt-8 border-t border-border-default hidden sm:block">
            <h3 className="text-sm font-bold text-foreground-secondary uppercase tracking-widest text-center mb-6">Grow with Farm Connect</h3>
            <div className="grid gap-5">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-400 shrink-0"><Store className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm font-bold text-foreground tracking-normal">Digital Storefront</div>
                  <p className="text-sm text-foreground-muted leading-relaxed mt-0.5">Showcase your harvest to thousands of local buyers instantly.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-400 shrink-0"><Users className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm font-bold text-foreground tracking-normal">Direct to Consumer</div>
                  <p className="text-sm text-foreground-muted leading-relaxed mt-0.5">Skip the middlemen and build lasting relationships with buyers.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-400 shrink-0"><Package className="w-5 h-5" /></div>
                <div>
                  <div className="text-sm font-bold text-foreground tracking-normal">Manage Inventory</div>
                  <p className="text-sm text-foreground-muted leading-relaxed mt-0.5">Track your stock, update prices, and manage orders all in one place.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
