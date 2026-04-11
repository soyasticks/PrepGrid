import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { Question, Submission, User } from '../models/index.js';

export const questionRouter = express.Router();

questionRouter.get('/', protect, async (req, res) => {
  try {
    const { difficulty, topic, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (topic) filter.topic = topic;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .select('-testCases -solution -starterCode')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Question.countDocuments(filter)
    ]);

    const solvedSet = new Set(req.user.solvedQuestions.map(id => id.toString()));
    const enriched = questions.map(q => ({
      ...q.toObject(), isSolved: solvedSet.has(q._id.toString())
    }));

    res.json({ questions: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

questionRouter.get('/:id', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).select('-testCases.isHidden -solution');
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    const visibleTestCases = question.testCases.filter(tc => !tc.isHidden);
    res.json({ ...question.toObject(), testCases: visibleTestCases });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

questionRouter.post('/', protect, adminOnly, async (req, res) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const question = await Question.create({ ...req.body, slug });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

questionRouter.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

questionRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

questionRouter.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const user = req.user;
    const qId = req.params.id;
    const idx = user.bookmarks.indexOf(qId);
    if (idx === -1) user.bookmarks.push(qId); else user.bookmarks.splice(idx, 1);
    await user.save();
    res.json({ bookmarked: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const submissionRouter = express.Router();

submissionRouter.post('/', protect, async (req, res) => {
  try {
    const { questionId, code, language, verdict, runtime, memory, testCasesPassed, totalTestCases, errorMessage } = req.body;

    const submission = await Submission.create({
      user: req.user._id, question: questionId, code, language,
      verdict, runtime, memory, testCasesPassed, totalTestCases, errorMessage
    });

    await Question.findByIdAndUpdate(questionId, {
      $inc: { attemptCount: 1, ...(verdict === 'Accepted' ? { solvedCount: 1 } : {}) }
    });

    if (verdict === 'Accepted') {
      const alreadySolved = req.user.solvedQuestions.includes(questionId);
      if (!alreadySolved) {
        const question = await Question.findById(questionId);
        req.user.solvedQuestions.push(questionId);
        req.user.stats.totalSolved += 1;
        if (question?.difficulty === 'Easy') req.user.stats.easySolved += 1;
        if (question?.difficulty === 'Medium') req.user.stats.mediumSolved += 1;
        if (question?.difficulty === 'Hard') req.user.stats.hardSolved += 1;
        
        // Update streak
        const today = new Date().toDateString();
        const lastActive = req.user.stats.lastActiveDate?.toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastActive === yesterday) req.user.stats.streak += 1;
        else if (lastActive !== today) req.user.stats.streak = 1;
        req.user.stats.lastActiveDate = new Date();
        await req.user.save();
      }
    }

    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

submissionRouter.get('/', protect, async (req, res) => {
  try {
    const { questionId } = req.query;
    const filter = { user: req.user._id };
    if (questionId) filter.question = questionId;

    const submissions = await Submission.find(filter)
      .populate('question', 'title difficulty topic')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});