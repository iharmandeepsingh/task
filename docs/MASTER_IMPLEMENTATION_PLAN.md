# CT University Task Assignment, Monitoring & Faculty Workflow System
## Master Technical Architecture & Phased Implementation Plan

---

## 1. Executive Summary & Technology Stack

The **CT University Task Assignment, Monitoring & Faculty Workflow System** is an enterprise-grade, cross-platform mobile application (Android & iOS) powered by a single Flutter codebase and backed by a modular, scalable Node.js + TypeScript (NestJS) backend with PostgreSQL, Prisma ORM, and Redis + BullMQ for background processing.

### Recommended Technology Stack & Rationale

| Layer | Technology | Rationale & Purpose |
|---|---|---|
| **Mobile App (iOS/Android)** | **Flutter 3.x (Dart)** | Single codebase compiling natively for Android and iOS; declarative UI, high performance, consistent styling across devices. |
| **State Management** | **Flutter Riverpod (v2.x)** | Type-safe, compile-time safe dependency injection and state management without Context dependencies; easy testing and mocking. |
| **Mobile Secure Storage** | **flutter_secure_storage** | Encrypted key-value storage for JWT access and refresh tokens using Keychain (iOS) and Keystore (Android). |
| **Mobile Router** | **GoRouter** | Declarative, role-based navigation guarding, path parameter parsing, deep linking. |
| **Backend Framework** | **NestJS (TypeScript)** | Enterprise Angular-style modular structure, built-in Dependency Injection, Guards, Interceptors, Pipes, and native OpenAPI/Swagger support. |
| **Database ORM** | **Prisma ORM** | Type-safe database client, auto-generated TypeScript models, robust schema migration engine (`prisma migrate`). |
| **Database Engine** | **PostgreSQL 16** | Relational ACID compliance, strong foreign key constraints, JSONB column support for flexible audit logs and configuration specs. |
| **Cache & Queue Engine** | **Redis 7 + BullMQ** | High-performance memory queue for background cron jobs (automated reminders every 3 days, idle task scanners), socket sessions, rate limiting. |
| **Real-time Engine** | **NestJS WebSockets (Socket.io)** | Real-time task-specific chat and live notification updates. |
| **Mobile Push Engine** | **Firebase Cloud Messaging (FCM)** | Cross-platform push notifications for Android & iOS when tasks are assigned, reminded, or updated. |
| **File Storage** | **Object Storage (AWS S3 / MinIO)** | Decoupled file storage; pre-signed URL upload/download authorization without loading binary files into PostgreSQL. |

---

## 2. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                            MOBILE CLIENT (Flutter)                                |
|    [Faculty App]      [Admin/Head App]         [HR App]        [Super Admin App]   |
+-----------------------------------------------------------------------------------+
                                         |  REST API / WebSockets (HTTPS / WSS)
                                         v
+-----------------------------------------------------------------------------------+
|                             BACKEND API (NestJS)                                  |
|  +-------------------+  +--------------------+  +------------------------------+  |
|  | Auth & Guard      |  | Task State Machine |  | RBAC & Scope Enforcer        |  |
|  +-------------------+  +--------------------+  +------------------------------+  |
|  | Task Service      |  | Extension Service  |  | Chat & WebSocket Gateway     |  |
|  +-------------------+  +--------------------+  +------------------------------+  |
+-----------------------------------------------------------------------------------+
         |                        |                             |
         v                        v                             v
+------------------+   +--------------------+        +---------------------+
| PostgreSQL 16    |   | Redis 7 + BullMQ   |        | AWS S3 / MinIO      |
| (Database & Data |   | (Background Jobs,  |        | (Task Attachments,  |
|  Integrity)      |   |  Reminders, Queue) |        |  Submissions, Chat) |
+------------------+   +--------------------+        +---------------------+
                                  |
                                  v
                       +--------------------+
                       |  FCM (Push Engine) |
                       +--------------------+
```

---

## 3. Role-Based Access Control (RBAC) & Scope Boundaries

### Roles & Hierarchical Scope

1. **SUPER_ADMIN**: Global access across all schools, departments, users, tasks, audit logs, and configuration.
2. **ADMIN_HEAD**: Scoped strictly to assigned Department/School. Can manage tasks, review submissions, approve extensions, and view workload. Cannot modify global settings or other departments.
3. **HR**: Scoped to employee and faculty profiles management (create, update, deactivate, import). No permission to alter task academic decisions unless granted.
4. **FACULTY**: Scoped strictly to self-assigned tasks. Can view assigned tasks, update progress, request extensions, submit work, and chat with assigning Head.

### Permission Matrix

| Permission | SUPER_ADMIN | ADMIN_HEAD | HR | FACULTY |
|---|:---:|:---:|:---:|:---:|
| `USER_MANAGE` | ✅ | ❌ | ✅ | ❌ |
| `EMPLOYEE_IMPORT` | ✅ | ❌ | ✅ | ❌ |
| `ROLE_MANAGE` | ✅ | ❌ | ❌ | ❌ |
| `TASK_CREATE` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `TASK_ASSIGN` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `TASK_UPDATE` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `TASK_REVIEW` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `TASK_REISSUE` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `TASK_SUBMIT` | ❌ | ❌ | ❌ | ✅ (Assigned) |
| `PROGRESS_UPDATE` | ❌ | ❌ | ❌ | ✅ (Assigned) |
| `EXTENSION_REQUEST` | ❌ | ❌ | ❌ | ✅ (Assigned) |
| `EXTENSION_APPROVE` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `EXTENSION_REJECT` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `REPORT_VIEW` | ✅ (Global) | ✅ (Dept Scoped) | ❌ | ❌ |
| `REPORT_EXPORT` | ✅ | ✅ (Dept Scoped) | ❌ | ❌ |
| `CHAT_ACCESS` | ✅ | ✅ (Task Scoped) | ❌ | ✅ (Task Scoped) |
| `AUDIT_LOG_VIEW` | ✅ | ❌ | ❌ | ❌ |
| `SUPER_ADMIN_OVERRIDE` | ✅ | ❌ | ❌ | ❌ |

---

## 4. State Machines

### 4.1 Task Lifecycle State Machine

```
      [ASSIGNED]
          │
          ▼
    [IN_PROGRESS] ─────── (Progress Updates 0-90%)
          │
          ▼
     [SUBMITTED]
          │
          ▼
    [UNDER_REVIEW]
      /        \
     /          \ (Reject + Feedback)
    ▼            ▼
[COMPLETED]  [REJECTED]
                 │
                 ▼ (Reissue with new timeline)
            [REISSUED]
                 │
                 ▼
            [IN_PROGRESS]
```

**State Transition Guard Rules:**
- `ASSIGNED` ➔ `IN_PROGRESS`: Triggered when faculty acknowledges or logs first progress update.
- `IN_PROGRESS` ➔ `SUBMITTED`: Requires progress = 100% and optional submission attachment/notes.
- `SUBMITTED` ➔ `UNDER_REVIEW`: Automated transition or explicit review start by Admin/Head.
- `UNDER_REVIEW` ➔ `COMPLETED`: Triggered on Admin approval. Records reviewer ID, timestamp, and deadline health status.
- `UNDER_REVIEW` ➔ `REJECTED`: Requires non-empty rejection reason string.
- `REJECTED` ➔ `REISSUED`: Admin sets new deadline, feedback, and re-triggers state to `IN_PROGRESS`.
- **Forbidden Transition**: Direct transition from `COMPLETED` to `IN_PROGRESS` is strictly disallowed without explicit `SUPER_ADMIN_OVERRIDE`.

### 4.2 Extension Request State Machine

```
[EXTENSION_REQUESTED] (Faculty creates request)
         │
         ├───► [APPROVED] ──► (Task deadline updated, history preserved, audit logged)
         │
         └───► [REJECTED] ──► (Original deadline maintained, decision reason logged)
```

---

## 5. Database Schema (Prisma PostgreSQL Data Model)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRoleType {
  SUPER_ADMIN
  ADMIN_HEAD
  HR
  FACULTY
}

enum PriorityLevel {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  ASSIGNED
  IN_PROGRESS
  SUBMITTED
  UNDER_REVIEW
  COMPLETED
  REJECTED
  REISSUED
  OVERDUE
}

enum ExtensionStatus {
  PENDING
  APPROVED
  REJECTED
}

enum DeadlineHealth {
  GREEN
  YELLOW
  ORANGE
  RED
}

model School {
  id          String       @id @default(uuid())
  name        String       @unique
  code        String       @unique
  departments Department[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Department {
  id        String            @id @default(uuid())
  name      String
  code      String            @unique
  schoolId  String
  school    School            @relation(fields: [schoolId], references: [id])
  profiles  EmployeeProfile[]
  tasks     Task[]
  createdAt DateTime          @default(now())
  updatedAt DateTime          @updatedAt
}

model User {
  id            String            @id @default(uuid())
  employeeId    String            @unique
  email         String            @unique
  passwordHash  String
  isActive      Boolean           @default(true)
  profile       EmployeeProfile?
  userRoles     UserRole[]
  assignedTasks Task[]            @relation("TaskAssignee")
  createdTasks  Task[]            @relation("TaskCreator")
  reviews       TaskReview[]
  extensions    ExtensionRequest[]
  chats         ChatMessage[]
  notifications Notification[]
  auditLogs     AuditLog[]
  deviceTokens  DeviceToken[]
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

model EmployeeProfile {
  id           String     @id @default(uuid())
  userId       String     @unique
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName    String
  lastName     String
  phone        String?
  designation  String
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}

model Role {
  id          String           @id @default(uuid())
  name        UserRoleType     @unique
  permissions RolePermission[]
  userRoles   UserRole[]
}

model Permission {
  id    String           @id @default(uuid())
  code  String           @unique // e.g. TASK_CREATE, EXTENSION_APPROVE
  roles RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
}

model Task {
  id              String               @id @default(uuid())
  taskCode        String               @unique // CTU-1001
  title           String
  description     String
  instructions    String?
  creatorId       String
  creator         User                 @relation("TaskCreator", fields: [creatorId], references: [id])
  assigneeId      String
  assignee        User                 @relation("TaskAssignee", fields: [assigneeId], references: [id])
  departmentId    String
  department      Department           @relation(fields: [departmentId], references: [id])
  priority        PriorityLevel        @default(MEDIUM)
  status          TaskStatus           @default(ASSIGNED)
  deadlineHealth  DeadlineHealth       @default(GREEN)
  progressPercent Int                  @default(0)
  startDate       DateTime
  deadline        DateTime
  lastActivityAt  DateTime             @default(now())
  isIdle          Boolean              @default(false)
  
  subtasks        TaskSubtask[]
  progressUpdates TaskProgressUpdate[]
  attachments     TaskAttachment[]
  submissions     TaskSubmission[]
  reviews         TaskReview[]
  reissues        TaskReissue[]
  extensions      ExtensionRequest[]
  chatThread      ChatThread?

  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
}

model TaskSubtask {
  id          String   @id @default(uuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  title       String
  description String?
  sequence    Int
  isCompleted Boolean  @default(false)
  dueDate     DateTime?
  completedAt DateTime?
}

model TaskProgressUpdate {
  id              String   @id @default(uuid())
  taskId          String
  task            Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  progressPercent Int
  updateMessage   String
  attachmentUrl   String?
  createdAt       DateTime @default(now())
}

model TaskAttachment {
  id         String   @id @default(uuid())
  taskId     String
  task       Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  fileName   String
  fileKey    String
  fileSize   Int
  mimeType   String
  uploadedBy String
  createdAt  DateTime @default(now())
}

model TaskSubmission {
  id            String   @id @default(uuid())
  taskId        String
  task          Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  notes         String?
  attachmentUrl String?
  submittedAt   DateTime @default(now())
}

model TaskReview {
  id         String     @id @default(uuid())
  taskId     String
  task       Task       @relation(fields: [taskId], references: [id], onDelete: Cascade)
  reviewerId String
  reviewer   User       @relation(fields: [reviewerId], references: [id])
  status     TaskStatus // COMPLETED or REJECTED
  feedback   String
  reviewedAt DateTime   @default(now())
}

model TaskReissue {
  id          String   @id @default(uuid())
  taskId      String
  task        Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  reason      String
  newDeadline DateTime
  reissuedAt  DateTime @default(now())
}

model ExtensionRequest {
  id                String          @id @default(uuid())
  taskId            String
  task              Task            @relation(fields: [taskId], references: [id], onDelete: Cascade)
  applicantId       String
  applicant         User            @relation(fields: [applicantId], references: [id])
  currentDeadline   DateTime
  requestedDeadline DateTime
  reason            String
  status            ExtensionStatus @default(PENDING)
  decisionReason    String?
  decidedBy         String?
  decidedAt         DateTime?
  createdAt         DateTime        @default(now())
}

model ChatThread {
  id        String        @id @default(uuid())
  taskId    String        @unique
  task      Task          @relation(fields: [taskId], references: [id], onDelete: Cascade)
  messages  ChatMessage[]
  createdAt DateTime      @default(now())
}

model ChatMessage {
  id            String     @id @default(uuid())
  threadId      String
  thread        ChatThread @relation(fields: [threadId], references: [id], onDelete: Cascade)
  senderId      String
  sender        User       @relation(fields: [senderId], references: [id])
  content       String
  attachmentUrl String?
  isRead        Boolean    @default(false)
  createdAt     DateTime   @default(now())
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String
  title     String
  message   String
  taskId    String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model DeviceToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  platform  String   // ANDROID / IOS
  createdAt DateTime @default(now())
}

model AuditLog {
  id         String   @id @default(uuid())
  actorId    String
  actor      User     @relation(fields: [actorId], references: [id])
  action     String   // e.g. TASK_ASSIGNED, EXTENSION_APPROVED
  entity     String   // Task, ExtensionRequest, User
  entityId   String
  metadata   Json?
  timestamp  DateTime @default(now())
}

model DeadlineConfiguration {
  id               String   @id @default("default")
  greenThresholdDays  Int   @default(7)  // > 7 days
  yellowThresholdDays Int   @default(3)  // 3 - 7 days
  orangeThresholdDays Int   @default(1)  // < 3 days
  idleThresholdDays   Int   @default(3)  // 3 days without progress update
  updatedAt        DateTime @updatedAt
}
```

---

## 6. API Endpoint Map (`/api/v1`)

### Authentication & Users
- `POST /api/v1/auth/login`: Authenticate employee, return access + refresh tokens & user permissions.
- `POST /api/v1/auth/refresh`: Exchange refresh token for new access token.
- `POST /api/v1/auth/logout`: Invalidate refresh token session.
- `POST /api/v1/users`: Create single user/employee (HR / Super Admin).
- `POST /api/v1/users/import`: Bulk import employee CSV/XLSX (HR).
- `GET /api/v1/users`: List employees with role & department filters.

### Tasks & Workflow
- `POST /api/v1/tasks`: Create new task & assign to faculty.
- `GET /api/v1/tasks`: Search/filter tasks (paginated, role & department scoped).
- `GET /api/v1/tasks/:id`: Get detailed task view including subtasks, timeline, and extension history.
- `POST /api/v1/tasks/:id/progress`: Faculty posts progress update (percentage + message + optional attachment).
- `POST /api/v1/tasks/:id/subtasks`: Add/update subtask progress.
- `POST /api/v1/tasks/:id/submit`: Faculty submits work for review.
- `POST /api/v1/tasks/:id/review`: Admin/Head accepts or rejects submission.
- `POST /api/v1/tasks/:id/reissue`: Admin/Head reissues rejected task with new deadline.

### Extensions
- `POST /api/v1/tasks/:id/extensions`: Faculty submits extension request.
- `PATCH /api/v1/extensions/:id/decision`: Admin approves or rejects extension.

### Chat & Files
- `GET /api/v1/tasks/:id/chat/messages`: Fetch chat history for task.
- `POST /api/v1/files/upload-url`: Request presigned upload URL for attachments.

### Reports & Analytics
- `GET /api/v1/reports/faculty`: Faculty-wise completion rates & performance metrics.
- `GET /api/v1/reports/export`: Export PDF/Excel report.
- `GET /api/v1/analytics/dashboard`: University/Department level workload & status analytics.

---

## 7. Flutter Mobile Application Architecture

### Folder Structure (Clean Feature-First Architecture)

```
lib/
├── app/
│   ├── config/          # Environment variables, app constants, theme tokens
│   ├── router/          # GoRouter configuration & navigation guards
│   └── theme/           # Color palettes, typography, card design tokens
├── core/
│   ├── network/         # Dio HTTP client, JWT interceptor, refresh token handler
│   ├── storage/         # FlutterSecureStorage wrapper for tokens
│   ├── errors/          # Failure models & error parsing
│   └── widgets/         # Reusable buttons, text fields, cards, status badges
├── features/
│   ├── auth/            # Login screen, auth controller, auth repository
│   ├── dashboard/       # Role-specific dashboard layouts (Faculty, Admin, HR, SuperAdmin)
│   ├── tasks/           # Task list, Kanban view, task details, subtasks, progress form
│   ├── review/          # Review submission queue & reissue dialog
│   ├── extensions/      # Extension request form & decision approval UI
│   ├── chat/            # Task-specific chat thread & attachment launcher
│   ├── reports/         # Faculty analytics & report card views
│   └── hr/              # Employee directory & CSV import result dialog
└── main.dart
```

---

## 8. Background Jobs & Automated Reminders (BullMQ + Redis)

1. **Deadline Health & Reminder Cron Job**: Runs daily at midnight.
   - Evaluates remaining days against `DeadlineConfiguration`.
   - Sends reminders for tasks due in 15–30 days every 3 days.
   - Triggers FCM push notifications & in-app notification records.
2. **Idle Task Detection Job**: Runs daily.
   - Scans active tasks where `lastActivityAt` > `idleThresholdDays` (e.g. 3 days).
   - Sets `isIdle = true` and alerts both Faculty and assigning Admin/Head.
3. **Overdue Status Transition Job**: Runs hourly.
   - Automatically flags uncompleted tasks past deadline as `OVERDUE`.

---

## 9. Phased Implementation Plan (Checkpoints 0 to 18)

| Checkpoint | Scope & Description | Status | Target Deliverable |
|---|---|:---:|---|
| **CHECKPOINT 0** | Requirements validation & Master Architecture Plan | ✅ COMPLETE | `docs/MASTER_IMPLEMENTATION_PLAN.md` |
| **CHECKPOINT 1** | Repository & Project Scaffold (NestJS + Flutter) | ✅ COMPLETE | Clean monorepo structure with `/backend`, `/mobile`, `/docs` |
| **CHECKPOINT 2** | Database & Prisma Model Definition | ⏳ PENDING | PostgreSQL docker container, Prisma schema, initial migration |
| **CHECKPOINT 3** | Authentication Engine | ⏳ PENDING | JWT Access/Refresh tokens, bcrypt password hashing, login API |
| **CHECKPOINT 4** | RBAC & Department Scoping Guards | ⏳ PENDING | `PermissionsGuard`, `DepartmentScopeGuard`, seed permissions |
| **CHECKPOINT 5** | Organization & Employee Management | ⏳ PENDING | Department, School, User CRUD & HR Bulk Import API |
| **CHECKPOINT 6** | Core Task Assignment API | ⏳ PENDING | Task creation, assignment, validation rules |
| **CHECKPOINT 7** | Task Lifecycle State Machine & Progress Engine | ⏳ PENDING | Subtask CRUD, progress updates, state machine guards |
| **CHECKPOINT 8** | Extension, Review & Reissue Engine | ⏳ PENDING | Extension approval flow, submission review & task reissue |
| **CHECKPOINT 9** | Deadline Engine & Idle Task Scanner | ⏳ PENDING | BullMQ Redis jobs, automated reminder cron, idle flags |
| **CHECKPOINT 10** | Task-Specific Chat & File Storage | ⏳ PENDING | Socket.io gateway, S3 presigned URL file upload integration |
| **CHECKPOINT 11** | Reporting, Analytics & PDF/Excel Export | ⏳ PENDING | Report generation, CSV/XLSX export backend endpoints |
| **CHECKPOINT 12** | Flutter Auth & Role Router | ⏳ PENDING | Flutter Riverpod auth state, GoRouter navigation guards |
| **CHECKPOINT 13** | Faculty Mobile Experience | ⏳ PENDING | Faculty dashboard, assigned tasks, progress logger, extensions |
| **CHECKPOINT 14** | Admin/Head Mobile Experience | ⏳ PENDING | Admin dashboard, task creator, review queue, extension approval |
| **CHECKPOINT 15** | HR & Super Admin Mobile Views | ⏳ PENDING | University analytics, global audit logs, HR employee manager |
| **CHECKPOINT 16** | Automated Testing & Security Hardening | ⏳ PENDING | Unit & E2E tests, rate limiting, security headers, input validation |
| **CHECKPOINT 17** | Production Build & Deployment Guide | ⏳ PENDING | Docker compose production config, CI/CD pipeline |
| **CHECKPOINT 18** | Android & iOS Store Release Preparation | ⏳ PENDING | App icons, Android APK build, iOS bundle configuration |

---

## 10. Risk Analysis & Edge Cases Resolution

1. **Edge Case: Faculty attempts to review own task**:
   - *Resolution*: Backend `TaskReviewGuard` strictly asserts `creatorId === currentUserId` or user has `TASK_REVIEW` for the assigned department, blocking faculty self-review attempts.
2. **Edge Case: Cross-Department Admin Access**:
   - *Resolution*: `DepartmentScopeGuard` validates user's assigned department scope against target task's department ID before executing any update.
3. **Edge Case: Duplicate Extension Request**:
   - *Resolution*: Prisma unique constraint on `ExtensionRequest` for `taskId` with status `PENDING`. Only one pending extension request allowed per task.
4. **Edge Case: Historical Extension & Deadline Overwrites**:
   - *Resolution*: Previous deadlines and approval timestamps are logged permanently in `ExtensionRequest` records; original `deadline` history is preserved.
