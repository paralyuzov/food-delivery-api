import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/createDish.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { User } from '.prisma/client/default';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all dishes' })
  @ApiResponse({ status: 200, description: 'List of all dishes' })
  async getAllDishes() {
    return await this.dishesService.getAllDishes();
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get most popular dishes' })
  @ApiResponse({
    status: 200,
    description: 'Popular dishes retrieved successfully',
  })
  async getMostPopularDishes(@Query('limit') limit?: number) {
    return await this.dishesService.getMostPopularDishes(limit || 5);
  }

  @Get('categories/:category')
  @ApiOperation({ summary: 'Get dishes by category' })
  @ApiResponse({ status: 200, description: 'Dishes retrieved successfully' })
  @ApiResponse({
    status: 404,
    description: 'No dishes found for this category',
  })
  async getDishesByCategory(@Param('category') category: string) {
    return await this.dishesService.getDishesByCategory(category);
  }

  @Get('dish/:dishId')
  @ApiOperation({ summary: 'Get dish by ID' })
  @ApiResponse({ status: 200, description: 'Dish retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  async getDishById(@Param('dishId') dishId: string) {
    return await this.dishesService.getDishById(dishId);
  }

  @Post('menu/:menuId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new dish (Admin only)' })
  @ApiResponse({ status: 201, description: 'Dish created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDish(
    @Param('menuId') menuId: string,
    @Body() createDishDto: CreateDishDto,
  ) {
    return await this.dishesService.createDish(menuId, createDishDto);
  }

  @Get('menu/:menuId')
  @ApiOperation({ summary: 'Get all dishes by menu ID' })
  @ApiResponse({ status: 200, description: 'Dishes retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Dishes not found' })
  async getDishesByMenu(@Param('menuId') menuId: string) {
    return await this.dishesService.getDishesByMenu(menuId);
  }

  @Put('menu/:menuId/dish/:dishId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a dish (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dish updated successfully' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  async updateDish(
    @Param('menuId') menuId: string,
    @Param('dishId') dishId: string,
    @Body() updateDishDto: CreateDishDto,
  ) {
    return await this.dishesService.updateDish(menuId, dishId, updateDishDto);
  }

  @Delete('dish/:dishId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a dish (Admin only)' })
  @ApiResponse({ status: 200, description: 'Dish deleted successfully' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  async deleteDish(@Param('dishId') dishId: string) {
    return await this.dishesService.deleteDishById(dishId);
  }

  @Post('dish/:dishId/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Rate a dish (Authenticated users only)' })
  @ApiResponse({ status: 200, description: 'Dish rated successfully' })
  @ApiResponse({ status: 404, description: 'Dish not found' })
  async rateDish(
    @Param('dishId') dishId: string,
    @Body() body: { rating: number },
    @GetUser() user: User,
  ) {
    return await this.dishesService.rateDish(dishId, body.rating, user.id);
  }
}
