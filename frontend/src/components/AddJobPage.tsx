import React, { useState } from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';
import type { Job } from './RecruiterDashboard';

interface AddJobPageProps {
  user: { name: string; email: string; role: string };
  onJobAdded: (job: Job) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const AddJobPage: React.FC<AddJobPageProps> = ({ user, onJobAdded, onBack, onLogout }) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [jobType, setJobType] = useState('Full-time');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !location || !description) {
      alert('Please fill all required fields.');
      return;
    }
    const newJob: Job = {
      id: Date.now().toString(),
      title,
      company,
      location,
      salary: salary || 'Not specified',
      description,
      requirements,
      postedBy: user.email,
      postedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    onJobAdded(newJob);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Header */}
      <header className="app-header">
        <div className="container flex align-center justify-between app-navbar">
          <div className="flex align-center" style={{ gap: '10px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '8px',
              background: 'var(--color-indigo)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <Briefcase size={18} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '18px' }}>RecruitOS</span>
          </div>
          <div className="flex align-center" style={{ gap: '16px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Hi, <strong style={{ color: 'var(--text-primary)' }}>{user.name}</strong>
            </span>
            <button className="btn btn-outline btn-sm" onClick={onLogout}>Log Out</button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '40px 24px', maxWidth: '760px' }}>
        {/* Back button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <h1 className="page-title">Post a New Job</h1>
        <p className="page-subtitle">Fill in the details below to publish a new job opening.</p>

        <div className="dashboard-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            {/* Row 1: Title + Company */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Job Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior React Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Row 2: Location + Salary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Location <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Remote / Mumbai, India"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. ₹8–12 LPA or $80,000/yr"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: Job Type */}
            <div className="form-group">
              <label className="form-label">Job Type</label>
              <select
                className="form-select"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Freelance</option>
              </select>
            </div>

            {/* Row 4: Description */}
            <div className="form-group">
              <label className="form-label">Job Description <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea
                className="form-textarea"
                placeholder="Describe the role, responsibilities, and what the candidate will do day-to-day..."
                style={{ minHeight: '120px' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Row 5: Requirements */}
            <div className="form-group">
              <label className="form-label">Requirements & Skills</label>
              <textarea
                className="form-textarea"
                placeholder="List required qualifications, technologies, or experience (one per line)..."
                style={{ minHeight: '100px' }}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onBack}>Cancel</button>
              <button type="submit" className="btn btn-primary">Publish Job</button>
            </div>
          </form>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
