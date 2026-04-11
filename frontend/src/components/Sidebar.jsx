import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, LayoutDashboard, BookOpen, Brain, HelpCircle, Trophy, User, LogOut, Zap, Shield } from 'lucide-react';
import { useAuthStore } from '../hooks/useAuth.js';

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/practice',   icon: BookOpen,         label: 'Practice' },
  { to: '/interview',  icon: Brain,            label: 'AI Interview' },
  { to: '/quiz',       icon: HelpCircle,       label: 'Quiz' },
  { to: '/leaderboard',icon: Trophy,           label: 'Leaderboard' },
  { to: '/profile',    icon: User,             label: 'Profile' },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, height: '100vh', width: 220,
      background: '#191919', borderRight: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column', zIndex: 40
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, borderRadius: 6, background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Code2 size={13} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ color: '#f0f0f0', fontWeight: 600, fontSize: 14, letterSpacing: '-0.2px' }}>PrepGrid</span>
        </Link>
      </div>

      {/* Plan badge */}
      {user?.plan?.type === 'free' && (
        <div style={{ margin: '10px 10px 0' }}>
          <Link to="/upgrade" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 7, padding: '7px 10px', textDecoration: 'none' }}>
            <Zap size={12} color="#60a5fa" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>Free plan</div>
              <div style={{ fontSize: 10, color: '#777' }}>{5 - (user?.plan?.interviewsUsed || 0)} interviews left</div>
            </div>
          </Link>
        </div>
      )}
      {user?.plan?.type === 'pro' && (
        <div style={{ margin: '10px 10px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 7, padding: '7px 10px' }}>
            <Zap size={12} color="#60a5fa" />
            <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa' }}>Pro plan</div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
          return (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 10px', borderRadius: 7, marginBottom: 1,
              textDecoration: 'none', fontSize: 13, fontWeight: active ? 500 : 400,
              color: active ? '#f0f0f0' : '#707070',
              background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
              transition: 'all 0.1s'
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#b0b0b0'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#707070'; }}}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
        {user?.isAdmin && (
          <Link to="/admin" style={{
            display: 'flex', alignItems: 'center', gap: 9,
            padding: '8px 10px', borderRadius: 7, marginTop: 4,
            textDecoration: 'none', fontSize: 13,
            color: pathname === '/admin' ? '#f0f0f0' : '#707070',
            background: pathname === '/admin' ? 'rgba(255,255,255,0.07)' : 'transparent',
          }}>
            <Shield size={15} />Admin
          </Link>
        )}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#60a5fa', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#e0e0e0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 12, color: '#555', padding: '4px 6px', borderRadius: 5,
          width: '100%', transition: 'color 0.1s'
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
        onMouseLeave={e => e.currentTarget.style.color = '#555'}
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export function DashboardLayout({ children, title, subtitle }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#1a1a1a' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>
          {(title || subtitle) && (
            <div style={{ marginBottom: 28 }}>
              {title && <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f0', letterSpacing: '-0.3px' }}>{title}</h1>}
              {subtitle && <p style={{ fontSize: 13, color: '#707070', marginTop: 3 }}>{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}