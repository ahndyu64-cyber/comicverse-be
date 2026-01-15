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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("../auth/schemas/user.schema");
const comic_schema_1 = require("../comics/schemas/comic.schema");
let UsersService = class UsersService {
    constructor(userModel, comicModel) {
        this.userModel = userModel;
        this.comicModel = comicModel;
    }
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.userModel.find().skip(skip).limit(limit).select('-password -refreshToken').exec(),
            this.userModel.countDocuments().exec(),
        ]);
        return { items, total, page, limit };
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('User not found');
        const user = await this.userModel.findById(id).select('-password -refreshToken').exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async follow(userId, comicId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const oid = new mongoose_2.Types.ObjectId(comicId);
        if (!user.followingComics)
            user.followingComics = [];
        if (!user.followingComics.find((c) => c.toString() === oid.toString())) {
            user.followingComics.push(oid);
            await user.save();
            await this.comicModel.collection.updateOne({ _id: new mongoose_2.Types.ObjectId(comicId) }, { $inc: { followersCount: 1 } });
        }
        return { message: 'Followed' };
    }
    async unfollow(userId, comicId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const initialLength = (user.followingComics || []).length;
        user.followingComics = (user.followingComics || []).filter((c) => c.toString() !== comicId);
        const finalLength = user.followingComics.length;
        if (initialLength > finalLength) {
            await user.save();
            await this.comicModel.collection.updateOne({ _id: new mongoose_2.Types.ObjectId(comicId), followersCount: { $gt: 0 } }, { $inc: { followersCount: -1 } });
        }
        return { message: 'Unfollowed' };
    }
    async updateUserRoles(userId, roles) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            throw new common_1.NotFoundException('User not found');
        const user = await this.userModel.findById(userId).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.roles = roles;
        user.markModified('roles');
        await user.save();
        return user;
    }
    async getFollowing(userId) {
        const user = await this.userModel.findById(userId).populate('followingComics').select('followingComics').exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user.followingComics ? [...user.followingComics].reverse() : [];
    }
    async setProgress(userId, comicId, progress) {
        const user = await this.userModel.findById(userId).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.readingProgress)
            user.readingProgress = new Map();
        user.readingProgress.set(comicId, progress);
        await user.save();
        return { message: 'Progress saved' };
    }
    async getProgress(userId) {
        const user = await this.userModel.findById(userId).select('readingProgress').exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user.readingProgress || {};
    }
    async setRoles(id, roles) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('User not found');
        const user = await this.userModel.findById(id).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.roles = roles;
        user.markModified('roles');
        await user.save();
        return user;
    }
    async updateProfile(userId, updates) {
        if (!mongoose_2.Types.ObjectId.isValid(userId))
            throw new common_1.NotFoundException('User not found');
        const allowedFields = ['username', 'email', 'avatar'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (field in updates && updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        });
        if (Object.keys(updateData).length === 0) {
            return this.findById(userId);
        }
        const updated = await this.userModel
            .findByIdAndUpdate(userId, updateData, { new: true })
            .select('-password -refreshToken')
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('User not found');
        return updated;
    }
    async delete(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('User not found');
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result)
            throw new common_1.NotFoundException('User not found');
        return { message: 'deleted' };
    }
    async cleanupFollowingComics(userId) {
        const user = await this.userModel.findById(userId).exec();
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.followingComics || user.followingComics.length === 0) {
            return { cleaned: 0 };
        }
        const followingComicIds = user.followingComics.map(id => new mongoose_2.Types.ObjectId(id.toString()));
        const existingComics = await this.comicModel
            .find({ _id: { $in: followingComicIds } })
            .select('_id')
            .exec();
        const existingComicIds = new Set(existingComics.map(c => c._id.toString()));
        const validFollowingComics = user.followingComics.filter((comicId) => existingComicIds.has(comicId.toString()));
        const removedCount = user.followingComics.length - validFollowingComics.length;
        if (removedCount > 0) {
            user.followingComics = validFollowingComics;
            await user.save();
        }
        return { cleaned: removedCount };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(comic_schema_1.Comic.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UsersService);
