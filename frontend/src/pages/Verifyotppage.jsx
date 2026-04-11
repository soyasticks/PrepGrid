import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { AuthLayout } from '../components/AuthLayout.jsx';
import { useAuthStore } from '../hooks/useAuth.js';


export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const userId = location.state?.userId;
  const email = location.state?.email;

  if (!userId) {
    return (
      <AuthLayout title="Verify your email" subtitle="">
        <p style={{ color: '#909090', fontSize: 13, textAlign: 'center' }}>
          Something went wrong. <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Go back to login</Link>
        </p>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { userId, otp });
      login(data.user, data.accessToken, data.refreshToken);
      toast.success('Email verified! Welcome to PrepGrid 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return toast.error('Email not found, please register again');
    setResending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('New OTP sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify your email" subtitle={email ? `We sent a 6-digit code to ${email}` : 'Enter the 6-digit code from your email'}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#909090', marginBottom: 6 }}>Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            className="auth-input"
            style={{ fontSize: 24, letterSpacing: 10, textAlign: 'center', fontWeight: 600 }}
            autoFocus
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          style={{ width: '100%', padding: '9px', borderRadius: 7, background: '#60a5fa', color: '#0f172a', border: 'none', fontWeight: 500, fontSize: 14, cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer', opacity: (loading || otp.length !== 6) ? 0.5 : 1, fontFamily: 'inherit' }}
        >
          {loading ? 'Verifying...' : 'Verify email'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#707090', marginTop: 20 }}>
        Didn't get the code?{' '}
        <button
          onClick={handleResend}
          disabled={resending}
          style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }}
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      </p>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#707070', marginTop: 8 }}>
        <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>← Back to login</Link>
      </p>
    </AuthLayout>
  );
}
