import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Brain, Zap, CheckCircle, Trophy, BookOpen } from 'lucide-react';

const FEATURES = [
  { icon: BookOpen, title: 'Coding practice', desc: 'In-browser editor with Judge0 execution. Easy, Medium and Hard problems across Arrays, Trees, DP, Graphs and more.' },
  { icon: Brain,    title: 'AI mock interviews', desc: 'Gemini-powered interviewer that adapts to your answers, scores each response and gives actionable feedback.' },
  { icon: Trophy,   title: 'Quizzes & leaderboard', desc: 'Timed MCQ tests on React, DBMS, OS Scheduling and more. Compete against others on topic leaderboards.' },
  { icon: Zap,      title: 'Personalised dashboard', desc: 'Track your streak, see weak areas detected by AI, and get recommended next problems based on your history.' },
];

const PLANS = [
  { name: 'Free',  price: '₹0',   period: 'forever', cta: 'Get started', highlight: false, features: ['5 AI interviews / month', '10 practice questions / month', 'All quiz topics', 'Basic dashboard'] },
  { name: 'Pro',   price: '₹499', period: 'per month', cta: 'Go Pro',    highlight: true,  features: ['Unlimited AI interviews', 'Unlimited practice', 'Full analytics', 'Weak area coaching', 'Billing history'] },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#1a1a1a', color: '#ececec', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#1a1a1a', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-0.2px' }}>PrepGrid</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link to="/login" style={{ color: '#909090', fontSize: 14, textDecoration: 'none', padding: '6px 14px' }}>Log in</Link>
            <Link to="/register" style={{ background: '#60a5fa', color: '#0f172a', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '7px 16px', borderRadius: 7 }}>Sign up free</Link>
          </div>
        </div>
      </nav>

      <section style={{ maxWidth: 760, margin: '0 auto', padding: '96px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(96,165,250,0.10)', border: '1px solid #3b82f6', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#60a5fa', marginBottom: 28, fontWeight: 500 }}>
          AI-Powered · Built for DevFusion Hackathon
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, lineHeight: 1.15, letterSpacing: '-1px', marginBottom: 20, color: '#f0f0f0' }}>
          Crack your next<br />tech interview
        </h1>
        <p style={{ fontSize: 17, color: '#909090', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 36px', fontWeight: 400 }}>
          AI mock interviews that adapt to you. In-browser code editor. Timed quizzes. Real feedback that helps you improve — not just pass.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" style={{ background: '#60a5fa', color: '#0f172a', textDecoration: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 500, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            Start for free <ArrowRight size={15} />
          </Link>
          <Link to="/login" style={{ background: 'transparent', color: '#ececec', textDecoration: 'none', padding: '10px 22px', borderRadius: 8, fontWeight: 400, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
            Sign in
          </Link>
        </div>
        <p style={{ marginTop: 16, fontSize: 12, color: '#555' }}>No credit card required · 5 free AI interviews/month</p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} style={{ background: '#1e1e1e', padding: '28px 24px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(96,165,250,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <f.icon size={16} color="#60a5fa" />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#f0f0f0' }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px 96px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, textAlign: 'center', marginBottom: 8, color: '#f0f0f0' }}>Simple pricing</h2>
        <p style={{ textAlign: 'center', color: '#777', fontSize: 14, marginBottom: 36 }}>Start free, upgrade when you need more.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? '#212121' : '#1e1e1e', border: p.highlight ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '24px 20px' }}>
              {p.highlight && <div style={{ fontSize: 11, fontWeight: 600, color: '#60a5fa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recommended</div>}
              <div style={{ fontSize: 13, color: '#909090', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#f0f0f0', marginBottom: 2 }}>{p.price}</div>
              <div style={{ fontSize: 12, color: '#555', marginBottom: 20 }}>/{p.period}</div>
              <ul style={{ listStyle: 'none', marginBottom: 20 }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, fontSize: 13, color: '#909090' }}>
                    <CheckCircle size={13} color="#60a5fa" style={{ flexShrink: 0, marginTop: 2 }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{ display: 'block', textAlign: 'center', padding: '8px', borderRadius: 7, fontSize: 13, fontWeight: 500, textDecoration: 'none', background: p.highlight ? '#60a5fa' : 'transparent', color: p.highlight ? '#fff' : '#909090', border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#444' }}>PrepGrid · Built for DevFusion Hackathon · Powered by Gemini AI, Judge0, Razorpay</p>
      </footer>
    </div>
  );
}