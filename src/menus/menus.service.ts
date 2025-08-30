import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dto/createMenu.dto';

@Injectable()
export class MenusService {
  constructor(private readonly prisma: PrismaService) {}

  async create(restaurantId: string, createMenuDto: CreateMenuDto) {
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existingRestaurant) {
      throw new ConflictException('Restaurant does not exist');
    }

    await this.prisma.menu.create({
      data: {
        ...createMenuDto,
        restaurantId: restaurantId,
      },
    });
  }

  async getMenus(restaurantId: string) {
    const existingRestaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existingRestaurant) {
      throw new ConflictException('Restaurant does not exist');
    }

    return this.prisma.menu.findMany({
      where: { restaurantId: restaurantId },
    });
  }

  async getOneMenu(menuId: string) {
    const existingMenu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      throw new ConflictException('Menu does not exist');
    }

    return existingMenu;
  }

  async updateMenu(menuId: string, updateMenuDto: CreateMenuDto) {
    const existingMenu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      throw new ConflictException('Menu does not exist');
    }

    return this.prisma.menu.update({
      where: { id: menuId },
      data: updateMenuDto,
    });
  }

  async deleteMenu(menuId: string) {
    const existingMenu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!existingMenu) {
      throw new ConflictException('Menu does not exist');
    }

    return this.prisma.menu.delete({
      where: { id: menuId },
    });
  }
}
