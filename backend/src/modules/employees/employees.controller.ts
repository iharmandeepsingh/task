import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { EmployeeImportService } from './services/employee-import.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ProvisionAccountDto } from './dto/provision-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions as Permissions } from '../../common/decorators/require-permissions.decorator';
import { EmployeeStatus, ImportRowStatus } from '@prisma/client';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly importService: EmployeeImportService,
  ) {}

  // 1. Employee Import Architecture Endpoints
  @Post('import/upload')
  @Permissions('EMPLOYEE_IMPORT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload employee Excel/CSV file for staging & validation' })
  async uploadImportFile(@UploadedFile() file: any, @Request() req: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('File upload required (.xlsx or .csv)');
    }

    // Validate MIME type & file extension
    const allowedExtensions = ['.xlsx', '.csv'];
    const fileName = (file.originalname || '').toLowerCase();
    const isValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      throw new BadRequestException('Invalid file format. Strictly .xlsx or .csv files are supported.');
    }

    return this.importService.uploadAndParseImportFile(file.buffer, file.originalname || 'upload.xlsx', req.user.id);
  }

  @Get('import/:jobId/preview')
  @Permissions('EMPLOYEE_IMPORT')
  @ApiOperation({ summary: 'Get paginated import staging preview rows with validation status filter' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', enum: ImportRowStatus, required: false })
  async getImportJobPreview(
    @Param('jobId') jobId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ImportRowStatus,
  ) {
    return this.importService.getImportJobPreview(
      jobId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
      status,
    );
  }

  @Post('import/:jobId/confirm')
  @Permissions('EMPLOYEE_IMPORT')
  @ApiOperation({ summary: 'Confirm and execute transactional batch import of valid staged rows' })
  async confirmImportJob(@Param('jobId') jobId: string, @Request() req: any) {
    return this.importService.confirmImportJob(jobId, req.user.id);
  }

  // 2. Employee Master Directory Endpoints
  @Get()
  @Permissions('EMPLOYEE_VIEW', 'EMPLOYEE_IMPORT', 'USER_MANAGE')
  @ApiOperation({ summary: 'Search and filter employee master directory' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'organizationUnitId', required: false })
  @ApiQuery({ name: 'designation', required: false })
  @ApiQuery({ name: 'employmentStatus', enum: EmployeeStatus, required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getEmployees(
    @Query('search') search?: string,
    @Query('organizationUnitId') organizationUnitId?: string,
    @Query('designation') designation?: string,
    @Query('employmentStatus') employmentStatus?: EmployeeStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeesService.getEmployees({
      search,
      organizationUnitId,
      designation,
      employmentStatus,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get(':id')
  @Permissions('EMPLOYEE_VIEW', 'EMPLOYEE_IMPORT', 'USER_MANAGE')
  @ApiOperation({ summary: 'Get detailed employee profile record' })
  async getEmployeeById(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }

  @Post()
  @Permissions('EMPLOYEE_CREATE')
  @ApiOperation({ summary: 'Manually create single employee record' })
  async createEmployee(@Body() dto: CreateEmployeeDto, @Request() req: any) {
    return this.employeesService.createEmployee(dto, req.user.id);
  }

  @Patch(':id')
  @Permissions('EMPLOYEE_UPDATE')
  @ApiOperation({ summary: 'Update employee record details' })
  async updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto, @Request() req: any) {
    return this.employeesService.updateEmployee(id, dto, req.user.id);
  }

  // 3. Account Provisioning Endpoint
  @Post(':id/provision-account')
  @Permissions('USER_CREATE', 'ROLE_ASSIGN')
  @ApiOperation({ summary: 'Provision application User account for an existing Employee' })
  async provisionAccount(
    @Param('id') employeeId: string,
    @Body() dto: ProvisionAccountDto,
    @Request() req: any,
  ) {
    return this.employeesService.provisionUserAccount(employeeId, dto, req.user);
  }
}
