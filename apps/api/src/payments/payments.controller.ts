import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthorizePaymentDto } from './dto/authorize-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('authorize')
  @HttpCode(HttpStatus.OK)
  authorize(@Body() dto: AuthorizePaymentDto) {
    return this.payments.authorize(dto);
  }
}
