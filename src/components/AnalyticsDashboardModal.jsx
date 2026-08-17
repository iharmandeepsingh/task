import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, BarChart3, TrendingUp, CheckCircle2, Clock, AlertTriangle, Building2, Shield, UserCheck, Download, Award } from 'lucide-react';
import { exportTasksToExcel, exportTasksToPDF } from '../utils/exportUtils';
import { formatDueDateWithDayTime } from '../data/initialData';

export default function AnalyticsDashboardModal({ isOpen, onClose, tasks = [], team = [], authUser }) {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedReportType, setSelectedReportType] = useState('NAAC'); // 'NAAC', 'NBA', 'DEAN'

  if (!isOpen) return null;

  // Extract Unique Departments
  const departments = Array.from(new Set(tasks.map(t => t.departmentName || t.dept || 'School of Engineering & Technology'))).filter(Boolean);

  // Filter Tasks by Selected Department
  const filteredTasks = tasks.filter(t => {
    if (selectedDeptFilter === 'ALL') return true;
    const d = t.departmentName || t.dept || '';
    return d.toLowerCase().includes(selectedDeptFilter.toLowerCase());
  });

  // Calculate Metrics
  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter(t => t.stage === 'Accepted' || t.stage === 'Completed' || t.progressPercent === 100).length;
  const inProgressCount = filteredTasks.filter(t => t.stage === 'In Progress' || t.stage === 'Assigned').length;
  const reviewCount = filteredTasks.filter(t => t.stage === 'Submitted for Review' || t.stage === 'Under Review').length;
  const urgentCount = filteredTasks.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;
  const completionRate = Math.round((completedCount / (totalCount || 1)) * 100);

  // Calculate Velocity Stats per Department
  const deptVelocityMap = {};
  tasks.forEach(t => {
    const dept = t.departmentName || t.dept || 'School of Engineering & Technology';
    if (!deptVelocityMap[dept]) {
      deptVelocityMap[dept] = { total: 0, completed: 0, inProgress: 0, review: 0 };
    }
    deptVelocityMap[dept].total += 1;
    if (t.stage === 'Accepted' || t.stage === 'Completed' || t.progressPercent === 100) {
      deptVelocityMap[dept].completed += 1;
    } else if (t.stage.includes('Review')) {
      deptVelocityMap[dept].review += 1;
    } else {
      deptVelocityMap[dept].inProgress += 1;
    }
  });

  const handleExportPDF = () => {
    const title = selectedReportType === 'NAAC'
      ? 'NAAC Criterion Audit & Task Velocity Report'
      : selectedReportType === 'NBA'
      ? 'NBA Outcomes & Accreditation Audit Document'
      : 'Deans Executive Performance Roster';

    exportTasksToPDF(filteredTasks, title, selectedReportType);
  };

  const handleExportExcel = () => {
    exportTasksToExcel(filteredTasks, 'CTU_Task_Audit_Report');
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
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
      padding: '16px'
    }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
        width: '100%',
        maxWidth: '920px',
        background: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '92vh'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.25)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BarChart3 size={22} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Department Velocity & NAAC Audit Dashboard</span>
                <span style={{ fontSize: '10px', background: '#3b82f6', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>EXECUTIVE</span>
              </h3>
              <p style={{ fontSize: '11px', color: '#93c5fd', margin: 0 }}>
                Visual Task Velocity Analytics & Official 1-Click NAAC/NBA PDF & Excel Exporter
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
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

        {/* Action Exporter Control Bar */}
        <div style={{
          padding: '12px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>Filter Department:</span>
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="ALL">All University Departments ({tasks.length} Tasks)</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 1-Click Export Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleExportPDF}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 10px rgba(30, 58, 138, 0.3)'
              }}
            >
              <FileText size={16} />
              <span>📄 Export Official NAAC/NBA PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
              }}
            >
              <FileSpreadsheet size={16} />
              <span>📊 Export Excel Roster (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Executive Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e40af', textTransform: 'uppercase' }}>Total Tasks</span>
                <Building2 size={18} color="#2563eb" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1e3a8a' }}>{totalCount}</div>
              <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '2px', fontWeight: '600' }}>In Active System</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0', borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#065f46', textTransform: 'uppercase' }}>Completion Velocity</span>
                <TrendingUp size={18} color="#059669" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#047857' }}>{completionRate}%</div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px', fontWeight: '600' }}>{completedCount} Completed Tasks</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)', border: '1px solid #fde68a', borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', textTransform: 'uppercase' }}>Under Review</span>
                <Clock size={18} color="#d97706" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#b45309' }}>{reviewCount}</div>
              <div style={{ fontSize: '11px', color: '#d97706', marginTop: '2px', fontWeight: '600' }}>Awaiting Dean Approval</div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fca5a5', borderRadius: '14px', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase' }}>Urgent / High Priority</span>
                <AlertTriangle size={18} color="#dc2626" />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#b91c1c' }}>{urgentCount}</div>
              <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '2px', fontWeight: '600' }}>Critical Deliverables</div>
            </div>
          </div>

          {/* Graphical Department Completion Velocity Bar Charts */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#2563eb" />
                  <span>Department Task Completion Velocity Breakdown</span>
                </h4>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Graphical visualization of task execution rates by department
                </p>
              </div>

              <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                {Object.keys(deptVelocityMap).length} Active Departments
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(deptVelocityMap).map(([dept, stats]) => {
                const pct = Math.round((stats.completed / (stats.total || 1)) * 100);
                return (
                  <div key={dept} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                        {dept}
                      </span>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: pct >= 70 ? '#15803d' : pct >= 40 ? '#1d4ed8' : '#b45309' }}>
                        {pct}% Complete ({stats.completed} / {stats.total} Tasks)
                      </div>
                    </div>

                    {/* Multi-Color Segmented Velocity Progress Bar */}
                    <div style={{ height: '12px', width: '100%', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                          height: '100%',
                          transition: 'width 0.5s ease'
                        }}
                        title={`Completed: ${stats.completed}`}
                      />
                      <div
                        style={{
                          width: `${Math.round((stats.review / (stats.total || 1)) * 100)}%`,
                          background: '#f59e0b',
                          height: '100%'
                        }}
                        title={`Under Review: ${stats.review}`}
                      />
                      <div
                        style={{
                          width: `${Math.round((stats.inProgress / (stats.total || 1)) * 100)}%`,
                          background: '#3b82f6',
                          height: '100%'
                        }}
                        title={`In Progress: ${stats.inProgress}`}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                      <span style={{ color: '#15803d', fontWeight: '700' }}>● Completed: {stats.completed}</span>
                      <span style={{ color: '#b45309', fontWeight: '700' }}>● Review: {stats.review}</span>
                      <span style={{ color: '#1d4ed8', fontWeight: '700' }}>● In Progress: {stats.inProgress}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filtered Tasks Roster Preview */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                Accreditation Audit Preview Roster ({filteredTasks.length} Tasks)
              </strong>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Ready for official NAAC / NBA PDF & Excel Download
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px' }}>Task ID</th>
                    <th style={{ padding: '10px 12px' }}>Title</th>
                    <th style={{ padding: '10px 12px' }}>Assignee</th>
                    <th style={{ padding: '10px 12px' }}>Department</th>
                    <th style={{ padding: '10px 12px' }}>Priority</th>
                    <th style={{ padding: '10px 12px' }}>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: '800', color: '#2563eb' }}>{t.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: '700' }}>{t.title}</td>
                      <td style={{ padding: '10px 12px' }}>{t.assigneeName}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{t.departmentName || t.dept}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', background: t.priority === 'Urgent' ? '#fee2e2' : '#f1f5f9', color: t.priority === 'Urgent' ? '#b91c1c' : '#475569', fontWeight: '700', fontSize: '10px' }}>
                          {t.priority}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: '700', color: t.stage === 'Accepted' || t.stage === 'Completed' ? '#15803d' : '#1d4ed8' }}>
                        {t.stage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
