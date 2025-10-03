import {
  Body,
  Controller,
  Delete,
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
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

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

  @Patch('admin/users/:userId/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update user status (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User status updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.userService.updateUserStatus(userId, isActive);
  }

  @Patch('admin/users/:userId/role')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User role updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: 'ADMIN' | 'CUSTOMER',
  ) {
    return this.userService.updateUserRole(userId, role);
  }

  @Delete('admin/users/:userId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string) {
    return await this.userService.deleteUser(userId);
  }
}
