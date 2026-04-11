import React from 'react';
import { useAuthStore } from '../hooks/useAuth.js';
import { DashboardLayout } from '../components/Sidebar.jsx';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuthStore();
  return (
    <DashboardLayout title="Profile">
      <div style={{ maxWidth: 480 }}>
        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '24px 24px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: '#60a5fa' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#f0f0f0' }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: '#707070', marginTop: 2 }}>{user?.email}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 5, padding: '2px 8px' }}>
                <Zap size={11} color="#60a5fa" />
                <span style={{ fontSize: 11, fontWeight: 500, color: '#60a5fa', textTransform: 'capitalize' }}>{user?.plan?.type} plan</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: 12 }}>
            {[['Problems solved', user?.stats?.totalSolved], ['Interviews', user?.stats?.totalInterviews], ['Streak', `${user?.stats?.streak || 0}d`]].map(([l, v]) => (
              <div key={l} style={{ background: '#1a1a1a', borderRadius: 8, padding: '12px' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: '#f0f0f0' }}>{v ?? 0}</div>
                <div style={{ fontSize: 11, color: '#707070', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {user?.plan?.type === 'free' && (
          <Link to="/upgrade" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#212121', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 10, padding: '16px 20px', textDecoration: 'none', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#60a5fa' }}>Upgrade to Pro</div>
              <div style={{ fontSize: 12, color: '#707070', marginTop: 2 }}>Unlimited interviews & practice for ₹499/mo</div>
            </div>
            <span style={{ color: '#60a5fa', fontSize: 16 }}>→</span>
          </Link>
        )}

        {user?.weakAreas?.length > 0 && (
          <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>AI-recommended focus areas</div>
            {user.weakAreas.map(a => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, color: '#d0d0d0' }}>
                <span style={{ color: '#60a5fa' }}>→</span>{a}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}