"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const comics_service_1 = require("../comics/comics.service");
const banners_service_1 = require("../banners/banners.service");
const user_schema_1 = require("../auth/schemas/user.schema");
let AdminService = class AdminService {
    constructor(usersService, comicsService, bannersService) {
        this.usersService = usersService;
        this.comicsService = comicsService;
        this.bannersService = bannersService;
    }
    async listUsers(query = {}) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 20;
        return this.usersService.findAll(page, limit);
    }
    async getUser(id) {
        return this.usersService.findById ? this.usersService.findById(id) : null;
    }
    async updateUserRoles(id, roles) {
        if (!Array.isArray(roles))
            throw new common_1.BadRequestException('roles must be an array');
        const allowed = new Set(Object.values(user_schema_1.UserRole));
        const normalized = Array.from(new Set(roles
            .map((r) => {
            var _a, _b, _c, _d, _e;
            if (typeof r === 'string')
                return r.toLowerCase();
            if (r && typeof r === 'object') {
                const candidate = (_e = (_d = (_c = (_b = (_a = r.value) !== null && _a !== void 0 ? _a : r.role) !== null && _b !== void 0 ? _b : r.name) !== null && _c !== void 0 ? _c : r.label) !== null && _d !== void 0 ? _d : r.id) !== null && _e !== void 0 ? _e : '';
                if (typeof candidate === 'string')
                    return candidate.toLowerCase();
            }
            return '';
        })
            .filter((r) => r && allowed.has(r))));
        if (normalized.length === 0) {
            throw new common_1.BadRequestException(`No valid roles provided. Received: ${JSON.stringify(roles)}. Valid roles are: ${Array.from(allowed).join(', ')}`);
        }
        return this.usersService.updateUserRoles(id, normalized);
    }
    async deleteUser(id) {
        if (this.usersService.delete)
            return this.usersService.delete(id);
        return this.usersService.remove ? this.usersService.remove(id) : { message: 'deleted' };
    }
    async listComics(filter = {}) {
        return this.comicsService.findAll(filter);
    }
    async updateComic(id, dto) {
        return this.comicsService.update(id, dto);
    }
    async deleteComic(id) {
        return this.comicsService.delete(id);
    }
    async listBanners(filter = {}) {
        return this.bannersService.findAll(filter);
    }
    async getBanner(id) {
        return this.bannersService.findById(id);
    }
    async createBanner(dto) {
        return this.bannersService.create(dto);
    }
    async updateBanner(id, dto) {
        return this.bannersService.update(id, dto);
    }
    async deleteBanner(id) {
        return this.bannersService.delete(id);
    }
    async updateBannerOrder(id, order) {
        return this.bannersService.updateOrder(id, order);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        comics_service_1.ComicsService,
        banners_service_1.BannersService])
], AdminService);
