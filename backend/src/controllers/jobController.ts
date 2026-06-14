import { Response } from 'express';
import { Job } from '../models/Job';
import { InterviewRound } from '../models/InterviewRound';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { title, company, location, salary, description, requirements } = req.body;

    // Validate request
    if (!title || !company || !location || !description) {
      return res.status(400).json({ message: 'Title, company, location, and description are required.' });
    }

    const newJob = new Job({
      title,
      company,
      location,
      salary: salary || 'Not specified',
      description,
      requirements,
      postedBy: req.user.id,
    });

    await newJob.save();

    return res.status(201).json({
      message: 'Job posting created successfully.',
      job: newJob,
    });
  } catch (error: any) {
    console.error(`CreateJob error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while creating job.' });
  }
};

export const getJobs = async (req: AuthRequest, res: Response) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'email').sort({ createdAt: -1 });
    return res.status(200).json({ jobs });
  } catch (error: any) {
    console.error(`GetJobs error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while fetching jobs.' });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { jobId } = req.params;
    const { title, company, location, salary, description, requirements } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own jobs.' });
    }

    // Update fields
    job.title = title || job.title;
    job.company = company || job.company;
    job.location = location || job.location;
    job.salary = salary !== undefined ? salary : job.salary;
    job.description = description || job.description;
    job.requirements = requirements !== undefined ? requirements : job.requirements;

    await job.save();

    return res.status(200).json({
      message: 'Job details updated successfully.',
      job,
    });
  } catch (error: any) {
    console.error(`UpdateJob error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while updating job.' });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only delete your own jobs.' });
    }

    await Job.deleteOne({ _id: jobId });
    
    // Also delete any scheduled interview rounds associated with this job
    await InterviewRound.deleteMany({ jobId });

    return res.status(200).json({
      message: 'Job posting deleted successfully.',
    });
  } catch (error: any) {
    console.error(`DeleteJob error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while deleting job.' });
  }
};
