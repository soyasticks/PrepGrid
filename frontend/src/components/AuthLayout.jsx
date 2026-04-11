import React from 'react';
import { Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', marginBottom: 32 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ color: '#f0f0f0', fontWeight: 600, fontSize: 15 }}>PrepGrid</span>
        </Link>

        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '28px 24px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#f0f0f0', marginBottom: 4, letterSpacing: '-0.2px' }}>{title}</h1>
          <p style={{ fontSize: 13, color: '#707070', marginBottom: 24 }}>{subtitle}</p>
          {children}
        </div>
      </div>

      <style>{`
        .auth-input { width:100%;background:#2a2a2a;border:1px solid rgba(255,255,255,0.08);border-radius:7px;padding:9px 12px;color:#ececec;font-size:13px;font-family:inherit;outline:none;transition:border-color 0.15s; }
        .auth-input:focus { border-color:#60a5fa; }
        .auth-input::placeholder { color:#444; }
      `}</style>
    </div>
  );
}