import React, { useState } from 'react';
import { X, CheckCircle, RefreshCw, AlertCircle, FileText, Send } from 'lucide-react';

export default function SubmissionReviewModal({ isOpen, onClose, task, authUser, onReviewSubmission, onSubmitTask }) {
  const [feedback, setFeedback] = useState('');
  const [newRestartDeadline, setNewRestartDeadline] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  if (!isOpen || !task) return null;

  const authEmpId = (authUser?.employeeId || '').trim();
  const authId = (authUser?.id || '').trim();
  const authName = (authUser?.name || '').trim().toLowerCase();

  const taskAssigneeId = (task.assigneeId || '').trim();
  const taskAssigneeName = (task.assigneeName || '').trim().toLowerCase();
  const taskCreatorId = (task.creatorId || '').trim();
  const taskCreatorName = (task.creatorName || '').trim().toLowerCase();

  // Is current logged-in user the assignee on this specific task?
  const isAssignee =
    (authId && taskAssigneeId === authId) ||
    (authEmpId && taskAssigneeId === authEmpId) ||
    (authName && taskAssigneeName === authName);

  // Is current logged-in user the creator/assigner on this specific task?
  const isCreator =
    (authId && taskCreatorId === authId) ||
    (authEmpId && taskCreatorId === authEmpId) ||
    (authName && taskCreatorName === authName);

  // Is current user Super Admin?
  const isSuperAdmin =
    authUser?.role === 'superAdmin' ||
    ['10001', '24051', '17572', '001'].includes(authEmpId) ||
    ['usr-0', 'usr-10001', 'usr-24051'].includes(authId);

  // Can current user submit work on this task?
  const canSubmitWork = isAssignee || (!isCreator && !isSuperAdmin);

  // Can current user review/approve this task?
  const canReviewWork = isCreator || isSuperAdmin;

  const handleFacultySubmitWork = (e) => {
    e.preventDefault();
    if (onSubmitTask) {
      onSubmitTask(task.id, submissionNotes);
    }
    setSubmissionNotes('');
    onClose();
  };

  const handleApprove = () => {
    onReviewSubmission(task.id, true, `Approved by ${authUser?.name || 'Assigner'}`);
    onClose();
  };

  const handleReissue = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please provide feedback explaining why the task is being re-issued.');
      return;
    }
    onReviewSubmission(task.id, false, feedback, newRestartDeadline);
    onClose();
  };

  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="modal-card" style={{
        width: '100%', maxWidth: '620px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <CheckCircle size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                {canSubmitWork && !canReviewWork ? 'Submit Completed Task Work' : 'Review Task Submission'}
              </h3>
              <p style={{ fontSize: '11px', color: '#a7f3d0', margin: 0 }}>Task: {task.id} • {task.title}</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px' }}>
            <div style={{ fontWeight: '700', color: '#1e293b' }}>Description:</div>
            <div style={{ color: '#475569' }}>{task.description}</div>
            <div style={{ marginTop: '6px', color: '#64748b' }}>
              <strong>Assignee:</strong> {task.assigneeName} • <strong>Assigned By:</strong> {task.creatorName || 'Super Admin'} • <strong>Stage:</strong> {task.stage}
            </div>
          </div>

          {/* Submit Work Form (For Assignee) */}
          {canSubmitWork && (
            <form onSubmit={handleFacultySubmitWork} style={{ marginBottom: canReviewWork ? '24px' : '0' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Submission Notes & Deliverables Summary
                </label>
                <textarea
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder={`Describe your completed work, links, or deliverables for ${task.creatorName || 'Assigner / Super Admin'}...`}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#059669', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Send size={15} /> Submit for Review to {task.creatorName || 'Assigner'}
              </button>
            </form>
          )}

          {/* Assigner / Super Admin Review Form */}
          {canReviewWork && (
            <div style={{ marginTop: canSubmitWork ? '16px' : '0', borderTop: canSubmitWork ? '1px dashed #cbd5e1' : 'none', paddingTop: canSubmitWork ? '16px' : '0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
                Reviewer Action ({authUser?.name || 'Assigner'})
              </h4>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleApprove}
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <CheckCircle size={16} /> Accept & Approve Task
                </button>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <h5 style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <RefreshCw size={14} /> Re-issue Task with Revision Feedback
                </h5>

                <form onSubmit={handleReissue}>
                  <div style={{ marginBottom: '10px' }}>
                    <textarea
                      rows={3}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Provide revision instructions (e.g. Please format syllabus according to OBE guidelines)..."
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>New Restart Due Date (Optional)</label>
                    <input
                      type="date"
                      value={newRestartDeadline}
                      onChange={(e) => setNewRestartDeadline(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#dc2626', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Re-issue Task to Assignee ({task.assigneeName})
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
