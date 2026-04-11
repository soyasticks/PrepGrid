import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  otp: { code: String, expiresAt: Date },
  plan: {
    type: { type: String, enum: ['free', 'pro'], default: 'free' },
    interviewsUsed: { type: Number, default: 0 },
    questionsUsed: { type: Number, default: 0 },
    monthReset: { type: Date, default: () => new Date() }
  },
  stats: {
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalInterviews: { type: Number, default: 0 },
    avgInterviewScore: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActiveDate: Date,
  },
  weakAreas: [String],
  solvedQuestions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
}, { timestamps: true });

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};
userSchema.methods.toPublic = function() {
  const obj = this.toObject();
  delete obj.passwordHash; delete obj.otp;
  return obj;
};

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  examples: [{
    input: String, output: String, explanation: String
  }],
  constraints: [String],
  hints: [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  topic: { type: String, enum: ['Arrays', 'Strings', 'Trees', 'DP', 'Graphs', 'SQL', 'Sorting', 'Binary Search', 'Recursion', 'Hashing', 'Linked Lists', 'Stack/Queue', 'Greedy', 'Backtracking', 'Math'], required: true },
  tags: [String],
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
  }],
  starterCode: {
    javascript: { type: String, default: '// Write your solution here\n' },
    python: { type: String, default: '# Write your solution here\n' },
    java: { type: String, default: '// Write your solution here\n' },
    cpp: { type: String, default: '// Write your solution here\n' }
  },
  solution: {
    javascript: String, python: String
  },
  acceptanceRate: { type: Number, default: 0 },
  solvedCount: { type: Number, default: 0 },
  attemptCount: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },
}, { timestamps: true });

questionSchema.index({ difficulty: 1, topic: 1 });

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  code: { type: String, required: true },
  language: { type: String, enum: ['javascript', 'python', 'java', 'cpp'], required: true },
  verdict: { type: String, enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'], required: true },
  runtime: Number,
  memory: Number,
  testCasesPassed: Number,
  totalTestCases: Number,
  errorMessage: String,
}, { timestamps: true });

const interviewSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Frontend', 'Backend', 'Full Stack', 'DSA'], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  messages: [{
    role: { type: String, enum: ['ai', 'user'] },
    content: String,
    score: Number,
    feedback: String,
    timestamp: { type: Date, default: Date.now }
  }],
  overallScore: { type: Number, default: 0 },
  questionsAsked: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  duration: Number,
  summary: String,
}, { timestamps: true });

const quizSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  questions: [{
    question: String,
    options: [String],
    correctIndex: Number,
    explanation: String,
    userAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 10 },
  timeTaken: Number,
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

const leaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: Number,
  timeTaken: Number,
}, { timestamps: true });

leaderboardSchema.index({ topic: 1, score: -1 });

export const User = mongoose.model('User', userSchema);
export const Question = mongoose.model('Question', questionSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export const QuizSession = mongoose.model('QuizSession', quizSessionSchema);
export const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardSchema);