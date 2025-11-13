import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    // Validate input
    if (!Array.isArray(roles)) throw new BadRequestException('roles must be an array');
    const allowed = new Set(Object.values(UserRole));
    // normalize to lowercase strings and keep only allowed values
    const normalized = Array.from(
      new Set(
        roles
          .map((r: any) => {
            if (typeof r === 'string') return r.toLowerCase();
            if (r && typeof r === 'object') {
              // common shapes from select components: { value: 'admin' } or { role: 'admin' } or { label: 'Admin' }
              const candidate = r.value ?? r.role ?? r.name ?? r.label ?? r.id ?? '';
              if (typeof candidate === 'string') return candidate.toLowerCase();
            }
            return '';
          })
          .filter((r: string) => r && allowed.has(r as UserRole)),
      ),
    );
    if (normalized.length === 0) {
      throw new BadRequestException(
        `No valid roles provided. Received: ${JSON.stringify(roles)}. Valid roles are: ${Array.from(allowed).join(', ')}`,
      );
    }

    // Use usersService update helper (atomic)
    return this.usersService.updateUserRoles(id, normalized as UserRole[]);
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
