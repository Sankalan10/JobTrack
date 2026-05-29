import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, getResume, updateResume } from './controllers/authController.js';
import { 
  getJobs, createJob, updateJob, deleteJob,
  getRecruiterJobs, updateRecruiterJob, autofillJob, searchRealJobs
} from './controllers/jobController.js';
import { 
  getPosts, createPost, likePost, commentOnPost, editPost, deletePost
} from './controllers/postController.js';
import { authenticateToken } from './middleware/auth.js';
import { decryptJoobleKey } from './utils/security.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', // Allow all origins for simple developer setup
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Public API operational health check route
app.get('/api/health', (req, res) => {
  const joobleActive = !!decryptJoobleKey();
  res.json({ 
    status: 'OK', 
    message: 'JobTrack API is fully operational',
    joobleActive 
  });
});

// Authentication Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// User Profile / Resume Routes
app.get('/api/users/resume', authenticateToken, getResume);
app.put('/api/users/resume', authenticateToken, updateResume);

// Secured Student Job Applications Routes
app.get('/api/jobs', authenticateToken, getJobs);
app.get('/api/jobs/search', authenticateToken, searchRealJobs);
app.post('/api/jobs', authenticateToken, createJob);
app.put('/api/jobs/:id', authenticateToken, updateJob);
app.delete('/api/jobs/:id', authenticateToken, deleteJob);

// Secured Recruiter Candidate Tracking Routes
app.get('/api/jobs/recruiter', authenticateToken, getRecruiterJobs);
app.put('/api/jobs/recruiter/:id', authenticateToken, updateRecruiterJob);

// Secured Metadata Scraper Autofill Route
app.post('/api/jobs/autofill', authenticateToken, autofillJob);

// Secured Job Tracker Social Feed Routes
app.get('/api/posts', authenticateToken, getPosts);
app.post('/api/posts', authenticateToken, createPost);
app.put('/api/posts/:id', authenticateToken, editPost);
app.delete('/api/posts/:id', authenticateToken, deletePost);
app.post('/api/posts/:id/like', authenticateToken, likePost);
app.post('/api/posts/:id/comment', authenticateToken, commentOnPost);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`🚀 JobTrack Backend running on http://localhost:${PORT}`);
});

