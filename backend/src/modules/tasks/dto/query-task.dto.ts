import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus, PriorityLevel, DeadlineHealth } from '@prisma/client';
import { Transform } from 'class-transformer';

export class QueryTaskDto {
  @ApiProperty({ required: false, enum: TaskStatus })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ required: false, enum: PriorityLevel })
  @IsEnum(PriorityLevel)
  @IsOptional()
  priority?: PriorityLevel;

  @ApiProperty({ required: false, enum: DeadlineHealth })
  @IsEnum(DeadlineHealth)
  @IsOptional()
  deadlineHealth?: DeadlineHealth;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isIdle?: boolean;

  @ApiProperty({ required: false, description: 'Search title, code, description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}
