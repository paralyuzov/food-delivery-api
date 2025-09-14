import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/createAdress.dto';

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
}
