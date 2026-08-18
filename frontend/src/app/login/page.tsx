'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Sprout, Phone, ArrowRight, Loader2 } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function ConsumerLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/marketplace';
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  // ─── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, {
        phone,
        userType: 'consumer',
        action: 'login'
      });

      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '';
      // If phone not registered, guide to registration
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('register')) {
        setError('Phone number not registered. Please create an account first.');
      } else {
        setError(msg || 'Failed to send OTP. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────────────
  const handleVerifyOTP = async (otpString: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, {
        phone,
        otp: otpString,
        userType: 'consumer'
      });

      const { token, user, requiresProfileCompletion } = res.data.data;

      // Store in AuthContext (handles localStorage too)
      login(token, user, 'consumer');

      if (requiresProfileCompletion) {
        router.push('/complete-profile');
      } else {
        router.push(redirectTo);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP. Try again.');
      // Clear OTP fields on error
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input Handlers ──────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(d => d) && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
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

  // ─── Resend Timer ─────────────────────────────────────────────────────────────
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
      await axios.post(`${API}/auth/send-otp`, { phone, userType: 'consumer', action: 'login' });
      startResendTimer();
    } catch {
      setError('Failed to resend OTP');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sprout className="w-8 h-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Farm Connect</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">
            {step === 'phone' ? 'Sign in to your account' : 'Verify your number'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === 'phone'
              ? 'Fresh produce from farmers near you'
              : `We sent a 6-digit code to ${phone}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {/* ── Phone Step ── */}
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg tracking-widest"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {phone.length}/10 digits
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  {error}
                  {error.includes('account') && (
                    <Link href="/register" className="block mt-1 font-medium underline">
                      Create account →
                    </Link>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={phone.length !== 10 || loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? 'Sending OTP...' : 'Get OTP'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {/* ── OTP Step ── */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
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
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 disabled:bg-gray-50"
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-primary-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Verifying...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-semibold text-primary-600">{resendTimer}s</span>
                  </p>
                ) : (
                  <button onClick={handleResend} className="text-sm text-primary-600 hover:underline font-medium">
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Change phone number
              </button>
            </div>
          )}
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          New to Farm Connect?{' '}
          <Link href="/register" className="text-primary-600 font-semibold hover:underline">
            Create account
          </Link>
        </p>

        {/* Farmer Login Link */}
        <p className="text-center text-sm text-gray-500 mt-2">
          Are you a farmer?{' '}
          <Link href="/farmer/login" className="text-green-700 font-semibold hover:underline">
            Farmer login →
          </Link>
        </p>
      </div>
    </div>
  );
}
