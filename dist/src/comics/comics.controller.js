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
exports.ComicsController = void 0;
const common_1 = require("@nestjs/common");
const comics_service_1 = require("./comics.service");
const create_comic_dto_1 = require("./dto/create-comic.dto");
const create_chapter_dto_1 = require("./dto/create-chapter.dto");
const filter_comics_dto_1 = require("./dto/filter-comics.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../auth/schemas/user.schema");
const users_service_1 = require("../users/users.service");
let ComicsController = class ComicsController {
    constructor(comicsService, usersService) {
        this.comicsService = comicsService;
        this.usersService = usersService;
    }
    getHot(limit = '10') {
        try {
            return this.comicsService.findHotComics(+limit);
        }
        catch (error) {
            console.error('Error in getHot:', error);
            throw error;
        }
    }
    getLatest(limit = '20') {
        try {
            return this.comicsService.findLatestUpdates(+limit);
        }
        catch (error) {
            console.error('Error in getLatest:', error);
            throw error;
        }
    }
    findAll(filterDto) {
        try {
            return this.comicsService.findAll(filterDto);
        }
        catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }
    findOne(id) {
        return this.comicsService.findById(id);
    }
    create(req, dto) {
        console.log('[CONTROLLER-CREATE] Received DTO:', JSON.stringify(dto));
        console.log('[CONTROLLER-CREATE] Authors:', dto.authors);
        console.log('[CONTROLLER-CREATE] Authors type:', typeof dto.authors);
        console.log('[CONTROLLER-CREATE] Authors is array:', Array.isArray(dto.authors));
        return this.comicsService.create(dto, req.user.sub);
    }
    update(req, id, dto) {
        console.log('[CONTROLLER-UPDATE] Received DTO:', JSON.stringify(dto));
        console.log('[CONTROLLER-UPDATE] Authors:', dto.authors);
        console.log('[CONTROLLER-UPDATE] Authors type:', typeof dto.authors);
        console.log('[CONTROLLER-UPDATE] Authors is array:', Array.isArray(dto.authors));
        console.log('Update comic - User:', req.user);
        return this.comicsService.updateWithAuth(id, dto, req.user.sub, req.user.roles);
    }
    patch(req, id, dto) {
        console.log('[CONTROLLER-PATCH] Received DTO:', JSON.stringify(dto));
        console.log('[CONTROLLER-PATCH] Authors:', dto.authors);
        console.log('[CONTROLLER-PATCH] Authors type:', typeof dto.authors);
        console.log('[CONTROLLER-PATCH] Authors is array:', Array.isArray(dto.authors));
        console.log('Patch comic - User:', req.user);
        return this.comicsService.updateWithAuth(id, dto, req.user.sub, req.user.roles);
    }
    remove(req, id) {
        return this.comicsService.deleteWithAuth(id, req.user.sub, req.user.roles);
    }
    addChapter(req, id, dto) {
        return this.comicsService.addChapterWithAuth(id, dto, req.user.sub, req.user.roles);
    }
    getChapterById(id, chapterId) {
        return this.comicsService.getChapterById(id, chapterId);
    }
    updateChapter(req, id, index, dto) {
        return this.comicsService.updateChapterWithAuth(id, +index, dto, req.user.sub, req.user.roles);
    }
    updateChapterById(req, id, chapterId, dto) {
        return this.comicsService.updateChapterByIdWithAuth(id, chapterId, dto, req.user.sub, req.user.roles);
    }
    deleteChapter(req, id, chapterId) {
        return this.comicsService.deleteChapterByIdWithAuth(id, chapterId, req.user.sub, req.user.roles);
    }
    follow(req, id) {
        return this.usersService.follow(req.user.sub, id);
    }
    unfollow(req, id) {
        return this.usersService.unfollow(req.user.sub, id);
    }
    setProgress(req, id, body) {
        return this.usersService.setProgress(req.user.sub, id, body.lastRead);
    }
    incrementViews(id) {
        return this.comicsService.incrementViews(id);
    }
    getFollowersCount(id) {
        return this.comicsService.getFollowersCount(id);
    }
};
exports.ComicsController = ComicsController;
__decorate([
    (0, common_1.Get)('hot'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "getHot", null);
__decorate([
    (0, common_1.Get)('latest'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "getLatest", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_comics_dto_1.FilterComicsDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_comic_dto_1.CreateComicDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, filter_comics_dto_1.UpdateComicDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, filter_comics_dto_1.UpdateComicDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/chapters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, create_chapter_dto_1.CreateChapterDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "addChapter", null);
__decorate([
    (0, common_1.Get)(':id/chapters/:chapterId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "getChapterById", null);
__decorate([
    (0, common_1.Put)(':id/chapters/:index'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('index')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, filter_comics_dto_1.UpdateChapterDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "updateChapter", null);
__decorate([
    (0, common_1.Patch)(':id/chapters/:chapterId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('chapterId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, filter_comics_dto_1.UpdateChapterDto]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "updateChapterById", null);
__decorate([
    (0, common_1.Delete)(':id/chapters/:chapterId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.UPLOADER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('chapterId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "deleteChapter", null);
__decorate([
    (0, common_1.Post)(':id/follow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "follow", null);
__decorate([
    (0, common_1.Post)(':id/unfollow'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Put)(':id/progress'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "setProgress", null);
__decorate([
    (0, common_1.Post)(':id/views'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "incrementViews", null);
__decorate([
    (0, common_1.Get)(':id/followers-count'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComicsController.prototype, "getFollowersCount", null);
exports.ComicsController = ComicsController = __decorate([
    (0, common_1.Controller)('comics'),
    __metadata("design:paramtypes", [comics_service_1.ComicsService, users_service_1.UsersService])
], ComicsController);
