import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import Stripe from 'stripe';

export interface OrderCheckoutData {
  items: Array<{
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image?: string;
    dishId: string;
  }>;
  deliveryFee: number;
  tax: number;
  total: number;
  metadata: {
    userId: string;
    addressId: string;
    restaurantId: string;
    orderData: string;
  };
}

@Injectable()
export class StripeService {
  private stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    @Inject('STRIPE_API_KEY') private readonly apiKey: string,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  async createOrderCheckoutSession(checkoutData: OrderCheckoutData) {
    try {
      const { items, deliveryFee, tax, total, metadata } = checkoutData;

      const lineItems = items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description || undefined,
            images: item.image ? [item.image] : [],
            metadata: {
              dishId: item.dishId,
            },
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
            description: 'Standard delivery to your address',
            images: [],
            metadata: {
              dishId: 'delivery-fee',
            },
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax (5%)',
            description: 'Sales tax on order',
            images: [],
            metadata: {
              dishId: 'tax',
            },
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:4200'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${this.configService.get('FRONTEND_URL') || 'http://localhost:4200'}`,
        metadata: {
          userId: metadata.userId,
          addressId: metadata.addressId,
          restaurantId: metadata.restaurantId,
          orderData: metadata.orderData,
          itemCount: items.length.toString(),
          total: total.toFixed(2),
        },
        customer_creation: 'if_required',
      });

      this.logger.log(`Order checkout session created: ${session.id}`);
      this.logger.log(
        `Real order: ${items.length} items, Total: $${total.toFixed(2)}`,
      );

      return {
        url: session.url,
        sessionId: session.id,
        orderSummary: {
          items: items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          deliveryFee: deliveryFee.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
        },
      };
    } catch (error) {
      this.logger.error('Error creating order checkout session', error);
      throw error;
    }
  }

  async verifyCheckoutSession(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      this.logger.error('Error retrieving checkout session', error);
      throw error;
    }
  }
}
