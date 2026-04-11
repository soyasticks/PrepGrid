import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { AuthLayout } from '../components/AuthLayout.jsx';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setUserId(data.userId); setStep(2); toast.success('OTP sent to your email');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) return toast.error('Min 8 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { userId, otp, newPassword });
      toast.success('Password reset! Please login.'); navigate('/login');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 12px', color: '#ececec', fontSize: 13, fontFamily: 'inherit', outline: 'none', marginTop: 6, marginBottom: 14 };
  const labelStyle = { display: 'block', fontSize: 12, color: '#909090' };
  const btnStyle = { width: '100%', padding: '9px', borderRadius: 7, background: '#60a5fa', color: '#0f172a', border: 'none', fontWeight: 500, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <AuthLayout title={step === 1 ? 'Forgot password' : 'Reset password'} subtitle={step === 1 ? 'Enter your email to receive a code' : 'Enter the OTP and your new password'}>
      {step === 1 ? (
        <form onSubmit={sendOTP}>
          <label style={labelStyle}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} required />
          <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>{loading ? 'Sending...' : 'Send OTP'}</button>
        </form>
      ) : (
        <form onSubmit={resetPassword}>
          <label style={labelStyle}>OTP</label>
          <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" style={inputStyle} />
          <label style={labelStyle}>New password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" style={inputStyle} />
          <button type="submit" disabled={loading} style={{ ...btnStyle, opacity: loading ? 0.5 : 1 }}>{loading ? 'Resetting...' : 'Reset password'}</button>
        </form>
      )}
    </AuthLayout>
  );
}