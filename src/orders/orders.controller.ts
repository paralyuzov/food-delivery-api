import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/createOrder.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { OrderStatus, User } from '@prisma/client';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAllOrders(@Query('status') status?: OrderStatus) {
    return this.ordersService.getOrdersByStatus(status);
  }

  @Get('user-orders')
  @UseGuards(JwtAuthGuard)
  getUserOrders(@GetUser() user: User) {
    return this.ordersService.getUserOrders(user.id);
  }

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

  @Patch('update-status/:orderId')
  @UseGuards(AdminGuard)
  @UseGuards(JwtAuthGuard)
  updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(orderId, status);
  }
}
