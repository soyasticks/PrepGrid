import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { AuthLayout } from '../components/AuthLayout.jsx';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      toast.success('Account created! Check your email for OTP.');
      navigate('/verify-otp', { state: { userId: data.userId, email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#909090', marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="auth-input" required />
    </div>
  );

  return (
    <AuthLayout title="Create your account" subtitle="Start your interview prep journey today">
      <form onSubmit={handleSubmit}>
        {field('Full name', 'name', 'text', 'Arjun Sharma')}
        {field('Email', 'email', 'email', 'you@example.com')}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#909090', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" className="auth-input" style={{ paddingRight: 36 }} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0 }}>
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '9px', borderRadius: 7, background: '#60a5fa', color: '#0f172a', border: 'none', fontWeight: 500, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#707070', marginTop: 20 }}>
        Already have an account? <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'none' }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}