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
exports.ComicsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const comic_schema_1 = require("./schemas/comic.schema");
const cloudinary_service_1 = require("../upload/cloudinary.service");
let ComicsService = class ComicsService {
    constructor(comicModel, cloudinaryService) {
        this.comicModel = comicModel;
        this.cloudinaryService = cloudinaryService;
    }
    async create(dto, uploaderId) {
        const slug = dto.title.toLowerCase().replace(/\s+/g, '-');
        console.log(`[CREATE-COMIC] Creating comic with uploaderId: ${uploaderId}`);
        console.log(`[CREATE-COMIC] Received authors:`, dto.authors);
        console.log(`[CREATE-COMIC] Authors type:`, typeof dto.authors);
        console.log(`[CREATE-COMIC] Authors is array:`, Array.isArray(dto.authors));
        let authors = [];
        if (Array.isArray(dto.authors)) {
            authors = dto.authors.filter(a => typeof a === 'string' && a.trim() !== '');
        }
        let genres = [];
        if (Array.isArray(dto.genres)) {
            genres = dto.genres.filter(g => typeof g === 'string' && g.trim() !== '');
        }
        console.log(`[CREATE-COMIC] Normalized authors:`, authors);
        console.log(`[CREATE-COMIC] Normalized genres:`, genres);
        const comicData = {
            title: dto.title,
            slug,
            uploaderId,
            authors,
            genres,
        };
        if (dto.description)
            comicData['description'] = dto.description;
        if (dto.cover)
            comicData['cover'] = dto.cover;
        if (dto.coverPublicId)
            comicData['coverPublicId'] = dto.coverPublicId;
        const created = new this.comicModel(comicData);
        const saved = await created.save();
        console.log(`[CREATE-COMIC] Comic created with ID: ${saved._id}`);
        console.log(`[CREATE-COMIC] Saved authors: ${JSON.stringify(saved.authors)}`);
        console.log(`[CREATE-COMIC] Saved genres: ${JSON.stringify(saved.genres)}`);
        return saved;
    }
    async findAll(filterDto = {}) {
        try {
            const { genres, status, search, sortBy = 'latest', order = 'desc', page = 1, limit = 20, } = filterDto;
            const query = {};
            const skip = (page - 1) * limit;
            if (genres === null || genres === void 0 ? void 0 : genres.length) {
                query.genres = { $all: genres };
            }
            if (status) {
                query.status = status;
            }
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }
            const sort = {};
            switch (sortBy) {
                case 'views':
                case 'popular':
                    sort.views = order === 'desc' ? -1 : 1;
                    break;
                case 'followers':
                    sort.followersCount = order === 'desc' ? -1 : 1;
                    break;
                case 'title':
                case 'alpha':
                    sort.title = order === 'desc' ? -1 : 1;
                    break;
                case 'new':
                    sort.updatedAt = order === 'desc' ? -1 : 1;
                    break;
                case 'latest':
                default:
                    sort.updatedAt = order === 'desc' ? -1 : 1;
            }
            const [items, total] = await Promise.all([
                this.comicModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
                this.comicModel.countDocuments(query).exec(),
            ]);
            return { items, total, page, limit };
        }
        catch (error) {
            console.error('Error in findAll:', error);
            throw error;
        }
    }
    async findByIds(ids) {
        return this.comicModel.find({ _id: { $in: ids.map((id) => new mongoose_2.Types.ObjectId(id)) } }).exec();
    }
    async findHotComics(limit = 10) {
        return this.comicModel.find().sort({ followersCount: -1, views: -1 }).limit(limit).exec();
    }
    async findLatestUpdates(limit = 20) {
        return this.comicModel.find().sort({ updatedAt: -1 }).limit(limit).exec();
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('Comic not found');
        const doc = await this.comicModel.findById(id).exec();
        if (!doc)
            throw new common_1.NotFoundException('Comic not found');
        return doc;
    }
    async findChapterById(chapterId) {
        if (!mongoose_2.Types.ObjectId.isValid(chapterId))
            throw new common_1.NotFoundException('Chapter not found');
        const comic = await this.comicModel.findOne({ 'chapters._id': new mongoose_2.Types.ObjectId(chapterId) }, { 'chapters.$': 1 }).exec();
        if (!comic || !comic.chapters || comic.chapters.length === 0)
            throw new common_1.NotFoundException('Chapter not found');
        return { comicId: comic._id, chapter: comic.chapters[0] };
    }
    async update(id, dto) {
        const comic = await this.findById(id);
        console.log('[SERVICE-UPDATE] Before update - Authors:', comic.authors);
        console.log('[SERVICE-UPDATE] DTO authors:', dto.authors);
        if (dto.title) {
            comic.title = dto.title;
            comic.slug = dto.title.toLowerCase().replace(/\s+/g, '-');
        }
        if (dto.description !== undefined) {
            comic.description = dto.description;
        }
        if (dto.cover !== undefined) {
            comic.cover = dto.cover;
        }
        if (dto.status !== undefined) {
            comic.status = dto.status;
        }
        if (dto.authors !== undefined) {
            let authors = [];
            if (Array.isArray(dto.authors)) {
                authors = dto.authors.filter(a => typeof a === 'string' && a.trim() !== '');
            }
            console.log('[SERVICE-UPDATE] Setting authors to:', authors);
            comic.authors = authors;
            comic.markModified('authors');
        }
        if (dto.genres !== undefined) {
            let genres = [];
            if (Array.isArray(dto.genres)) {
                genres = dto.genres.filter(g => typeof g === 'string' && g.trim() !== '');
            }
            console.log('[SERVICE-UPDATE] Setting genres to:', genres);
            comic.genres = genres;
            comic.markModified('genres');
        }
        console.log('[SERVICE-UPDATE] Before save - Authors:', comic.authors);
        const updated = await comic.save();
        console.log('[SERVICE-UPDATE] After save - Authors:', updated.authors);
        if (!updated)
            throw new common_1.NotFoundException('Comic not found');
        return updated;
    }
    async delete(id) {
        const deleted = await this.comicModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Comic not found');
        if (deleted.coverPublicId) {
            await this.cloudinaryService.deleteImage(deleted.coverPublicId);
        }
        const allImagePublicIds = [];
        if (deleted.chapters) {
            deleted.chapters.forEach((chapter) => {
                if (chapter.imagePublicIds && chapter.imagePublicIds.length > 0) {
                    allImagePublicIds.push(...chapter.imagePublicIds);
                }
            });
        }
        if (allImagePublicIds.length > 0) {
            await this.cloudinaryService.deleteMultipleImages(allImagePublicIds);
        }
        return { message: 'Comic deleted successfully' };
    }
    async addChapter(comicId, dto) {
        const slug = dto.title.toLowerCase().replace(/\s+/g, '-');
        const comic = await this.findById(comicId);
        const chapter = { ...dto, slug, date: new Date() };
        comic.chapters.push(chapter);
        return comic.save();
    }
    async getChapterById(comicId, chapterId) {
        if (!mongoose_2.Types.ObjectId.isValid(chapterId))
            throw new common_1.NotFoundException('Chapter not found');
        const comic = await this.findById(comicId);
        if (!comic.chapters) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        const chapter = comic.chapters.find((ch) => { var _a; return ((_a = ch._id) === null || _a === void 0 ? void 0 : _a.toString()) === chapterId; });
        if (!chapter) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        return { comicId: comic._id, chapter };
    }
    async updateChapter(comicId, chapterIndex, dto) {
        const comic = await this.findById(comicId);
        if (!comic.chapters || chapterIndex < 0 || chapterIndex >= comic.chapters.length) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        const chapter = comic.chapters[chapterIndex];
        if (!chapter) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        if (dto.title) {
            chapter.title = dto.title;
            chapter.slug = dto.title.toLowerCase().replace(/\s+/g, '-');
        }
        if (dto.images !== undefined) {
            const oldImages = chapter.images || [];
            const newImages = dto.images || [];
            const removedImages = oldImages.filter((img) => !newImages.includes(img));
            if (removedImages.length > 0 && chapter.imagePublicIds) {
                const publicIdsToDelete = [];
                removedImages.forEach((removedImg) => {
                    const index = oldImages.indexOf(removedImg);
                    if (index !== -1 && chapter.imagePublicIds[index]) {
                        publicIdsToDelete.push(chapter.imagePublicIds[index]);
                    }
                });
                if (publicIdsToDelete.length > 0) {
                    try {
                        await this.cloudinaryService.deleteMultipleImages(publicIdsToDelete);
                    }
                    catch (error) {
                        console.error('Error deleting images from Cloudinary:', error);
                    }
                }
                const newPublicIds = chapter.imagePublicIds.filter((_, index) => {
                    return index < newImages.length && oldImages[index] && newImages.includes(oldImages[index]);
                });
                chapter.imagePublicIds = newPublicIds;
            }
            chapter.images = dto.images;
        }
        comic.markModified('chapters');
        try {
            return await comic.save();
        }
        catch (error) {
            if (error.name === 'VersionError') {
                console.error('Version conflict detected, retrying...', error);
                const freshComic = await this.findById(comicId);
                if (chapterIndex < freshComic.chapters.length) {
                    const freshChapter = freshComic.chapters[chapterIndex];
                    if (dto.title) {
                        freshChapter.title = dto.title;
                        freshChapter.slug = dto.title.toLowerCase().replace(/\s+/g, '-');
                    }
                    if (dto.images !== undefined) {
                        freshChapter.images = dto.images;
                    }
                    freshComic.markModified('chapters');
                    return await freshComic.save();
                }
            }
            throw error;
        }
    }
    async updateChapterById(comicId, chapterId, dto) {
        if (!mongoose_2.Types.ObjectId.isValid(chapterId))
            throw new common_1.NotFoundException('Chapter not found');
        const comic = await this.findById(comicId);
        if (!comic.chapters) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        const chapterIndex = comic.chapters.findIndex((ch) => { var _a; return ((_a = ch._id) === null || _a === void 0 ? void 0 : _a.toString()) === chapterId; });
        if (chapterIndex === -1) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        const chapter = comic.chapters[chapterIndex];
        if (!chapter) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        if (dto.title) {
            chapter.title = dto.title;
            chapter.slug = dto.title.toLowerCase().replace(/\s+/g, '-');
        }
        if (dto.images !== undefined) {
            const oldImages = chapter.images || [];
            const newImages = dto.images || [];
            const removedImages = oldImages.filter((img) => !newImages.includes(img));
            if (removedImages.length > 0 && chapter.imagePublicIds) {
                const publicIdsToDelete = [];
                removedImages.forEach((removedImg) => {
                    const index = oldImages.indexOf(removedImg);
                    if (index !== -1 && chapter.imagePublicIds[index]) {
                        publicIdsToDelete.push(chapter.imagePublicIds[index]);
                    }
                });
                if (publicIdsToDelete.length > 0) {
                    try {
                        await this.cloudinaryService.deleteMultipleImages(publicIdsToDelete);
                    }
                    catch (error) {
                        console.error('Error deleting images from Cloudinary:', error);
                    }
                }
                const newPublicIds = chapter.imagePublicIds.filter((_, index) => {
                    return index < newImages.length && oldImages[index] && newImages.includes(oldImages[index]);
                });
                chapter.imagePublicIds = newPublicIds;
            }
            chapter.images = dto.images;
        }
        comic.markModified('chapters');
        try {
            return await comic.save();
        }
        catch (error) {
            if (error.name === 'VersionError') {
                console.error('Version conflict detected, retrying...', error);
                const freshComic = await this.findById(comicId);
                const freshChapterIndex = freshComic.chapters.findIndex((ch) => { var _a; return ((_a = ch._id) === null || _a === void 0 ? void 0 : _a.toString()) === chapterId; });
                if (freshChapterIndex !== -1) {
                    const freshChapter = freshComic.chapters[freshChapterIndex];
                    if (dto.title) {
                        freshChapter.title = dto.title;
                        freshChapter.slug = dto.title.toLowerCase().replace(/\s+/g, '-');
                    }
                    if (dto.images !== undefined) {
                        freshChapter.images = dto.images;
                    }
                    freshComic.markModified('chapters');
                    return await freshComic.save();
                }
            }
            throw error;
        }
    }
    async deleteChapter(comicId, chapterIndex) {
        const comic = await this.findById(comicId);
        if (chapterIndex < 0 || chapterIndex >= comic.chapters.length) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        const chapter = comic.chapters[chapterIndex];
        if (chapter && chapter.imagePublicIds && chapter.imagePublicIds.length > 0) {
            try {
                await this.cloudinaryService.deleteMultipleImages(chapter.imagePublicIds);
            }
            catch (error) {
                console.error('Error deleting chapter images from Cloudinary:', error);
            }
        }
        comic.chapters.splice(chapterIndex, 1);
        return comic.save();
    }
    async deleteChapterById(comicId, chapterId) {
        if (!mongoose_2.Types.ObjectId.isValid(comicId))
            throw new common_1.NotFoundException('Comic not found');
        if (!mongoose_2.Types.ObjectId.isValid(chapterId))
            throw new common_1.NotFoundException('Chapter not found');
        const comic = await this.findById(comicId);
        const chapterIndex = comic.chapters.findIndex(ch => ch._id && ch._id.toString() === chapterId);
        if (chapterIndex === -1) {
            throw new common_1.NotFoundException('Chapter not found');
        }
        const chapter = comic.chapters[chapterIndex];
        if (chapter && chapter.imagePublicIds && chapter.imagePublicIds.length > 0) {
            try {
                await this.cloudinaryService.deleteMultipleImages(chapter.imagePublicIds);
            }
            catch (error) {
                console.error('Error deleting chapter images from Cloudinary:', error);
            }
        }
        comic.chapters.splice(chapterIndex, 1);
        return comic.save();
    }
    async incrementViews(id) {
        return this.comicModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true, timestamps: false }).exec();
    }
    canUserModifyComic(comic, userId, userRoles) {
        var _a;
        if (userRoles && userRoles.includes('admin')) {
            return true;
        }
        if (userRoles && userRoles.includes('uploader')) {
            const comicUploaderId = ((_a = comic.uploaderId) === null || _a === void 0 ? void 0 : _a.toString()) || '';
            const userIdStr = String(userId);
            console.log(`[AUTH-CHECK] Comic uploaderId: '${comicUploaderId}' | User ID: '${userIdStr}' | Match: ${comicUploaderId === userIdStr}`);
            return comicUploaderId === userIdStr;
        }
        return false;
    }
    async updateWithAuth(id, dto, userId, userRoles) {
        console.log(`[UPDATE-AUTH] Comic ID: ${id}, User ID: ${userId}, Roles: ${JSON.stringify(userRoles)}`);
        const comic = await this.findById(id);
        console.log(`[UPDATE-AUTH] Comic found. Current uploaderId: '${comic.uploaderId}'`);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            console.log(`[UPDATE-AUTH] Comic has no uploaderId, setting to current user: ${userId}`);
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only edit your own comics');
        }
        return this.update(id, dto);
    }
    async deleteWithAuth(id, userId, userRoles) {
        const comic = await this.findById(id);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only delete your own comics');
        }
        return this.delete(id);
    }
    async addChapterWithAuth(comicId, dto, userId, userRoles) {
        const comic = await this.findById(comicId);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only add chapters to your own comics');
        }
        return this.addChapter(comicId, dto);
    }
    async updateChapterWithAuth(comicId, chapterIndex, dto, userId, userRoles) {
        const comic = await this.findById(comicId);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only edit chapters in your own comics');
        }
        return this.updateChapter(comicId, chapterIndex, dto);
    }
    async updateChapterByIdWithAuth(comicId, chapterId, dto, userId, userRoles) {
        const comic = await this.findById(comicId);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only edit chapters in your own comics');
        }
        return this.updateChapterById(comicId, chapterId, dto);
    }
    async deleteChapterWithAuth(comicId, chapterIndex, userId, userRoles) {
        const comic = await this.findById(comicId);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only delete chapters in your own comics');
        }
        return this.deleteChapter(comicId, chapterIndex);
    }
    async deleteChapterByIdWithAuth(comicId, chapterId, userId, userRoles) {
        const comic = await this.findById(comicId);
        if (!comic.uploaderId && userRoles.includes('uploader')) {
            comic.uploaderId = userId;
            await comic.save();
        }
        if (!this.canUserModifyComic(comic, userId, userRoles)) {
            throw new common_1.ForbiddenException('You can only delete chapters in your own comics');
        }
        return this.deleteChapterById(comicId, chapterId);
    }
    async getFollowersCount(comicId) {
        const comic = await this.comicModel.findById(comicId).exec();
        if (!comic) {
            throw new common_1.NotFoundException(`Comic with ID ${comicId} not found`);
        }
        return { followersCount: comic.followersCount || 0 };
    }
};
exports.ComicsService = ComicsService;
exports.ComicsService = ComicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(comic_schema_1.Comic.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cloudinary_service_1.CloudinaryService])
], ComicsService);
