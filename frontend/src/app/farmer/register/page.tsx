'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Tractor, Phone, ArrowRight, Loader2 } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function FarmerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[6-9]\d{9}$/.test(phone)) { setError('Enter a valid 10-digit mobile number'); return; }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/send-otp`, { phone, userType: 'farmer', action: 'register' });
      setStep('otp');
      startResendTimer();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '';
      if (msg.toLowerCase().includes('already')) {
        setError('This number is already registered. Please login.');
      } else {
        setError(msg || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpString: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/verify-otp`, { phone, otp: otpString, userType: 'farmer' });
      const { token, user } = res.data.data;
      login(token, user, 'farmer');
      router.push('/complete-profile');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const n = [...otp]; n[i] = value; setOtp(n);
    if (value && i < 5) document.getElementById(`frotp-${i + 1}`)?.focus();
    if (n.every(d => d) && i === 5) handleVerifyOTP(n.join(''));
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      document.getElementById(`frotp-${i - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); handleVerifyOTP(pasted); }
  };

  const startResendTimer = () => {
    setResendTimer(60);
    const id = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; }), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-700 rounded-2xl mb-4">
            <Tractor className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Register as Farmer</h1>
          <p className="text-gray-500 text-sm mt-1">Start selling directly to consumers near you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Your Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-600 text-lg tracking-widest"
                    autoFocus />
                </div>
              </div>

              {error && (
                <div className="text-red-700 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                  {error.includes('login') && <Link href="/farmer/login" className="block mt-1 font-medium underline">Go to farmer login →</Link>}
                </div>
              )}

              <button type="submit" disabled={phone.length !== 10 || loading}
                className="w-full flex items-center justify-center gap-2 bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 disabled:opacity-50">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {loading ? 'Sending...' : 'Get OTP'} {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-6">
              <p className="text-sm text-center text-gray-600">OTP sent to <span className="font-medium">{phone}</span></p>

              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otp.map((d, i) => (
                  <input key={i} id={`frotp-${i}`} type="text" inputMode="numeric" maxLength={1}
                    value={d} onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-600"
                    autoFocus={i === 0} />
                ))}
              </div>

              {loading && <div className="flex justify-center gap-2 text-green-700"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Verifying...</span></div>}
              {error && <p className="text-red-600 text-sm text-center">{error}</p>}

              <div className="text-center">
                {resendTimer > 0
                  ? <p className="text-sm text-gray-500">Resend in <span className="font-semibold">{resendTimer}s</span></p>
                  : <button onClick={() => { axios.post(`${API}/auth/send-otp`, { phone, userType: 'farmer', action: 'register' }); startResendTimer(); }} className="text-sm text-green-700 hover:underline">Resend OTP</button>
                }
              </div>

              <button onClick={() => { setStep('phone'); setOtp(['','','','','','']); }} className="w-full text-sm text-gray-500">← Change number</button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already registered? <Link href="/farmer/login" className="text-green-700 font-semibold hover:underline">Farmer login</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Consumer? <Link href="/register" className="text-primary-600 hover:underline">Consumer registration →</Link>
        </p>
      </div>
    </div>
  );
}
