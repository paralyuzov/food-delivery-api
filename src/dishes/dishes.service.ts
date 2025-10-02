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

    const createdDish = await this.prisma.dish.create({
      data: {
        name: createDishDto.name,
        description: createDishDto.description,
        price: new Prisma.Decimal(createDishDto.price),
        imageUrl: createDishDto.imageUrl,
        menuId: menuId,
      },
    });

    return {
      ...createdDish,
      restaurantId: menu.restaurant.id,
    };
  }

  async getDishesByMenu(menuId: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    return this.prisma.dish.findMany({
      where: { menuId: menuId },
    });
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
    console.log(menuId, dishId, updateDishDto);
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

    const dish = await this.prisma.dish.update({
      where: { id: dishId },
      data: {
        name: updateDishDto.name,
        description: updateDishDto.description,
        price: new Prisma.Decimal(updateDishDto.price),
        imageUrl: updateDishDto.imageUrl,
        isAvailable: updateDishDto.isAvailable,
      },
    });

    return {
      ...dish,
      restaurantId: menu.restaurant.id,
    };
  }

  async deleteDishById(dishId: string) {
    const existingDish = await this.prisma.dish.findUnique({
      where: { id: dishId },
      include: {
        menu: {
          select: {
            restaurantId: true,
          },
        },
      },
    });

    if (!existingDish) {
      throw new NotFoundException('Dish not found');
    }

    const deletedDish = await this.prisma.dish.delete({
      where: { id: dishId },
    });

    return {
      ...deletedDish,
      restaurantId: existingDish.menu.restaurantId,
    };
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

  async getMostPopularDishes(limit: number) {
    return this.prisma.dish.findMany({
      where: {
        avgRating: {
          not: null,
        },
      },
      orderBy: {
        avgRating: 'desc',
      },
      take: limit,
    });
  }

  async getAllDishes() {
    return this.prisma.dish.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        category: true,
        isAvailable: true,
        avgRating: true,
        createdAt: true,
        updatedAt: true,
        menuId: true,
        menu: {
          select: {
            restaurant: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async getDishesByCategory(category: string) {
    const dishes = await this.prisma.dish.findMany({
      where: { category: category },
    });
    if (dishes.length === 0) {
      throw new NotFoundException(`No dishes found in category: ${category}`);
    }
    return dishes;
  }
}
