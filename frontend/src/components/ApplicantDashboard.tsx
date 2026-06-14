import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, IndianRupee, Search, X, Upload, FileText, CheckCircle, Calendar, Clock, Info } from 'lucide-react';
import type { Job } from './RecruiterDashboard';
import type { Application, CandidateResult } from './ResponsesPage';
import type { InterviewRound } from '../App';
import { API_BASE_URL } from '../config';

interface ApplicantDashboardProps {
  user: { name: string; email: string; role: string };
  jobs: Job[];
  myApplications: Application[];
  interviews: Record<string, InterviewRound[]>;
  roundResults: CandidateResult[];
  onApply: (application: Application) => void;
  onLogout: () => void;
}

export const ApplicantDashboard: React.FC<ApplicantDashboardProps> = ({
  user,
  jobs,
  myApplications,
  roundResults,
  onApply,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'applied'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState('');
  const [viewingScheduleJobId, setViewingScheduleJobId] = useState<string | null>(null);
  const [scheduleRounds, setScheduleRounds] = useState<InterviewRound[]>([]);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [submittingApply, setSubmittingApply] = useState(false);

  useEffect(() => {
    if (viewingScheduleJobId) {
      setLoadingRounds(true);
      fetch(`${API_BASE_URL}/api/jobs/${viewingScheduleJobId}/rounds`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch rounds');
          return res.json();
        })
        .then((data) => {
          const mapped = data.rounds.map((r: any) => ({
            id: r._id,
            roundNumber: r.roundNumber,
            roundName: r.roundName,
            dateTime: r.dateTime,
            resultDeclaration: r.resultDeclaration,
            isOnline: r.isOnline,
            interviewLink: r.interviewLink || '',
          }));
          setScheduleRounds(mapped);
        })
        .catch((err) => {
          console.error(err);
          setScheduleRounds([]);
        })
        .finally(() => {
          setLoadingRounds(false);
        });
    } else {
      setScheduleRounds([]);
    }
  }, [viewingScheduleJobId]);

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

    const token = localStorage.getItem('rms_token');
    if (!token) {
      alert('Your session has expired. Please log in again.');
      onLogout();
      return;
    }

    setSubmittingApply(true);
    setResumeError('');

    const formData = new FormData();
    formData.append('jobId', applyingJob.id);
    formData.append('resume', resumeFile);

    fetch(`${API_BASE_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            throw new Error(errData.message || 'Failed to submit application');
          });
        }
        return res.json();
      })
      .then((data) => {
        const app = data.application;
        // Map back to frontend Application layout
        const clientApp: Application = {
          id: app._id,
          applicationId: app.applicationId,
          jobId: app.jobId,
          candidateName: user.name,
          candidateEmail: user.email,
          resumeName: resumeFile.name,
          resumeaUrl: app.resumeaUrl,
          appliedAt: new Date(app.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          status: app.status,
        };

        onApply(clientApp);
        setApplyingJob(null);
        setResumeFile(null);
        setActiveTab('applied');
        alert('Application submitted successfully!');
      })
      .catch((err) => {
        setResumeError(err.message || 'An error occurred during submission.');
      })
      .finally(() => {
        setSubmittingApply(false);
      });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <span className="badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Applied</span>;
      case 'underprocess':
        return <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>Under Process</span>;
      case 'shortlisted':
        return <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#3730a3' }}>Shortlisted</span>;
      case 'rejected':
        return <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>Rejected</span>;
      case 'hired':
        return <span className="badge" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Hired</span>;
      default:
        return <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>{status}</span>;
    }
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
                                <IndianRupee size={13} /> {job.salary}
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
                      <th>Interview Schedule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myApplications.map((app) => {
                      const job = jobs.find((j) => j.id === app.jobId);
                      const hasFailedRound = roundResults.some(
                        (r) => r.applicationId === app.applicationId && r.result === 'fail'
                      );

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
                              <a
                                href={app.resumeaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '13px', color: 'var(--color-indigo)', textDecoration: 'none' }}
                                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                                title="View Resume"
                              >
                                {app.resumeName}
                              </a>
                            </span>
                          </td>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{app.appliedAt}</td>
                          <td>
                            {hasFailedRound || app.status === 'rejected' ? (
                              <span className="badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontWeight: 'bold' }}>
                                Failed & Rejected
                              </span>
                            ) : (
                              getStatusBadge(app.status)
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                              onClick={() => setViewingScheduleJobId(app.jobId)}
                            >
                              <Calendar size={13} /> View Schedule
                            </button>
                          </td>
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
              <button className="btn btn-secondary" onClick={() => setApplyingJob(null)} disabled={submittingApply}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmitApplication} disabled={submittingApply}>
                {submittingApply ? 'Uploading...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {viewingScheduleJobId && (() => {
        const scheduleJob = jobs.find((j) => j.id === viewingScheduleJobId);
        const rounds = scheduleRounds;
        const formatDateTime = (dtStr: string) => {
          try {
            const date = new Date(dtStr);
            return date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });
          } catch {
            return dtStr;
          }
        };

        return (
          <div className="modal-overlay" onClick={() => { setViewingScheduleJobId(null); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
              <button className="modal-close" onClick={() => { setViewingScheduleJobId(null); }}><X size={20} /></button>

              <div className="flex align-center justify-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    Interview Process & Rounds
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--color-indigo)', fontWeight: 600 }}>
                    {scheduleJob?.title} · {scheduleJob?.company}
                  </p>
                </div>
              </div>

              {loadingRounds ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="flex align-center justify-center" style={{ gap: '8px', color: 'var(--text-secondary)' }}>
                    <Clock size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Loading interview schedule...</span>
                  </div>
                </div>
              ) : rounds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Calendar size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', maxWidth: '400px', margin: '0 auto' }}>
                    All applications for this job are shortlisted. However, the recruiting team has not scheduled any interview rounds yet. Please check back later.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '16px', position: 'relative' }}>
                  {/* Vertical line connecting nodes */}
                  <div style={{
                    position: 'absolute', left: '27px', top: '12px', bottom: '12px',
                    width: '2px', background: 'var(--border-color)', zIndex: 0
                  }}></div>

                  {rounds.map((round, index) => {
                    const roundNumber = round.roundNumber || (index + 1);
                    const matchingApp = myApplications.find((a) => a.jobId === viewingScheduleJobId);
                    const savedResult = matchingApp
                      ? roundResults.find(
                        (r) => r.applicationId === matchingApp.applicationId && r.roundNumber === roundNumber
                      )
                      : null;

                    let nodeBg = 'var(--color-indigo)';
                    if (savedResult) {
                      nodeBg = savedResult.result === 'pass' ? 'var(--color-teal)' : '#ef4444';
                    } else if (matchingApp && matchingApp.status === 'rejected') {
                      nodeBg = '#ef4444';
                    }

                    return (
                      <div key={round.id} className="flex" style={{ gap: '20px', position: 'relative', zIndex: 1 }}>
                        {/* Round indicator node */}
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: nodeBg,
                          color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, flexShrink: 0
                        }}>
                          {index + 1}
                        </div>

                        {/* Details Box */}
                        <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', flex: 1 }}>
                          <div className="flex align-center justify-between" style={{ marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {round.roundName}
                            </h4>
                            <span className={`badge ${round.isOnline ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px' }}>
                              {round.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span className="flex align-center" style={{ gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <Clock size={13} style={{ color: 'var(--color-indigo)' }} />
                              {formatDateTime(round.dateTime)}
                            </span>
                            <span className="flex align-center" style={{ gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                              <Info size={13} style={{ color: 'var(--color-teal)' }} />
                              <strong>Results:</strong> {round.resultDeclaration}
                            </span>

                            {(() => {
                              const roundNumber = round.roundNumber || (index + 1);
                              const matchingApp = myApplications.find((a) => a.jobId === viewingScheduleJobId);
                              const savedResult = matchingApp
                                ? roundResults.find(
                                  (r) => r.applicationId === matchingApp.applicationId && r.roundNumber === roundNumber
                                )
                                : null;

                              if (savedResult) {
                                return (
                                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div className="flex align-center" style={{ gap: '6px' }}>
                                      <span className={`badge ${savedResult.result === 'pass' ? 'badge-success' : 'badge-danger'}`}
                                        style={{
                                          fontSize: '11px',
                                          backgroundColor: savedResult.result === 'pass' ? undefined : '#fee2e2',
                                          color: savedResult.result === 'pass' ? undefined : '#b91c1c'
                                        }}>
                                        Status: {savedResult.result === 'pass' ? 'Passed ✅' : 'Failed ❌'}
                                      </span>
                                    </div>
                                    {savedResult.remarks && (
                                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                        Remarks: "{savedResult.remarks}"
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              if (matchingApp && matchingApp.status === 'rejected') {
                                return (
                                  <div style={{ marginTop: '6px' }}>
                                    <span className="badge badge-danger"
                                      style={{
                                        fontSize: '11px',
                                        backgroundColor: '#fee2e2',
                                        color: '#b91c1c'
                                      }}>
                                      Status: Failed ❌
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <div style={{ marginTop: '6px' }}>
                                  <span className="badge badge-info" style={{ fontSize: '11px' }}>
                                    Status: Pending Evaluation ⏳
                                  </span>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Online instructions */}
                          {round.isOnline && (!savedResult || savedResult.result !== 'pass') && (
                            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
                              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                💻 <strong>Online Round:</strong> The interview joining link will be shared via email before the session starts.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="flex" style={{ gap: '12px', justifyContent: 'flex-end', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button className="btn btn-primary" onClick={() => { setViewingScheduleJobId(null); }}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
