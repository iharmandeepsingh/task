export const CTU_ROLES = [
  { id: 'superAdmin', name: 'Super Admin', description: 'Full control across all dashboards & permission overrides' },
  { id: 'adminHead', name: 'Admin / Head', description: 'Department Lead: Task assignment, extension & submission review' },
  { id: 'hr', name: 'HR Lead', description: 'HR Peer: Employee directory management & bulk CSV/XLSX import' },
  { id: 'faculty', name: 'Faculty', description: 'Faculty Member: Executes tasks, updates subtasks & requests extensions' },
];

export const INITIAL_TEAM = [
  {
    "id": "usr-24051",
    "employeeId": "24051",
    "name": "Dr. Nitin Tandon",
    "role": "Super Admin",
    "category": "Admin",
    "dept": "Vice Chancellor / Executive Director & Dean Research",
    "email": "drnitin@ctuniversity.in",
    "avatar": "NT"
  },
  {
    "id": "usr-17572",
    "employeeId": "17572",
    "name": "Dr. Simranjeet Kaur Gill",
    "role": "Super Admin",
    "category": "Admin",
    "dept": "Pro Vice Chancellor / Dean Academics / Principal of SOL",
    "email": "principalsol@ctuniversity.in",
    "avatar": "SG"
  },
  {
    "id": "usr-10001",
    "employeeId": "10001",
    "name": "Super Admin",
    "role": "Super Admin",
    "category": "Admin",
    "dept": "University Executive Administration",
    "email": "superadmin.10001@ctu.edu.in",
    "avatar": "SA"
  },
  {
    "id": "usr-0",
    "employeeId": "001",
    "name": "Dr. Manjit Singh",
    "role": "Super Admin",
    "category": "Admin",
    "dept": "University Administration",
    "email": "superadmin@ctu.edu.in",
    "avatar": "MS"
  }
];
export const INITIAL_TASKS = [
  {
    "_id": "6a919159583df6788df622e1",
    "id": "CTU-CSE-501",
    "title": "Mid",
    "description": "Mid",
    "stage": "Assigned",
    "priority": "Medium",
    "assigneeId": "usr-imp-1787108239345-0",
    "assigneeName": "Rohit",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-28T17:00",
    "dueTime": "17:00",
    "subtasks": [
      {
        "id": "s-1787649201632",
        "text": "Mid",
        "done": false
      }
    ],
    "attachments": [],
    "progressPercent": 0,
    "deadlineHealth": "Green",
    "isIdle": false,
    "creatorName": "Dr. Nitin Tandon",
    "creatorId": "usr-24051",
    "creatorRole": "Super Administrator",
    "departmentName": "Vice Chancellor / Executive Director & Dean Research"
  },
  {
    "_id": "6a919159583df6788df622e2",
    "id": "CTU-CSE-899",
    "title": "Task",
    "description": "Task",
    "stage": "Assigned",
    "priority": "Medium",
    "assigneeId": "usr-imp-1787108239345-54",
    "assigneeName": "Jagseer Singh",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-28T17:00",
    "dueTime": "17:00",
    "subtasks": [
      {
        "id": "s-1787649009347",
        "text": "Task",
        "done": false
      }
    ],
    "attachments": [],
    "progressPercent": 0,
    "deadlineHealth": "Green",
    "isIdle": false,
    "creatorName": "Dr. Nitin Tandon",
    "creatorId": "usr-24051",
    "creatorRole": "Super Administrator",
    "departmentName": "Vice Chancellor / Executive Director & Dean Research"
  },
  {
    "_id": "6a919159583df6788df622e3",
    "id": "CTU-CSE-753",
    "title": "hello",
    "description": "",
    "stage": "Assigned",
    "priority": "Medium",
    "assigneeId": "usr-imp-1787108239345-19",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-28T17:00",
    "dueTime": "17:00",
    "subtasks": [],
    "attachments": [],
    "progressPercent": 0,
    "deadlineHealth": "Green",
    "isIdle": false,
    "creatorName": "Dr. Nitin Tandon",
    "creatorId": "usr-24051",
    "creatorRole": "Super Administrator",
    "departmentName": "Vice Chancellor / Executive Director & Dean Research",
    "chatMessages": [
      {
        "id": "msg-1787649049457",
        "sender": "Dr. Nitin Tandon",
        "senderName": "Dr. Nitin Tandon",
        "senderId": "usr-24051",
        "senderEmpId": "24051",
        "senderAvatar": "NT",
        "text": "hlo",
        "time": "02:40 PM",
        "attachment": null
      }
    ]
  },
  {
    "_id": "6a919159583df6788df622e4",
    "id": "CTU-CSE-703",
    "title": "dndfkjgven",
    "description": "kjdhfvke",
    "stage": "Accepted",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938392080-17",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T17:00",
    "dueTime": "17:00",
    "subtasks": [],
    "attachments": [],
    "progressPercent": 100,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622e5",
    "id": "CTU-CSE-626",
    "title": "jnvfjv",
    "description": "nj fvjh",
    "stage": "Under Review",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938392080-17",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-12",
    "dueTime": "17:00",
    "subtasks": [
      {
        "id": "s-1786989939132",
        "text": "jdbv",
        "done": true
      }
    ],
    "attachments": [],
    "progressPercent": 100,
    "deadlineHealth": "Green",
    "isIdle": false,
    "creatorName": "Dr. Abhilash Thakur",
    "creatorId": "usr-imp-1786938431093-3",
    "creatorRole": "Administrative Staff",
    "departmentName": "Vc office",
    "extensions": [
      {
        "id": "ext-1787067603239",
        "reason": "klnknki",
        "requestedDeadline": "2026-08-12",
        "status": "APPROVED"
      }
    ]
  },
  {
    "_id": "6a919159583df6788df622e6",
    "id": "CTU-CSE-495",
    "title": "jvfehdv",
    "description": "dkvhirue",
    "stage": "Submitted for Review",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938431093-3",
    "assigneeName": "Dr. Abhilash Thakur",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T17:00",
    "dueTime": "17:00",
    "subtasks": [],
    "attachments": [],
    "progressPercent": 90,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622e7",
    "id": "CTU-CSE-198",
    "title": "kldfnveriumkldv",
    "description": "jkdbhce",
    "stage": "Assigned",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938392080-17",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T17:00",
    "dueTime": "17:00",
    "subtasks": [
      {
        "id": "s-1786989555892",
        "text": "kjbdv",
        "done": false
      }
    ],
    "attachments": [],
    "progressPercent": 0,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622e8",
    "id": "CTU-CSE-925",
    "title": "ejvoidf",
    "description": "kjbefvkuer",
    "stage": "Assigned",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938392080-17",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T17:00",
    "dueTime": "17:00",
    "subtasks": [],
    "attachments": [],
    "progressPercent": 0,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622e9",
    "id": "CTU-CSE-185",
    "title": "hjbnhjh nihfihr",
    "description": "kjhdfiu",
    "stage": "Accepted",
    "priority": "Medium",
    "assigneeId": "usr-24051",
    "assigneeName": "Dr. Nitin Tandon",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T17:00",
    "dueTime": "17:00",
    "subtasks": [],
    "attachments": [],
    "progressPercent": 100,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622ea",
    "id": "CTU-CSE-194",
    "title": "title",
    "description": "title",
    "stage": "In Progress",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938431093-3",
    "assigneeName": "Dr. Abhilash Thakur",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T17:00",
    "dueTime": "17:00",
    "subtasks": [
      {
        "id": "s-1786985910184",
        "text": "title",
        "done": false
      }
    ],
    "attachments": [],
    "progressPercent": 90,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622eb",
    "id": "CTU-CSE-336",
    "title": "exam",
    "description": "exam",
    "stage": "Assigned",
    "priority": "Medium",
    "assigneeId": "usr-imp-1786938392080-17",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-20T14:00",
    "dueTime": "14:00",
    "subtasks": [],
    "progressPercent": 0,
    "deadlineHealth": "Green",
    "isIdle": false
  },
  {
    "_id": "6a919159583df6788df622ec",
    "id": "CTU-CSE-451",
    "title": "erp handle foe students",
    "description": "has to do all the erp work",
    "stage": "Under Review",
    "priority": "High",
    "assigneeId": "usr-imp-1786938392080-17",
    "assigneeName": "Arvin Vinayek",
    "tags": [
      "Academic",
      "CSE"
    ],
    "dueDate": "2026-08-21",
    "subtasks": [
      {
        "id": "s-1786938671444",
        "text": "students",
        "done": true
      },
      {
        "id": "s-1786938675906",
        "text": "teacher",
        "done": true
      }
    ],
    "progressPercent": 90,
    "deadlineHealth": "Green",
    "isIdle": false,
    "chatMessages": [
      {
        "id": "msg-1786938834887",
        "sender": "Kuldeep Kumar",
        "text": "do this work witin 2 hours",
        "time": "10:53 PM",
        "attachment": null
      }
    ]
  },
  {
    "_id": "6a919159583df6788df622ed",
    "id": "CTU-ENG-301",
    "title": "Smart City Internet of Things Research Paper Submission",
    "description": "Prepare and submit peer-reviewed manuscript for IEEE IoT Journal.",
    "creatorName": "Dr. Nitin Tandon (Super Admin)",
    "creatorId": "usr-24051",
    "assigneeId": "usr-10001",
    "assigneeName": "Super Admin",
    "departmentName": "School of Engineering & Technology",
    "priority": "High",
    "stage": "Accepted",
    "deadlineHealth": "Green",
    "progressPercent": 100,
    "dueDate": "2026-08-25",
    "isIdle": false,
    "subtasks": [
      {
        "id": "st-av-1",
        "text": "Compile experimental data plots",
        "done": true
      },
      {
        "id": "st-av-2",
        "text": "Draft IEEE two-column paper template",
        "done": true
      }
    ],
    "extensions": [],
    "chatMessages": [
      {
        "id": "m-1",
        "sender": "Dr. Nitin Tandon",
        "text": "Please ensure IEEE conference citation format is verified.",
        "time": "10:15 AM"
      }
    ]
  },
  {
    "_id": "6a919159583df6788df622ee",
    "id": "CTU-MGT-401",
    "title": "NAAC Executive Management Accreditation Audit",
    "description": "Assemble School of Management syllabus modules and student feedback audits.",
    "creatorName": "Dr. Simranjeet Kaur Gill (Super Admin)",
    "creatorId": "usr-17572",
    "assigneeId": "usr-24051",
    "assigneeName": "Dr. Nitin Tandon",
    "departmentName": "School of Management & Sciences",
    "priority": "Urgent",
    "stage": "Under Review",
    "deadlineHealth": "Green",
    "progressPercent": 75,
    "dueDate": "2026-08-22",
    "isIdle": false,
    "subtasks": [
      {
        "id": "st-sd-1",
        "text": "Collect student feedback forms",
        "done": true
      },
      {
        "id": "st-sd-2",
        "text": "Compile course outcome report",
        "done": true
      }
    ],
    "extensions": [],
    "chatMessages": []
  },
  {
    "_id": "6a919159583df6788df622ef",
    "id": "CTU-CSE-101",
    "title": "NAAC Accreditation Criterion 3 Research Report",
    "description": "Compile research publications, consultancy grants, and patents data for NAAC inspection.",
    "creatorName": "Dr. Manjit Singh (Super Admin)",
    "creatorId": "usr-0",
    "assigneeId": "usr-17572",
    "assigneeName": "Dr. Simranjeet Kaur Gill",
    "departmentName": "Computer Science & Engineering",
    "priority": "High",
    "stage": "Submitted for Review",
    "deadlineHealth": "Yellow",
    "progressPercent": 90,
    "dueDate": "2026-08-20",
    "isIdle": false,
    "subtasks": [
      {
        "id": "st-1",
        "text": "Gather Scopus publication index",
        "done": true
      },
      {
        "id": "st-2",
        "text": "Verify consultancy project receipts",
        "done": true
      },
      {
        "id": "st-3",
        "text": "Draft PDF annexure summary",
        "done": true
      }
    ],
    "extensions": [],
    "chatMessages": []
  },
  {
    "_id": "6a919159583df6788df622f0",
    "id": "CTU-EXAM-202",
    "title": "Mid-Semester Exam Outcome-Based Question Paper Setup",
    "description": "Prepare bloom taxonomy mapped question paper for End-Term University Examinations.",
    "creatorName": "Dr. Nitin Tandon (Super Admin)",
    "creatorId": "usr-24051",
    "assigneeId": "usr-0",
    "assigneeName": "Dr. Manjit Singh",
    "departmentName": "Central Academic Affairs",
    "priority": "Urgent",
    "stage": "Accepted",
    "deadlineHealth": "Green",
    "progressPercent": 100,
    "dueDate": "2026-08-24",
    "isIdle": false,
    "subtasks": [
      {
        "id": "st-ex-1",
        "text": "Map Level 4 Bloom questions",
        "done": true
      },
      {
        "id": "st-ex-2",
        "text": "Draft answer keys & rubrics",
        "done": true
      }
    ],
    "extensions": [],
    "chatMessages": []
  },
  {
    "_id": "6a919159583df6788df622f1",
    "id": "CTU-LAW-104",
    "title": "National Moot Court Competition Organization",
    "description": "Finalize moot court student briefs and invite Punjab High Court judges.",
    "creatorName": "Dr. Simranjeet Kaur Gill (Super Admin)",
    "creatorId": "usr-17572",
    "assigneeId": "usr-10001",
    "assigneeName": "Super Admin",
    "departmentName": "School of Law",
    "priority": "Medium",
    "stage": "Accepted",
    "deadlineHealth": "Green",
    "progressPercent": 100,
    "dueDate": "2026-08-15",
    "isIdle": false,
    "subtasks": [
      {
        "id": "st-lw-1",
        "text": "Issue official invitation letters",
        "done": true
      },
      {
        "id": "st-lw-2",
        "text": "Publish competition rulebook",
        "done": true
      }
    ],
    "extensions": [],
    "chatMessages": []
  },
  {
    "_id": "6a919159583df6788df622f2",
    "id": "CTU-PHARM-501",
    "title": "Pharmaceutical Chemistry Lab Equipment Audit",
    "description": "Inspect HPLC and Spectrophotometer calibration certificates.",
    "creatorName": "Dr. Nitin Tandon (Super Admin)",
    "creatorId": "usr-24051",
    "assigneeId": "usr-24051",
    "assigneeName": "Dr. Nitin Tandon",
    "departmentName": "School of Pharmaceutical Sciences",
    "priority": "Low",
    "stage": "Under Review",
    "deadlineHealth": "Green",
    "progressPercent": 100,
    "dueDate": "2026-08-28",
    "isIdle": false,
    "subtasks": [
      {
        "id": "st-ph-1",
        "text": "Log calibration logbook",
        "done": true
      },
      {
        "id": "st-ph-2",
        "text": "Attach AMC vendor receipt",
        "done": false
      }
    ],
    "extensions": [],
    "chatMessages": [],
    "review": {
      "isApproved": false,
      "feedback": "Please attach verified vendor AMC receipt before final signoff.",
      "newRestartDeadline": "2026-08-28"
    }
  }
];

export const STAGES = ['Assigned', 'In Progress', 'Submitted for Review', 'Under Review', 'Re-issued', 'Accepted'];
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

    return `${monthDayYear} (${dayName}) â€¢ ${timeStr}`;
  } catch (e) {
    return dueDate;
  }
}

export function getUrgentCountdownInfo(dueDate, dueTime, stage) {
  if (!dueDate || stage === 'Accepted') return null;

  try {
    let combinedStr = dueDate;
    if (dueDate.includes('T')) {
      combinedStr = dueDate;
    } else if (dueTime) {
      combinedStr = `${dueDate}T${dueTime}`;
    } else {
      combinedStr = `${dueDate}T17:00`;
    }

    const targetDate = new Date(combinedStr.includes('T') ? combinedStr : combinedStr.replace(' ', 'T'));
    if (isNaN(targetDate.getTime())) return null;

    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs < 0) {
      const overdueHours = Math.abs(Math.floor(diffHours));
      return {
        isOverdue: true,
        isUrgent24h: true,
        text: overdueHours < 24 ? `ðŸš¨ OVERDUE BY ${overdueHours}h` : `ðŸš¨ OVERDUE BY ${Math.floor(overdueHours / 24)}d`,
        bgColor: '#fee2e2',
        textColor: '#b91c1c',
        borderColor: '#fca5a5'
      };
    }

    if (diffHours <= 24) {
      const hours = Math.floor(diffHours);
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return {
        isOverdue: false,
        isUrgent24h: true,
        text: `ðŸ”¥ DUE IN ${hours}h ${minutes}m`,
        bgColor: '#fff7ed',
        textColor: '#c2410c',
        borderColor: '#fdba74'
      };
    }

    return null;
  } catch (e) {
    return null;
  }
}
