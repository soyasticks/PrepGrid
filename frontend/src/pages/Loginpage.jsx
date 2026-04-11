import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { useAuthStore } from '../hooks/useAuth.js';
import { AuthLayout } from '../components/AuthLayout.jsx';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.accessToken, data.refreshToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.status === 403) {
        toast.error('Please verify your email first');
        navigate('/verify-otp', { state: { userId: err.response.data.userId } });
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your PrepGrid account">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#909090', marginBottom: 6 }}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="auth-input" required />
        </div>
        <div style={{ marginBottom: 6 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#909090', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="auth-input" style={{ paddingRight: 36 }} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <Link to="/forgot-password" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '9px', borderRadius: 7, background: '#60a5fa', color: '#0f172a', border: 'none', fontWeight: 500, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#707070', marginTop: 20 }}>
        No account? <Link to="/register" style={{ color: '#60a5fa', textDecoration: 'none' }}>Create one free</Link>
      </p>
    </AuthLayout>
  );
}