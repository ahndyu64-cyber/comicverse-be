import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ComicsService } from '../comics/comics.service';
import { FilterComicsDto, UpdateComicDto } from '../comics/dto/filter-comics.dto';
import { UserRole } from '../auth/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(private usersService: UsersService, private comicsService: ComicsService) {}

  // Users
  async listUsers(query: any = {}) {
    // reuse usersService.findAll(page, limit)
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;
    return this.usersService.findAll(page, limit);
  }

  async getUser(id: string) {
    return (this.usersService as any).findById ? (this.usersService as any).findById(id) : null;
  }

  async updateUserRoles(id: string, roles: UserRole[]) {
    const user = await (this.usersService as any).findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.roles = roles;
    return user.save();
  }

  async deleteUser(id: string) {
    if ((this.usersService as any).delete) return (this.usersService as any).delete(id);
    return (this.usersService as any).remove ? (this.usersService as any).remove(id) : { message: 'deleted' };
  }

  // Comics
  async listComics(filter: FilterComicsDto = {}) {
    return this.comicsService.findAll(filter);
  }

  async updateComic(id: string, dto: UpdateComicDto) {
    return this.comicsService.update(id, dto as any);
  }

  async deleteComic(id: string) {
    return this.comicsService.delete(id);
  }
}
