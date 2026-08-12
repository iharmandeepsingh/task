import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UserRoleType } from '@prisma/client';

export class ProvisionAccountDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserRoleType)
  @IsNotEmpty()
  roleName: UserRoleType;

  @IsString()
  @IsOptional()
  organizationUnitId?: string;
}
