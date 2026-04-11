import express from 'express';
import { protect } from '../middleware/auth.js';
import { QuizSession, LeaderboardEntry } from '../models/index.js';
import { generateQuizQuestions } from '../services/gemini.js';

const router = express.Router();

router.post('/generate', protect, async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ message: 'Topic required' });

    const questions = await generateQuizQuestions(topic, 10);
    
    const session = await QuizSession.create({
      user: req.user._id, topic,
      questions: questions.map(q => ({
        question: q.question, options: q.options,
        correctIndex: q.correctIndex, explanation: q.explanation,
        difficulty: q.difficulty
      })),
      totalQuestions: questions.length
    });

    const clientQuestions = questions.map((q, i) => ({
      id: i, question: q.question, options: q.options, difficulty: q.difficulty
    }));

    res.status(201).json({ sessionId: session._id, questions: clientQuestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body; 
    const session = await QuizSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session || session.isCompleted) return res.status(404).json({ message: 'Session not found or completed' });

    let score = 0;
    const results = session.questions.map((q, i) => {
      const userAnswer = answers[i]?.answer ?? -1;
      const isCorrect = userAnswer === q.correctIndex;
      if (isCorrect) score++;
      q.userAnswer = userAnswer;
      q.isCorrect = isCorrect;
      q.timeSpent = answers[i]?.timeSpent || 0;
      return {
        question: q.question, options: q.options,
        userAnswer, correctAnswer: q.correctIndex,
        isCorrect, explanation: q.explanation
      };
    });

    session.score = score;
    session.timeTaken = timeTaken || 0;
    session.isCompleted = true;
    await session.save();

    await LeaderboardEntry.create({
      user: req.user._id, topic: session.topic,
      score, totalQuestions: session.totalQuestions, timeTaken
    });

    const rank = await LeaderboardEntry.countDocuments({
      topic: session.topic,
      $or: [{ score: { $gt: score } }, { score, timeTaken: { $lt: timeTaken } }]
    }) + 1;

    res.json({ score, total: session.totalQuestions, results, timeTaken, rank });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/leaderboard/:topic', async (req, res) => {
  try {
    const entries = await LeaderboardEntry.find({ topic: req.params.topic })
      .sort({ score: -1, timeTaken: 1 })
      .limit(20)
      .populate('user', 'name');

    const leaderboard = entries.map((e, i) => ({
      rank: i + 1, name: e.user?.name || 'Anonymous',
      score: e.score, total: e.totalQuestions, timeTaken: e.timeTaken,
      createdAt: e.createdAt
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/topics', async (req, res) => {
  const topics = [
    'React Hooks', 'JavaScript Closures', 'Node.js Event Loop',
    'DBMS Normalization', 'SQL Joins', 'OS Scheduling',
    'Process Synchronization', 'Computer Networks', 'HTTP/REST',
    'Data Structures', 'Dynamic Programming', 'System Design Basics',
    'Git & Version Control', 'Docker & Kubernetes', 'AWS Fundamentals'
  ];
  res.json(topics);
});

export default router;