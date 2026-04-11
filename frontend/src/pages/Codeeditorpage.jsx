import React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronLeft, ChevronRight, Lightbulb, CheckCircle, XCircle, Clock, Cpu } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';
import { DashboardLayout } from '../components/Sidebar.jsx';

const LANGUAGES = [
  { id: 63, name: 'JavaScript', key: 'javascript' },
  { id: 71, name: 'Python', key: 'python' },
  { id: 62, name: 'Java', key: 'java' },
  { id: 54, name: 'C++', key: 'cpp' },
];

const JUDGE0_HOST = import.meta.env.VITE_JUDGE0_HOST;
const JUDGE0_KEY = import.meta.env.VITE_JUDGE0_KEY;

export default function CodeEditorPage() {
  const { id } = useParams();
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState('');
  const [tab, setTab] = useState('description'); 
  const [runOutput, setRunOutput] = useState(null);
  const [running, setRunning] = useState(false);

  const { data: question, isLoading } = useQuery({
    queryKey: ['question', id],
    queryFn: () => api.get(`/questions/${id}`).then(r => r.data),
    onSuccess: (q) => {
      setCode(q.starterCode?.[lang.key] || '// Write your solution here\n');
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!code.trim()) throw new Error('Write some code first!');
      
      // Run against all visible test cases via Judge0
      const results = [];
      for (const tc of question.testCases.slice(0, 3)) {
        const body = { source_code: btoa(code), language_id: lang.id, stdin: btoa(tc.input) };
        const resp = await fetch(`https://${JUDGE0_HOST}/submissions?base64_encoded=true&wait=true`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-RapidAPI-Key': JUDGE0_KEY, 'X-RapidAPI-Host': JUDGE0_HOST },
          body: JSON.stringify(body)
        });
        const result = await resp.json();
        const output = result.stdout ? atob(result.stdout).trim() : '';
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: output,
          passed: output === tc.expectedOutput.trim(),
          status: result.status?.description,
          time: result.time,
          memory: result.memory,
          stderr: result.stderr ? atob(result.stderr) : ''
        });
      }

      const allPassed = results.every(r => r.passed);
      const verdict = allPassed ? 'Accepted' : results.some(r => r.status?.includes('Time')) ? 'Time Limit Exceeded' : results.some(r => r.status?.includes('Runtime')) ? 'Runtime Error' : 'Wrong Answer';

      await api.post('/submissions', {
        questionId: id, code, language: lang.key, verdict,
        testCasesPassed: results.filter(r => r.passed).length,
        totalTestCases: results.length,
        runtime: results[0]?.time ? Math.round(results[0].time * 1000) : 0
      });

      return { results, verdict };
    },
    onSuccess: ({ verdict }) => {
      if (verdict === 'Accepted') toast.success('Accepted! ✅');
      else toast.error(`${verdict}`);
    },
    onError: (err) => toast.error(err.message)
  });

  const handleRun = async () => {
    if (!code.trim() || !question?.testCases?.[0]) return;
    setRunning(true);
    try {
      const tc = question.testCases[0];
      const body = { source_code: btoa(code), language_id: lang.id, stdin: btoa(tc.input) };
      const resp = await fetch(`https://${JUDGE0_HOST}/submissions?base64_encoded=true&wait=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-RapidAPI-Key': JUDGE0_KEY, 'X-RapidAPI-Host': JUDGE0_HOST },
        body: JSON.stringify(body)
      });
      const result = await resp.json();
      setRunOutput({
        stdout: result.stdout ? atob(result.stdout) : '',
        stderr: result.stderr ? atob(result.stderr) : '',
        time: result.time,
        status: result.status?.description
      });
    } catch (err) {
      toast.error('Code execution failed');
    } finally {
      setRunning(false);
    }
  };

  if (isLoading) return <DashboardLayout><div className="skeleton h-96 rounded-2xl" /></DashboardLayout>;

  return (
    <div className="flex h-screen bg-[#050a0a] ml-60">
      {/* Left: Problem */}
      <div className="w-[420px] flex-shrink-0 border-r border-[rgba(0,229,224,0.08)] flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[rgba(0,229,224,0.08)]">
          {['description', 'hints', 'submissions'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize transition-colors ${tab === t ? 'text-[#00e5e0] border-b-2 border-[#00e5e0]' : 'text-[#7a9e9e] hover:text-[#e8f4f4]'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'description' && (
            <div>
              <div className="flex items-start gap-3 mb-4">
                <h1 className="font-display text-xl font-bold flex-1">{question?.title}</h1>
                <span className={`badge-${question?.difficulty?.toLowerCase()} px-3 py-1 rounded-full text-xs flex-shrink-0`}>{question?.difficulty}</span>
              </div>
              <div className="flex gap-2 mb-5">
                <span className="px-2 py-1 rounded bg-[rgba(0,229,224,0.08)] text-[#00e5e0] text-xs">{question?.topic}</span>
                {question?.tags?.map(t => <span key={t} className="px-2 py-1 rounded bg-[rgba(255,255,255,0.04)] text-[#4a6e6e] text-xs">{t}</span>)}
              </div>
              <p className="text-[#b0d4d4] text-sm leading-relaxed mb-6 whitespace-pre-wrap">{question?.description}</p>
              
              {question?.examples?.map((ex, i) => (
                <div key={i} className="mb-4 p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs font-display font-semibold text-[#7a9e9e] mb-2">Example {i + 1}</p>
                  <p className="text-xs font-mono text-[#b0d4d4]"><span className="text-[#4a6e6e]">Input: </span>{ex.input}</p>
                  <p className="text-xs font-mono text-[#b0d4d4] mt-1"><span className="text-[#4a6e6e]">Output: </span>{ex.output}</p>
                  {ex.explanation && <p className="text-xs text-[#7a9e9e] mt-2">{ex.explanation}</p>}
                </div>
              ))}

              {question?.constraints?.length > 0 && (
                <div>
                  <p className="text-xs font-display font-semibold text-[#7a9e9e] mb-2">Constraints</p>
                  <ul className="space-y-1">
                    {question.constraints.map((c, i) => <li key={i} className="text-xs font-mono text-[#b0d4d4]">• {c}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {tab === 'hints' && (
            <div className="space-y-3">
              {question?.hints?.length > 0
                ? question.hints.map((h, i) => (
                  <details key={i} className="glass rounded-xl p-4 cursor-pointer">
                    <summary className="text-sm font-medium flex items-center gap-2"><Lightbulb size={14} className="text-blue-400" /> Hint {i + 1}</summary>
                    <p className="text-[#7a9e9e] text-sm mt-3">{h}</p>
                  </details>
                ))
                : <p className="text-[#4a6e6e] text-sm">No hints available for this problem.</p>
              }
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(0,229,224,0.08)] bg-[#080f0f]">
          <select value={lang.key} onChange={e => { const l = LANGUAGES.find(l => l.key === e.target.value); setLang(l); setCode(question?.starterCode?.[l.key] || ''); }}
            className="bg-[rgba(255,255,255,0.05)] border border-[rgba(0,229,224,0.15)] rounded-lg px-3 py-1.5 text-sm text-[#e8f4f4] focus:outline-none focus:border-[rgba(0,229,224,0.4)]">
            {LANGUAGES.map(l => <option key={l.key} value={l.key}>{l.name}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleRun} disabled={running}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[rgba(0,229,224,0.08)] border border-[rgba(0,229,224,0.2)] text-[#00e5e0] text-sm hover:bg-[rgba(0,229,224,0.12)] transition-colors disabled:opacity-50">
              <Play size={14} />{running ? 'Running...' : 'Run'}
            </button>
            <button onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}
              className="btn-primary flex items-center gap-1.5 px-4 py-1.5 text-sm rounded-lg disabled:opacity-50">
              <Send size={14} />{submitMutation.isPending ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={lang.key === 'cpp' ? 'cpp' : lang.key}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6,
              minimap: { enabled: false }, scrollBeyondLastLine: false,
              padding: { top: 16 }, tabSize: 2
            }}
          />
        </div>

        {(runOutput || submitMutation.data) && (
          <div className="border-t border-[rgba(0,229,224,0.08)] bg-[#080f0f] p-4 max-h-48 overflow-y-auto">
            {runOutput && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${runOutput.status === 'Accepted' ? 'verdict-ac' : 'verdict-wa'}`}>{runOutput.status}</span>
                  {runOutput.time && <span className="text-xs text-[#4a6e6e] flex items-center gap-1"><Clock size={11} />{Math.round(runOutput.time * 1000)}ms</span>}
                </div>
                <pre className="text-xs font-mono text-[#b0d4d4] whitespace-pre-wrap">{runOutput.stdout || runOutput.stderr || '(no output)'}</pre>
              </div>
            )}
            {submitMutation.data && (
              <div>
                <div className={`flex items-center gap-2 mb-3 text-sm font-display font-semibold ${submitMutation.data.verdict === 'Accepted' ? 'text-[#00e676]' : 'text-[#ff5252]'}`}>
                  {submitMutation.data.verdict === 'Accepted' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {submitMutation.data.verdict}
                </div>
                <div className="space-y-2">
                  {submitMutation.data.results?.map((r, i) => (
                    <div key={i} className={`p-3 rounded-lg text-xs ${r.passed ? 'bg-green-500/5 border border-green-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {r.passed ? <CheckCircle size={12} className="text-[#00e676]" /> : <XCircle size={12} className="text-[#ff5252]" />}
                        <span className="font-mono">Test case {i + 1}</span>
                      </div>
                      {!r.passed && <>
                        <p className="font-mono text-[#4a6e6e]">Expected: <span className="text-[#b0d4d4]">{r.expected}</span></p>
                        <p className="font-mono text-[#4a6e6e]">Got: <span className="text-[#ff5252]">{r.actual || 'no output'}</span></p>
                      </>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}