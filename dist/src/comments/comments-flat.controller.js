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
exports.CommentsFlatController = void 0;
const common_1 = require("@nestjs/common");
const comments_service_1 = require("./comments.service");
const comment_dto_1 = require("./dto/comment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_schema_1 = require("../auth/schemas/user.schema");
let CommentsFlatController = class CommentsFlatController {
    constructor(commentsService) {
        this.commentsService = commentsService;
    }
    findByComicId(comicId, page = '1', limit = '20') {
        if (!comicId) {
            throw new common_1.BadRequestException('comicId query parameter is required');
        }
        const p = parseInt(page, 10) || 1;
        const l = parseInt(limit, 10) || 20;
        return this.commentsService.findForComicFlat(comicId, p, l);
    }
    create(queryComicId, req, dto) {
        const comicId = queryComicId || dto.comicId;
        if (!comicId) {
            throw new common_1.BadRequestException('comicId is required (pass as query param: ?comicId=xyz OR in request body)');
        }
        const { comicId: _, ...createDto } = dto;
        return this.commentsService.create(req.user.sub, comicId, createDto);
    }
    update(req, id, dto) {
        return this.commentsService.update(req.user.sub, id, dto);
    }
    remove(req, id) {
        const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
        return this.commentsService.remove(req.user.sub, id, roles);
    }
};
exports.CommentsFlatController = CommentsFlatController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('comicId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CommentsFlatController.prototype, "findByComicId", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('comicId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CommentsFlatController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, comment_dto_1.UpdateCommentDto]),
    __metadata("design:returntype", void 0)
], CommentsFlatController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.USER, user_schema_1.UserRole.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommentsFlatController.prototype, "remove", null);
exports.CommentsFlatController = CommentsFlatController = __decorate([
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [comments_service_1.CommentsService])
], CommentsFlatController);
