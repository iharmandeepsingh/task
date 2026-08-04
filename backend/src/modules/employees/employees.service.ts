import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkImportEmployeesDto } from './dto/import-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(dto: CreateEmployeeDto, actorId: string) {
    // Check duplicate email or employeeId
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { employeeId: dto.employeeId }],
      },
    });
    if (existing) {
      throw new ConflictException('User with this email or Employee ID already exists');
    }

    // Verify Department
    const department = await this.prisma.department.findUnique({
      where: { id: dto.departmentId },
    });
    if (!department) {
      throw new NotFoundException(`Department with ID ${dto.departmentId} not found`);
    }

    // Verify Role
    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role ${dto.roleName} not found`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create User, Profile, Role in transaction
    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeId: dto.employeeId,
          email: dto.email,
          passwordHash,
          profile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              designation: dto.designation,
              phone: dto.phone,
              departmentId: dto.departmentId,
            },
          },
          userRoles: {
            create: {
              roleId: role.id,
            },
          },
        },
        include: {
          profile: {
            include: {
              department: true,
            },
          },
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'EMPLOYEE_CREATED',
          entity: 'User',
          entityId: user.id,
          metadata: { employeeId: user.employeeId, email: user.email },
        },
      });

      return user;
    });

    return newUser;
  }

  async getEmployees(params: {
    departmentId?: string;
    roleName?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (params.isActive !== undefined) {
      whereClause.isActive = params.isActive;
    }

    if (params.departmentId) {
      whereClause.profile = { departmentId: params.departmentId };
    }

    if (params.roleName) {
      whereClause.userRoles = {
        some: {
          role: {
            name: params.roleName,
          },
        },
      };
    }

    if (params.search) {
      whereClause.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { employeeId: { contains: params.search, mode: 'insensitive' } },
        { profile: { firstName: { contains: params.search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where: whereClause }),
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        select: {
          id: true,
          employeeId: true,
          email: true,
          isActive: true,
          createdAt: true,
          profile: {
            include: {
              department: {
                include: {
                  school: true,
                },
              },
            },
          },
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployeeById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        isActive: true,
        createdAt: true,
        profile: {
          include: {
            department: {
              include: {
                school: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            role: true,
          },
        },
        assignedTasks: {
          select: {
            id: true,
            taskCode: true,
            title: true,
            status: true,
            priority: true,
            deadline: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return user;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    if (dto.departmentId) {
      const dept = await this.prisma.department.findUnique({ where: { id: dto.departmentId } });
      if (!dept) {
        throw new NotFoundException(`Department ${dto.departmentId} not found`);
      }
    }

    const updated = await this.prisma.employeeProfile.update({
      where: { userId: id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        designation: dto.designation,
        phone: dto.phone,
        departmentId: dto.departmentId,
      },
      include: {
        department: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'EMPLOYEE_UPDATED',
        entity: 'EmployeeProfile',
        entityId: id,
        metadata: dto as any,
      },
    });

    return updated;
  }

  async deactivateEmployee(id: string, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const deactivated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'EMPLOYEE_DEACTIVATE',
        entity: 'User',
        entityId: id,
      },
    });

    return { message: `Employee ${deactivated.employeeId} account has been deactivated.` };
  }

  async bulkImportEmployees(dto: BulkImportEmployeesDto, actorId: string) {
    let successfulRows = 0;
    let failedRows = 0;
    const validationErrors: Array<{ row: number; error: string }> = [];
    const duplicateEmployees: Array<{ employeeId: string; email: string }> = [];

    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    for (let i = 0; i < dto.records.length; i++) {
      const row = dto.records[i];
      const rowIndex = i + 1;

      try {
        // 1. Check duplicate
        const existing = await this.prisma.user.findFirst({
          where: {
            OR: [{ email: row.email }, { employeeId: row.employeeId }],
          },
        });
        if (existing) {
          failedRows++;
          duplicateEmployees.push({ employeeId: row.employeeId, email: row.email });
          validationErrors.push({ row: rowIndex, error: `Employee ${row.employeeId} / ${row.email} already exists.` });
          continue;
        }

        // 2. Resolve Department by Code
        const dept = await this.prisma.department.findUnique({
          where: { code: row.departmentCode },
        });
        if (!dept) {
          failedRows++;
          validationErrors.push({ row: rowIndex, error: `Department code '${row.departmentCode}' not found.` });
          continue;
        }

        // 3. Resolve Role
        const role = await this.prisma.role.findUnique({
          where: { name: row.roleName },
        });
        if (!role) {
          failedRows++;
          validationErrors.push({ row: rowIndex, error: `Role '${row.roleName}' not found.` });
          continue;
        }

        const passwordHash = row.password ? await bcrypt.hash(row.password, 10) : defaultPasswordHash;

        // 4. Create User in DB
        await this.prisma.user.create({
          data: {
            employeeId: row.employeeId,
            email: row.email,
            passwordHash,
            profile: {
              create: {
                firstName: row.firstName,
                lastName: row.lastName,
                designation: row.designation,
                phone: row.phone,
                departmentId: dept.id,
              },
            },
            userRoles: {
              create: {
                roleId: role.id,
              },
            },
          },
        });

        successfulRows++;
      } catch (err: any) {
        failedRows++;
        validationErrors.push({ row: rowIndex, error: err.message || 'Row import failed.' });
      }
    }

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'EMPLOYEE_IMPORT',
        entity: 'User',
        entityId: actorId,
        metadata: { total: dto.records.length, successfulRows, failedRows },
      },
    });

    return {
      totalRecordsProcessed: dto.records.length,
      successfulRows,
      failedRows,
      validationErrors,
      duplicateEmployees,
    };
  }
}
