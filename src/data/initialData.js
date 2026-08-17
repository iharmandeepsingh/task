export const CTU_ROLES = [
  { id: 'superAdmin', name: 'Super Admin', description: 'Full control across all dashboards & permission overrides' },
  { id: 'adminHead', name: 'Admin / Head', description: 'Department Lead: Task assignment, extension & submission review' },
  { id: 'hr', name: 'HR Lead', description: 'HR Peer: Employee directory management & bulk CSV/XLSX import' },
  { id: 'faculty', name: 'Faculty', description: 'Faculty Member: Executes tasks, updates subtasks & requests extensions' },
];

export const INITIAL_TEAM = [
  // Super Admin Executive Leadership ONLY
  { id: 'usr-24051', employeeId: '24051', name: 'Dr. Nitin Tandon', role: 'Super Admin', category: 'Admin', dept: 'Vice Chancellor / Executive Director & Dean Research', email: 'drnitin@ctuniversity.in', avatar: 'NT' },
  { id: 'usr-17572', employeeId: '17572', name: 'Dr. Simranjeet Kaur Gill', role: 'Super Admin', category: 'Admin', dept: 'Pro Vice Chancellor / Dean Academics / Principal of SOL', email: 'principalsol@ctuniversity.in', avatar: 'SG' },
  { id: 'usr-10001', employeeId: '10001', name: 'Super Admin', role: 'Super Admin', category: 'Admin', dept: 'University Executive Administration', email: 'superadmin.10001@ctu.edu.in', avatar: 'SA' },
  { id: 'usr-0', employeeId: '001', name: 'Dr. Manjit Singh', role: 'Super Admin', category: 'Admin', dept: 'University Administration', email: 'superadmin@ctu.edu.in', avatar: 'MS' }
];

export const INITIAL_TASKS = [
  {
    id: 'CTU-ENG-301',
    title: 'Smart City Internet of Things Research Paper Submission',
    description: 'Prepare and submit peer-reviewed manuscript for IEEE IoT Journal.',
    creatorName: 'Dr. Nitin Tandon (Super Admin)',
    creatorId: 'usr-24051',
    assigneeId: 'usr-10001',
    assigneeName: 'Super Admin',
    departmentName: 'School of Engineering & Technology',
    priority: 'High',
    stage: 'In Progress',
    deadlineHealth: 'Green',
    progressPercent: 50,
    dueDate: '2026-08-25',
    isIdle: false,
    subtasks: [
      { id: 'st-av-1', text: 'Compile experimental data plots', done: true },
      { id: 'st-av-2', text: 'Draft IEEE two-column paper template', done: false }
    ],
    extensions: [],
    chatMessages: [
      { id: 'm-1', sender: 'Dr. Nitin Tandon', text: 'Please ensure IEEE conference citation format is verified.', time: '10:15 AM' }
    ]
  },
  {
    id: 'CTU-MGT-401',
    title: 'NAAC Executive Management Accreditation Audit',
    description: 'Assemble School of Management syllabus modules and student feedback audits.',
    creatorName: 'Dr. Simranjeet Kaur Gill (Super Admin)',
    creatorId: 'usr-17572',
    assigneeId: 'usr-24051',
    assigneeName: 'Dr. Nitin Tandon',
    departmentName: 'School of Management & Sciences',
    priority: 'Urgent',
    stage: 'In Progress',
    deadlineHealth: 'Green',
    progressPercent: 75,
    dueDate: '2026-08-22',
    isIdle: false,
    subtasks: [
      { id: 'st-sd-1', text: 'Collect student feedback forms', done: true },
      { id: 'st-sd-2', text: 'Compile course outcome report', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-CSE-101',
    title: 'NAAC Accreditation Criterion 3 Research Report',
    description: 'Compile research publications, consultancy grants, and patents data for NAAC inspection.',
    creatorName: 'Dr. Manjit Singh (Super Admin)',
    creatorId: 'usr-0',
    assigneeId: 'usr-17572',
    assigneeName: 'Dr. Simranjeet Kaur Gill',
    departmentName: 'Computer Science & Engineering',
    priority: 'High',
    stage: 'Submitted for Review',
    deadlineHealth: 'Yellow',
    progressPercent: 90,
    dueDate: '2026-08-20',
    isIdle: false,
    subtasks: [
      { id: 'st-1', text: 'Gather Scopus publication index', done: true },
      { id: 'st-2', text: 'Verify consultancy project receipts', done: true },
      { id: 'st-3', text: 'Draft PDF annexure summary', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-EXAM-202',
    title: 'Mid-Semester Exam Outcome-Based Question Paper Setup',
    description: 'Prepare bloom taxonomy mapped question paper for End-Term University Examinations.',
    creatorName: 'Dr. Nitin Tandon (Super Admin)',
    creatorId: 'usr-24051',
    assigneeId: 'usr-0',
    assigneeName: 'Dr. Manjit Singh',
    departmentName: 'Central Academic Affairs',
    priority: 'Urgent',
    stage: 'Under Review',
    deadlineHealth: 'Green',
    progressPercent: 80,
    dueDate: '2026-08-24',
    isIdle: false,
    subtasks: [
      { id: 'st-ex-1', text: 'Map Level 4 Bloom questions', done: true },
      { id: 'st-ex-2', text: 'Draft answer keys & rubrics', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-LAW-104',
    title: 'National Moot Court Competition Organization',
    description: 'Finalize moot court student briefs and invite Punjab High Court judges.',
    creatorName: 'Dr. Simranjeet Kaur Gill (Super Admin)',
    creatorId: 'usr-17572',
    assigneeId: 'usr-10001',
    assigneeName: 'Super Admin',
    departmentName: 'School of Law',
    priority: 'Medium',
    stage: 'Accepted',
    deadlineHealth: 'Green',
    progressPercent: 100,
    dueDate: '2026-08-15',
    isIdle: false,
    subtasks: [
      { id: 'st-lw-1', text: 'Issue official invitation letters', done: true },
      { id: 'st-lw-2', text: 'Publish competition rulebook', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-PHARM-501',
    title: 'Pharmaceutical Chemistry Lab Equipment Audit',
    description: 'Inspect HPLC and Spectrophotometer calibration certificates.',
    creatorName: 'Dr. Nitin Tandon (Super Admin)',
    creatorId: 'usr-24051',
    assigneeId: 'usr-24051',
    assigneeName: 'Dr. Nitin Tandon',
    departmentName: 'School of Pharmaceutical Sciences',
    priority: 'Low',
    stage: 'Re-issued',
    deadlineHealth: 'Orange',
    progressPercent: 40,
    dueDate: '2026-08-28',
    isIdle: true,
    subtasks: [
      { id: 'st-ph-1', text: 'Log calibration logbook', done: true },
      { id: 'st-ph-2', text: 'Attach AMC vendor receipt', done: false }
    ],
    extensions: [],
    chatMessages: [],
    review: {
      isApproved: false,
      feedback: 'Please attach verified vendor AMC receipt before final signoff.',
      newRestartDeadline: '2026-08-28'
    }
  }
];

export const STAGES = ['Assigned', 'In Progress', 'Submitted for Review', 'Under Review', 'Accepted', 'Completed', 'Rejected', 'Re-issued'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export function formatDueDateWithDayTime(dueDate, dueTime) {
  if (!dueDate) return 'No Deadline';
  try {
    let combinedStr = dueDate;
    if (dueDate.includes('T')) {
      combinedStr = dueDate;
    } else if (dueTime) {
      combinedStr = `${dueDate}T${dueTime}`;
    } else {
      combinedStr = `${dueDate}T17:00`;
    }

    const d = new Date(combinedStr.includes('T') ? combinedStr : combinedStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dueDate;

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const monthDayYear = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return `${monthDayYear} (${dayName}) • ${timeStr}`;
  } catch (e) {
    return dueDate;
  }
}
