import './env.js';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import { questionRouter, submissionRouter } from './routes/questions.js';
import interviewRoutes from './routes/interviews.js';
import quizRoutes from './routes/quiz.js';
import { paymentRouter, userRouter, adminRouter } from './routes/payments.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 }); 
app.use('/api/', limiter);
app.use('/api/interview', aiLimiter);
app.use('/api/quiz', aiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRouter);
app.use('/api/submissions', submissionRouter);
app.use('/api/interviews', interviewRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payments', paymentRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB connection failed:', err); process.exit(1); });

export default app;