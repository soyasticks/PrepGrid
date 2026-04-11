import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null;

    if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-passwordHash -otp');

    if (!req.user) return res.status(401).json({ message: 'User not found' });
    if (!req.user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin access required' });
  next();
};

export const checkPlanLimits = (resource) => async (req, res, next) => {
  const { plan } = req.user;

  const now = new Date();
  if (plan.monthReset && now.getMonth() !== new Date(plan.monthReset).getMonth()) {
    req.user.plan.interviewsUsed = 0;
    req.user.plan.questionsUsed = 0;
    req.user.plan.monthReset = now;
    await req.user.save();
  }

  if (plan.type === 'pro') return next();

  if (resource === 'interview' && plan.interviewsUsed >= 5) {
    return res.status(403).json({
      message: 'Free tier limit reached (5 interviews/month). Upgrade to Pro.',
      code: 'LIMIT_REACHED'
    });
  }
  if (resource === 'question' && plan.questionsUsed >= 10) {
    return res.status(403).json({
      message: 'Free tier limit reached (10 questions/month). Upgrade to Pro.',
      code: 'LIMIT_REACHED'
    });
  }
  next();
};