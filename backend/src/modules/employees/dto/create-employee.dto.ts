import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Unique Employee ID', example: 'EMP-401' })
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty({ description: 'Employee Email', example: 'faculty.new@ctu.edu.in' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: 'Initial Account Password', example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ description: 'First Name', example: 'Gurpreet' })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({ description: 'Last Name', example: 'Kaur' })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({ description: 'Designation Title', example: 'Assistant Professor' })
  @IsString()
  @IsNotEmpty()
  designation!: string;

  @ApiProperty({ description: 'Phone Number', example: '+919876543210', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ description: 'Department UUID' })
  @IsUUID()
  @IsNotEmpty()
  departmentId!: string;

  @ApiProperty({ description: 'Primary System Role', enum: UserRoleType })
  @IsEnum(UserRoleType)
  @IsNotEmpty()
  roleName!: UserRoleType;
}
