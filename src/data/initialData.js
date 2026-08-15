export const CTU_ROLES = [
  { id: 'superAdmin', name: 'Super Admin', description: 'Full control across all dashboards & permission overrides' },
  { id: 'adminHead', name: 'Admin / Head', description: 'Department Lead: Task assignment, extension & submission review' },
  { id: 'hr', name: 'HR Lead', description: 'HR Peer: Employee directory management & bulk CSV/XLSX import' },
  { id: 'faculty', name: 'Faculty', description: 'Faculty Member: Executes tasks, updates subtasks & requests extensions' },
];

export const INITIAL_TEAM = [
  { id: 'usr-0', employeeId: 'CTU-EMP-001', name: 'Dr. Manjit Singh', role: 'Super Admin', category: 'Admin', dept: 'University Administration', email: 'superadmin@ctu.edu.in', avatar: 'MS' },
  { id: 'usr-1', employeeId: 'CTU-EMP-102', name: 'Dr. Gurpreet Singh', role: 'Admin / Head', category: 'Admin', dept: 'Computer Science & Engineering', email: 'head.cse@ctu.edu.in', avatar: 'GS' },
  { id: 'usr-2', employeeId: 'CTU-EMP-205', name: 'Ms. Pooja Rani', role: 'HR Lead', category: 'Admin', dept: 'Human Resources', email: 'hr.head@ctu.edu.in', avatar: 'PR' },
  { id: 'usr-3', employeeId: 'CTU-EMP-309', name: 'Dr. Harmanpreet Singh', role: 'Faculty', category: 'Faculty', dept: 'Computer Science & Engineering', email: 'harman.faculty@ctu.edu.in', avatar: 'HS' },
  { id: 'usr-4', employeeId: 'CTU-EMP-312', name: 'Prof. Ananya Sharma', role: 'Faculty', category: 'Faculty', dept: 'School of Law', email: 'ananya.law@ctu.edu.in', avatar: 'AS' },
  { id: 'usr-5', employeeId: 'CTU-EMP-315', name: 'Dr. Rajesh Kumar', role: 'Faculty', category: 'Faculty', dept: 'Computer Science & Engineering', email: 'rajesh@ctu.edu.in', avatar: 'RK' },
  { id: 'usr-6', employeeId: 'CTU-EMP-301', name: 'Dr. Preeti Verma', role: 'Assistant Professor', category: 'Faculty', dept: 'School of Engineering', email: 'preeti@ctu.edu.in', avatar: 'PV' },
  { id: 'usr-7', employeeId: 'CTU-EMP-302', name: 'Er. Vikramjeet Singh', role: 'Senior Lecturer', category: 'Faculty', dept: 'Mechanical Engineering', email: 'vikram@ctu.edu.in', avatar: 'VS' },
  { id: 'usr-8', employeeId: 'CTU-EMP-303', name: 'Dr. Simranjeet Kaur', role: 'Associate Professor', category: 'Faculty', dept: 'Computer Science & Engineering', email: 'simran@ctu.edu.in', avatar: 'SK' },
  { id: 'usr-26010', employeeId: '26010', name: 'Shilpa Debnath', role: 'Faculty Member', category: 'Faculty', dept: 'School of Management & Sciences', email: 'shilpa.debnath@ctu.edu.in', avatar: 'SD' },
  { id: 'usr-9', employeeId: 'CTU-EMP-304', name: 'Prof. Amit Sharma', role: 'Professor', category: 'Faculty', dept: 'School of Management', email: 'amit.sharma@ctu.edu.in', avatar: 'AS' },
  { id: 'usr-10', employeeId: 'CTU-ADM-102', name: 'Mr. Suresh Grover', role: 'Finance Officer', category: 'Admin', dept: 'Accounts & Finance', email: 'suresh.accounts@ctu.edu.in', avatar: 'SG' }
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
    deadlineHealth: 'Yellow',
    progressPercent: 60,
    dueDate: '2026-08-18',
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
        requestedDeadline: '2026-08-20',
        status: 'PENDING'
      }
    ],
    chatMessages: [
      { id: 'm1', sender: 'Dr. Gurpreet Singh (Head)', text: 'Please cross-verify all Scopus DOIs before submitting.', time: '10:00 AM' },
      { id: 'm2', sender: 'Dr. Harmanpreet Singh (Faculty)', text: 'Uploaded the draft spreadsheet under subtasks.', time: '11:30 AM', attachment: 'CSE_NAAC_Research_Draft.xlsx' }
    ]
  },
  {
    id: 'CTU-CSE-102',
    title: 'Curriculum Revision for AI & ML Elective',
    description: 'Draft updated syllabus for B.Tech CSE AI elective according to NEP 2020 guidelines.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-3',
    assigneeName: 'Dr. Harmanpreet Singh',
    departmentName: 'Computer Science & Engineering',
    priority: 'Urgent',
    stage: 'Assigned',
    deadlineHealth: 'Green',
    progressPercent: 0,
    dueDate: '2026-08-22',
    isIdle: false,
    subtasks: [
      { id: 'st-4', text: 'Review Industry partner feedback', done: false },
      { id: 'st-5', text: 'Map course outcomes to Bloom Taxonomy', done: false }
    ],
    extensions: [],
    chatMessages: []
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
    deadlineHealth: 'Green',
    progressPercent: 90,
    dueDate: '2026-08-16',
    isIdle: false,
    subtasks: [
      { id: 'st-10', text: 'Draft invitation letter for judges', done: true },
      { id: 'st-11', text: 'Publish rulebook to student portal', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-CSE-105',
    title: 'B.Tech Capstone Project Viva Evaluation',
    description: 'Conduct final viva evaluation for 4th year CSE software development projects.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-5',
    assigneeName: 'Dr. Rajesh Kumar',
    departmentName: 'Computer Science & Engineering',
    priority: 'High',
    stage: 'Under Review',
    deadlineHealth: 'Green',
    progressPercent: 85,
    dueDate: '2026-08-17',
    isIdle: false,
    subtasks: [
      { id: 'st-15', text: 'Evaluate Github repos', done: true },
      { id: 'st-16', text: 'Compile rubric marksheet', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-CSE-106',
    title: 'IEEE International Conference Proceedings',
    description: 'Finalize camera-ready paper submissions and peer-review feedback for IEEE ICCST 2026.',
    creatorName: 'Dr. Manjit Singh (Super Admin)',
    assigneeId: 'usr-3',
    assigneeName: 'Dr. Harmanpreet Singh',
    departmentName: 'Computer Science & Engineering',
    priority: 'Medium',
    stage: 'Accepted',
    deadlineHealth: 'Green',
    progressPercent: 100,
    dueDate: '2026-08-10',
    isIdle: false,
    subtasks: [
      { id: 'st-17', text: 'Upload copyright forms', done: true },
      { id: 'st-18', text: 'Verify IEEE Xplore format', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-CSE-109',
    title: 'End-Semester Exam Outcome & Grade Upload',
    description: 'Final marks compilation and grade roster submission on CT University ERP portal.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-3',
    assigneeName: 'Dr. Harmanpreet Singh',
    departmentName: 'Computer Science & Engineering',
    priority: 'High',
    stage: 'Completed',
    deadlineHealth: 'Green',
    progressPercent: 100,
    dueDate: '2026-08-14',
    isIdle: false,
    subtasks: [
      { id: 'st-30', text: 'Upload internal assessment marks', done: true },
      { id: 'st-31', text: 'Submit signed grade roster', done: true }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-CSE-107',
    title: 'Lab Equipment Maintenance Audit',
    description: 'Conduct physical inventory audit of IoT and High-Performance Computing labs.',
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-5',
    assigneeName: 'Dr. Rajesh Kumar',
    departmentName: 'Computer Science & Engineering',
    priority: 'Low',
    stage: 'Rejected',
    deadlineHealth: 'Red',
    progressPercent: 10,
    dueDate: '2026-08-05',
    isIdle: false,
    subtasks: [
      { id: 'st-19', text: 'Check serial numbers', done: false }
    ],
    extensions: [],
    chatMessages: [],
    review: {
      isApproved: false,
      feedback: 'Incomplete audit log. Missing GPU server serial numbers.',
      newRestartDeadline: '2026-08-12'
    }
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
    deadlineHealth: 'Orange',
    progressPercent: 40,
    dueDate: '2026-08-19',
    isIdle: true,
    subtasks: [
      { id: 'st-20', text: 'Map Questions to Bloom Taxonomy Level 4', done: true },
      { id: 'st-21', text: 'Submit answer key and marking scheme', done: false }
    ],
    extensions: [],
    chatMessages: [],
    review: {
      isApproved: false,
      feedback: 'Questions did not align with Bloom Taxonomy level 4. Please revise and resubmit.',
      newRestartDeadline: '2026-08-19'
    }
  }
];

export const STAGES = ['Assigned', 'In Progress', 'Submitted for Review', 'Under Review', 'Accepted', 'Completed', 'Rejected', 'Re-issued'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
