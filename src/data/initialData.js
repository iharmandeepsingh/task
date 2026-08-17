export const CTU_ROLES = [
  { id: 'superAdmin', name: 'Super Admin', description: 'Full control across all dashboards & permission overrides' },
  { id: 'adminHead', name: 'Admin / Head', description: 'Department Lead: Task assignment, extension & submission review' },
  { id: 'hr', name: 'HR Lead', description: 'HR Peer: Employee directory management & bulk CSV/XLSX import' },
  { id: 'faculty', name: 'Faculty', description: 'Faculty Member: Executes tasks, updates subtasks & requests extensions' },
];

export const INITIAL_TEAM = [
  // Super Admin Executive Leadership
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
    creatorName: 'Dr. Gurpreet Singh (Head)',
    assigneeId: 'usr-26001',
    assigneeName: 'Arvin Vinayek',
    departmentName: 'School of Engineering & Technology',
    priority: 'High',
    stage: 'In Progress',
    deadlineHealth: 'Green',
    progressPercent: 50,
    dueDate: '2026-08-20',
    isIdle: false,
    subtasks: [
      { id: 'st-av-1', text: 'Compile experimental data plots', done: true },
      { id: 'st-av-2', text: 'Draft IEEE two-column paper template', done: false }
    ],
    extensions: [],
    chatMessages: []
  },
  {
    id: 'CTU-MGT-401',
    title: 'NAAC Executive Management Documentation',
    description: 'Assemble School of Management syllabus modules and student feedback audits.',
    creatorName: 'Dr. Manjit Singh (Super Admin)',
    assigneeId: 'usr-26010',
    assigneeName: 'Shilpa Debnath',
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
