import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const ACCESS_COOKIE_NAME = 'crm_access_token';
const REFRESH_COOKIE_NAME = 'crm_refresh_token';
const ACCESS_COOKIE_TTL_MS = 60 * 60 * 1000;
const REFRESH_COOKIE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getCookieOptions(maxAge: number) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge,
  };
}

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

class RefreshDto {
  @IsOptional()
  @IsString()
  @MinLength(10)
  refreshToken?: string;
}

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login exitoso con access/refresh token' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password);

    res.cookie(ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(ACCESS_COOKIE_TTL_MS));
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(REFRESH_COOKIE_TTL_MS));

    return result;
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renovar access token con refresh token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'Access token renovado' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken ?? req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await this.authService.refresh(refreshToken);
    res.cookie(ACCESS_COOKIE_NAME, result.accessToken, getCookieOptions(ACCESS_COOKIE_TTL_MS));
    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión finalizada' })
  async logout(@Res({ passthrough: true }) res: Response) {
    const clearOptions = {
      ...getCookieOptions(0),
      maxAge: 0,
    };
    res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
    res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener sesión actual' })
  @ApiResponse({ status: 200, description: 'Sesión actual' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  me(@Req() req: Request) {
    const user = req.user as { sub: string; email: string; role: 'admin' | 'vendedor' };
    return {
      user: {
        id: user.sub,
        email: user.email,
        role: user.role,
      },
    };
  }
}
