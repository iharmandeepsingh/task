import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ description: 'School Name', example: 'School of Engineering & Technology' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Unique School Code', example: 'SOE' })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
