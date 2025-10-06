import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  tokenId: string;
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    super({
      jwtFromRequest: ExtractJwt.fromHeader('x-refresh-token'),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtRefreshPayload) {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: {
        id: payload.tokenId,
        userId: payload.sub,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!refreshToken.user || !refreshToken.user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      user: refreshToken.user,
      tokenId: payload.tokenId,
      refreshTokenRecord: refreshToken,
    };
  }
}
