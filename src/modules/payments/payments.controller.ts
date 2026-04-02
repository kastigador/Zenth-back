import { Body, Controller, Get, Headers, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto, ListPaymentsQueryDto } from './payments.dto';
import { PaymentsService } from './payments.service';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiTags('Payments')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear cobro (payment intent)' })
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: JwtPayload) {
    return this.paymentsService.createPayment({ ...dto, createdByUserId: user.sub });
  }

  @Get()
  @ApiOperation({ summary: 'Listar pagos por filtros' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  list(@Query() query: ListPaymentsQueryDto) {
    return this.paymentsService.listPayments(query);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook Stripe para confirmación de pagos' })
  @ApiHeader({ name: 'stripe-signature', required: true })
  webhook(
    @Headers('stripe-signature') signature: string,
    @Body() body: { type: 'payment_intent.succeeded' | 'payment_intent.payment_failed'; data: { object: { id: string } } },
  ) {
    return this.paymentsService.applyStripeWebhook({ signature, event: body });
  }
}
