import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRoleType } from '@prisma/client';

export class AssignRoleDto {
  @ApiProperty({ description: 'Target user ID (UUID)' })
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ description: 'Role name enum', enum: UserRoleType })
  @IsEnum(UserRoleType)
  @IsNotEmpty()
  roleName!: UserRoleType;
}
