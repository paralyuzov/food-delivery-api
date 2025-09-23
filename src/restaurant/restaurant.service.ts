import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto, userId: string) {
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { name: createRestaurantDto.name },
    });
    if (existingRestaurant) {
      throw new Error('Restaurant with this name already exists');
    }

    return this.prisma.restaurant.create({
      data: {
        ...createRestaurantDto,
        managerId: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.restaurant.findMany();
  }

  async findOne(id: string) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        menus: {
          include: {
            dishes: {
              include: { ratings: true },
            },
          },
        },
        ratings: true,
      },
    });
  }

  async updateOne(id: string, data: CreateRestaurantDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data,
    });
  }

  async deleteOne(id: string) {
    return this.prisma.restaurant.delete({
      where: { id },
    });
  }

  async rateRestaurant(restaurantId: string, rating: number, userId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const existingRating = await this.prisma.restaurantRating.findFirst({
      where: { restaurantId, userId },
    });

    if (existingRating) {
      await this.prisma.restaurantRating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
      await this.prisma.restaurantRating.create({
        data: {
          restaurantId,
          rating,
          userId,
        },
      });
    }

    await this.updateRestaurantAvgRating(restaurantId);

    const action = existingRating ? 'updated' : 'created';

    return {
      message: `You ${action} your rating for ${restaurant.name} to ${rating} stars`,
    };
  }

  private async updateRestaurantAvgRating(restaurantId: string): Promise<void> {
    const ratings = await this.prisma.restaurantRating.findMany({
      where: { restaurantId },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      await this.prisma.restaurant.update({
        where: { id: restaurantId },
        data: { avgRating: null },
      });
      return;
    }

    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / ratings.length).toFixed(2));

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { avgRating },
    });
  }

  async getMostPopularRestaurants(limit: number) {
    return this.prisma.restaurant.findMany({
      where: {
        avgRating: { not: null },
      },
      orderBy: { avgRating: 'desc' },
      take: limit,
    });
  }
}
