import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';

export class EmployeeImportRowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  employeeId!: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  designation!: string;

  @ApiProperty({ description: 'Department Code e.g. CSE, ECE' })
  @IsString()
  @IsNotEmpty()
  departmentCode!: string;

  @ApiProperty({ enum: UserRoleType })
  @IsEnum(UserRoleType)
  @IsNotEmpty()
  roleName!: UserRoleType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class BulkImportEmployeesDto {
  @ApiProperty({ type: [EmployeeImportRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeImportRowDto)
  records!: EmployeeImportRowDto[];
}
