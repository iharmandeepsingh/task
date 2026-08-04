import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'University Employee ID or Email address',
    example: 'EMP-001 or superadmin@ctu.edu.in',
  })
  @IsString()
  @IsNotEmpty({ message: 'Login ID (Employee ID or Email) is required' })
  loginId!: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
