import { SetMetadata } from '@nestjs/common';
import { UserRoleType } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const RequireRoles = (...roles: UserRoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
