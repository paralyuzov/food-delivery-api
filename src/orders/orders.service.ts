import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
  ) {}

  async createOrderCheckout(createOrder: CreateOrderDto, userId: string) {
    const { address, items } = createOrder;

    const userAddress = await this.prisma.address.findFirst({
      where: {
        id: address,
        userId: userId,
      },
    });

    if (!userAddress) {
      throw new NotFoundException(
        'Address not found or does not belong to user',
      );
    }

    const dishIds = items.map((item) => item.dish.id);
    const dishes = await this.prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        isAvailable: true,
      },
      include: {
        menu: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (dishes.length !== dishIds.length) {
      throw new NotFoundException('Some dishes are not available');
    }

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = 3.0;
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + deliveryFee + tax;

    const restaurantId = dishes[0].menu.restaurantId;

    const checkoutData = {
      items: items.map((orderItem) => {
        const dish = dishes.find((d) => d.id === orderItem.dish.id);
        if (!dish) {
          throw new NotFoundException(
            `Dish with id ${orderItem.dish.id} not found`,
          );
        }
        return {
          name: dish.name,
          description: dish.description || undefined,
          price: Number(orderItem.dish.price),
          quantity: orderItem.quantity,
          image: dish.imageUrl || undefined,
          dishId: dish.id,
        };
      }),
      deliveryFee,
      tax,
      total,
      metadata: {
        userId,
        addressId: address,
        restaurantId,
        orderData: JSON.stringify({
          items: items.map((item) => ({
            dishId: item.dish.id,
            quantity: item.quantity,
            price: item.dish.price,
          })),
          notes: createOrder.notes,
        }),
      },
    };

    const checkoutSession =
      await this.stripeService.createOrderCheckoutSession(checkoutData);

    return {
      success: true,
      message: 'Checkout session created successfully',
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.sessionId,
      orderPreview: {
        items: checkoutSession.orderSummary.items,
        deliveryFee: checkoutSession.orderSummary.deliveryFee,
        tax: checkoutSession.orderSummary.tax,
        total: checkoutSession.orderSummary.total,
        restaurantName: dishes[0].menu.restaurant.name,
        itemCount: items.length,
      },
    };
  }

  async createOrderFromPayment(sessionId: string, userId: string) {
    const session = await this.stripeService.verifyCheckoutSession(sessionId);

    if (session.payment_status !== 'paid') {
      throw new NotFoundException('Payment not completed or failed');
    }

    if (!session.metadata) {
      throw new NotFoundException('Session metadata not found');
    }

    const orderData = JSON.parse(session.metadata.orderData) as {
      items: Array<{ dishId: string; quantity: number; price: string }>;
      notes?: string;
    };
    const addressId = session.metadata.addressId;
    const restaurantId = session.metadata.restaurantId;

    if (session.metadata.userId !== userId) {
      throw new NotFoundException('Session does not belong to this user');
    }

    const userAddress = await this.prisma.address.findFirst({
      where: {
        id: addressId,
        userId: userId,
      },
    });

    if (!userAddress) {
      throw new NotFoundException(
        'Address not found or does not belong to user',
      );
    }

    const dishIds = orderData.items.map((item) => item.dishId);
    const dishes = await this.prisma.dish.findMany({
      where: {
        id: { in: dishIds },
        isAvailable: true,
      },
      include: {
        menu: {
          include: {
            restaurant: true,
          },
        },
      },
    });

    if (dishes.length !== dishIds.length) {
      throw new NotFoundException('Some dishes are no longer available');
    }

    const total = parseFloat(session.metadata.total);
    const deliveryFee = 3.0;
    const subtotal =
      parseFloat(session.metadata.total) -
      3.0 -
      ((parseFloat(session.metadata.total) - 3.0) * 0.05) / 1.05;
    const tax = subtotal * 0.05;

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.order.create({
        data: {
          customerId: userId,
          restaurantId: restaurantId,
          addressId: addressId,
          subtotal: new Decimal(subtotal),
          deliveryFee: new Decimal(deliveryFee),
          tax: new Decimal(tax),
          total: new Decimal(total),
          notes: orderData.notes || '',
          estimatedTime: 30,
          status: 'CONFIRMED',
        },
      });

      const orderItems = await Promise.all(
        orderData.items.map((item) =>
          prisma.orderItem.create({
            data: {
              orderId: newOrder.id,
              dishId: item.dishId,
              quantity: item.quantity,
              price: new Decimal(item.price),
              notes: '',
            },
          }),
        ),
      );

      return {
        ...newOrder,
        items: orderItems,
      };
    });

    return {
      success: true,
      message: 'Order created successfully from payment',
      order: {
        id: order.id,
        status: order.status,
        subtotal: order.subtotal.toString(),
        deliveryFee: order.deliveryFee.toString(),
        tax: order.tax.toString(),
        total: order.total.toString(),
        estimatedTime: order.estimatedTime,
        itemCount: orderData.items.length,
        restaurantName: dishes[0].menu.restaurant.name,
        sessionId: sessionId,
      },
    };
  }
}
