import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAddressDto } from './dto/createAdress.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getUserProfile(@GetUser() user: User) {
    return this.userService.userProfile(user.id);
  }

  @Post('address')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add a new address for the user' })
  @ApiResponse({
    status: 201,
    description: 'Address added successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async addUserNewAddress(
    @Body() createAddressDto: CreateAddressDto,
    @GetUser() user: User,
  ) {
    return this.userService.addNewAddress(createAddressDto, user.id);
  }
}
