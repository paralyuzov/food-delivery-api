import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('verify-session')
  @UseGuards(JwtAuthGuard)
  async verifySession(@Query('session_id') sessionId: string) {
    return this.stripeService.verifyCheckoutSession(sessionId);
  }
}
