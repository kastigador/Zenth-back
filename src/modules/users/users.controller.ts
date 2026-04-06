import { BadRequestException, Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateMyAvatarDto, UploadMyAvatarDto } from './users.dto';
import { Inject } from '@nestjs/common';
import { STORAGE_PORT, type StoragePort } from '../storage/storage.port';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    private usersService: UsersService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
  ) {}

  @Get()
  @Roles('admin', 'vendedor')
  @ApiOperation({ summary: 'Listar usuarios (admin y vendedor)' })
  async list(@CurrentUser() user: JwtPayload) {
    const users = await this.usersService.listUsers();
    return {
      requestedBy: user.email,
      items: users,
      total: users.length,
    };
  }

  @Patch('me/avatar')
  @Roles('admin', 'vendedor')
  @ApiOperation({ summary: 'Actualizar avatar del usuario autenticado' })
  async updateMyAvatar(@CurrentUser() user: JwtPayload, @Body() dto: UpdateMyAvatarDto) {
    return this.usersService.updateMyAvatar(user.sub, dto.avatarUrl);
  }

  @Post('me/avatar/upload')
  @Roles('admin', 'vendedor')
  @ApiOperation({ summary: 'Subir avatar de usuario (base64) al storage configurado' })
  async uploadMyAvatar(
    @CurrentUser() user: JwtPayload,
    @Body() body: UploadMyAvatarDto,
  ) {
    const mimeType = body?.mimeType ?? 'image/jpeg';
    const fileName = body?.fileName ?? 'avatar.jpg';
    const base64 = body?.base64 ?? '';

    if (!base64 || base64.trim().length < 8) {
      throw new BadRequestException('base64 is required');
    }

    const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
    const buffer = Buffer.from(cleaned, 'base64');

    const stored = await this.storage.put({
      content: buffer,
      fileName,
      mimeType,
      folder: `users/${user.sub}/avatar`,
    });

    const updatedUser = await this.usersService.updateMyAvatar(user.sub, stored.url);

    return {
      file: stored,
      user: updatedUser,
    };
  }
}
