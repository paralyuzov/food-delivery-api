import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/createMenu.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menus' })
  @ApiResponse({ status: 200, description: 'List of all menus' })
  async getAllMenus() {
    return this.menusService.getAllMenus();
  }

  @Post('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create menu (Admin only)' })
  @ApiResponse({ status: 201, description: 'Menu created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async createMenu(
    @Param('restaurantId') restaurantId: string,
    @Body() createMenuDto: CreateMenuDto,
  ) {
    return this.menusService.create(restaurantId, createMenuDto);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get menus by restaurant ID' })
  @ApiResponse({ status: 200, description: 'Menus retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Menus not found' })
  async getMenus(@Param('restaurantId') restaurantId: string) {
    return this.menusService.getMenus(restaurantId);
  }

  @Get(':menuId')
  @ApiOperation({ summary: 'Get menu by ID' })
  @ApiResponse({ status: 200, description: 'Menu retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async getMenu(@Param('menuId') menuId: string) {
    return this.menusService.getOneMenu(menuId);
  }

  @Put(':menuId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update menu (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu updated successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async updateMenu(
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: CreateMenuDto,
  ) {
    return this.menusService.updateMenu(menuId, updateMenuDto);
  }

  @Delete(':menuId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete menu (Admin only)' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  @ApiResponse({ status: 404, description: 'Menu not found' })
  async deleteMenu(@Param('menuId') menuId: string) {
    return this.menusService.deleteMenu(menuId);
  }
}
