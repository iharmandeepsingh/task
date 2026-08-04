import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User authentication context is missing');
    }

    // Fetch user permissions from database
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const userPermissionSet = new Set<string>();
    userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        userPermissionSet.add(rp.permission.code);
      });
    });

    // Super admin override check
    if (userPermissionSet.has('SUPER_ADMIN_OVERRIDE')) {
      return true;
    }

    // Check if user possesses all required permissions
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissionSet.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
