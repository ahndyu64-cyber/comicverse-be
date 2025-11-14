import { Controller, Get, Param, UseGuards, Request, Put, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from '../auth/dto/auth.dto';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 20;
    return this.usersService.findAll(p, l);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Request() req) {
    return this.usersService.findById(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }

  @Get(':id/following')
  getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }

  @Get(':id/progress')
  getProgress(@Param('id') id: string) {
    return this.usersService.getProgress(id);
  }

  @Get('setup-admin/:id')
  async setupAdmin(@Param('id') id: string) {
    return this.usersService.setRoles(id, [UserRole.ADMIN]);
  }
}
