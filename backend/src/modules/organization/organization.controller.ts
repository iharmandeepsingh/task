import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@ApiTags('Organization')
@Controller('organization')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly orgService: OrganizationService) {}

  @Post('schools')
  @RequirePermissions('USER_MANAGE')
  @ApiOperation({ summary: 'Create a new university school' })
  @ApiResponse({ status: 201, description: 'School created successfully' })
  async createSchool(@Body() dto: CreateSchoolDto) {
    return this.orgService.createSchool(dto);
  }

  @Get('schools')
  @ApiOperation({ summary: 'List all university schools and embedded departments' })
  @ApiResponse({ status: 200, description: 'Schools retrieved successfully' })
  async getSchools() {
    return this.orgService.getAllSchools();
  }

  @Post('departments')
  @RequirePermissions('USER_MANAGE')
  @ApiOperation({ summary: 'Create a new department within a school' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.orgService.createDepartment(dto);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List all university departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async getDepartments() {
    return this.orgService.getAllDepartments();
  }
}
