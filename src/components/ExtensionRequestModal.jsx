import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle2, XCircle, Send, Check, RefreshCw } from 'lucide-react';
import { formatDueDateWithDayTime } from '../data/initialData';

export default function ExtensionRequestModal({ isOpen, onClose, task, authUser, onRequestExtension, onApproveExtension }) {
  const [reason, setReason] = useState('');
  const [requestedDeadline, setRequestedDeadline] = useState('');
  const [customSupervisorDeadline, setCustomSupervisorDeadline] = useState('');

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

  const canRequestExtension = isAssignee || (!isCreator && !isSuperAdmin);
  const canApproveExtension = isCreator || isSuperAdmin;

  const existingExtensions = task.extensions || [];

  const handleApplyRequest = (e) => {
    e.preventDefault();
    if (!reason.trim() || !requestedDeadline) {
      alert('Please provide a valid reason and target deadline');
      return;
    }

    const newExt = {
      id: `ext-${Date.now()}`,
      reason: reason.trim(),
      requestedDeadline,
      requestedDate: requestedDeadline,
      requestedAt: new Date().toISOString(),
      status: 'PENDING'
    };

    onRequestExtension(task.id, newExt);
    setReason('');
    setRequestedDeadline('');
    onClose();
  };

  const handleQuickAddHours = (hours, isSupervisor = false) => {
    const currentTarget = isSupervisor 
      ? (customSupervisorDeadline ? new Date(customSupervisorDeadline) : new Date(task.dueDate || new Date()))
      : (requestedDeadline ? new Date(requestedDeadline) : new Date(task.dueDate || new Date()));
    
    const newDate = new Date(currentTarget.getTime() + hours * 60 * 60 * 1000);
    const isoString = new Date(newDate.getTime() - newDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    if (isSupervisor) {
      setCustomSupervisorDeadline(isoString);
    } else {
      setRequestedDeadline(isoString);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '12px'
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: '560px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Deadline Extension & Re-issue Management
              </h3>
              <p style={{ fontSize: '11px', color: '#fef3c7', margin: 0 }}>
                {task.id} • Current Due: <strong>{formatDueDateWithDayTime(task.dueDate, task.dueTime)}</strong>
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Form & History Body */}
        <div style={{ padding: '18px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Task Info Pill */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#92400e' }}>
            <div><strong>Task:</strong> {task.title}</div>
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#b45309' }}>
              <strong>Assigned To:</strong> {task.assigneeName} • <strong>Assigned By:</strong> {task.creatorName || 'Super Admin'} • <strong>Stage:</strong> {task.stage}
            </div>
          </div>

          {/* Supervisor / HOD Direct Custom Due Date Grant */}
          {canApproveExtension && (
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={15} color="#2563eb" />
                  <span>Grant Direct Deadline Extension</span>
                </h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => handleQuickAddHours(24, true)} style={{ padding: '3px 6px', fontSize: '11px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+24h</button>
                  <button type="button" onClick={() => handleQuickAddHours(48, true)} style={{ padding: '3px 6px', fontSize: '11px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+48h</button>
                  <button type="button" onClick={() => handleQuickAddHours(72, true)} style={{ padding: '3px 6px', fontSize: '11px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+3d</button>
                  <button type="button" onClick={() => handleQuickAddHours(168, true)} style={{ padding: '3px 6px', fontSize: '11px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+1w</button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="datetime-local"
                  value={customSupervisorDeadline}
                  onChange={(e) => setCustomSupervisorDeadline(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customSupervisorDeadline) {
                      alert('Please select a new deadline timestamp first.');
                      return;
                    }
                    onApproveExtension(task.id, 'direct-supervisor-grant', customSupervisorDeadline);
                    onClose();
                  }}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <CheckCircle2 size={15} /> Apply
                </button>
              </div>
            </div>
          )}

          {/* Existing Extensions List */}
          {existingExtensions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                Pending & Past Extension Requests
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {existingExtensions.map((e) => (
                  <div key={e.id} style={{ padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>
                        Target Date: {e.requestedDeadline || e.requestedDate}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '10px', fontWeight: '700', fontSize: '10px',
                        background: e.status === 'APPROVED' ? '#dcfce7' : e.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                        color: e.status === 'APPROVED' ? '#15803d' : e.status === 'REJECTED' ? '#b91c1c' : '#a16207'
                      }}>
                        {e.status}
                      </span>
                    </div>

                    <div style={{ color: '#475569', fontSize: '12px', marginBottom: '8px', lineHeight: '1.4' }}>
                      <strong>Reason:</strong> {e.reason}
                    </div>

                    {canApproveExtension && e.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => onApproveExtension(task.id, e.id, e.requestedDeadline || e.requestedDate)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
                        >
                          <CheckCircle2 size={15} /> Approve New Deadline ({e.requestedDeadline || e.requestedDate})
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extension Request Form (Available to Assignee on this task) */}
          {canRequestExtension && (
            <form onSubmit={handleApplyRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  Submit New Extension Request
                </h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => handleQuickAddHours(24)} style={{ padding: '2px 6px', fontSize: '10.5px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+24h</button>
                  <button type="button" onClick={() => handleQuickAddHours(48)} style={{ padding: '2px 6px', fontSize: '10.5px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+48h</button>
                  <button type="button" onClick={() => handleQuickAddHours(72)} style={{ padding: '2px 6px', fontSize: '10.5px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+3 Days</button>
                  <button type="button" onClick={() => handleQuickAddHours(168)} style={{ padding: '2px 6px', fontSize: '10.5px', fontWeight: '700', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', cursor: 'pointer' }}>+1 Week</button>
                </div>
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Proposed New Target Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={requestedDeadline}
                  onChange={(e) => setRequestedDeadline(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Detailed Reason for Extension *
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`State reason for ${task.creatorName || 'Assigner / Super Admin'} (e.g. Awaiting verified finance receipts or university exam schedule change)...`}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)' }}
              >
                <Send size={15} /> Submit Extension Request to {task.creatorName || 'Assigner / Super Admin'}
              </button>
            </form>
          )}

          {/* Close Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
