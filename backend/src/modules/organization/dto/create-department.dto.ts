import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department Name', example: 'Computer Science & Engineering' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unique Department Code', example: 'CSE' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ description: 'School UUID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  schoolId!: string;
}
