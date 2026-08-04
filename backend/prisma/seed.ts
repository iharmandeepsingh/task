import { PrismaClient, UserRoleType, PriorityLevel, TaskStatus, ExtensionStatus, DeadlineHealth } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CT University Database Seeding...');

  // 1. Seed System Configuration Defaults
  await prisma.deadlineConfiguration.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      greenThresholdDays: 7,
      yellowThresholdDays: 3,
      orangeThresholdDays: 1,
      idleThresholdDays: 3,
    },
  });

  // 2. Seed Roles
  const roles = [
    { name: UserRoleType.SUPER_ADMIN, description: 'Super Administrator with global university access' },
    { name: UserRoleType.ADMIN_HEAD, description: 'Department or School Head' },
    { name: UserRoleType.HR, description: 'Human Resources Employee Manager' },
    { name: UserRoleType.FACULTY, description: 'University Academic Faculty Member' },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of roles) {
    const roleRecord = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    roleMap[r.name] = roleRecord.id;
  }

  // 3. Seed Permissions
  const permissionCodes = [
    'USER_MANAGE', 'ROLE_MANAGE', 'PERMISSION_MANAGE', 'AUDIT_LOG_VIEW', 'SUPER_ADMIN_OVERRIDE',
    'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DEACTIVATE', 'EMPLOYEE_IMPORT',
    'TASK_CREATE', 'TASK_ASSIGN', 'TASK_UPDATE', 'TASK_DELETE', 'TASK_REVIEW', 'TASK_REISSUE',
    'EXTENSION_REQUEST', 'EXTENSION_APPROVE', 'EXTENSION_REJECT',
    'REPORT_VIEW', 'REPORT_EXPORT', 'CHAT_ACCESS'
  ];

  for (const code of permissionCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: `Permission for ${code}` },
    });
  }

  // 4. Seed Schools & Departments
  const school = await prisma.school.upsert({
    where: { code: 'SOE' },
    update: {},
    create: {
      name: 'School of Engineering & Technology',
      code: 'SOE',
    },
  });

  const cseDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      schoolId: school.id,
    },
  });

  const eceDept = await prisma.department.upsert({
    where: { code: 'ECE' },
    update: {},
    create: {
      name: 'Electronics & Communication Engineering',
      code: 'ECE',
      schoolId: school.id,
    },
  });

  // Default hashed password for dev accounts: 'Password123!'
  const devPasswordHash = '$2b$10$EpRnTzVlqHNP0.fKbX26D.gNqMv4w7u2N3I0A2.3I4K5L6M7N8O9P';

  // 5. Seed Users & Profiles
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-001',
      email: 'superadmin@ctu.edu.in',
      passwordHash: devPasswordHash,
      userRoles: { create: { roleId: roleMap[UserRoleType.SUPER_ADMIN] } },
      profile: {
        create: {
          firstName: 'Super',
          lastName: 'Admin',
          designation: 'University System Administrator',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // CSE Head
  const cseHead = await prisma.user.upsert({
    where: { email: 'csehead@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-101',
      email: 'csehead@ctu.edu.in',
      passwordHash: devPasswordHash,
      userRoles: { create: { roleId: roleMap[UserRoleType.ADMIN_HEAD] } },
      profile: {
        create: {
          firstName: 'Dr. Rajesh',
          lastName: 'Kumar',
          designation: 'Head of Department (CSE)',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // HR Manager
  await prisma.user.upsert({
    where: { email: 'hr@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-201',
      email: 'hr@ctu.edu.in',
      passwordHash: devPasswordHash,
      userRoles: { create: { roleId: roleMap[UserRoleType.HR] } },
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Sharma',
          designation: 'HR Executive',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // Faculty A
  const facultyA = await prisma.user.upsert({
    where: { email: 'facultya@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-301',
      email: 'facultya@ctu.edu.in',
      passwordHash: devPasswordHash,
      userRoles: { create: { roleId: roleMap[UserRoleType.FACULTY] } },
      profile: {
        create: {
          firstName: 'Harmandeep',
          lastName: 'Singh',
          designation: 'Assistant Professor',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // Faculty B
  const facultyB = await prisma.user.upsert({
    where: { email: 'facultyb@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-302',
      email: 'facultyb@ctu.edu.in',
      passwordHash: devPasswordHash,
      userRoles: { create: { roleId: roleMap[UserRoleType.FACULTY] } },
      profile: {
        create: {
          firstName: 'Amit',
          lastName: 'Verma',
          designation: 'Associate Professor',
          departmentId: cseDept.id,
        },
      },
    },
  });

  // 6. Seed Sample Tasks across lifecycles
  const now = new Date();
  const deadlineIn7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const deadlineIn2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const pastDeadline = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  // Task 1: Normal In-Progress Task
  await prisma.task.upsert({
    where: { taskCode: 'CTU-1001' },
    update: {},
    create: {
      taskCode: 'CTU-1001',
      title: 'Prepare NBA Accreditation Curriculum Syllabus',
      description: 'Review and update B.Tech CSE syllabus as per NBA accreditation guidelines.',
      instructions: 'Include industry 4.0 modules and practical lab exercises.',
      creatorId: cseHead.id,
      assigneeId: facultyA.id,
      departmentId: cseDept.id,
      priority: PriorityLevel.HIGH,
      status: TaskStatus.IN_PROGRESS,
      deadlineHealth: DeadlineHealth.GREEN,
      progressPercent: 40,
      startDate: now,
      deadline: deadlineIn7Days,
      subtasks: {
        create: [
          { title: 'Draft Operating Systems Module', sequence: 1, isCompleted: true },
          { title: 'Draft Artificial Intelligence Module', sequence: 2, isCompleted: false },
        ],
      },
    },
  });

  // Task 2: High Priority Submitted Task
  await prisma.task.upsert({
    where: { taskCode: 'CTU-1002' },
    update: {},
    create: {
      taskCode: 'CTU-1002',
      title: 'Submit End-Semester Exam Question Papers',
      description: 'Upload end-term examination papers for Data Structures and Algorithms.',
      creatorId: cseHead.id,
      assigneeId: facultyB.id,
      departmentId: cseDept.id,
      priority: PriorityLevel.URGENT,
      status: TaskStatus.SUBMITTED,
      deadlineHealth: DeadlineHealth.YELLOW,
      progressPercent: 100,
      startDate: now,
      deadline: deadlineIn2Days,
      submissions: {
        create: {
          notes: 'Completed question paper set with answer key attached.',
        },
      },
    },
  });

  // Task 3: Overdue Task
  await prisma.task.upsert({
    where: { taskCode: 'CTU-1003' },
    update: {},
    create: {
      taskCode: 'CTU-1003',
      title: 'Submit Monthly Faculty Research Report',
      description: 'Compile research papers published in Scopus/SCI journals during July.',
      creatorId: cseHead.id,
      assigneeId: facultyA.id,
      departmentId: cseDept.id,
      priority: PriorityLevel.MEDIUM,
      status: TaskStatus.OVERDUE,
      deadlineHealth: DeadlineHealth.RED,
      progressPercent: 20,
      startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      deadline: pastDeadline,
    },
  });

  console.log('✅ CT University Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
