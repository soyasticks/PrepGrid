import Groq from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const callAI = async (prompt) => {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500,
  });
  const text = response.choices[0]?.message?.content || '';
  return text.replace(/```json|```/g, '').trim();
};

export const generateInterviewQuestion = async (role, difficulty, conversationHistory) => {
  const context = conversationHistory.length === 0
    ? `Start with a ${difficulty}-level opening question.`
    : `Conversation so far:\n${conversationHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\nGenerate the NEXT question.`;

  const text = await callAI(`You are a senior ${role} engineer conducting a technical interview.
${context}
Topics: ${getTopicsForRole(role)}
Return ONLY valid JSON, no markdown:
{"type":"question","question":"...","topic":"...","difficulty":"${difficulty}","hint":"..."}`);
  return JSON.parse(text);
};

export const evaluateInterviewAnswer = async (question, answer, role) => {
  const text = await callAI(`You are evaluating a ${role} developer's interview answer.
Question: ${question}
Answer: ${answer}
Return ONLY valid JSON, no markdown:
{"type":"evaluation","score":7,"verdict":"Good","feedback":"2-3 sentence technical feedback","correctApproach":"brief ideal answer","improvementTip":"one actionable tip"}`);
  return JSON.parse(text);
};

export const generateInterviewSummary = async (messages, role) => {
  const qa = messages.filter(m => m.score !== undefined);
  const avg = qa.reduce((a, m) => a + (m.score || 0), 0) / (qa.length || 1);
  const text = await callAI(`Summarize this ${role} technical interview. Average score: ${avg.toFixed(1)}/10.
Return ONLY valid JSON, no markdown:
{"overallScore":${Math.round(avg)},"verdict":"Hire","strengths":["s1","s2"],"areasToImprove":["a1","a2"],"recommendedTopics":["t1","t2"],"summary":"3-4 sentence assessment"}`);
  return JSON.parse(text);
};

export const generateQuizQuestions = async (topic, count = 10) => {
  const text = await callAI(`Generate ${count} multiple choice questions about "${topic}" for a CS student.
Mix: 3 Easy, 5 Medium, 2 Hard.
Return ONLY a valid JSON array, no markdown, no text before or after the array:
[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"why correct","difficulty":"Easy","topic":"${topic}"}]`);
  return JSON.parse(text);
};

export const analyzeWeakAreas = async (submissions) => {
  const failed = submissions.filter(s => s.verdict !== 'Accepted').map(s => s.question?.topic).filter(Boolean);
  if (!failed.length) return [];
  const text = await callAI(`Student failed in: ${failed.join(', ')}.
Return ONLY a JSON array of 3 improvement tips, no markdown:
["tip1","tip2","tip3"]`);
  return JSON.parse(text);
};

const getTopicsForRole = (role) => ({
  'Frontend': 'React, JavaScript ES6+, CSS, browser APIs, performance',
  'Backend': 'Node.js, REST APIs, databases, caching, system design',
  'Full Stack': 'React, Node.js, databases, API design, deployment',
  'DSA': 'Arrays, strings, trees, graphs, dynamic programming, complexity'
}[role] || 'Data structures and algorithms');