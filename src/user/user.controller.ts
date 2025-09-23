import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAddressDto } from './dto/createAdress.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/updateUser.dto';

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

  @Put('address/:addressId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a user address by ID' })
  @ApiResponse({
    status: 200,
    description: 'Address updated successfully',
  })
  async updateUserAddress(
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: CreateAddressDto,
    @GetUser() user: User,
  ) {
    return this.userService.updateUserAddress(
      addressId,
      user.id,
      updateAddressDto,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated successfully',
  })
  async updateUserProfile(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: User,
  ) {
    return this.userService.updateUserProfile(user.id, updateUserDto);
  }
}
