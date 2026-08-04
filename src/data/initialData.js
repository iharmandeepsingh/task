export const INITIAL_TEAM = [
  { id: 'usr-1', name: 'Harmandeep Singh', role: 'Repository Owner / Tech Lead', avatar: 'HS', email: 'harman@github.com', status: 'Active' },
  { id: 'usr-2', name: 'Alex Rivera', role: 'Frontend Engineer', avatar: 'AR', email: 'alex@company.com', status: 'Active' },
  { id: 'usr-3', name: 'Sarah Chen', role: 'UI/UX Designer', avatar: 'SC', email: 'sarah@company.com', status: 'Active' },
  { id: 'usr-4', name: 'Marcus Vance', role: 'Backend Developer', avatar: 'MV', email: 'marcus@company.com', status: 'On Leave' },
  { id: 'usr-5', name: 'Elena Rostova', role: 'DevOps / Infrastructure', avatar: 'ER', email: 'elena@company.com', status: 'Active' },
];

export const INITIAL_TASKS = [
  {
    id: 'TSK-101',
    title: 'Set up GitHub Repository Integration',
    description: 'Initialize local workspace repository and connect remote origin to github.com/iharmandeepsingh',
    stage: 'In Progress',
    priority: 'Urgent',
    assigneeId: 'usr-1',
    tags: ['Git', 'DevOps'],
    dueDate: '2026-08-05',
    subtasks: [
      { id: 's1', text: 'Initialize git workspace', done: true },
      { id: 's2', text: 'Scaffold project files', done: true },
      { id: 's3', text: 'Link to remote GitHub repository', done: false }
    ]
  },
  {
    id: 'TSK-102',
    title: 'Design Dark-Theme Design Tokens & UI',
    description: 'Implement glassmorphic CSS design tokens, custom scrollbars, typography and color palettes.',
    stage: 'Done',
    priority: 'High',
    assigneeId: 'usr-3',
    tags: ['UI/UX', 'Design'],
    dueDate: '2026-08-04',
    subtasks: [
      { id: 's1', text: 'Define CSS variables', done: true },
      { id: 's2', text: 'Apply Outfit font', done: true }
    ]
  },
  {
    id: 'TSK-103',
    title: 'Build Task Assignment & Kanban Board',
    description: 'Construct interactive 4-column drag/click task workflow with real-time status transitions.',
    stage: 'In Progress',
    priority: 'High',
    assigneeId: 'usr-2',
    tags: ['React', 'Frontend'],
    dueDate: '2026-08-06',
    subtasks: [
      { id: 's1', text: 'Column container rendering', done: true },
      { id: 's2', text: 'Task card badge components', done: true },
      { id: 's3', text: 'Stage movement controls', done: false }
    ]
  },
  {
    id: 'TSK-104',
    title: 'Implement Multi-Criteria Filter & Search',
    description: 'Allow instant keyword filtering, stage classification, priority filtering, and assignee lookup.',
    stage: 'To Do',
    priority: 'Medium',
    assigneeId: 'usr-2',
    tags: ['Frontend', 'Search'],
    dueDate: '2026-08-08',
    subtasks: []
  },
  {
    id: 'TSK-105',
    title: 'Configure Automated CI/CD Pipeline',
    description: 'Setup GitHub Actions workflow for linting, testing, and continuous deployment to GitHub Pages or Vercel.',
    stage: 'In Review',
    priority: 'Medium',
    assigneeId: 'usr-5',
    tags: ['CI/CD', 'GitHub'],
    dueDate: '2026-08-10',
    subtasks: []
  },
  {
    id: 'TSK-106',
    title: 'REST API & Authentication Backend',
    description: 'Create Node.js / Express microservices for task persistence and OAuth integration.',
    stage: 'To Do',
    priority: 'Low',
    assigneeId: 'usr-4',
    tags: ['Backend', 'NodeJS'],
    dueDate: '2026-08-15',
    subtasks: []
  }
];

export const STAGES = ['To Do', 'In Progress', 'In Review', 'Done'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
