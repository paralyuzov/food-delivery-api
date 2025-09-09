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
        menus: { include: { dishes: true } },
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
}
