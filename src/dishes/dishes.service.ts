import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDishDto } from './dto/createDish.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DishesService {
  constructor(private readonly prisma: PrismaService) {}

  async createDish(menuId: string, createDishDto: CreateDishDto) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    if (!menu.isActive || !menu.restaurant.isActive) {
      throw new NotFoundException('Menu or Restaurant is not active');
    }

    return await this.prisma.dish.create({
      data: {
        name: createDishDto.name,
        description: createDishDto.description,
        price: new Prisma.Decimal(createDishDto.price),
        imageUrl: createDishDto.imageUrl,
        menuId: menuId,
      },
    });
  }

  async getDishesByMenu(menuId: string) {
    const existingDishes = await this.prisma.dish.findMany({
      where: { menuId: menuId },
    });

    if (!existingDishes || existingDishes.length === 0) {
      throw new NotFoundException('Dishes not found');
    }

    return existingDishes;
  }

  async getDishById(dishId: string) {
    const existingDish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!existingDish) {
      throw new NotFoundException('Dish not found');
    }

    return existingDish;
  }

  async updateDish(
    menuId: string,
    dishId: string,
    updateDishDto: CreateDishDto,
  ) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            isActive: true,
          },
        },
      },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    if (!menu.isActive || !menu.restaurant.isActive) {
      throw new NotFoundException('Menu or Restaurant is not active');
    }

    const existingDish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!existingDish) {
      throw new NotFoundException('Dish not found');
    }

    return await this.prisma.dish.update({
      where: { id: dishId },
      data: {
        name: updateDishDto.name,
        description: updateDishDto.description,
        price: new Prisma.Decimal(updateDishDto.price),
        imageUrl: updateDishDto.imageUrl,
      },
    });
  }

  async deleteDishById(dishId: string) {
    const existingDish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });

    if (!existingDish) {
      throw new NotFoundException('Dish not found');
    }

    return await this.prisma.dish.delete({
      where: { id: dishId },
    });
  }

  async rateDish(dishId: string, rating: number, userId: string) {
    const dish = await this.prisma.dish.findUnique({
      where: { id: dishId },
    });
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    const existingRating = await this.prisma.dishRating.findFirst({
      where: { dishId, userId },
    });

    if (existingRating) {
      await this.prisma.dishRating.update({
        where: { id: existingRating.id },
        data: { rating },
      });
    } else {
      await this.prisma.dishRating.create({
        data: {
          dishId,
          rating,
          userId,
        },
      });
    }

    const action = existingRating ? 'updated' : 'added';

    await this.updateDishAvgRating(dishId);

    return {
      message: `You ${action} your rating for ${dish.name} to ${rating} stars`,
    };
  }

  private async updateDishAvgRating(dishId: string) {
    const ratings = await this.prisma.dishRating.findMany({
      where: { dishId },
    });

    if (ratings.length === 0) {
      await this.prisma.dish.update({
        where: { id: dishId },
        data: { avgRating: null },
      });
      return;
    }

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / ratings.length;

    await this.prisma.dish.update({
      where: { id: dishId },
      data: { avgRating: avg },
    });
  }
}
