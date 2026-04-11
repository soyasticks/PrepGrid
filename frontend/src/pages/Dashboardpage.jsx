import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, Code2, Brain, Target, TrendingUp, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';
import { useAuthStore } from '../hooks/useAuth.js';

const PIE_COLORS = ['#60a5fa','#818cf8','#38bdf8','#a78bfa','#6b7280','#4b5563'];

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '18px 20px' }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Icon size={16} color="#60a5fa" />
    </div>
    <div style={{ fontSize: 24, fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>{value}</div>
    <div style={{ fontSize: 12, color: '#707070' }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: '#555', marginTop: 3 }}>{sub}</div>}
  </div>
);

const Skel = ({ h = 32 }) => <div className="skeleton" style={{ height: h, borderRadius: 8 }} />;

const tooltipStyle = { background: '#212121', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 };

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/users/dashboard').then(r => r.data),
  });

  const topicData = data?.recentSubmissions
    ? Object.entries(data.recentSubmissions.reduce((acc, s) => { const t = s.question?.topic || 'Other'; acc[t] = (acc[t] || 0) + 1; return acc; }, {})).map(([name, value]) => ({ name, value }))
    : [];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f0' }}>{greeting}, {user?.name?.split(' ')[0]}</h1>
          <p style={{ fontSize: 13, color: '#707070', marginTop: 2 }}>Here's your progress overview</p>
        </div>
        <Link to="/practice" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#60a5fa', color: '#0f172a', textDecoration: 'none', padding: '8px 16px', borderRadius: 7, fontSize: 13, fontWeight: 500 }}>
          Practice <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {isLoading ? [...Array(4)].map((_, i) => <Skel key={i} h={110} />) : (<>
          <StatCard icon={Code2} label="Problems solved" value={data?.stats?.totalSolved || 0} sub={`Easy ${data?.stats?.easySolved || 0} · Med ${data?.stats?.mediumSolved || 0} · Hard ${data?.stats?.hardSolved || 0}`} />
          <StatCard icon={Brain} label="Interviews done" value={data?.stats?.totalInterviews || 0} sub={`Avg ${(data?.stats?.avgInterviewScore || 0).toFixed(1)}/10`} />
          <StatCard icon={Flame} label="Day streak" value={`${data?.stats?.streak || 0}d`} sub="Keep it going" />
          <StatCard icon={Target} label="Avg score" value={`${(data?.stats?.avgInterviewScore || 0).toFixed(1)}/10`} sub="AI interview avg" />
        </>)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>30-day activity</div>
          {isLoading ? <Skel h={100} /> : (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={data?.activity || []} barSize={8}>
                <XAxis dataKey="_id" tick={{ fontSize: 10, fill: '#555' }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" fill="#60a5fa" opacity={0.8} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Topics</div>
          {isLoading ? <Skel h={100} /> : topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={topicData} cx="50%" cy="50%" innerRadius={28} outerRadius={50} paddingAngle={2} dataKey="value">
                  {topicData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 100, color: '#555', fontSize: 13 }}>
              <BookOpen size={20} style={{ marginBottom: 6, opacity: 0.4 }} />No data yet
            </div>
          )}
        </div>
      </div>

      {data?.weakAreas?.length > 0 && (
        <div style={{ background: '#212121', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={13} /> Areas to improve
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.weakAreas.map(a => (
              <span key={a} style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 5, padding: '3px 10px', fontSize: 12, color: '#60a5fa' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent submissions</div>
          <Link to="/practice" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none' }}>View all →</Link>
        </div>
        {isLoading ? (
          <div style={{ padding: 20 }}>{[...Array(3)].map((_, i) => <Skel key={i} h={36} />)}</div>
        ) : data?.recentSubmissions?.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center', fontSize: 13, color: '#555' }}>
            No submissions yet. <Link to="/practice" style={{ color: '#60a5fa', textDecoration: 'none' }}>Start practicing!</Link>
          </div>
        ) : data?.recentSubmissions?.slice(0, 6).map(s => (
          <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span className={`verdict-${s.verdict === 'Accepted' ? 'ac' : s.verdict === 'Wrong Answer' ? 'wa' : s.verdict === 'Time Limit Exceeded' ? 'tle' : 're'}`}>
              {s.verdict === 'Accepted' ? 'AC' : s.verdict === 'Wrong Answer' ? 'WA' : s.verdict === 'Time Limit Exceeded' ? 'TLE' : 'RE'}
            </span>
            <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#d0d0d0' }}>{s.question?.title}</span>
            <span className={`badge-${s.question?.difficulty?.toLowerCase()}`}>{s.question?.difficulty}</span>
            <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>{new Date(s.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}