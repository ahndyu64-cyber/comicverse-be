import { Controller, Get, Param, Query, Patch, Body, Delete, UseGuards, BadRequestException, NotFoundException } from '@nestjs/common';
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

  @Patch('users/:id')
  async patchUser(@Param('id') id: string, @Body() body: any) {

    if (body && body.roles && Array.isArray(body.roles)) {
      return this.adminService.updateUserRoles(id, body.roles as UserRole[]);
    }

    
    if (body && (body.rolesList || body.selectedRoles)) {
      const roles = body.rolesList || body.selectedRoles;
      if (Array.isArray(roles)) {
        return this.adminService.updateUserRoles(id, roles as UserRole[]);
      }
    }

    
    if (body && body.role) {
      const roles = Array.isArray(body.role) ? body.role : [body.role];
      return this.adminService.updateUserRoles(id, roles as UserRole[]);
    }

    
    if (body && (body.assignAdmin === true || body.removeAdmin === true)) {
      const user = await this.adminService.getUser(id);
      if (!user) throw new NotFoundException('User not found');
      const currentRoles: UserRole[] = Array.isArray(user.roles) ? user.roles : [user.roles];
      const hasAdmin = currentRoles.includes(UserRole.ADMIN);
      if (body.assignAdmin === true && !hasAdmin) {
        currentRoles.push(UserRole.ADMIN);
      }
      if (body.removeAdmin === true && hasAdmin) {
        const idx = currentRoles.indexOf(UserRole.ADMIN);
        if (idx >= 0) currentRoles.splice(idx, 1);
      }
      return this.adminService.updateUserRoles(id, currentRoles);
    }

    throw new BadRequestException('No updatable fields provided. Send roles, role, rolesList, selectedRoles, or assignAdmin/removeAdmin flags.');
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }


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
