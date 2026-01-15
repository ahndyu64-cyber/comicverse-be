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
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comment_schema_1 = require("./schemas/comment.schema");
const user_schema_1 = require("../auth/schemas/user.schema");
let CommentsService = class CommentsService {
    constructor(commentModel) {
        this.commentModel = commentModel;
    }
    async create(userId, comicId, dto) {
        const doc = new this.commentModel({
            user: new mongoose_2.Types.ObjectId(userId),
            comic: new mongoose_2.Types.ObjectId(comicId),
            chapter: dto.chapterId ? new mongoose_2.Types.ObjectId(dto.chapterId) : undefined,
            content: dto.content,
        });
        return doc.save();
    }
    async findForComic(comicId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.commentModel
                .find({ comic: new mongoose_2.Types.ObjectId(comicId), isHidden: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username avatar')
                .exec(),
            this.commentModel.countDocuments({ comic: new mongoose_2.Types.ObjectId(comicId), isHidden: false }).exec(),
        ]);
        return { items, total, page, limit };
    }
    async findForComicFlat(comicId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.commentModel
                .find({ comic: new mongoose_2.Types.ObjectId(comicId), isHidden: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('user', 'username avatar')
                .exec(),
            this.commentModel.countDocuments({ comic: new mongoose_2.Types.ObjectId(comicId), isHidden: false }).exec(),
        ]);
        return items;
    }
    async update(userId, commentId, dto) {
        const comment = await this.commentModel.findById(commentId).exec();
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.user.toString() !== userId)
            throw new common_1.ForbiddenException('Not allowed');
        comment.content = dto.content;
        if (dto.isHidden !== undefined)
            comment.isHidden = dto.isHidden;
        return comment.save();
    }
    async remove(userId, commentId, roles) {
        const comment = await this.commentModel.findById(commentId).exec();
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const isOwner = comment.user.toString() === userId;
        const isAdmin = roles && Array.isArray(roles) && roles.includes(user_schema_1.UserRole.ADMIN);
        console.log(`[DELETE COMMENT] userId: ${userId}, isOwner: ${isOwner}, roles: ${JSON.stringify(roles)}, isAdmin: ${isAdmin}`);
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException('Not allowed');
        return this.commentModel.findByIdAndDelete(commentId).exec();
    }
    async adminDelete(commentId) {
        return this.commentModel.findByIdAndDelete(commentId).exec();
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comment_schema_1.Comment.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CommentsService);
