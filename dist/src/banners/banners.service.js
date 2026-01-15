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
exports.BannersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const banner_schema_1 = require("./schemas/banner.schema");
const cloudinary_service_1 = require("../upload/cloudinary.service");
let BannersService = class BannersService {
    constructor(bannerModel, cloudinaryService) {
        this.bannerModel = bannerModel;
        this.cloudinaryService = cloudinaryService;
    }
    async create(dto) {
        var _a;
        const relatedComics = ((_a = dto.relatedComics) === null || _a === void 0 ? void 0 : _a.map((id) => new mongoose_2.Types.ObjectId(id))) || [];
        const banner = new this.bannerModel({
            ...dto,
            relatedComics,
        });
        return banner.save();
    }
    async findAll(filterDto = {}) {
        const { isActive, tags, page = 1, limit = 20 } = filterDto;
        const query = {};
        if (isActive !== undefined) {
            query.isActive = isActive;
        }
        if (tags && tags.length > 0) {
            query.tags = { $in: tags };
        }
        const now = new Date();
        query.$or = [
            { startDate: { $lte: now }, endDate: { $gte: now } },
            { startDate: { $exists: false }, endDate: { $exists: false } },
        ];
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.bannerModel
                .find(query)
                .sort({ order: 1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('relatedComics', 'title slug cover')
                .exec(),
            this.bannerModel.countDocuments(query).exec(),
        ]);
        return { items, total, page, limit };
    }
    async findById(id) {
        if (!mongoose_2.Types.ObjectId.isValid(id))
            throw new common_1.NotFoundException('Banner not found');
        const banner = await this.bannerModel
            .findById(id)
            .populate('relatedComics', 'title slug cover')
            .exec();
        if (!banner)
            throw new common_1.NotFoundException('Banner not found');
        return banner;
    }
    async update(id, dto) {
        const banner = await this.findById(id);
        Object.assign(banner, dto);
        if (dto.relatedComics) {
            banner.relatedComics = dto.relatedComics.map((id) => new mongoose_2.Types.ObjectId(id));
            banner.markModified('relatedComics');
        }
        return banner.save();
    }
    async delete(id) {
        const banner = await this.findById(id);
        if (banner.imagePublicId) {
            await this.cloudinaryService.deleteImage(banner.imagePublicId);
        }
        await this.bannerModel.findByIdAndDelete(id).exec();
        return { message: 'Banner deleted successfully' };
    }
    async recordView(id) {
        const banner = await this.findById(id);
        banner.views += 1;
        return banner.save();
    }
    async recordClick(id) {
        const banner = await this.findById(id);
        banner.clicks += 1;
        return banner.save();
    }
    async getActiveBanners(limit = 5) {
        const now = new Date();
        return this.bannerModel
            .find({
            isActive: true,
            $or: [
                { startDate: { $lte: now }, endDate: { $gte: now } },
                { startDate: { $exists: false }, endDate: { $exists: false } },
            ],
        })
            .sort({ order: 1 })
            .limit(limit)
            .populate('relatedComics', 'title slug cover')
            .exec();
    }
    async updateOrder(bannerId, newOrder) {
        const banner = await this.findById(bannerId);
        banner.order = newOrder;
        return banner.save();
    }
};
exports.BannersService = BannersService;
exports.BannersService = BannersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(banner_schema_1.Banner.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        cloudinary_service_1.CloudinaryService])
], BannersService);
