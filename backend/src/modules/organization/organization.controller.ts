import { Controller, Get, Post, Param, UseGuards, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateOrganizationUnitDto } from './dto/create-org-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions as Permissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Organization')
@Controller()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  // Organization Unit Endpoints
  @Get('organization-units')
  @ApiOperation({ summary: 'Get full organizational unit tree hierarchy' })
  getOrganizationTree() {
    return this.organizationService.getOrganizationTree();
  }

  @Get('organization-units/:id')
  @ApiOperation({ summary: 'Get organizational unit detail by ID' })
  getOrganizationUnitById(@Param('id') id: string) {
    return this.organizationService.getOrganizationUnitById(id);
  }

  @Post('organization-units')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ORGANIZATION_MANAGE', 'USER_MANAGE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new organizational unit' })
  createOrganizationUnit(@Body() dto: CreateOrganizationUnitDto) {
    return this.organizationService.createOrganizationUnit(dto);
  }

  @Delete('organization-units/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('ORGANIZATION_MANAGE', 'USER_MANAGE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate organizational unit (soft delete)' })
  deactivateOrganizationUnit(@Param('id') id: string) {
    return this.organizationService.deactivateOrganizationUnit(id);
  }

  // Legacy Bridge Endpoints (Schools & Departments)
  @Get('schools')
  @ApiOperation({ summary: 'Get all schools' })
  getAllSchools() {
    return this.organizationService.getAllSchools();
  }

  @Post('schools')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_MANAGE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new school' })
  createSchool(@Body() dto: CreateSchoolDto) {
    return this.organizationService.createSchool(dto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'Get all departments' })
  getAllDepartments() {
    return this.organizationService.getAllDepartments();
  }

  @Post('departments')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('USER_MANAGE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new department' })
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.organizationService.createDepartment(dto);
  }
}
