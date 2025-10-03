import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: "Today's total revenue" })
  todayRevenue: number;

  @ApiProperty({ description: "Today's total orders count" })
  todayOrders: number;

  @ApiProperty({ description: 'Total number of users' })
  totalUsers: number;

  @ApiProperty({ description: 'Number of active restaurants' })
  activeRestaurants: number;

  @ApiProperty({ description: 'Revenue growth percentage' })
  revenueGrowth: number;

  @ApiProperty({ description: 'Orders growth percentage' })
  ordersGrowth: number;

  @ApiProperty({ description: 'New users registered today' })
  newUsersToday: number;

  @ApiProperty({ description: 'Total number of restaurants' })
  totalRestaurants: number;
}

export class OrderTrendDto {
  @ApiProperty({ description: 'Date in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ description: 'Number of orders on this date' })
  orders: number;

  @ApiProperty({ description: 'Total revenue on this date' })
  revenue: number;
}

export class TopDishDto {
  @ApiProperty({ description: 'Dish ID' })
  id: string;

  @ApiProperty({ description: 'Dish name' })
  name: string;

  @ApiProperty({ description: 'Number of orders for this dish' })
  orders: number;

  @ApiProperty({ description: 'Total revenue from this dish' })
  revenue: number;

  @ApiProperty({ description: 'Restaurant name serving this dish' })
  restaurant: string;

  @ApiProperty({ description: 'Restaurant ID', required: false })
  restaurantId?: string;
}

export class RecentOrderDto {
  @ApiProperty({ description: 'Order ID' })
  id: string;

  @ApiProperty({ description: 'Customer full name' })
  customerName: string;

  @ApiProperty({ description: 'Order status' })
  status: string;

  @ApiProperty({ description: 'Order total amount' })
  total: number;

  @ApiProperty({ description: 'Order creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Restaurant name', required: false })
  restaurantName?: string;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardStatsDto })
  stats: DashboardStatsDto;

  @ApiProperty({ type: [OrderTrendDto] })
  orderTrend: OrderTrendDto[];

  @ApiProperty({ type: [TopDishDto] })
  topDishes: TopDishDto[];

  @ApiProperty({ type: [RecentOrderDto] })
  recentOrders: RecentOrderDto[];
}
