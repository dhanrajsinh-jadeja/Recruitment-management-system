import { Router } from 'express';
import multer from 'multer';
import {
  submitRoundResult,
  getJobRoundResults,
  getMyRoundResults,
  uploadResultsCSV,
  notifyPassedCandidates,
} from '../controllers/resultController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Multer memory configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for CSV files
  },
});

// Recruiter submits/updates a candidate's round result
router.post('/', authMiddleware, requireRole('recruiter'), submitRoundResult);

// Recruiter uploads CSV file to bulk pass candidates for a round
router.post('/upload-csv', authMiddleware, requireRole('recruiter'), upload.single('file'), uploadResultsCSV);

// Recruiter triggers emails to all passed candidates for a round
router.post('/notify-passed', authMiddleware, requireRole('recruiter'), notifyPassedCandidates);

// Recruiter gets all round results for a specific job posting
router.get('/job/:jobId', authMiddleware, requireRole('recruiter'), getJobRoundResults);

// Candidate gets all of their own round results
router.get('/my-results', authMiddleware, requireRole('candidate'), getMyRoundResults);

export default router;
