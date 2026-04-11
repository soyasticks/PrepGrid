import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Code2, Brain, BarChart2 } from 'lucide-react';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';

export default function AdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => api.get('/admin/stats').then(r => r.data) });
  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: () => api.get('/admin/users').then(r => r.data) });

  const StatCard = ({ icon: Icon, label, value }) => (
    <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '18px 20px' }}>
      <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(96,165,250,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Icon size={15} color="#60a5fa" /></div>
      <div style={{ fontSize: 24, fontWeight: 600, color: '#f0f0f0' }}>{isLoading ? '—' : value}</div>
      <div style={{ fontSize: 12, color: '#707070', marginTop: 2 }}>{label}</div>
    </div>
  );

  return (
    <DashboardLayout title="Admin Panel" subtitle="Platform overview">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard icon={Users} label="Total users" value={data?.totalUsers} />
        <StatCard icon={Code2} label="Questions" value={data?.totalQuestions} />
        <StatCard icon={Brain} label="Interviews" value={data?.totalInterviews} />
        <StatCard icon={BarChart2} label="Submissions" value={data?.totalSubmissions} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Most attempted topics</div>
          {data?.topTopics?.map((t, i) => (
            <div key={t._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: '#555', width: 14 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                  <span style={{ color: '#d0d0d0' }}>{t._id}</span>
                  <span style={{ color: '#60a5fa' }}>{t.count}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ height: 3, background: '#60a5fa', borderRadius: 2, width: `${(t.count / (data.topTopics[0]?.count || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>Avg score by role</div>
          {data?.avgScoreByTopic?.map(r => (
            <div key={r._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: '#d0d0d0' }}>{r._id}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ height: 3, background: '#60a5fa', borderRadius: 2, width: `${(r.avgScore / 10) * 100}%` }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', width: 28 }}>{r.avgScore?.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 500, color: '#d0d0d0' }}>Registered Users</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {['Name','Email','Plan','Solved','Interviews','Joined'].map(h => <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {users?.users?.slice(0, 20).map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 16px', color: '#d0d0d0' }}>{u.name}</td>
                  <td style={{ padding: '10px 16px', color: '#707070' }}>{u.email}</td>
                  <td style={{ padding: '10px 16px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: u.plan?.type === 'pro' ? 'rgba(96,165,250,0.10)' : 'rgba(255,255,255,0.05)', color: u.plan?.type === 'pro' ? '#60a5fa' : '#707070' }}>{u.plan?.type}</span></td>
                  <td style={{ padding: '10px 16px', color: '#707070' }}>{u.stats?.totalSolved || 0}</td>
                  <td style={{ padding: '10px 16px', color: '#707070' }}>{u.stats?.totalInterviews || 0}</td>
                  <td style={{ padding: '10px 16px', color: '#555', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}