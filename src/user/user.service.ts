import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/createAdress.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async userProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        addresses: true,
        orders: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async addNewAddress(createAdressDto: CreateAddressDto, userId: string) {
    return this.prisma.address.create({
      data: {
        ...createAdressDto,
        userId,
      },
    });
  }

  async updateUserAddress(
    addressId: string,
    userId: string,
    updateData: CreateAddressDto,
  ) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new Error('Address not found or does not belong to user');
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data: updateData,
    });
  }

  async updateUserProfile(userId: string, updateData: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
