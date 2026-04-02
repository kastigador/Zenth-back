import { Controller, Get, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiTags('Dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener métricas del dashboard' })
  @ApiQuery({ name: 'period', required: false })
  metrics(@Query('period') period = 'current_month') {
    return this.dashboardService.metrics(period);
  }
}
