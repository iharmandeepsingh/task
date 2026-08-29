import React from 'react';
import { X, Award, CheckCircle2, Clock, AlertTriangle, TrendingUp, BookOpen, Calendar, ShieldCheck } from 'lucide-react';

export default function FacultyReportCardModal({ isOpen, onClose, authUser, tasks }) {
  if (!isOpen) return null;

  const facultyName = authUser?.name || 'Faculty Member';
  const facultyDept = authUser?.dept || 'Department of Engineering';

  // Calculate faculty task stats matching by ID, Employee ID, or Name
  const authEmpId = String(authUser?.employeeId || '').toLowerCase().trim();
  const authId = String(authUser?.id || '').toLowerCase().trim();
  const authName = String(authUser?.name || '').toLowerCase().trim();

  const facultyTasks = tasks.filter(t => {
    const aId = String(t.assigneeId || '').toLowerCase().trim();
    const aEmpId = String(t.assigneeEmpId || '').toLowerCase().trim();
    const aName = String(t.assigneeName || '').toLowerCase().trim();
    return (authId && (aId === authId || aId === `usr-${authEmpId}`)) ||
           (authEmpId && (aEmpId === authEmpId || aId === authEmpId || aId === `usr-${authEmpId}`)) ||
           (authName && aName === authName);
  });

  const completedTasks = facultyTasks.filter(t => t.stage === 'Accepted' || t.stage === 'Submitted for Review');
  const inProgressTasks = facultyTasks.filter(t => t.stage === 'In Progress' || t.stage === 'Assigned' || t.stage === 'Re-issued');
  const overdueTasks = facultyTasks.filter(t => t.deadlineHealth === 'Red');

  const completionRate = facultyTasks.length > 0 ? Math.round((completedTasks.length / facultyTasks.length) * 100) : 100;


  return (
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="modal-card" style={{
        width: '100%',
        maxWidth: '720px',
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(245, 158, 11, 0.4)'
            }}>
              <Award size={24} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Faculty Performance & Academic Report Card
              </h3>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>
                {facultyName} • {facultyDept}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
            <div style={{ padding: '14px', borderRadius: '12px', background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1d4ed8' }}>{facultyTasks.length}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#1e40af' }}>Total Assigned</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#047857' }}>{completedTasks.length}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#065f46' }}>Completed</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#b45309' }}>{inProgressTasks.length}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#92400e' }}>In Progress</div>
            </div>

            <div style={{ padding: '14px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#b91c1c' }}>{completionRate}%</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#991b1b' }}>Completion Rate</div>
            </div>
          </div>

          {/* Detailed Task Progress List */}
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} color="#2563eb" /> Assigned Department Tasks & Subtasks
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {facultyTasks.map((t) => (
              <div key={t.id} style={{ padding: '14px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#3b82f6', background: '#eff6ff', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{t.id}</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{t.title}</strong>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: t.stage === 'Accepted' ? '#dcfce7' : '#fef9c3',
                    color: t.stage === 'Accepted' ? '#15803d' : '#a16207'
                  }}>
                    {t.stage}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>{t.description}</p>

                {/* Subtask checklist */}
                {t.subtasks && t.subtasks.length > 0 && (
                  <div style={{ background: '#ffffff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '11px' }}>
                    <div style={{ fontWeight: '700', color: '#475569', marginBottom: '4px' }}>Subtask Checklist:</div>
                    {t.subtasks.map((st) => (
                      <div key={st.id || st.text} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '3px 0' }}>
                        <CheckCircle2 size={13} color={st.done ? '#10b981' : '#94a3b8'} />
                        <span style={{ textDecoration: st.done ? 'line-through' : 'none', color: st.done ? '#64748b' : '#1e293b' }}>{st.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              background: '#1e293b',
              color: '#ffffff',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Close Report Card
          </button>
        </div>
      </div>
    </div>
  );
}
