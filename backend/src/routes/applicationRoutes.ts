import { Router } from 'express';
import multer from 'multer';
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Multer memory configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Candidate application submission
router.post('/', authMiddleware, requireRole('candidate'), upload.single('resume'), applyJob);

// Candidate listing their applications
router.get('/my-applications', authMiddleware, requireRole('candidate'), getMyApplications);

// Recruiter endpoints
router.get('/job/:jobId', authMiddleware, requireRole('recruiter'), getJobApplications);
router.put('/:applicationId/status', authMiddleware, requireRole('recruiter'), updateApplicationStatus);

export default router;
