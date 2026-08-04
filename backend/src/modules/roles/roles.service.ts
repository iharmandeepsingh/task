import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async assignRoleToUser(dto: AssignRoleDto, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const role = await this.prisma.role.findUnique({ where: { name: dto.roleName } });
    if (!role) {
      throw new NotFoundException(`Role ${dto.roleName} not found`);
    }

    // Upsert UserRole mapping
    await this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: dto.userId,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        userId: dto.userId,
        roleId: role.id,
      },
    });

    // Log Audit event
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'ROLE_CHANGED',
        entity: 'UserRole',
        entityId: dto.userId,
        metadata: { assignedRole: dto.roleName },
      },
    });

    return { message: `Role ${dto.roleName} assigned to user successfully` };
  }
}
