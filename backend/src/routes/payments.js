import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { protect, adminOnly } from '../middleware/auth.js';
import { User, Question, Submission, InterviewSession } from '../models/index.js';

export const paymentRouter = express.Router();

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

paymentRouter.post('/create-order', protect, async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: 49900, 
      currency: 'INR',
      receipt: `order_${req.user._id}_${Date.now()}`,
      notes: { userId: req.user._id.toString(), plan: 'pro' }
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

paymentRouter.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const now = new Date();
    req.user.plan.type = 'pro';
    req.user.plan.monthReset = now;
    await req.user.save();

    res.json({ message: 'Payment verified. Welcome to Pro!', user: req.user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

paymentRouter.get('/history', protect, async (req, res) => {
  if (req.user.plan.type === 'pro') {
    res.json([{
      id: 'pay_sandbox_001', amount: 499, currency: 'INR',
      status: 'captured', plan: 'Pro Monthly', date: req.user.plan.monthReset
    }]);
  } else {
    res.json([]);
  }
});

export const userRouter = express.Router();

userRouter.get('/me', protect, async (req, res) => {
  res.json(req.user.toPublic());
});

userRouter.get('/dashboard', protect, async (req, res) => {
  try {
    const [recentSubmissions, recentInterviews] = await Promise.all([
      Submission.find({ user: req.user._id })
        .populate('question', 'title difficulty topic')
        .sort({ createdAt: -1 }).limit(10),
      InterviewSession.find({ user: req.user._id, isCompleted: true })
        .sort({ createdAt: -1 }).limit(5).select('-messages')
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activity = await Submission.aggregate([
      { $match: { user: req.user._id, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: req.user.stats,
      plan: req.user.plan,
      weakAreas: req.user.weakAreas,
      recentSubmissions,
      recentInterviews,
      activity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const adminRouter = express.Router();

adminRouter.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalQuestions, totalSubmissions, totalInterviews] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Submission.countDocuments(),
      InterviewSession.countDocuments({ isCompleted: true })
    ]);

    const topTopics = await Submission.aggregate([
      { $lookup: { from: 'questions', localField: 'question', foreignField: '_id', as: 'q' } },
      { $unwind: '$q' },
      { $group: { _id: '$q.topic', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 8 }
    ]);

    const avgScoreByTopic = await InterviewSession.aggregate([
      { $match: { isCompleted: true } },
      { $group: { _id: '$role', avgScore: { $avg: '$overallScore' }, count: { $sum: 1 } } }
    ]);

    res.json({ totalUsers, totalQuestions, totalSubmissions, totalInterviews, topTopics, avgScoreByTopic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

adminRouter.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const [users, total] = await Promise.all([
      User.find().select('-passwordHash -otp').sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments()
    ]);
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});