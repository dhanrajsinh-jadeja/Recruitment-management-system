import { Router } from 'express';
import { createJob, getJobs, updateJob, deleteJob } from '../controllers/jobController';
import { getJobRounds, updateJobRounds } from '../controllers/roundController';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authMiddleware, requireRole('recruiter'), createJob);
router.get('/', getJobs);
router.put('/:jobId', authMiddleware, requireRole('recruiter'), updateJob);
router.delete('/:jobId', authMiddleware, requireRole('recruiter'), deleteJob);
router.put('/:jobId/rounds', authMiddleware, requireRole('recruiter'), updateJobRounds);
router.get('/:jobId/rounds', getJobRounds);

export default router;
