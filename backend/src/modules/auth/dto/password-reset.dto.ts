import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Registered employee email address',
    example: 'facultya@ctu.edu.in',
  })
  @IsEmail({}, { message: 'Valid email address is required' })
  @IsNotEmpty()
  email!: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token received via email' })
  @IsString()
  @IsNotEmpty()
  resetToken!: string;

  @ApiProperty({ description: 'New password', example: 'NewPassword123!' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  newPassword!: string;
}
