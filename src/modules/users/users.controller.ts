import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Listar usuarios (solo admin)' })
  list(@CurrentUser() user: JwtPayload) {
    return {
      requestedBy: user.email,
      items: [],
      total: 0,
    };
  }
}
