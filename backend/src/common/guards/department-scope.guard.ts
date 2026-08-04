import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';

@Injectable()
export class DepartmentScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User authentication context missing');
    }

    // SUPER_ADMIN bypasses department scoping
    if (user.roles && user.roles.includes(UserRoleType.SUPER_ADMIN)) {
      return true;
    }

    // Extract target department ID from params, query, or body
    const targetDepartmentId =
      request.params?.departmentId ||
      request.query?.departmentId ||
      request.body?.departmentId;

    // If no specific department is targeted by request, pass to controller service-level filter
    if (!targetDepartmentId) {
      return true;
    }

    // Enforce matching department ID for ADMIN_HEAD or FACULTY
    if (user.departmentId && user.departmentId !== targetDepartmentId) {
      throw new ForbiddenException(
        'Access denied: Action is outside your assigned department/school scope',
      );
    }

    return true;
  }
}
