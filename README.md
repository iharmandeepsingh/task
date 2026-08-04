# TaskPulse - Workspace & Task Assignment System

A modern, high-performance Task Assignment & Workspace Management application built with **React**, **Vite**, and **Vanilla CSS Design Tokens**.

Created for GitHub user **[iharmandeepsingh](https://github.com/iharmandeepsingh)**.

---

## 🌟 Key Features

1. **Kanban Board View**: Interactive 4-column workflow (*To Do*, *In Progress*, *In Review*, *Done*) with stage transitions and subtask progress indicators.
2. **Detailed List / Table View**: Sortable columns by ID, Title, Stage, Priority, Assignee, and Due Date with inline actions.
3. **Team Workload Directory**: Team member profiles, active/completed task counters, and role distribution.
4. **Live Metrics Dashboard**: Completion rate tracking, total active tasks, in-progress counters, and urgent priority alerts.
5. **Real-time Filter & Search**: Search by title, description, or tags with multi-tier priority filtering.
6. **Task Creation & Subtask Checklist**: Full modal interface for creating and editing tasks with dynamic subtasks.
7. **Local Persistence**: Integrated `localStorage` auto-saving.

---

## 🚀 How to Publish to GitHub (https://github.com/iharmandeepsingh)

Follow these simple steps in your terminal to publish this workspace to your GitHub account:

1. **Create a new repository on GitHub**:
   Go to [https://github.com/new](https://github.com/new) and create a public or private repository named `task-assignment`.

2. **Add Remote Origin**:
   ```bash
   git remote add origin https://github.com/iharmandeepsingh/task-assignment.git
   ```

3. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```

---

## 💻 Local Development Setup

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle
npm run build
```

---

## 📁 Workspace Architecture

```
task assignement/
├── src/
│   ├── components/
│   │   ├── GitHubSyncModal.jsx   # Interactive GitHub deployment modal
│   │   ├── KanbanBoard.jsx       # 4-stage Kanban Board
│   │   ├── ListView.jsx          # Sortable task directory
│   │   ├── Navbar.jsx            # Top navigation, search, and view tabs
│   │   ├── StatsOverview.jsx     # Workspace metrics cards
│   │   ├── TaskModal.jsx         # Create & edit task modal
│   │   └── TeamDirectory.jsx     # Team workload tracker
│   ├── data/
│   │   └── initialData.js        # Default tasks & team members
│   ├── App.jsx                   # Main application container
│   ├── index.css                 # Glassmorphic CSS design tokens
│   └── main.jsx                  # Application entry point
├── package.json
└── README.md
```
