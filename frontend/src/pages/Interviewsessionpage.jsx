import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, StopCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => state?.question ? [{ role: 'ai', content: state.question.question, topic: state.question.topic }] : []);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [ended, setEnded] = useState(false);
  const [summary, setSummary] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => { const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime.current) / 1000)), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleSubmit = async () => {
    if (!answer.trim()) return toast.error('Type your answer first');
    setLoading(true);
    const userMsg = { role: 'user', content: answer };
    setMessages(prev => [...prev, userMsg]);
    setAnswer('');
    try {
      const { data } = await api.post(`/interviews/${id}/answer`, { answer: userMsg.content });
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { ...u[u.length - 1], evaluation: data.evaluation }; return u; });
      if (data.nextQuestion) setMessages(prev => [...prev, { role: 'ai', content: data.nextQuestion.question, topic: data.nextQuestion.topic }]);
      else toast('8 questions answered. End the session to see your results.', { icon: '🎯' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleEnd = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/interviews/${id}/end`, { duration: elapsed });
      setEnded(true); setSummary(data.summary);
    } catch { toast.error('Failed to end interview'); }
    finally { setLoading(false); }
  };

  if (ended && summary) return (
    <DashboardLayout title="Interview Complete">
      <div style={{ maxWidth: 560 }}>
        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '32px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: '#707070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Overall Score</div>
          <div style={{ fontSize: 64, fontWeight: 600, color: '#f0f0f0', lineHeight: 1 }}>{summary.overallScore}<span style={{ fontSize: 24, color: '#555' }}>/10</span></div>
          <span style={{ display: 'inline-block', marginTop: 12, padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, background: summary.verdict === 'Strong Hire' || summary.verdict === 'Hire' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: summary.verdict === 'Strong Hire' || summary.verdict === 'Hire' ? '#4ade80' : '#fbbf24' }}>{summary.verdict}</span>
          <p style={{ fontSize: 13, color: '#707070', marginTop: 16, lineHeight: 1.6 }}>{summary.summary}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[['Strengths', summary.strengths, '#4ade80'], ['Improve', summary.areasToImprove, '#fbbf24']].map(([title, items, color]) => (
            <div key={title} style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '16px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{title}</div>
              {items?.map((s, i) => <div key={i} style={{ fontSize: 12, color: '#909090', marginBottom: 6 }}>· {s}</div>)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/interview')} style={{ flex: 1, padding: '9px', background: '#60a5fa', color: '#0f172a', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>New Interview</button>
          <button onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '9px', background: '#212121', color: '#d0d0d0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Dashboard</button>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#1a1a1a', marginLeft: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#191919', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 14, fontWeight: 500, color: '#f0f0f0' }}>AI Interview</span>
          <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 4, padding: '2px 8px', color: '#909090' }}>Q{messages.filter(m => m.role === 'ai').length}/8</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#707070', display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} />{fmt(elapsed)}</span>
          <button onClick={handleEnd} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '6px 12px', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            <StopCircle size={13} />End
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'ai' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AI</div>}
            <div style={{ maxWidth: '70%' }}>
              <div style={{ background: msg.role === 'ai' ? '#212121' : '#2a2a2a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: msg.role === 'ai' ? '0 10px 10px 10px' : '10px 0 10px 10px', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, color: '#d0d0d0' }}>
                {msg.topic && <div style={{ fontSize: 11, fontWeight: 500, color: '#60a5fa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{msg.topic}</div>}
                {msg.content}
              </div>
              {msg.evaluation && (
                <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', marginTop: 6, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[...Array(10)].map((_, j) => <div key={j} style={{ width: 12, height: 3, borderRadius: 2, background: j < msg.evaluation.score ? '#60a5fa' : 'rgba(255,255,255,0.1)' }} />)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>{msg.evaluation.score}/10</span>
                  </div>
                  <p style={{ color: '#707070', marginBottom: 5 }}>{msg.evaluation.feedback}</p>
                  <p style={{ color: '#fbbf24', fontSize: 11 }}>💡 {msg.evaluation.improvementTip}</p>
                </div>
              )}
            </div>
            {msg.role === 'user' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#909090', flexShrink: 0 }}>You</div>}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>AI</div>
            <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0 10px 10px 10px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#555', animation: `bounce 1s infinite ${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: '#191919', padding: '14px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <textarea value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmit(); }} placeholder="Type your answer... (Ctrl+Enter to submit)"
            style={{ flex: 1, background: '#212121', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 13px', color: '#ececec', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', minHeight: 72 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => { const sr = new (window.webkitSpeechRecognition || window.SpeechRecognition)(); sr.onresult = e => setAnswer(p => p + ' ' + e.results[0][0].transcript); sr.start(); setListening(!listening); }}
              style={{ width: 38, height: 38, borderRadius: 7, background: listening ? 'rgba(239,68,68,0.1)' : '#212121', border: `1px solid ${listening ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: listening ? '#f87171' : '#707070' }}>
              {listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
            <button onClick={handleSubmit} disabled={loading || !answer.trim()}
              style={{ width: 38, height: 38, borderRadius: 7, background: '#60a5fa', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (loading || !answer.trim()) ? 0.4 : 1 }}>
              <Send size={15} color="#fff" />
            </button>
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#444', marginTop: 6 }}>Ctrl+Enter to submit</p>
      </div>
      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}