import React from 'react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2, Bookmark, BookmarkCheck } from 'lucide-react';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';
import toast from 'react-hot-toast';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const TOPICS = ['All', 'Arrays', 'Strings', 'Trees', 'DP', 'Graphs', 'SQL', 'Sorting', 'Binary Search', 'Recursion', 'Hashing', 'Linked Lists', 'Stack/Queue'];

const pill = (active) => ({
  padding: '4px 12px', borderRadius: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: 'none', fontFamily: 'inherit',
  background: active ? 'rgba(96,165,250,0.12)' : 'transparent',
  color: active ? '#60a5fa' : '#707070',
  outline: active ? '1px solid rgba(96,165,250,0.30)' : '1px solid rgba(255,255,255,0.07)',
});

export default function PracticePage() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['questions', search, difficulty, topic, page],
    queryFn: () => api.get('/questions', { params: { ...(search && { search }), ...(difficulty !== 'All' && { difficulty }), ...(topic !== 'All' && { topic }), page, limit: 20 } }).then(r => r.data),
    keepPreviousData: true
  });

  const toggleBookmark = async (e, id) => {
    e.preventDefault();
    try { await api.post(`/questions/${id}/bookmark`); refetch(); }
    catch { toast.error('Failed to bookmark'); }
  };

  return (
    <DashboardLayout title="Practice" subtitle="Sharpen your coding skills">
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search problems..." style={{ width: '100%', background: '#212121', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, padding: '8px 12px 8px 32px', color: '#ececec', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DIFFICULTIES.map(d => <button key={d} onClick={() => { setDifficulty(d); setPage(1); }} style={pill(difficulty === d)}>{d}</button>)}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        {TOPICS.map(t => <button key={t} onClick={() => { setTopic(t); setPage(1); }} style={{ ...pill(topic === t), padding: '3px 10px', fontSize: 11 }}>{t}</button>)}
      </div>

      <div style={{ background: '#212121', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 40px 40px', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 500, color: '#555', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          <div>#</div><div>Title</div><div>Difficulty</div><div>Topic</div><div></div><div></div>
        </div>

        {isLoading ? [...Array(8)].map((_, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="skeleton" style={{ height: 16, borderRadius: 4 }} />
          </div>
        )) : data?.questions?.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: '#555' }}>No questions found</div>
        ) : data?.questions?.map((q, i) => (
          <Link key={q._id} to={`/practice/${q._id}`} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 40px 40px', padding: '11px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textDecoration: 'none', alignItems: 'center', transition: 'background 0.1s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ fontSize: 12, color: '#555' }}>{(page - 1) * 20 + i + 1}</div>
            <div style={{ fontSize: 13, color: '#d0d0d0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</div>
            <div><span className={`badge-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span></div>
            <div style={{ fontSize: 12, color: '#707070' }}>{q.topic}</div>
            <div>{q.isSolved && <CheckCircle2 size={14} color="#22c55e" />}</div>
            <div>
              <button onClick={e => toggleBookmark(e, q._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: 0, display: 'flex' }}>
                {q.isBookmarked ? <BookmarkCheck size={14} color="#60a5fa" /> : <Bookmark size={14} />}
              </button>
            </div>
          </Link>
        ))}
      </div>

      {data?.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ ...pill(false), cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>← Prev</button>
          <span style={{ fontSize: 13, color: '#707070', padding: '4px 12px' }}>Page {page} of {data.totalPages}</span>
          <button disabled={page === data.totalPages} onClick={() => setPage(p => p + 1)} style={{ ...pill(false), cursor: page === data.totalPages ? 'not-allowed' : 'pointer', opacity: page === data.totalPages ? 0.4 : 1 }}>Next →</button>
        </div>
      )}
    </DashboardLayout>
  );
}