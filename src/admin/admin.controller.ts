import { Controller, Get, Param, Query, Patch, Body, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // Users
  @Get('users')
  async listUsers(@Query() query: any) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/roles')
  async updateUserRoles(@Param('id') id: string, @Body('roles') roles: UserRole[]) {
    return this.adminService.updateUserRoles(id, roles);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // Comics
  @Get('comics')
  async listComics(@Query() query: any) {
    return this.adminService.listComics(query);
  }

  @Patch('comics/:id')
  async updateComic(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateComic(id, body);
  }

  @Delete('comics/:id')
  async deleteComic(@Param('id') id: string) {
    return this.adminService.deleteComic(id);
  }
}
