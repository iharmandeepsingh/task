export const CTU_ROLES = [
  { id: 'superAdmin', name: 'Super Admin', description: 'Full control across all dashboards & permission overrides' },
  { id: 'adminHead', name: 'Admin / Head', description: 'Department Lead: Task assignment, extension & submission review' },
  { id: 'hr', name: 'HR Lead', description: 'HR Peer: Employee directory management & bulk CSV/XLSX import' },
  { id: 'faculty', name: 'Faculty', description: 'Faculty Member: Executes tasks, updates subtasks & requests extensions' },
];

export const INITIAL_TEAM = [
  { id: 'usr-0', employeeId: 'CTU-EMP-001', name: 'Dr. Manjit Singh', role: 'Super Admin', dept: 'University Administration', email: 'superadmin@ctu.edu.in', avatar: 'MS' },
  { id: 'usr-1', employeeId: 'CTU-EMP-102', name: 'Dr. Gurpreet Singh', role: 'Admin / Head', dept: 'Computer Science & Engineering', email: 'head.cse@ctu.edu.in', avatar: 'GS' },
  { id: 'usr-2', employeeId: 'CTU-EMP-205', name: 'Ms. Pooja Rani', role: 'HR Lead', dept: 'Human Resources', email: 'hr.head@ctu.edu.in', avatar: 'PR' },
  { id: 'usr-3', employeeId: 'CTU-EMP-309', name: 'Dr. Harmanpreet Singh', role: 'Faculty', dept: 'Computer Science & Engineering', email: 'harman.faculty@ctu.edu.in', avatar: 'HS' },
  { id: 'usr-4', employeeId: 'CTU-EMP-312', name: 'Prof. Ananya Sharma', role: 'Faculty', dept: 'School of Law', email: 'ananya.law@ctu.edu.in', avatar: 'AS' },
];

export const INITIAL_TASKS = [
  {
    id: 'CTU-CSE-101',
    title: 'NAAC Accreditation Criterion 3 Report',
    description: 'Compile research publications, consultancy grants, and patents data for the CSE Department for NAAC inspection.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-3',
    assigneeName: 'Dr. Harmanpreet Singh',
    departmentName: 'Computer Science & Engineering',
    priority: 'High',
    stage: 'In Progress',
    deadlineHealth: 'Yellow', // Near deadline (3-7 days)
    progressPercent: 60,
    dueDate: '2026-08-09',
    isIdle: false,
    subtasks: [
      { id: 'st-1', text: 'Gather Scopus publication index', done: true },
      { id: 'st-2', text: 'Verify consultancy project receipts', done: true },
      { id: 'st-3', text: 'Draft PDF annexure summary', done: false }
    ],
    extensions: [
      {
        id: 'ext-1',
        reason: 'Awaiting verified consultancy receipt figures from university finance department.',
        requestedDeadline: '2026-08-14',
        status: 'PENDING'
      }
    ],
    chatMessages: [
      { id: 'm1', sender: 'Dr. Gurpreet Singh (Head)', text: 'Please cross-verify all Scopus DOIs before submitting.', time: '10:00 AM' },
      { id: 'm2', sender: 'Dr. Harmanpreet Singh (Faculty)', text: 'Uploaded the draft spreadsheet under subtasks.', time: '11:30 AM', attachment: 'CSE_NAAC_Research_Draft.xlsx' }
    ]
  },
  {
    id: 'CTU-LAW-204',
    title: 'MoOT Court Competition Organization',
    description: 'Prepare event schedule, invite guest judges from Punjab High Court, and finalize student moot court briefs.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-4',
    assigneeName: 'Prof. Ananya Sharma',
    departmentName: 'School of Law',
    priority: 'Urgent',
    stage: 'Submitted for Review',
    deadlineHealth: 'Green', // Finished on time
    progressPercent: 100,
    dueDate: '2026-08-15',
    isIdle: false,
    subtasks: [
      { id: 'st-10', text: 'Draft invitation letter for judges', done: true },
      { id: 'st-11', text: 'Publish rulebook to student portal', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-CSE-108',
    title: 'Mid-Semester Exam Question Paper Setup',
    description: 'Create outcome-based education (OBE) question papers for Data Structures & Algorithms course.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-3',
    assigneeName: 'Dr. Harmanpreet Singh',
    departmentName: 'Computer Science & Engineering',
    priority: 'Medium',
    stage: 'Re-issued',
    deadlineHealth: 'Orange', // Almost at deadline (<3 days)
    progressPercent: 40,
    dueDate: '2026-08-07',
    isIdle: true, // Idle flag triggered! (No update for 3-5 days)
    subtasks: [
      { id: 'st-20', text: 'Map Questions to Bloom Taxonomy Level 4', done: true },
      { id: 'st-21', text: 'Submit answer key and marking scheme', done: false }
    ],
    extensions: [],
    chatMessages: [],
    review: {
      isApproved: false,
      feedback: 'Questions did not align with Bloom Taxonomy level 4. Please revise and resubmit.',
      newRestartDeadline: '2026-08-07'
    }
  }
];

export const STAGES = ['Assigned', 'In Progress', 'Submitted for Review', 'Under Review', 'Accepted', 'Rejected', 'Re-issued'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
