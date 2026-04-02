import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListPricesQueryDto, StartImportDto } from './pricing.dto';
import { PricingService } from './pricing.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('pricing')
@UseGuards(JwtAuthGuard)
@ApiTags('Pricing')
@ApiBearerAuth()
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('import')
  @ApiOperation({ summary: 'Iniciar importación masiva de precios' })
  importFile(@Body() dto: StartImportDto) {
    return this.pricingService.startImport(dto);
  }

  @Get('import/:jobId')
  @ApiOperation({ summary: 'Consultar estado de importación por jobId' })
  getImportStatus(@Param('jobId') jobId: string) {
    return this.pricingService.getImportStatus(jobId);
  }

  @Get('current')
  @ApiOperation({ summary: 'Listar precios actuales' })
  @ApiQuery({ name: 'search', required: false })
  listCurrentPrices(@Query() query: ListPricesQueryDto) {
    return this.pricingService.listCurrentPrices(query);
  }
}
