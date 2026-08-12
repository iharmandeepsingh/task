import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { OrganizationUnitType } from '@prisma/client';

export class CreateOrganizationUnitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(OrganizationUnitType)
  @IsOptional()
  type?: OrganizationUnitType;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
