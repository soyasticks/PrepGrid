import express from 'express';
import { protect, checkPlanLimits } from '../middleware/auth.js';
import { InterviewSession, User } from '../models/index.js';
import {
  generateInterviewQuestion,
  evaluateInterviewAnswer,
  generateInterviewSummary
} from '../services/gemini.js';

const router = express.Router();

router.post('/start', protect, checkPlanLimits('interview'), async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    if (!role) return res.status(400).json({ message: 'Role is required' });

    const session = await InterviewSession.create({
      user: req.user._id, role, difficulty: difficulty || 'Medium'
    });

    const firstQuestion = await generateInterviewQuestion(role, difficulty || 'Medium', []);
    
    session.messages.push({
      role: 'ai', content: firstQuestion.question,
      timestamp: new Date()
    });
    session.questionsAsked = 1;
    await session.save();

    req.user.plan.interviewsUsed += 1;
    await req.user.save();

    res.status(201).json({ session, question: firstQuestion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/answer', protect, async (req, res) => {
  try {
    const { answer } = req.body;
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session || session.isCompleted) return res.status(404).json({ message: 'Session not found or completed' });

    const lastQuestion = [...session.messages].reverse().find(m => m.role === 'ai');
    if (!lastQuestion) return res.status(400).json({ message: 'No question found' });

    session.messages.push({ role: 'user', content: answer, timestamp: new Date() });

    const evaluation = await evaluateInterviewAnswer(lastQuestion.content, answer, session.role, session.messages);

    const lastUserMsg = session.messages[session.messages.length - 1];
    lastUserMsg.score = evaluation.score;
    lastUserMsg.feedback = evaluation.feedback;

    let nextQuestion = null;
    if (session.questionsAsked < 8) {
      nextQuestion = await generateInterviewQuestion(session.role, session.difficulty, session.messages);
      session.messages.push({ role: 'ai', content: nextQuestion.question, timestamp: new Date() });
      session.questionsAsked += 1;
    }

    const scoredMessages = session.messages.filter(m => m.score !== undefined);
    session.overallScore = scoredMessages.reduce((a, m) => a + m.score, 0) / (scoredMessages.length || 1);

    await session.save();
    res.json({ evaluation, nextQuestion, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/end', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const summary = await generateInterviewSummary(session.messages, session.role);
    
    session.isCompleted = true;
    session.overallScore = summary.overallScore;
    session.summary = summary.summary;
    session.duration = req.body.duration || 0;
    await session.save();

    const user = req.user;
    user.stats.totalInterviews += 1;
    const prevAvg = user.stats.avgInterviewScore;
    const total = user.stats.totalInterviews;
    user.stats.avgInterviewScore = ((prevAvg * (total - 1)) + summary.overallScore) / total;
    user.weakAreas = summary.recommendedTopics.slice(0, 3);
    await user.save();

    res.json({ session, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ user: req.user._id, isCompleted: true })
      .sort({ createdAt: -1 }).limit(20).select('-messages');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;