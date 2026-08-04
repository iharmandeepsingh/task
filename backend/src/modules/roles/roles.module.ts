import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { DepartmentScopeGuard } from '../../common/guards/department-scope.guard';

@Module({
  controllers: [RolesController],
  providers: [RolesService, PermissionsGuard, RolesGuard, DepartmentScopeGuard],
  exports: [RolesService, PermissionsGuard, RolesGuard, DepartmentScopeGuard],
})
export class RolesModule {}
