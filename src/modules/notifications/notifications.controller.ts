import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ConfirmTelegramLinkDto,
  SendPaymentNotificationDto,
  StartTelegramLinkDto,
} from './notifications.dto';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('notifications/telegram/link')
@UseGuards(JwtAuthGuard)
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar vinculación de Telegram' })
  startLink(@Body() dto: StartTelegramLinkDto) {
    return this.notificationsService.startTelegramLink(dto.clientId);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirmar vinculación de Telegram por código' })
  confirmLink(@Body() dto: ConfirmTelegramLinkDto) {
    return this.notificationsService.confirmTelegramLink(dto.code, dto.chatId);
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiTags('Notifications')
@ApiBearerAuth()
export class PaymentsNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('payments/send')
  @ApiOperation({ summary: 'Enviar notificación de pago' })
  sendPaymentNotification(@Body() dto: SendPaymentNotificationDto) {
    return this.notificationsService.sendPaymentNotification(dto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Listar logs de notificaciones' })
  listLogs() {
    return this.notificationsService.listLogs();
  }
}
