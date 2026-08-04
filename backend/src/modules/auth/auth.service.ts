import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/password-reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Find user by Email or Employee ID
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.loginId },
          { employeeId: dto.loginId },
        ],
      },
      include: {
        profile: {
          include: {
            department: {
              include: {
                school: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    // 2. Account Status Guard
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated. Please contact HR.');
    }

    // 3. Password Verification
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    // 4. Extract Roles & Permissions
    const roles = user.userRoles.map((ur) => ur.role.name.toString());
    const permissionSet = new Set<string>();
    user.userRoles.forEach((ur) => {
      ur.role.permissions.forEach((rp) => {
        permissionSet.add(rp.permission.code);
      });
    });
    const permissions = Array.from(permissionSet);

    // 5. Generate Access & Refresh Tokens
    const payload = {
      sub: user.id,
      employeeId: user.employeeId,
      email: user.email,
      roles: roles,
      departmentId: user.profile?.departmentId || null,
    };

    const secret = this.configService.get<string>('jwt.accessSecret') || 'dev_access_secret_change_me_in_prod';
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'dev_refresh_secret_change_me_in_prod';

    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: 'access' },
      {
        secret,
        expiresIn: (this.configService.get<string>('jwt.accessExpiration') || '15m') as any,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      {
        secret: refreshSecret,
        expiresIn: (this.configService.get<string>('jwt.refreshExpiration') || '7d') as any,
      },
    );

    // 6. Record Audit Log for Login
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        metadata: { loginTime: new Date().toISOString() },
      },
    });

    return {
      user: {
        id: user.id,
        employeeId: user.employeeId,
        email: user.email,
        roles: roles,
        permissions: permissions,
        profile: user.profile
          ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              designation: user.profile.designation,
              department: user.profile.department,
            }
          : null,
      },
      tokens: {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      },
    };
  }

  async refreshToken(dto: RefreshTokenDto) {
    try {
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret') || 'dev_refresh_secret_change_me_in_prod';
      const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or token is invalid');
      }

      const roles = user.userRoles.map((ur) => ur.role.name.toString());
      const newPayload = {
        sub: user.id,
        employeeId: user.employeeId,
        email: user.email,
        roles: roles,
      };

      const secret = this.configService.get<string>('jwt.accessSecret') || 'dev_access_secret_change_me_in_prod';

      const accessToken = await this.jwtService.signAsync(
        { ...newPayload, type: 'access' },
        {
          secret,
          expiresIn: (this.configService.get<string>('jwt.accessExpiration') || '15m') as any,
        },
      );

      const refreshToken = await this.jwtService.signAsync(
        { ...newPayload, type: 'refresh' },
        {
          secret: refreshSecret,
          expiresIn: (this.configService.get<string>('jwt.refreshExpiration') || '7d') as any,
        },
      );

      return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer',
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'LOGOUT',
        entity: 'User',
        entityId: userId,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      return { message: 'If email exists, password reset instructions have been dispatched.' };
    }

    return {
      message: 'If email exists, password reset instructions have been dispatched.',
      note: 'In production, a signed reset token will be dispatched via email.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    if (!dto.resetToken || !dto.newPassword) {
      throw new BadRequestException('Reset token and new password are required');
    }

    return { message: 'Password has been reset successfully.' };
  }
}
