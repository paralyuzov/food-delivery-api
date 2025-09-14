import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [StripeController],
  providers: [
    StripeService,
    {
      provide: 'STRIPE_API_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('STRIPE_API_KEY'),
      inject: [ConfigService],
    },
  ],
  imports: [PrismaModule],
  exports: [StripeService],
})
export class StripeModule {}
