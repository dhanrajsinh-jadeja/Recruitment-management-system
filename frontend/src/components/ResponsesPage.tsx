import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, FileText, User, Mail, Calendar, Upload, UserCheck } from 'lucide-react';
import type { Job } from './RecruiterDashboard';
import type { InterviewRound } from '../App';

export interface Application {
  id: string;
  jobId: string;
  applicationId: string; // The generated unique application ID (APP-XXXXX)
  candidateName: string;
  candidateEmail: string;
  resumeName: string;
  resumeaUrl: string; // Cloudinary URL
  status: 'applied' | 'shortlisted' | 'hired' | 'rejected' | 'underprocess';
  appliedAt: string;
}

export interface CandidateResult {
  candidateId: string;
  jobId: string;
  applicationId: string;
  roundNumber: number;
  result: 'pass' | 'fail';
  remarks?: string;
}

interface ResponsesPageProps {
  user: { name: string; email: string; role: string };
  job: Job | undefined;
  applications: Application[];
  rounds: InterviewRound[];
  roundResults: CandidateResult[];
  onBack: () => void;
  onLogout: () => void;
  onUpdateStatus: (applicationId: string, newStatus: string) => void;
  onSubmitResult: (applicationId: string, roundNumber: number, result: 'pass' | 'fail', remarks: string) => void;
  onBulkUploadResults: (
    jobId: string,
    roundNumber: number,
    csvFile: File,
    onSuccess: () => void,
    onError: (err: string) => void
  ) => void;
  onNotifyPassed: (
    jobId: string,
    roundNumber: number,
    onSuccess: (sentCount: number) => void,
    onError: (err: string) => void
  ) => void;
}

export const ResponsesPage: React.FC<ResponsesPageProps> = ({
  user,
  job,
  applications,
  rounds,
  roundResults,
  onBack,
  onLogout,
  onUpdateStatus,
  onSubmitResult,
  onBulkUploadResults,
  onNotifyPassed,
}) => {
  const [editingRoundKey, setEditingRoundKey] = useState<string | null>(null); // "applicationId-roundNumber"
  const [gradeResult, setGradeResult] = useState<'pass' | 'fail'>('pass');
  const [remarksText, setRemarksText] = useState('');

  // Bulk CSV upload state
  const [selectedRoundNum, setSelectedRoundNum] = useState<number>(1);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [notifyingPassed, setNotifyingPassed] = useState(false);

  const handleNotifyPassed = () => {
    if (!job) return;
    setNotifyingPassed(true);
    setUploadMessage(null);

    onNotifyPassed(
      job.id,
      selectedRoundNum,
      (count) => {
        setNotifyingPassed(false);
        setUploadMessage({
          text: `Success: Sent passed notification emails to ${count} candidate(s) for Round ${selectedRoundNum}!`,
          type: 'success',
        });
      },
      (err) => {
        setNotifyingPassed(false);
        setUploadMessage({ text: err || 'An error occurred while sending emails.', type: 'error' });
      }
    );
  };

  // Set default round number once rounds are loaded
  useEffect(() => {
    if (rounds.length > 0) {
      setSelectedRoundNum(rounds[0].roundNumber || 1);
    }
  }, [rounds]);

  if (!job) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>Job not found.</p>
        <button className="btn btn-secondary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return { text: 'Applied', style: { backgroundColor: '#fef3c7', color: '#92400e' } }; // Orange/Amber
      case 'underprocess':
        return { text: 'Under Process', style: { backgroundColor: '#e0f2fe', color: '#0369a1' } }; // Blue
      case 'shortlisted':
        return { text: 'Shortlisted', style: { backgroundColor: '#e0e7ff', color: '#3730a3' } }; // Indigo
      case 'rejected':
        return { text: 'Rejected', style: { backgroundColor: '#fecaca', color: '#991b1b' } }; // Red
      case 'hired':
        return { text: 'Hired', style: { backgroundColor: '#d1fae5', color: '#065f46' } }; // Green
      default:
        return { text: status, style: { backgroundColor: '#f1f5f9', color: '#334155' } }; // Slate
    }
  };

  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setUploadMessage({ text: 'Only CSV files are accepted.', type: 'error' });
        setCSVFile(null);
        return;
      }
      setCSVFile(file);
      setUploadMessage(null);
    }
  };

  const handleCSVSubmit = () => {
    if (!csvFile) return;
    setUploadingCSV(true);
    setUploadMessage(null);

    onBulkUploadResults(
      job.id,
      selectedRoundNum,
      csvFile,
      () => {
        setUploadingCSV(false);
        setCSVFile(null);
        setUploadMessage({ text: 'CSV uploaded and candidate statuses updated successfully!', type: 'success' });
        // Reset file input
        const fileInput = document.getElementById('bulk-csv-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      (err) => {
        setUploadingCSV(false);
        setUploadMessage({ text: err || 'An error occurred during file upload.', type: 'error' });
      }
    );
  };

  const maxRoundNumber = rounds.length > 0 ? Math.max(...rounds.map((r, index) => r.roundNumber || (index + 1))) : 0;

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
        {/* Back + Title */}
        <button
          className="btn btn-outline btn-sm"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px' }}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {/* Job Summary Card */}
        <div className="dashboard-card" style={{ marginBottom: '32px', padding: '24px' }}>
          <div className="flex align-center justify-between">
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {job.title}
              </h1>
              <div className="flex align-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{job.company}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📍 {job.location}</span>
                {job.salary !== 'Not specified' && (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>💰 {job.salary}</span>
                )}
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>📅 Posted {job.postedAt}</span>
              </div>
            </div>
            <span className={`badge ${applications.length > 0 ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
              {applications.length} {applications.length === 1 ? 'Applicant' : 'Applicants'}
            </span>
          </div>
        </div>

        {/* Bulk Upload CSV Card */}
        {rounds.length > 0 && (
          <div className="dashboard-card" style={{ marginBottom: '32px', padding: '24px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Bulk Evaluate Interview Rounds via CSV
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Upload a CSV file containing <code>applicationId</code>s of candidates who passed a particular round. They will be marked as **Passed** in that round.
            </p>
            
            <div className="flex align-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
              {/* Select Round */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Select Round:</span>
                <select
                  value={selectedRoundNum}
                  onChange={(e) => setSelectedRoundNum(parseInt(e.target.value, 10))}
                  className="form-select"
                  style={{ width: '240px', height: '38px', padding: '6px 12px' }}
                >
                  {rounds.map((r, index) => (
                    <option key={r.id} value={r.roundNumber || (index + 1)}>
                      Round {r.roundNumber || (index + 1)}: {r.roundName}
                    </option>
                  ))}
                </select>
              </div>

              {/* File input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Upload CSV File:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVFileChange}
                    style={{ display: 'none' }}
                    id="bulk-csv-upload"
                  />
                  <label htmlFor="bulk-csv-upload" className="btn btn-secondary" style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Upload size={14} /> {csvFile ? csvFile.name : 'Choose CSV File'}
                  </label>
                  {csvFile && (
                    <button className="btn btn-outline" onClick={() => setCSVFile(null)} style={{ height: '38px', padding: '6px 12px', color: '#ef4444' }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Submit button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-end', height: '58px' }}>
                <button
                  className="btn btn-primary"
                  onClick={handleCSVSubmit}
                  disabled={!csvFile || uploadingCSV}
                  style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {uploadingCSV ? 'Processing...' : 'Upload CSV Results'}
                </button>
              </div>

              {/* Notify Passed Candidates button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'flex-end', height: '58px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleNotifyPassed}
                  disabled={notifyingPassed}
                  style={{
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderColor: 'var(--color-teal)',
                    color: 'var(--color-teal)',
                    background: '#f0fdf4',
                  }}
                >
                  {notifyingPassed ? 'Sending Emails...' : 'Send Pass Notification Emails'}
                </button>
              </div>
            </div>

            {uploadMessage && (
              <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '13.5px',
                background: uploadMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: uploadMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                color: uploadMessage.type === 'success' ? '#15803d' : '#b91c1c'
              }}>
                {uploadMessage.text}
              </div>
            )}
          </div>
        )}

        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px' }}>
          Candidate Applications
        </h2>

        {applications.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <User size={40} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>No applications yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Candidates haven't applied to this job yet. Check back later.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {applications.map((app, idx) => {
              const badge = getStatusBadge(app.status);
              const passedLastRound = maxRoundNumber > 0 && roundResults.some(
                (r) => r.applicationId === app.applicationId && r.roundNumber === maxRoundNumber && r.result === 'pass'
              );
              return (
                <div key={app.id} className="dashboard-card" style={{ padding: '24px' }}>
                  <div className="flex align-center justify-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                    {/* Candidate Info */}
                    <div className="flex align-center" style={{ gap: '16px' }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'var(--color-sky-bg)', color: 'var(--color-indigo)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '16px', flexShrink: 0
                      }}>
                        {app.candidateName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex align-center" style={{ gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
                            {app.candidateName}
                          </span>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            fontWeight: 'bold'
                          }}>
                            {app.applicationId}
                          </span>
                          <span className="badge" style={badge.style}>
                            {badge.text}
                          </span>
                        </div>
                        <div className="flex align-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
                          <span className="flex align-center" style={{ gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <Mail size={12} /> {app.candidateEmail}
                          </span>
                          <span className="flex align-center" style={{ gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            <Calendar size={12} /> Applied on {app.appliedAt}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Resume & Status Update */}
                    <div className="flex align-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
                      {/* Status Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Update Status:</span>
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value as any)}
                          className="form-select"
                          style={{ padding: '6px 10px', fontSize: '13px', width: '130px', height: '34px' }}
                        >
                          <option value="applied">Applied</option>
                          <option value="underprocess">Under Process</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

                      {/* Resume Download */}
                      <div className="flex align-center" style={{ gap: '8px' }}>
                        <a
                          href={app.resumeaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '34px', textDecoration: 'none' }}
                          title="View Resume"
                        >
                          <FileText size={14} style={{ color: 'var(--color-indigo)' }} /> View Resume
                        </a>
                      </div>

                      {/* Hire Candidate Button */}
                      {passedLastRound && app.status !== 'hired' && app.status !== 'rejected' && (
                        <div className="flex align-center" style={{ gap: '8px' }}>
                          <button
                            className="btn btn-sm"
                            onClick={() => onUpdateStatus(app.id, 'hired')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              height: '34px',
                              backgroundColor: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '0 12px',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          >
                            <UserCheck size={14} /> Hire Candidate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interview Rounds Evaluation */}
                  {rounds.length > 0 && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                        Interview Rounds Evaluation
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {rounds.map((round, rIdx) => {
                          const roundNumber = round.roundNumber || (rIdx + 1);
                          const savedResult = roundResults.find(
                            (r) => r.applicationId === app.applicationId && r.roundNumber === roundNumber
                          );
                          const isEditing = editingRoundKey === `${app.applicationId}-${roundNumber}`;

                          return (
                            <div key={round.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              background: '#f8fafc', border: '1px solid var(--border-color)',
                              borderRadius: '6px', padding: '12px 16px', flexWrap: 'wrap', gap: '12px'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-primary)' }}>
                                  {round.roundName}
                                </div>
                                {savedResult ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span className={`badge ${savedResult.result === 'pass' ? 'badge-success' : 'badge-danger'}`}
                                            style={{
                                              fontSize: '11px',
                                              backgroundColor: savedResult.result === 'pass' ? undefined : '#fee2e2',
                                              color: savedResult.result === 'pass' ? undefined : '#b91c1c'
                                            }}>
                                        {savedResult.result === 'pass' ? 'Passed ✅' : 'Failed ❌'}
                                      </span>
                                    </div>
                                    {savedResult.remarks && (
                                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                        Remarks: "{savedResult.remarks}"
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                                    Not evaluated yet
                                  </div>
                                )}
                              </div>

                              <div>
                                {isEditing ? (
                                  <div className="flex align-center" style={{ gap: '10px', flexWrap: 'wrap' }}>
                                    <select
                                      value={gradeResult}
                                      onChange={(e) => setGradeResult(e.target.value as 'pass' | 'fail')}
                                      className="form-select"
                                      style={{ padding: '4px 8px', fontSize: '12px', width: '90px', height: '30px' }}
                                    >
                                      <option value="pass">Pass</option>
                                      <option value="fail">Fail</option>
                                    </select>
                                    <input
                                      type="text"
                                      placeholder="Remarks (optional)"
                                      value={remarksText}
                                      onChange={(e) => setRemarksText(e.target.value)}
                                      className="form-input"
                                      style={{ padding: '4px 8px', fontSize: '12px', width: '160px', height: '30px' }}
                                    />
                                    <button
                                      className="btn btn-primary btn-sm"
                                      style={{ height: '30px', padding: '4px 10px', fontSize: '12px' }}
                                      onClick={() => {
                                        onSubmitResult(app.applicationId, roundNumber, gradeResult, remarksText);
                                        setEditingRoundKey(null);
                                      }}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="btn btn-secondary btn-sm"
                                      style={{ height: '30px', padding: '4px 10px', fontSize: '12px' }}
                                      onClick={() => setEditingRoundKey(null)}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="btn btn-outline btn-sm"
                                    style={{ height: '30px', padding: '4px 10px', fontSize: '12px' }}
                                    onClick={() => {
                                      setEditingRoundKey(`${app.applicationId}-${roundNumber}`);
                                      setGradeResult(savedResult?.result || 'pass');
                                      setRemarksText(savedResult?.remarks || '');
                                    }}
                                  >
                                    {savedResult ? 'Edit Grade' : 'Evaluate'}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Applicant number label */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <span className="badge badge-info">Applicant #{idx + 1}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <div className="container">© {new Date().getFullYear()} RecruitOS. All rights reserved.</div>
      </footer>
    </div>
  );
};
