import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle2, XCircle, Send } from 'lucide-react';

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
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px'
    }}>
      <div className="modal-card" style={{
        width: '100%', maxWidth: '600px', background: '#ffffff', borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Clock size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                Deadline Extension Management
              </h3>
              <p style={{ fontSize: '11px', color: '#fef3c7', margin: 0 }}>Task: {task.id} • Current Due: {task.dueDate}</p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {/* Existing Extensions List */}
          {existingExtensions.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>Pending / Historical Requests</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {existingExtensions.map((e) => (
                  <div key={e.id} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: '#0f172a' }}>Requested Target: {e.requestedDeadline}</strong>
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px', fontWeight: '700', fontSize: '10px',
                        background: e.status === 'APPROVED' ? '#dcfce7' : e.status === 'REJECTED' ? '#fee2e2' : '#fef9c3',
                        color: e.status === 'APPROVED' ? '#15803d' : e.status === 'REJECTED' ? '#b91c1c' : '#a16207'
                      }}>
                        {e.status}
                      </span>
                    </div>
                    <div style={{ color: '#475569', marginBottom: '8px' }}>Reason: {e.reason}</div>

                    {!isFaculty && e.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => onApproveExtension(task.id, e.id, e.requestedDeadline)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#16a34a', color: '#ffffff', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle2 size={13} /> Approve Extension
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Request Form for Faculty */}
          {isFaculty && (
            <form onSubmit={handleApplyRequest}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', marginBottom: '10px' }}>Submit New Extension Request</h4>
              
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Proposed New Deadline Date</label>
                <input
                  type="date"
                  value={requestedDeadline}
                  onChange={(e) => setRequestedDeadline(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>Reason for Extension Request</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="State academic reason (e.g. Awaiting verified finance receipts)..."
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#d97706', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Send size={15} /> Submit Extension Request to HOD
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
