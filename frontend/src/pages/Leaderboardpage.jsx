import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Clock } from 'lucide-react';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';

const TOPICS = ['React Hooks', 'JavaScript Closures', 'DBMS Normalization', 'SQL Joins', 'OS Scheduling', 'Data Structures'];
const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const { data, isLoading } = useQuery({ queryKey: ['leaderboard', topic], queryFn: () => api.get(`/quiz/leaderboard/${encodeURIComponent(topic)}`).then(r => r.data) });

  return (
    <DashboardLayout title="Leaderboard" subtitle="Top scorers by topic">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {TOPICS.map(t => (
          <button key={t} onClick={() => setTopic(t)} style={{
            padding: '7px 14px', borderRadius: 7, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', border: 'none',
            background: topic === t ? '#60a5fa' : '#212121', color: topic === t ? '#fff' : '#909090',
            outline: '1px solid ' + (topic === t ? 'transparent' : 'rgba(255,255,255,0.07)'),
          }}>{t}</button>
        ))}
      </div>

      <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden', maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Trophy size={14} color="#60a5fa" />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#d0d0d0' }}>{topic}</span>
        </div>
        {isLoading ? [...Array(5)].map((_, i) => <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></div>)
          : data?.length === 0 ? <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#555' }}>No scores yet. Be the first!</div>
          : data?.map((entry, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ width: 24, textAlign: 'center', fontSize: i < 3 ? 16 : 12, color: '#555' }}>{i < 3 ? MEDAL[i] : `#${entry.rank}`}</div>
              <div style={{ flex: 1, fontSize: 13, color: '#d0d0d0' }}>{entry.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#60a5fa' }}>{entry.score}/{entry.total}</div>
              <div style={{ fontSize: 11, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} />{entry.timeTaken}s</div>
            </div>
          ))
        }
      </div>
    </DashboardLayout>
  );
}