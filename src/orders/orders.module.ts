import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [PrismaModule, StripeModule],
})
export class OrdersModule {}
