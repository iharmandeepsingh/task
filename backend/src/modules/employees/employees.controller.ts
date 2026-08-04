import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { BulkImportEmployeesDto } from './dto/import-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DepartmentScopeGuard } from '../../common/guards/department-scope.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Employees & Faculty Management')
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentScopeGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @RequirePermissions('EMPLOYEE_CREATE')
  @ApiOperation({ summary: 'Create single employee user record' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(
    @Body() dto: CreateEmployeeDto,
    @CurrentUser('userId') actorId: string,
  ) {
    return this.employeesService.createEmployee(dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'List employees with pagination and filters' })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'roleName', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('roleName') roleName?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeesService.getEmployees({
      departmentId,
      roleName,
      search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed employee profile by User ID' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }

  @Patch(':id')
  @RequirePermissions('EMPLOYEE_UPDATE')
  @ApiOperation({ summary: 'Update employee profile details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser('userId') actorId: string,
  ) {
    return this.employeesService.updateEmployee(id, dto, actorId);
  }

  @Patch(':id/deactivate')
  @RequirePermissions('EMPLOYEE_DEACTIVATE')
  @ApiOperation({ summary: 'Deactivate employee account' })
  async deactivate(
    @Param('id') id: string,
    @CurrentUser('userId') actorId: string,
  ) {
    return this.employeesService.deactivateEmployee(id, actorId);
  }

  @Post('import')
  @RequirePermissions('EMPLOYEE_IMPORT')
  @ApiOperation({ summary: 'Bulk import employee records from CSV / JSON data' })
  @ApiResponse({ status: 200, description: 'Bulk import completed with summary report' })
  async bulkImport(
    @Body() dto: BulkImportEmployeesDto,
    @CurrentUser('userId') actorId: string,
  ) {
    return this.employeesService.bulkImportEmployees(dto, actorId);
  }
}
