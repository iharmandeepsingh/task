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

export const INITIAL_TASKS = [];

export const STAGES = ['Assigned', 'In Progress', 'Submitted for Review', 'Under Review', 'Accepted', 'Completed', 'Rejected', 'Re-issued'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
