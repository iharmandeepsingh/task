import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PriorityLevel } from '@prisma/client';

export class CreateSubtaskItemDto {
  @ApiProperty({ description: 'Subtask Title', example: 'Collect Faculty Publications' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Subtask Description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Sequence order', example: 1 })
  sequence!: number;

  @ApiProperty({ description: 'Optional subtask due date', required: false })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class CreateTaskAttachmentDto {
  @ApiProperty({ description: 'Original File Name', example: 'Syllabus_Guidelines.pdf' })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({ description: 'S3 File Key', example: 'attachments/task-101/Syllabus_Guidelines.pdf' })
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @ApiProperty({ description: 'File Size in Bytes', example: 1048576 })
  fileSize!: number;

  @ApiProperty({ description: 'MIME Type', example: 'application/pdf' })
  @IsString()
  @IsNotEmpty()
  mimeType!: string;
}

export class CreateTaskDto {
  @ApiProperty({ description: 'Task Title', example: 'Prepare Department Accreditation Report' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Detailed Task Description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Specific Instructions for Assignee', required: false })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ description: 'Assignee Faculty User UUID' })
  @IsUUID()
  @IsNotEmpty()
  assigneeId!: string;

  @ApiProperty({ description: 'Department UUID' })
  @IsUUID()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({ description: 'Priority Level', enum: PriorityLevel, default: PriorityLevel.MEDIUM })
  @IsEnum(PriorityLevel)
  @IsOptional()
  priority?: PriorityLevel = PriorityLevel.MEDIUM;

  @ApiProperty({ description: 'Task Start Date (ISO String)', example: '2026-08-04T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiProperty({ description: 'Task Deadline Date (ISO String)', example: '2026-08-15T23:59:59Z' })
  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @ApiProperty({ description: 'Optional Subtasks List', type: [CreateSubtaskItemDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskItemDto)
  subtasks?: CreateSubtaskItemDto[];

  @ApiProperty({ description: 'Optional Attachments List', type: [CreateTaskAttachmentDto], required: false })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskAttachmentDto)
  attachments?: CreateTaskAttachmentDto[];
}
