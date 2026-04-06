import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './auth.types';
import { PrismaService } from '../../common/prisma.service';

const ACCESS_COOKIE_NAME = 'crm_access_token';

const fromAccessCookie = (request: Request): string | null => {
  if (!request || !request.cookies) {
    return null;
  }

  return request.cookies[ACCESS_COOKIE_NAME] ?? null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), fromAccessCookie]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload & { name?: string; avatarUrl?: string }> {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { name: true, avatarUrl: true },
    });

    return {
      ...payload,
      name: dbUser?.name,
      avatarUrl: dbUser?.avatarUrl ?? undefined,
    };
  }
}
