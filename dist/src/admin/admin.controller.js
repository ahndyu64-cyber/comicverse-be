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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../auth/schemas/user.schema");
const banner_dto_1 = require("../banners/dto/banner.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async listUsers(query) {
        return this.adminService.listUsers(query);
    }
    async getUser(id) {
        return this.adminService.getUser(id);
    }
    async updateUserRoles(id, roles) {
        return this.adminService.updateUserRoles(id, roles);
    }
    async patchUser(id, body) {
        if (body && body.roles && Array.isArray(body.roles)) {
            return this.adminService.updateUserRoles(id, body.roles);
        }
        if (body && (body.rolesList || body.selectedRoles)) {
            const roles = body.rolesList || body.selectedRoles;
            if (Array.isArray(roles)) {
                return this.adminService.updateUserRoles(id, roles);
            }
        }
        if (body && body.role) {
            const roles = Array.isArray(body.role) ? body.role : [body.role];
            return this.adminService.updateUserRoles(id, roles);
        }
        if (body && (body.assignAdmin === true || body.removeAdmin === true)) {
            const user = await this.adminService.getUser(id);
            if (!user)
                throw new common_1.NotFoundException('User not found');
            const currentRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const hasAdmin = currentRoles.includes(user_schema_1.UserRole.ADMIN);
            if (body.assignAdmin === true && !hasAdmin) {
                currentRoles.push(user_schema_1.UserRole.ADMIN);
            }
            if (body.removeAdmin === true && hasAdmin) {
                const idx = currentRoles.indexOf(user_schema_1.UserRole.ADMIN);
                if (idx >= 0)
                    currentRoles.splice(idx, 1);
            }
            return this.adminService.updateUserRoles(id, currentRoles);
        }
        throw new common_1.BadRequestException('No updatable fields provided. Send roles, role, rolesList, selectedRoles, or assignAdmin/removeAdmin flags.');
    }
    async deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    async listComics(query) {
        return this.adminService.listComics(query);
    }
    async updateComic(id, body) {
        return this.adminService.updateComic(id, body);
    }
    async deleteComic(id) {
        return this.adminService.deleteComic(id);
    }
    async listBanners(query) {
        return this.adminService.listBanners(query);
    }
    async getBanner(id) {
        return this.adminService.getBanner(id);
    }
    async createBanner(dto) {
        return this.adminService.createBanner(dto);
    }
    async updateBanner(id, dto) {
        return this.adminService.updateBanner(id, dto);
    }
    async updateBannerOrder(id, order) {
        return this.adminService.updateBannerOrder(id, order);
    }
    async deleteBanner(id) {
        return this.adminService.deleteBanner(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/roles'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('roles')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserRoles", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "patchUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('comics'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listComics", null);
__decorate([
    (0, common_1.Patch)('comics/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateComic", null);
__decorate([
    (0, common_1.Delete)('comics/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteComic", null);
__decorate([
    (0, common_1.Get)('banners'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listBanners", null);
__decorate([
    (0, common_1.Get)('banners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBanner", null);
__decorate([
    (0, common_1.Post)('banners'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [banner_dto_1.CreateBannerDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBanner", null);
__decorate([
    (0, common_1.Patch)('banners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, banner_dto_1.UpdateBannerDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBanner", null);
__decorate([
    (0, common_1.Patch)('banners/:id/order'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('order')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateBannerOrder", null);
__decorate([
    (0, common_1.Delete)('banners/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteBanner", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
