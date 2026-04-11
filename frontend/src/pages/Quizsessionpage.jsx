import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Trophy, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';

const TIME_PER_Q = 30;

export default function QuizSessionPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const questions = state?.questions || [];
  const topic = state?.topic || 'Quiz';
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [totalTime, setTotalTime] = useState(0);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const qStart = useRef(Date.now());

  useEffect(() => {
    if (results) return;
    const t = setInterval(() => {
      setTotalTime(Math.floor((Date.now() - startTime.current) / 1000));
      setTimeLeft(prev => { if (prev <= 1) { handleNext(true); return TIME_PER_Q; } return prev - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [current, results]);

  const handleNext = (auto = false) => {
    const timeSpent = Math.floor((Date.now() - qStart.current) / 1000);
    const answer = auto ? -1 : selected ?? -1;
    const newAnswers = [...answers, { answer, timeSpent }];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) { submitQuiz(newAnswers); }
    else { setCurrent(c => c + 1); setSelected(null); setTimeLeft(TIME_PER_Q); qStart.current = Date.now(); }
  };

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/quiz/${id}/submit`, { answers: finalAnswers, timeTaken: totalTime });
      setResults(data);
      if (data.score / data.total >= 0.7) confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 }, colors: ['#60a5fa','#93c5fd','#38bdf8'] });
    } catch { toast.error('Failed to submit quiz'); }
    finally { setSubmitting(false); }
  };

  if (!questions.length) return <DashboardLayout><p style={{ color: '#555', fontSize: 13 }}>No questions. <button onClick={() => navigate('/quiz')} style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button></p></DashboardLayout>;

  if (results) {
    const pct = Math.round((results.score / results.total) * 100);
    return (
      <DashboardLayout title="Quiz Results">
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '32px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: '#707070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{topic}</div>
            <div style={{ fontSize: 56, fontWeight: 600, color: '#f0f0f0', lineHeight: 1 }}>{results.score}<span style={{ fontSize: 24, color: '#555' }}>/{results.total}</span></div>
            <div style={{ fontSize: 13, color: '#707070', marginTop: 6 }}>{pct}% correct · {results.timeTaken}s</div>
            {results.rank && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.20)', borderRadius: 20, padding: '4px 14px', fontSize: 12, color: '#60a5fa' }}><Trophy size={12} />Rank #{results.rank} on leaderboard</div>}
          </div>

          <div style={{ marginBottom: 16 }}>
            {results.results?.map((r, i) => (
              <div key={i} style={{ background: '#212121', border: `1px solid ${r.isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: r.isCorrect ? 0 : 6 }}>
                  {r.isCorrect ? <CheckCircle size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />}
                  <span style={{ fontSize: 13, color: '#d0d0d0', lineHeight: 1.5 }}>{r.question}</span>
                </div>
                {!r.isCorrect && <div style={{ marginLeft: 22, fontSize: 12, color: '#707070' }}>
                  <span style={{ color: '#f87171' }}>Your answer: {r.options?.[r.userAnswer] ?? 'Skipped'}</span>
                  <span style={{ marginLeft: 12, color: '#4ade80' }}>Correct: {r.options?.[r.correctAnswer]}</span>
                </div>}
                {r.explanation && <p style={{ marginLeft: 22, marginTop: 5, fontSize: 11, color: '#555', fontStyle: 'italic' }}>{r.explanation}</p>}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/quiz')} style={{ flex: 1, padding: '9px', background: '#60a5fa', color: '#0f172a', border: 'none', borderRadius: 7, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Try Another Quiz</button>
            <button onClick={() => navigate(`/leaderboard`)} style={{ flex: 1, padding: '9px', background: '#212121', color: '#d0d0d0', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Trophy size={14} />Leaderboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const q = questions[current];
  const timerPct = (timeLeft / TIME_PER_Q) * 100;
  const timerColor = timeLeft <= 10 ? '#ef4444' : timeLeft <= 20 ? '#f59e0b' : '#60a5fa';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#707070', marginBottom: 8 }}>
          <span style={{ fontWeight: 500, color: '#d0d0d0' }}>{topic}</span>
          <span>Question {current + 1} of {questions.length}</span>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 16 }}>
          <div style={{ height: 3, background: '#60a5fa', borderRadius: 2, width: `${(current / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Clock size={13} style={{ color: timerColor, flexShrink: 0 }} />
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{ height: 4, borderRadius: 2, width: `${timerPct}%`, background: timerColor, transition: 'width 1s linear, background 0.3s' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: timerColor, minWidth: 30 }}>{timeLeft}s</span>
        </div>

        <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 9, padding: '20px', marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: '#707070', display: 'block', marginBottom: 10 }}>{q.difficulty}</span>
          <p style={{ fontSize: 14, color: '#e0e0e0', lineHeight: 1.6 }}>{q.question}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
          {q.options?.map((opt, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              padding: '12px 14px', borderRadius: 8, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5,
              background: selected === i ? 'rgba(96,165,250,0.08)' : '#212121',
              color: selected === i ? '#60a5fa' : '#909090',
              border: `1px solid ${selected === i ? '#3b82f6' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.1s'
            }}>
              <span style={{ fontWeight: 600, marginRight: 8, color: selected === i ? '#60a5fa' : '#555' }}>{['A','B','C','D'][i]}.</span>{opt}
            </button>
          ))}
        </div>

        <button onClick={() => handleNext()} disabled={selected === null || submitting} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, background: '#60a5fa', color: '#0f172a',
          border: 'none', borderRadius: 7, padding: '9px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          opacity: (selected === null || submitting) ? 0.4 : 1
        }}>
          {submitting ? 'Submitting...' : current + 1 >= questions.length ? 'Submit Quiz' : 'Next Question'} <ArrowRight size={15} />
        </button>
      </div>
    </DashboardLayout>
  );
}