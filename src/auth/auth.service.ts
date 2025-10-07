import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResendVerificationDto } from './dto/resendVerification.dto';
import { UserRole } from '@prisma/client';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException(
        'Password and confirm password do not match',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phone: registerDto.phone,
        role: registerDto.role || UserRole.CUSTOMER,
        emailVerificationToken,
        emailVerificationTokenExpiry,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken,
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
    }

    return {
      message:
        'Registration successful! Please check your email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });

    return {
      message: 'Email verification successful!',
    };
  }

  async resendVerificationEmail(resendVerificationDto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: resendVerificationDto.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken,
        emailVerificationTokenExpiry,
      },
    });

    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken,
      );
    } catch (error) {
      console.error('Error sending verification email:', error);
    }

    return {
      message: 'Verification email resent successfully!',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        password: true,
        addresses: true,
        orders: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email to login');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        addresses: user.addresses,
        orders: user.orders,
      },
      ...tokens,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    return user;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (
      changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword
    ) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const hashedNewPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      12,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async generateTokens(userId: string, email: string) {
    const payload = {
      email,
      sub: userId,
    };

    const refreshTokenRecord = await this.createRefreshToken(userId);

    const refreshPayload = {
      ...payload,
      tokenId: refreshTokenRecord.id,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private async createRefreshToken(userId: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return await this.prisma.refreshToken.create({
      data: {
        userId,
        token: crypto.randomBytes(64).toString('hex'),
        expiresAt,
      },
    });
  }

  async refreshTokensFromValidatedToken(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.generateTokens(userId, user.email);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Logged out from all devices successfully' };
  }

  async forgotPassword(email: string) {
    console.log(email);
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiry: resetTokenExpiry,
      },
    });

    try {
      await this.mailService.sendResetPasswordEmail(
        user.email,
        user.firstName,
        resetToken,
      );
    } catch (error: unknown) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: null,
          resetPasswordTokenExpiry: null,
        },
      });

      if (error instanceof Error) {
        throw new InternalServerErrorException(
          'Error sending reset password email: ' + error.message,
        );
      }

      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }

    return { message: 'Password reset link sent to your email' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });

    return { message: 'Password reset successful!' };
  }
}
