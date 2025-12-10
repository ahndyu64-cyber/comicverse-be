import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto, FilterBannersDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  // Public endpoint - get active banners
  @Get('active')
  getActiveBanners(@Query('limit') limit = '5') {
    return this.bannersService.getActiveBanners(+limit);
  }

  // Public endpoint - list all active banners with filter
  @Get()
  findAll(@Query() filterDto: FilterBannersDto) {
    return this.bannersService.findAll(filterDto);
  }

  // Public endpoint - get single banner
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findById(id);
  }

  // Record banner view (public)
  @Post(':id/views')
  recordView(@Param('id') id: string) {
    return this.bannersService.recordView(id);
  }

  // Record banner click (public)
  @Post(':id/clicks')
  recordClick(@Param('id') id: string) {
    return this.bannersService.recordClick(id);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateBannerDto) {
    return this.bannersService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  patch(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.bannersService.delete(id);
  }

  @Patch(':id/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateOrder(@Param('id') id: string, @Body('order') order: number) {
    return this.bannersService.updateOrder(id, order);
  }
}
