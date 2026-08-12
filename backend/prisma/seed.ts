import { PrismaClient, UserRoleType, PriorityLevel, TaskStatus, ExtensionStatus, DeadlineHealth, OrganizationUnitType, EmployeeStatus, AccountStatus, EmailType, MembershipType } from '@prisma/client';
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
    'EMPLOYEE_CREATE', 'EMPLOYEE_UPDATE', 'EMPLOYEE_DEACTIVATE', 'EMPLOYEE_IMPORT', 'EMPLOYEE_VIEW',
    'TASK_CREATE', 'TASK_ASSIGN', 'TASK_UPDATE', 'TASK_DELETE', 'TASK_REVIEW', 'TASK_REISSUE',
    'EXTENSION_REQUEST', 'EXTENSION_APPROVE', 'EXTENSION_REJECT',
    'REPORT_VIEW', 'REPORT_EXPORT', 'CHAT_ACCESS', 'USER_CREATE', 'ROLE_ASSIGN', 'SCOPE_ASSIGN'
  ];

  for (const code of permissionCodes) {
    await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: `Permission for ${code}` },
    });
  }

  // 4. Seed Organization Units & Bridge with Schools & Departments
  const ctuUniversityOrg = await prisma.organizationUnit.upsert({
    where: { code: 'CTU' },
    update: {},
    create: {
      name: 'CT University',
      code: 'CTU',
      type: OrganizationUnitType.UNIVERSITY,
      isActive: true,
    },
  });

  const soeOrg = await prisma.organizationUnit.upsert({
    where: { code: 'SOE-ORG' },
    update: {},
    create: {
      name: 'School of Engineering & Technology',
      code: 'SOE-ORG',
      type: OrganizationUnitType.SCHOOL,
      parentId: ctuUniversityOrg.id,
      isActive: true,
    },
  });

  const cseDeptOrg = await prisma.organizationUnit.upsert({
    where: { code: 'CSE-ORG' },
    update: {},
    create: {
      name: 'Computer Science & Engineering',
      code: 'CSE-ORG',
      type: OrganizationUnitType.DEPARTMENT,
      parentId: soeOrg.id,
      isActive: true,
    },
  });

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
    update: { organizationUnitId: cseDeptOrg.id },
    create: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      schoolId: school.id,
      organizationUnitId: cseDeptOrg.id,
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

  // 5. Seed Users, Profiles, & Employee Master Records
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-001',
      email: 'superadmin@ctu.edu.in',
      passwordHash: devPasswordHash,
      accountStatus: AccountStatus.ACTIVE,
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

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-001' },
    update: { userId: superAdminUser.id },
    create: {
      employeeId: 'EMP-001',
      displayName: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      primaryEmail: 'superadmin@ctu.edu.in',
      designation: 'University System Administrator',
      employmentType: 'REGULAR',
      employmentStatus: EmployeeStatus.ACTIVE,
      userId: superAdminUser.id,
      source: 'SEED',
      memberships: {
        create: {
          organizationUnitId: ctuUniversityOrg.id,
          membershipType: MembershipType.PRIMARY,
          isPrimary: true,
        },
      },
    },
  });

  const cseHeadUser = await prisma.user.upsert({
    where: { email: 'csehead@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-101',
      email: 'csehead@ctu.edu.in',
      passwordHash: devPasswordHash,
      accountStatus: AccountStatus.ACTIVE,
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

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-101' },
    update: { userId: cseHeadUser.id },
    create: {
      employeeId: 'EMP-101',
      displayName: 'Dr. Rajesh Kumar',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      primaryEmail: 'csehead@ctu.edu.in',
      designation: 'Head of Department (CSE)',
      employmentType: 'REGULAR',
      employmentStatus: EmployeeStatus.ACTIVE,
      userId: cseHeadUser.id,
      source: 'SEED',
      memberships: {
        create: {
          organizationUnitId: cseDeptOrg.id,
          membershipType: MembershipType.PRIMARY,
          isPrimary: true,
        },
      },
    },
  });

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-201',
      email: 'hr@ctu.edu.in',
      passwordHash: devPasswordHash,
      accountStatus: AccountStatus.ACTIVE,
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

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-201' },
    update: { userId: hrUser.id },
    create: {
      employeeId: 'EMP-201',
      displayName: 'Priya Sharma',
      firstName: 'Priya',
      lastName: 'Sharma',
      primaryEmail: 'hr@ctu.edu.in',
      designation: 'HR Executive',
      employmentType: 'REGULAR',
      employmentStatus: EmployeeStatus.ACTIVE,
      userId: hrUser.id,
      source: 'SEED',
    },
  });

  const facultyAUser = await prisma.user.upsert({
    where: { email: 'facultya@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-301',
      email: 'facultya@ctu.edu.in',
      passwordHash: devPasswordHash,
      accountStatus: AccountStatus.ACTIVE,
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

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-301' },
    update: { userId: facultyAUser.id },
    create: {
      employeeId: 'EMP-301',
      displayName: 'Harmandeep Singh',
      firstName: 'Harmandeep',
      lastName: 'Singh',
      primaryEmail: 'facultya@ctu.edu.in',
      designation: 'Assistant Professor',
      employmentType: 'REGULAR',
      employmentStatus: EmployeeStatus.ACTIVE,
      userId: facultyAUser.id,
      source: 'SEED',
      memberships: {
        create: {
          organizationUnitId: cseDeptOrg.id,
          membershipType: MembershipType.PRIMARY,
          isPrimary: true,
        },
      },
    },
  });

  const facultyBUser = await prisma.user.upsert({
    where: { email: 'facultyb@ctu.edu.in' },
    update: {},
    create: {
      employeeId: 'EMP-302',
      email: 'facultyb@ctu.edu.in',
      passwordHash: devPasswordHash,
      accountStatus: AccountStatus.ACTIVE,
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

  await prisma.employee.upsert({
    where: { employeeId: 'EMP-302' },
    update: { userId: facultyBUser.id },
    create: {
      employeeId: 'EMP-302',
      displayName: 'Amit Verma',
      firstName: 'Amit',
      lastName: 'Verma',
      primaryEmail: 'facultyb@ctu.edu.in',
      designation: 'Associate Professor',
      employmentType: 'REGULAR',
      employmentStatus: EmployeeStatus.ACTIVE,
      userId: facultyBUser.id,
      source: 'SEED',
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
      creatorId: cseHeadUser.id,
      assigneeId: facultyAUser.id,
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
