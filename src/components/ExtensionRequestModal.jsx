import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle2, XCircle, Send, Check } from 'lucide-react';

export default function ExtensionRequestModal({ isOpen, onClose, task, authUser, onRequestExtension, onApproveExtension }) {
  const [reason, setReason] = useState('');
  const [requestedDeadline, setRequestedDeadline] = useState('');

  if (!isOpen || !task) return null;

  const isFaculty = authUser?.role === 'faculty';
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
      status: 'PENDING'
    };

    onRequestExtension(task.id, newExt);
    setReason('');
    setRequestedDeadline('');
    onClose();
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
        width: '100%', maxWidth: '540px', background: '#ffffff', borderRadius: '18px',
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
                Deadline Extension Management
              </h3>
              <p style={{ fontSize: '11px', color: '#fef3c7', margin: 0 }}>
                {task.id} • Current Due: <strong>{task.dueDate}</strong>
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
            <strong>Task Title:</strong> {task.title}
          </div>

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
                        Target Date: {e.requestedDeadline}
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

                    {!isFaculty && e.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button
                          onClick={() => onApproveExtension(task.id, e.id, e.requestedDeadline)}
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)' }}
                        >
                          <CheckCircle2 size={15} /> Approve New Deadline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Extension Request Form for Faculty */}
          {isFaculty && (
            <form onSubmit={handleApplyRequest} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Submit New Extension Request
              </h4>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Proposed New Target Date *
                </label>
                <input
                  type="date"
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
                  placeholder="State academic reason (e.g. Awaiting verified finance receipts or university exam schedule change)..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)' }}
              >
                <Send size={15} /> Submit Extension Request to HOD
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
