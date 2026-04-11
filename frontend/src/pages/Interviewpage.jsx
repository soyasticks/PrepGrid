import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Code2, Server, Layers, GitBranch, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';
import { useAuthStore } from '../hooks/useAuth.js';

const ROLES = [
  { id: 'Frontend',   icon: Code2,     desc: 'React, JS, CSS, browser APIs' },
  { id: 'Backend',    icon: Server,    desc: 'Node.js, databases, system design' },
  { id: 'Full Stack', icon: Layers,    desc: 'End-to-end web development' },
  { id: 'DSA',        icon: GitBranch, desc: 'Arrays, trees, graphs, DP' },
];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function InterviewPage() {
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const remaining = 5 - (user?.plan?.interviewsUsed || 0);
  const isPro = user?.plan?.type === 'pro';

  const start = async () => {
    if (!role) return toast.error('Select a role first');
    setLoading(true);
    try {
      const { data } = await api.post('/interviews/start', { role, difficulty });
      navigate(`/interview/${data.session._id}`, { state: { question: data.question } });
    } catch (err) {
      if (err.response?.data?.code === 'LIMIT_REACHED') { toast.error('Free limit reached! Upgrade to Pro.'); navigate('/upgrade'); }
      else toast.error(err.response?.data?.message || 'Failed to start interview');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="AI Mock Interview" subtitle="Practice with an AI interviewer that adapts to your level">
      {!isPro && (
        <div style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 8, padding: '10px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#60a5fa' }}>{remaining > 0 ? `${remaining} AI interviews remaining this month` : 'Monthly limit reached'}</span>
          <button onClick={() => navigate('/upgrade')} style={{ background: 'rgba(96,165,250,0.15)', border: 'none', borderRadius: 5, padding: '4px 12px', fontSize: 12, color: '#60a5fa', cursor: 'pointer', fontFamily: 'inherit' }}>Upgrade</button>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Choose your role</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={{
              padding: '16px', borderRadius: 9, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              background: role === r.id ? 'rgba(96,165,250,0.08)' : '#212121',
              border: role === r.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.07)',
              transition: 'all 0.15s'
            }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(96,165,250,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <r.icon size={15} color="#60a5fa" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0', marginBottom: 4 }}>{r.id}</div>
              <div style={{ fontSize: 11, color: '#707070', lineHeight: 1.5 }}>{r.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Difficulty</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)} style={{
              padding: '7px 18px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, border: 'none',
              background: difficulty === d ? (d === 'Easy' ? 'rgba(34,197,94,0.1)' : d === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)') : '#212121',
              color: difficulty === d ? (d === 'Easy' ? '#4ade80' : d === 'Medium' ? '#fbbf24' : '#f87171') : '#707070',
              outline: '1px solid ' + (difficulty === d ? (d === 'Easy' ? 'rgba(34,197,94,0.25)' : d === 'Medium' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)') : 'rgba(255,255,255,0.07)'),
            }}>{d}</button>
          ))}
        </div>
      </div>

      <button onClick={start} disabled={loading || !role || (!isPro && remaining <= 0)} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, background: '#60a5fa', color: '#0f172a',
        border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
        opacity: (loading || !role || (!isPro && remaining <= 0)) ? 0.4 : 1
      }}>
        <Brain size={16} />
        {loading ? 'Starting...' : 'Start AI Interview'}
        <ArrowRight size={15} />
      </button>

      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {['Think out loud — the AI evaluates your reasoning', 'Ask clarifying questions like a real interview', 'Mention tradeoffs and edge cases for better scores'].map((tip, i) => (
          <div key={i} style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '14px 16px' }}>
            <span style={{ color: '#60a5fa', fontWeight: 600, marginRight: 6 }}>{i + 1}.</span>
            <span style={{ fontSize: 12, color: '#707070', lineHeight: 1.6 }}>{tip}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}