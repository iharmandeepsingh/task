import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ProvisionAccountDto } from './dto/provision-account.dto';
import { EmployeeStatus, AccountStatus, UserRoleType, EmailType, MembershipType } from '@prisma/client';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a single employee master record manually.
   */
  async createEmployee(dto: CreateEmployeeDto, actorId: string) {
    const existing = await this.prisma.employee.findUnique({
      where: { employeeId: dto.employeeId },
    });
    if (existing) {
      throw new ConflictException(`Employee ID ${dto.employeeId} already exists`);
    }

    if (dto.email) {
      const existingEmail = await this.prisma.employee.findUnique({
        where: { primaryEmail: dto.email.toLowerCase().trim() },
      });
      if (existingEmail) {
        throw new ConflictException(`Primary email ${dto.email} is already in use`);
      }
    }

    const employee = await this.prisma.employee.create({
      data: {
        employeeId: dto.employeeId.trim(),
        displayName: `${dto.firstName} ${dto.lastName}`.trim(),
        firstName: dto.firstName,
        lastName: dto.lastName,
        primaryEmail: dto.email ? dto.email.toLowerCase().trim() : null,
        phone: dto.phone,
        designation: dto.designation,
        employmentStatus: EmployeeStatus.ACTIVE,
        source: 'MANUAL',
        emails: dto.email
          ? {
              create: {
                email: dto.email.toLowerCase().trim(),
                type: EmailType.UNIVERSITY,
                isPrimary: true,
                isVerified: true,
              },
            }
          : undefined,
      },
      include: {
        emails: true,
        memberships: { include: { organizationUnit: true } },
        user: true,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'EMPLOYEE_CREATED',
        entity: 'Employee',
        entityId: employee.id,
        metadata: { employeeId: employee.employeeId, displayName: employee.displayName },
      },
    });

    return employee;
  }

  /**
   * Fetches paginated employee directory with filters and least-privilege projection.
   */
  async getEmployees(params: {
    organizationUnitId?: string;
    designation?: string;
    employmentStatus?: EmployeeStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { organizationUnitId, designation, employmentStatus, search, page = 1, limit = 20 } = params;

    const where: any = {};

    if (employmentStatus) {
      where.employmentStatus = employmentStatus;
    }

    if (designation) {
      where.designation = { contains: designation, mode: 'insensitive' };
    }

    if (organizationUnitId) {
      where.memberships = {
        some: { organizationUnitId },
      };
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { primaryEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        include: {
          memberships: {
            include: { organizationUnit: true },
          },
          emails: true,
          user: {
            select: { id: true, accountStatus: true, userRoles: { include: { role: true } } },
          },
        },
        orderBy: { displayName: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      employees,
    };
  }

  /**
   * Fetches detailed employee record.
   */
  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        emails: true,
        memberships: { include: { organizationUnit: true } },
        user: {
          include: {
            userRoles: { include: { role: true } },
            scopes: { include: { organizationUnit: true } },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee ID ${id} not found`);
    }

    return employee;
  }

  /**
   * Provisions a User application account for an existing Employee record.
   * Separate, controlled authorization operation.
   */
  async provisionUserAccount(employeeId: string, dto: ProvisionAccountDto, actorUser: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException(`Employee ID ${employeeId} not found`);
    }

    if (employee.user) {
      throw new ConflictException('Application account already provisioned for this employee');
    }

    if (!employee.primaryEmail) {
      throw new BadRequestException('Cannot provision application login account for employee without a canonical primary email');
    }

    // Privileged Role Protections: Assigning SUPER_ADMIN requires actor to have SUPER_ADMIN role
    if (dto.roleName === UserRoleType.SUPER_ADMIN) {
      const isActorSuperAdmin = actorUser.roles && actorUser.roles.includes(UserRoleType.SUPER_ADMIN);
      if (!isActorSuperAdmin) {
        throw new ForbiddenException('Privilege escalation blocked: Only an existing Super Admin can provision a SUPER_ADMIN account');
      }
    }

    const role = await this.prisma.role.findUnique({
      where: { name: dto.roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role ${dto.roleName} not found`);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          employeeId: employee.employeeId,
          email: employee.primaryEmail!,
          passwordHash,
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
          userRoles: {
            create: { roleId: role.id },
          },
        },
      });

      await tx.employee.update({
        where: { id: employeeId },
        data: {
          userId: user.id,
        },
      });

      if (dto.organizationUnitId) {
        await tx.userScope.create({
          data: {
            userId: user.id,
            organizationUnitId: dto.organizationUnitId,
            grantedBy: actorUser.id,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: actorUser.id,
          action: 'USER_ACCOUNT_CREATED',
          entity: 'User',
          entityId: user.id,
          metadata: { employeeId: employee.employeeId, roleName: dto.roleName },
        },
      });

      return user;
    });

    return {
      message: 'Application user account successfully provisioned',
      userId: newUser.id,
      employeeId: employee.employeeId,
      primaryEmail: employee.primaryEmail,
      role: dto.roleName,
    };
  }

  /**
   * Updates employee master record details.
   */
  async updateEmployee(id: string, dto: UpdateEmployeeDto, actorId: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      throw new NotFoundException(`Employee ID ${id} not found`);
    }

    const updated = await this.prisma.employee.update({
      where: { id },
      data: {
        displayName: dto.firstName || dto.lastName ? `${dto.firstName || ''} ${dto.lastName || ''}`.trim() : undefined,
        phone: dto.phone,
        designation: dto.designation,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'EMPLOYEE_UPDATED',
        entity: 'Employee',
        entityId: id,
        metadata: dto as any,
      },
    });

    return updated;
  }
}
