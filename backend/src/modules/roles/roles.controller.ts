import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { AssignRoleDto } from './dto/assign-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles & Permissions')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequirePermissions('ROLE_MANAGE')
  @ApiOperation({ summary: 'List all system roles and their assigned permissions' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully' })
  async getRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('permissions')
  @RequirePermissions('PERMISSION_MANAGE')
  @ApiOperation({ summary: 'List all available system permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  async getPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Post('assign')
  @RequirePermissions('ROLE_MANAGE')
  @ApiOperation({ summary: 'Assign a role to a target user' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  async assignRole(
    @Body() dto: AssignRoleDto,
    @CurrentUser('userId') actorId: string,
  ) {
    return this.rolesService.assignRoleToUser(dto, actorId);
  }
}
