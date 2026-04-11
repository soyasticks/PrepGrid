import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';

export default function QuizPage() {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { data: topics } = useQuery({ queryKey: ['quiz-topics'], queryFn: () => api.get('/quiz/topics').then(r => r.data) });

  const start = async () => {
    const topic = custom.trim() || selected;
    if (!topic) return toast.error('Choose or enter a topic');
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/generate', { topic });
      navigate(`/quiz/${data.sessionId}`, { state: { questions: data.questions, topic } });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate quiz'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="AI Quiz" subtitle="Test your knowledge with timed AI-generated questions">
      <div style={{ maxWidth: 680 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>Popular topics</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {(topics || []).map(t => (
            <button key={t} onClick={() => { setSelected(t); setCustom(''); }} style={{
              padding: '7px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: 'none',
              background: selected === t ? 'rgba(96,165,250,0.10)' : '#212121',
              color: selected === t ? '#60a5fa' : '#909090',
              outline: '1px solid ' + (selected === t ? 'rgba(96,165,250,0.30)' : 'rgba(255,255,255,0.07)'),
              transition: 'all 0.1s'
            }}>{t}</button>
          ))}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#909090', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Or enter a custom topic</div>
          <input value={custom} onChange={e => { setCustom(e.target.value); setSelected(''); }} placeholder="e.g. WebSockets, Redis, Docker..."
            style={{ width: '100%', background: '#212121', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '9px 13px', color: '#ececec', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        </div>

        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '16px 20px', marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center' }}>
          {[['10', 'Questions'], ['30s', 'Per question'], ['AI', 'Evaluation']].map(([v, l]) => (
            <div key={l}><div style={{ fontSize: 22, fontWeight: 600, color: '#60a5fa' }}>{v}</div><div style={{ fontSize: 11, color: '#707070', marginTop: 2 }}>{l}</div></div>
          ))}
        </div>

        <button onClick={start} disabled={loading || (!selected && !custom.trim())} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, background: '#60a5fa', color: '#0f172a',
          border: 'none', borderRadius: 8, padding: '10px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          opacity: (loading || (!selected && !custom.trim())) ? 0.4 : 1
        }}>
          <Zap size={16} />{loading ? 'Generating...' : 'Start Quiz'}<ArrowRight size={15} />
        </button>
      </div>
    </DashboardLayout>
  );
}