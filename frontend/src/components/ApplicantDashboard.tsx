import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, Search, X, Upload, FileText, CheckCircle } from 'lucide-react';
import type { Job } from './RecruiterDashboard';
import type { Application } from './ResponsesPage';

interface ApplicantDashboardProps {
  user: { name: string; email: string; role: string };
  jobs: Job[];
  myApplications: Application[];
  onApply: (application: Application) => void;
  onLogout: () => void;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  user,
  jobs,
  myApplications,
  onApply,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'applied'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');

  const appliedJobIds = new Set(myApplications.map((a) => a.jobId));

  const filteredJobs = jobs.filter((job) => {
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q)
    );
  });

  const handleApplyClick = (job: Job) => {
    setApplyingJob(job);
    setResumeFile(null);
    setResumeError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowed.includes(file.type)) {
        setResumeError('Only PDF or Word documents are accepted.');
        setResumeFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setResumeError('File size must be under 5MB.');
        setResumeFile(null);
        return;
      }
      setResumeError('');
      setResumeFile(file);
    }
  };

  const handleSubmitApplication = () => {
    if (!resumeFile) {
      setResumeError('Please upload your resume before submitting.');
      return;
    }
    if (!applyingJob) return;

    const application: Application = {
      id: Date.now().toString(),
      jobId: applyingJob.id,
      candidateName: user.name,
      candidateEmail: user.email,
      resumeName: resumeFile.name,
      appliedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    };
    onApply(application);
    setApplyingJob(null);
    setResumeFile(null);
    setActiveTab('applied');
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

      <main className="container" style={{ padding: '40px 24px' }}>
        <h1 className="page-title">Job Board</h1>
        <p className="page-subtitle">Browse open positions and apply with your resume.</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid var(--border-color)', marginBottom: '32px' }}>
          {(['browse', 'applied'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '12px 24px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--color-indigo)' : '2px solid transparent',
                marginBottom: '-2px',
                color: activeTab === tab ? 'var(--color-indigo)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'browse' ? `Browse Jobs (${jobs.length})` : `Applied Jobs (${myApplications.length})`}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <>
            {/* Search */}
            <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '24px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by job title, company or location..."
                style={{ paddingLeft: '38px' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredJobs.length === 0 ? (
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <Briefcase size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No jobs found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {searchQuery ? 'Try a different search term.' : 'No jobs have been posted yet. Check back later.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredJobs.map((job) => {
                  const hasApplied = appliedJobIds.has(job.id);
                  return (
                    <div key={job.id} className="dashboard-card" style={{ padding: '24px' }}>
                      <div className="flex align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div className="flex align-center" style={{ gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</h3>
                            {hasApplied && <span className="badge badge-success" style={{ fontSize: '11px' }}>Applied</span>}
                          </div>
                          <div className="flex align-center" style={{ gap: '20px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-indigo)' }}>{job.company}</span>
                            <span className="flex align-center" style={{ gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                              <MapPin size={13} /> {job.location}
                            </span>
                            {job.salary !== 'Not specified' && (
                              <span className="flex align-center" style={{ gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                <DollarSign size={13} /> {job.salary}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '700px' }}>
                            {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                          </p>
                          {job.requirements && (
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                              <strong>Requirements:</strong> {job.requirements.length > 120 ? job.requirements.substring(0, 120) + '...' : job.requirements}
                            </p>
                          )}
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {hasApplied ? (
                            <button className="btn btn-secondary" disabled style={{ cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <CheckCircle size={14} style={{ color: 'var(--color-teal)' }} /> Applied
                            </button>
                          ) : (
                            <button className="btn btn-primary" onClick={() => handleApplyClick(job)}>
                              Apply Now
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Posted on {job.postedAt}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Applied Jobs Tab */}
        {activeTab === 'applied' && (
          <>
            {myApplications.length === 0 ? (
              <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
                <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No applications yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Start applying to jobs to track them here.
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTab('browse')}>Browse Jobs</button>
              </div>
            ) : (
              <div className="table-container">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Job Title</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Resume Uploaded</th>
                      <th>Applied On</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map((app) => {
                      const job = jobs.find((j) => j.id === app.jobId);
                      return (
                        <tr key={app.id}>
                          <td style={{ fontWeight: 600 }}>{job?.title ?? 'Unknown Job'}</td>
                          <td style={{ color: 'var(--color-indigo)', fontWeight: 500 }}>{job?.company ?? '—'}</td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            <span className="flex align-center" style={{ gap: '4px' }}>
                              <MapPin size={12} /> {job?.location ?? '—'}
                            </span>
                          </td>
                          <td>
                            <span className="flex align-center" style={{ gap: '6px' }}>
                              <FileText size={13} style={{ color: 'var(--color-indigo)' }} />
                              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{app.resumeName}</span>
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{app.appliedAt}</td>
                          <td><span className="badge badge-info">Under Review</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Apply Modal */}
      {applyingJob && (
        <div className="modal-overlay" onClick={() => setApplyingJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setApplyingJob(null)}><X size={20} /></button>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Apply for this Position
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-indigo)', fontWeight: 500, marginBottom: '4px' }}>
              {applyingJob.title}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {applyingJob.company} · {applyingJob.location}
            </p>

            {/* Applicant Info (pre-filled) */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applying As</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{user.email}</div>
            </div>

            {/* Resume Upload */}
            <div className="form-group">
              <label className="form-label">Upload Resume <span style={{ color: '#ef4444' }}>*</span></label>
              <label htmlFor="resume-upload" style={{ cursor: 'pointer', display: 'block' }}>
                <div className={`file-upload-box ${resumeFile ? 'border-color: var(--color-teal)' : ''}`} style={{
                  borderColor: resumeFile ? 'var(--color-teal)' : undefined,
                  background: resumeFile ? '#f0fdf4' : undefined
                }}>
                  {resumeFile ? (
                    <div className="flex align-center justify-center" style={{ gap: '10px' }}>
                      <FileText size={24} style={{ color: 'var(--color-teal)' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-teal)' }}>{resumeFile.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {(resumeFile.size / 1024).toFixed(1)} KB · Click to change
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                      <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Click to upload your resume
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        PDF or Word · Max 5MB
                      </div>
                    </>
                  )}
                </div>
              </label>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {resumeError && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{resumeError}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex" style={{ gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setApplyingJob(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitApplication}>Submit Application</button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
