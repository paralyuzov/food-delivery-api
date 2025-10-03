import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DashboardStatsDto,
  OrderTrendDto,
  TopDishDto,
  RecentOrderDto,
  DashboardResponseDto,
} from './dto/dashboard-stats.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<DashboardResponseDto> {
    const [stats, orderTrend, topDishes, recentOrders] = await Promise.all([
      this.getDashboardStatsData(),
      this.getOrderTrend(),
      this.getTopDishes(),
      this.getRecentOrders(),
    ]);

    return {
      stats,
      orderTrend,
      topDishes,
      recentOrders,
    };
  }

  private async getDashboardStatsData(): Promise<DashboardStatsDto> {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );

    const todayOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
      select: {
        total: true,
      },
    });

    const yesterdayOrders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfYesterday,
          lt: startOfToday,
        },
      },
      select: {
        total: true,
      },
    });

    const totalUsers = await this.prisma.user.count();

    const newUsersToday = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });

    const totalRestaurants = await this.prisma.restaurant.count();
    const activeRestaurants = await this.prisma.restaurant.count({
      where: {
        isActive: true,
      },
    });

    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );
    const yesterdayRevenue = yesterdayOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    const revenueGrowth =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;

    const ordersGrowth =
      yesterdayOrders.length > 0
        ? ((todayOrders.length - yesterdayOrders.length) /
            yesterdayOrders.length) *
          100
        : 0;

    return {
      todayRevenue: Number(todayRevenue.toFixed(2)),
      todayOrders: todayOrders.length,
      totalUsers,
      activeRestaurants,
      revenueGrowth: Number(revenueGrowth.toFixed(1)),
      ordersGrowth: Number(ordersGrowth.toFixed(1)),
      newUsersToday,
      totalRestaurants,
    };
  }

  private async getOrderTrend(days: number = 7): Promise<OrderTrendDto[]> {
    const trends: OrderTrendDto[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);

      const orders = await this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        select: {
          total: true,
        },
      });

      const revenue = orders.reduce(
        (sum, order) => sum + Number(order.total),
        0,
      );

      trends.push({
        date: startOfDay.toISOString().split('T')[0],
        orders: orders.length,
        revenue: Number(revenue.toFixed(2)),
      });
    }

    return trends;
  }

  private async getTopDishes(limit: number = 10): Promise<TopDishDto[]> {
    const topDishes = await this.prisma.orderItem.groupBy({
      by: ['dishId'],
      _count: {
        dishId: true,
      },
      _sum: {
        price: true,
      },
      orderBy: {
        _count: {
          dishId: 'desc',
        },
      },
      take: limit,
    });

    const dishesWithDetails = await Promise.all(
      topDishes.map(async (item) => {
        const dish = await this.prisma.dish.findUnique({
          where: { id: item.dishId },
          include: {
            menu: {
              include: {
                restaurant: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        return {
          id: dish?.id || '',
          name: dish?.name || '',
          orders: item._count.dishId,
          revenue: Number(item._sum.price || 0),
          restaurant: dish?.menu.restaurant.name || '',
          restaurantId: dish?.menu.restaurant.id || '',
        };
      }),
    );

    return dishesWithDetails;
  }

  private async getRecentOrders(limit: number = 10): Promise<RecentOrderDto[]> {
    const orders = await this.prisma.order.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        restaurant: {
          select: {
            name: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt,
      restaurantName: order.restaurant.name,
    }));
  }
}
