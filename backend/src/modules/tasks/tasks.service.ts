import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { DeadlineHealth, TaskStatus, UserRoleType } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateDeadlineHealth(deadline: Date, greenDays = 7, yellowDays = 3, orangeDays = 1): DeadlineHealth {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < 0) return DeadlineHealth.RED;
    if (diffDays <= orangeDays) return DeadlineHealth.ORANGE;
    if (diffDays <= yellowDays) return DeadlineHealth.YELLOW;
    return DeadlineHealth.GREEN;
  }

  async createTask(dto: CreateTaskDto, creatorId: string) {
    const startDate = new Date(dto.startDate);
    const deadline = new Date(dto.deadline);

    if (deadline.getTime() <= startDate.getTime()) {
      throw new BadRequestException('Task deadline date must be strictly after start date');
    }

    // Validate Assignee
    const assignee = await this.prisma.user.findUnique({
      where: { id: dto.assigneeId },
      include: { profile: true },
    });
    if (!assignee || !assignee.isActive) {
      throw new BadRequestException('Assigned faculty user does not exist or is deactivated');
    }

    // Validate Department
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(`Department ID ${dto.departmentId} not found`);
    }

    // Fetch Deadline Config
    const deadlineConfig = await this.prisma.deadlineConfiguration.findUnique({
      where: { id: 'default' },
    });

    const health = this.calculateDeadlineHealth(
      deadline,
      deadlineConfig?.greenThresholdDays || 7,
      deadlineConfig?.yellowThresholdDays || 3,
      deadlineConfig?.orangeThresholdDays || 1,
    );

    // Auto-generate unique task code (e.g. CTU-1004)
    const taskCount = await this.prisma.task.count();
    const taskCode = `CTU-${1000 + taskCount + 1}`;

    // Transactional task creation
    const createdTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          taskCode,
          title: dto.title,
          description: dto.description,
          instructions: dto.instructions,
          creatorId,
          assigneeId: dto.assigneeId,
          departmentId: dto.departmentId,
          priority: dto.priority,
          status: TaskStatus.ASSIGNED,
          deadlineHealth: health,
          startDate,
          deadline,
          subtasks: dto.subtasks && dto.subtasks.length > 0
            ? {
                create: dto.subtasks.map((st) => ({
                  title: st.title,
                  description: st.description,
                  sequence: st.sequence,
                  dueDate: st.dueDate ? new Date(st.dueDate) : null,
                })),
              }
            : undefined,
          attachments: dto.attachments && dto.attachments.length > 0
            ? {
                create: dto.attachments.map((att) => ({
                  fileName: att.fileName,
                  fileKey: att.fileKey,
                  fileSize: att.fileSize,
                  mimeType: att.mimeType,
                  uploadedBy: creatorId,
                })),
              }
            : undefined,
          chatThread: {
            create: {},
          },
        },
        include: {
          subtasks: true,
          attachments: true,
          chatThread: true,
          assignee: {
            select: { id: true, employeeId: true, email: true, profile: true },
          },
          creator: {
            select: { id: true, employeeId: true, email: true, profile: true },
          },
          department: true,
        },
      });

      // Create Notification for Assignee
      await tx.notification.create({
        data: {
          userId: dto.assigneeId,
          type: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned task [${task.taskCode}]: ${task.title}`,
          taskId: task.id,
        },
      });

      // Audit Trail
      await tx.auditLog.create({
        data: {
          actorId: creatorId,
          action: 'TASK_CREATED',
          entity: 'Task',
          entityId: task.id,
          metadata: { taskCode: task.taskCode, assigneeId: dto.assigneeId, priority: dto.priority },
        },
      });

      return task;
    });

    return createdTask;
  }

  async getTasks(query: QueryTaskDto, user: any) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    // 1. Role-based Scope Boundaries
    if (user.roles.includes(UserRoleType.SUPER_ADMIN)) {
      // Global access
      if (query.departmentId) whereClause.departmentId = query.departmentId;
    } else if (user.roles.includes(UserRoleType.ADMIN_HEAD)) {
      // Scoped to Admin's department unless explicit department is allowed
      whereClause.departmentId = user.departmentId || query.departmentId;
    } else {
      // FACULTY strictly scoped to self-assigned tasks
      whereClause.assigneeId = user.userId;
    }

    // 2. Query Filters
    if (query.status) whereClause.status = query.status;
    if (query.priority) whereClause.priority = query.priority;
    if (query.deadlineHealth) whereClause.deadlineHealth = query.deadlineHealth;
    if (query.assigneeId) whereClause.assigneeId = query.assigneeId;
    if (query.creatorId) whereClause.creatorId = query.creatorId;
    if (query.isIdle !== undefined) whereClause.isIdle = query.isIdle;

    if (query.search) {
      whereClause.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { taskCode: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, tasks] = await Promise.all([
      this.prisma.task.count({ where: whereClause }),
      this.prisma.task.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          department: true,
          assignee: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              profile: {
                select: { firstName: true, lastName: true, designation: true },
              },
            },
          },
          creator: {
            select: {
              id: true,
              employeeId: true,
              email: true,
              profile: {
                select: { firstName: true, lastName: true, designation: true },
              },
            },
          },
          _count: {
            select: { subtasks: true, progressUpdates: true, extensions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(id: string, user: any) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        department: {
          include: { school: true },
        },
        creator: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            profile: true,
          },
        },
        assignee: {
          select: {
            id: true,
            employeeId: true,
            email: true,
            profile: true,
          },
        },
        subtasks: {
          orderBy: { sequence: 'asc' },
        },
        progressUpdates: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        submissions: {
          orderBy: { submittedAt: 'desc' },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, employeeId: true, profile: true },
            },
          },
          orderBy: { reviewedAt: 'desc' },
        },
        reissues: {
          orderBy: { reissuedAt: 'desc' },
        },
        extensions: {
          orderBy: { createdAt: 'desc' },
        },
        chatThread: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Role Scope Verification
    if (
      !user.roles.includes(UserRoleType.SUPER_ADMIN) &&
      !user.roles.includes(UserRoleType.ADMIN_HEAD) &&
      task.assigneeId !== user.userId
    ) {
      throw new ForbiddenException('Access denied: You are not authorized to view this task');
    }

    return task;
  }
}
