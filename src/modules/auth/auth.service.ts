import { Injectable, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthUser, JwtPayload } from './auth.types';

const DEMO_USERS: AuthUser[] = [
  {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@crm.local',
    role: 'admin',
    passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$gpU1x/WWXcxWWATQfLj3Rg$OcjisSJK+tghqnJM0SiNv/QPo8zgZKyZG7Q5oVKaOKY',
  },
];

@Injectable()
export class AuthService {
  private readonly users: AuthUser[] = DEMO_USERS;

  constructor(
    private readonly jwtService: JwtService,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = this.users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await argon2.verify(user.passwordHash, password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService?.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      expiresIn: this.configService?.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1h',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService?.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      expiresIn: this.configService?.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService?.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      });

      const accessToken = await this.jwtService.signAsync(
        { sub: payload.sub, email: payload.email, role: payload.role },
        {
          secret: this.configService?.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
          expiresIn: this.configService?.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '1h',
        },
      );

      return {
        accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  hashPassword(password: string) {
    return argon2.hash(password);
  }

  async verifyPassword(passwordHash: string, plainTextPassword: string) {
    return argon2.verify(passwordHash, plainTextPassword);
  }

  async verifyAccessToken(token: string) {
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: this.configService?.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
    });
  }

  getDemoUsers() {
    return {
      users: this.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    };
  }
}
