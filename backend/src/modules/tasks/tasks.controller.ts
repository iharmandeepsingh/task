import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { DepartmentScopeGuard } from '../../common/guards/department-scope.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Task Management & Assignment')
@Controller('tasks')
@UseGuards(JwtAuthGuard, PermissionsGuard, DepartmentScopeGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @RequirePermissions('TASK_CREATE', 'TASK_ASSIGN')
  @ApiOperation({ summary: 'Create a new task and assign to faculty' })
  @ApiResponse({ status: 201, description: 'Task created and assigned successfully' })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('userId') creatorId: string,
  ) {
    return this.tasksService.createTask(dto, creatorId);
  }

  @Get()
  @ApiOperation({ summary: 'Search and filter tasks with role-based scoping' })
  @ApiResponse({ status: 200, description: 'Tasks list retrieved successfully' })
  async findAll(
    @Query() query: QueryTaskDto,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.getTasks(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detailed task information including subtasks, timeline & extensions' })
  @ApiResponse({ status: 200, description: 'Task details retrieved successfully' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tasksService.getTaskById(id, user);
  }
}
