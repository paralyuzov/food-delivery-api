import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/createOrder.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createOrderCheckout(
    @Body() createOrder: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.ordersService.createOrderCheckout(createOrder, user.id);
  }

  @Post('confirm-payment')
  @UseGuards(JwtAuthGuard)
  confirmPaymentAndCreateOrder(
    @Body() body: { sessionId: string },
    @GetUser() user: User,
  ) {
    return this.ordersService.createOrderFromPayment(body.sessionId, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserOrders(@GetUser() user: User) {
    return this.ordersService.getUserOrders(user.id);
  }
}
