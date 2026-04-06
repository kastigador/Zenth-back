import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateClientDto,
  CreateTagDto,
  ListClientsQueryDto,
  UploadClientAvatarDto,
  UpdateClientDto,
} from './clients.dto';
import { ClientsService } from './clients.service';
import { STORAGE_PORT, type StoragePort } from '../storage/storage.port';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Clients')
@ApiBearerAuth()
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    @Inject(STORAGE_PORT) private readonly storage: StoragePort,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar clientes con búsqueda, tag y paginación' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'tag', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  list(@Query() query: ListClientsQueryDto) {
    return this.clientsService.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Crear cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado' })
  create(@Body() dto: CreateClientDto, @CurrentUser() user: JwtPayload) {
    return this.clientsService.create(dto, user.sub);
  }

  @Get('tags')
  listTags() {
    return this.clientsService.listTags();
  }

  @Post('tags')
  @Roles('admin')
  @ApiOperation({ summary: 'Crear tag de clientes (admin)' })
  createTag(@Body() dto: CreateTagDto) {
    return this.clientsService.createTag(dto.name);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.clientsService.update(id, dto, user.sub);
  }

  @Post(':id/avatar/upload')
  @ApiOperation({ summary: 'Subir avatar de cliente (base64) al storage configurado' })
  async uploadAvatar(
    @Param('id') id: string,
    @Body() body: UploadClientAvatarDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const mimeType = body?.mimeType ?? 'image/jpeg';
    const fileName = body?.fileName ?? 'avatar.jpg';
    const base64 = body?.base64 ?? '';

    if (!base64 || base64.trim().length < 8) {
      throw new BadRequestException('base64 is required');
    }

    const cleaned = base64.includes(',') ? base64.split(',')[1] : base64;
    const buffer = Buffer.from(cleaned, 'base64');

    const currentClient = this.clientsService.findById(id);
    const previousAvatarUrl = currentClient.avatarUrl;

    const stored = await this.storage.put({
      content: buffer,
      fileName,
      mimeType,
      folder: `clients/${id}/avatar`,
    });

    const updatedClient = await this.clientsService.updateAvatar(id, stored.url, user.sub);

    const previousKey = this.extractStorageKey(previousAvatarUrl);
    if (previousKey && previousAvatarUrl !== stored.url) {
      try {
        await this.storage.remove(previousKey);
      } catch {
        // no-op: no debe romper upload por fallo de limpieza
      }
    }

    return {
      file: stored,
      client: updatedClient,
    };
  }

  private extractStorageKey(url?: string): string | undefined {
    if (!url) {
      return undefined;
    }

    const base = this.config.get<string>('STORAGE_PUBLIC_BASE_URL', 'http://localhost:3000/assets').replace(/\/$/, '');
    if (!url.startsWith(`${base}/`)) {
      return undefined;
    }

    return url.slice(base.length + 1);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar cliente (soft delete)' })
  deactivate(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.clientsService.deactivate(id, user.sub);
  }

  @Get(':id/history')
  history(@Param('id') id: string) {
    return this.clientsService.history(id);
  }
}
