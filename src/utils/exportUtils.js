import * as XLSX from 'xlsx';
import { formatDueDateWithDayTime } from '../data/initialData';

// Export Tasks to Official CT University Excel (.xlsx) Spreadsheet
export function exportTasksToExcel(tasks = [], reportTitle = 'CT University Executive Task & NAAC Audit Report') {
  if (!tasks || tasks.length === 0) {
    alert('No tasks available to export.');
    return;
  }

  const exportData = tasks.map((t) => {
    const subtaskDone = t.subtasks ? t.subtasks.filter((s) => s.done).length : 0;
    const subtaskTotal = t.subtasks ? t.subtasks.length : 0;
    
    return {
      'Task ID': t.id,
      'Title': t.title,
      'Description': t.description || '',
      'Assigned To': t.assigneeName || 'Faculty',
      'Department / School': t.departmentName || t.dept || 'School of Engineering & Technology',
      'Priority': t.priority || 'Medium',
      'Stage Status': t.stage || 'Assigned',
      'Progress (%)': `${t.progressPercent || 0}%`,
      'Deadline': formatDueDateWithDayTime(t.dueDate, t.dueTime),
      'Deadline Health': t.deadlineHealth || 'Green',
      'Subtasks Completed': `${subtaskDone} / ${subtaskTotal}`
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Set Column Widths
  worksheet['!cols'] = [
    { wch: 15 }, // Task ID
    { wch: 40 }, // Title
    { wch: 45 }, // Description
    { wch: 25 }, // Assigned To
    { wch: 35 }, // Department
    { wch: 12 }, // Priority
    { wch: 22 }, // Stage
    { wch: 14 }, // Progress
    { wch: 30 }, // Deadline
    { wch: 16 }, // Health
    { wch: 20 }  // Subtasks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Task Audit Data');

  const fileName = `CTU_Executive_Task_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Export Tasks to Official CT University NAAC / NBA Audit PDF Document
export function exportTasksToPDF(tasks = [], reportTitle = 'NAAC & NBA Accreditation Audit Report', reportType = 'Accreditation Inspection') {
  if (!tasks || tasks.length === 0) {
    alert('No tasks available to generate PDF report.');
    return;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.stage === 'Accepted' || t.stage === 'Completed' || t.progressPercent === 100).length;
  const inProgressTasks = tasks.filter(t => t.stage === 'In Progress' || t.stage === 'Assigned').length;
  const reviewTasks = tasks.filter(t => t.stage === 'Submitted for Review' || t.stage === 'Under Review').length;
  const completionRate = Math.round((completedTasks / (totalTasks || 1)) * 100);

  // Calculate Department Breakdown
  const deptMap = {};
  tasks.forEach((t) => {
    const d = t.departmentName || t.dept || 'General Academic';
    if (!deptMap[d]) deptMap[d] = { total: 0, completed: 0, inProgress: 0 };
    deptMap[d].total += 1;
    if (t.stage === 'Accepted' || t.stage === 'Completed' || t.progressPercent === 100) {
      deptMap[d].completed += 1;
    } else {
      deptMap[d].inProgress += 1;
    }
  });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked. Please allow pop-ups to generate PDF Audit Report.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CT University - ${reportTitle}</title>

        margin: 0;
        padding: 24px;
        background: #ffffff;
        color: #0f172a;
      }
      .header-banner {
        border-bottom: 3px solid #1e3a8a;
        padding-bottom: 16px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .uni-title {
        font-size: 24px;
        font-weight: 800;
        color: #1e3a8a;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .uni-subtitle {
        font-size: 13px;
        color: #475569;
        font-weight: 700;
        margin-top: 4px;
      }
      .badge-naac {
        background: #1e3a8a;
        color: #ffffff;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 24px;
      }
      .meta-card {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        padding: 12px;
        border-radius: 8px;
        text-align: center;
      }
      .meta-num {
        font-size: 20px;
        font-weight: 800;
        color: #1e3a8a;
      }
      .meta-lbl {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
      }
      .section-heading {
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
        border-left: 4px solid #2563eb;
        padding-left: 10px;
        margin: 24px 0 12px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        margin-bottom: 24px;
      }
      th {
        background: #f1f5f9;
        color: #1e293b;
        font-weight: 800;
        padding: 10px;
        border: 1px solid #cbd5e1;
        text-align: left;
      }
      td {
        padding: 8px 10px;
        border: 1px solid #e2e8f0;
      }
      tr:nth-child(even) {
        background: #f8fafc;
      }
      .status-pill {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 800;
      }
      .st-completed { background: #dcfce7; color: #15803d; }
      .st-progress { background: #eff6ff; color: #1d4ed8; }
      .st-review { background: #fef3c7; color: #b45309; }
      .footer-sign {
        margin-top: 40px;
        display: flex;
        justify-content: space-between;
        padding-top: 20px;
        border-top: 1px solid #cbd5e1;
        font-size: 12px;
        font-weight: 700;
        color: #334155;
      }
      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
      </style>
    </head>
    <body>
      <div class="no-print" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: #1e40af; font-size: 13px;">📄 Official CT University Audit Report Ready for Printing / PDF Export</span>
        <button onclick="window.print()" style="padding: 8px 16px; background: #2563eb; color: #ffffff; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">🖨️ Print / Save as PDF</button>
      </div>

      <div class="header-banner">
        <div>
          <h1 class="uni-title">CT University • Executive Audit Report</h1>
          <div class="uni-subtitle">${reportTitle} | Date: ${dateStr}</div>
        </div>
        <div class="badge-naac">NAAC / NBA Audit Verified</div>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <div class="meta-num">${totalTasks}</div>
          <div class="meta-lbl">Total Assigned Tasks</div>
        </div>
        <div class="meta-card">
          <div class="meta-num">${completedTasks}</div>
          <div class="meta-lbl">Completed Tasks</div>
        </div>
        <div class="meta-card">
          <div class="meta-num">${reviewTasks}</div>
          <div class="meta-lbl">Under Review</div>
        </div>
        <div class="meta-card">
          <div class="meta-num">${completionRate}%</div>
          <div class="meta-lbl">Overall Completion Velocity</div>
        </div>
      </div>

      <div class="section-heading">🏢 Department Completion Velocity Summary</div>
      <table>
        <thead>
          <tr>
            <th>Department / School Name</th>
            <th>Total Tasks</th>
            <th>Completed</th>
            <th>In Progress</th>
            <th>Completion Rate (%)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(deptMap).map(([dept, stat]) => {
            const rate = Math.round((stat.completed / (stat.total || 1)) * 100);
            return `
              <tr>
                <td><strong>${dept}</strong></td>
                <td>${stat.total}</td>
                <td style="color: #15803d; font-weight: 700;">${stat.completed}</td>
                <td style="color: #1d4ed8;">${stat.inProgress}</td>
                <td><strong>${rate}%</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="section-heading">📋 Full Task Audit Roster & Execution Status</div>
      <table>
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Task Title</th>
            <th>Assigned Faculty / Admin</th>
            <th>Department</th>
            <th>Priority</th>
            <th>Stage Status</th>
            <th>Due Deadline</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => `
            <tr>
              <td><strong>${t.id}</strong></td>
              <td>${t.title}</td>
              <td>${t.assigneeName || 'Faculty'}</td>
              <td>${t.departmentName || t.dept || 'Engineering'}</td>
              <td>${t.priority || 'Medium'}</td>
              <td>
                <span class="status-pill ${t.stage === 'Completed' || t.stage === 'Accepted' ? 'st-completed' : t.stage.includes('Review') ? 'st-review' : 'st-progress'}">
                  ${t.stage}
                </span>
              </td>
              <td>${formatDueDateWithDayTime(t.dueDate, t.dueTime)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer-sign">
        <div>Generated By: CT University Executive Management Portal</div>
        <div>Authorized Signatory: Dean Academics / Super Admin</div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
