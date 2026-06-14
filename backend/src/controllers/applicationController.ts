import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { Application } from '../models/Application';
import { Job } from '../models/Job';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendCandidateHiredEmail } from '../config/emailService';

// Helper function to upload buffer directly to Cloudinary
const uploadFromBuffer = (fileBuffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cldUploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'resumes',
        resource_type: 'auto', // Auto-detect PDF/Word formats
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    cldUploadStream.end(fileBuffer);
  });
};

export const applyJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required.' });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check if user already applied
    const alreadyApplied = await Application.findOne({ jobId, candidateId: req.user.id });
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this position.' });
    }

    // Check if resume file is attached
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your resume file.' });
    }

    console.log(`Uploading resume to Cloudinary for candidate ${req.user.email}...`);
    // Upload buffer to Cloudinary
    const uploadResult = await uploadFromBuffer(req.file.buffer);
    const resumeUrl = uploadResult.secure_url;
    console.log('Cloudinary upload success. Secure URL:', resumeUrl);

    // Generate unique human-readable application ID
    const applicationId = 'APP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Save Application
    const newApplication = new Application({
      applicationId,
      jobId,
      candidateId: req.user.id,
      resumeaUrl: resumeUrl,
      status: 'applied',
    });

    await newApplication.save();

    return res.status(201).json({
      message: 'Application submitted successfully.',
      application: newApplication,
    });
  } catch (error: any) {
    console.error(`ApplyJob error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while submitting application.' });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    // Find applications and populate job details
    const applications = await Application.find({ candidateId: req.user.id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (error: any) {
    console.error(`GetMyApplications error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while fetching applications.' });
  }
};

export const getJobApplications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { jobId } = req.params;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found.' });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view applications for your own jobs.' });
    }

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ applications });
  } catch (error: any) {
    console.error(`GetJobApplications error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while fetching job applications.' });
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const { applicationId } = req.params; // The Mongoose Object _id
    const { status } = req.body;

    const validStatuses = ['applied', 'shortlisted', 'hired', 'rejected', 'underprocess'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const application = await Application.findById(applicationId)
      .populate('jobId')
      .populate('candidateId', 'name email');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    // Verify that the recruiter owns the job associated with this application
    const job = application.jobId as any;
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only update candidates for your own job postings.' });
    }

    application.status = status;
    await application.save();

    if (status === 'hired') {
      const candidate = application.candidateId as any;
      if (candidate && candidate.email) {
        try {
          await sendCandidateHiredEmail(candidate.email, candidate.name, job.title, job.company);
        } catch (mailErr: any) {
          console.error(`Error sending hired congrats email: ${mailErr.message}`);
        }
      }
    }

    return res.status(200).json({
      message: 'Candidate application status updated successfully.',
      application,
    });
  } catch (error: any) {
    console.error(`UpdateApplicationStatus error: ${error.message}`);
    return res.status(500).json({ message: 'Internal server error while updating status.' });
  }
};
