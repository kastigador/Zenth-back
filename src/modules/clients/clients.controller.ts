import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateClientDto,
  CreateTagDto,
  ListClientsQueryDto,
  UpdateClientDto,
} from './clients.dto';
import { ClientsService } from './clients.service';
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
  constructor(private readonly clientsService: ClientsService) {}

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
