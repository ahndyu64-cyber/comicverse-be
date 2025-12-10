import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Banner, BannerDocument } from './schemas/banner.schema';
import { CreateBannerDto, UpdateBannerDto, FilterBannersDto } from './dto/banner.dto';
import { CloudinaryService } from '../upload/cloudinary.service';

@Injectable()
export class BannersService {
  constructor(
    @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateBannerDto) {
    const relatedComics = dto.relatedComics?.map((id) => new Types.ObjectId(id)) || [];
    const banner = new this.bannerModel({
      ...dto,
      relatedComics,
    });
    return banner.save();
  }

  async findAll(filterDto: FilterBannersDto = {}) {
    const { isActive, tags, page = 1, limit = 20 } = filterDto;

    const query: any = {};

    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Filter by active date range
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

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Banner not found');
    const banner = await this.bannerModel
      .findById(id)
      .populate('relatedComics', 'title slug cover')
      .exec();
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.findById(id);

    Object.assign(banner, dto);

    if (dto.relatedComics) {
      banner.relatedComics = dto.relatedComics.map((id) => new Types.ObjectId(id));
      banner.markModified('relatedComics');
    }

    return banner.save();
  }

  async delete(id: string) {
    const banner = await this.findById(id);

    // Delete image from Cloudinary if exists
    if (banner.imagePublicId) {
      await this.cloudinaryService.deleteImage(banner.imagePublicId);
    }

    await this.bannerModel.findByIdAndDelete(id).exec();
    return { message: 'Banner deleted successfully' };
  }

  async recordView(id: string) {
    const banner = await this.findById(id);
    banner.views += 1;
    return banner.save();
  }

  async recordClick(id: string) {
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

  async updateOrder(bannerId: string, newOrder: number) {
    const banner = await this.findById(bannerId);
    banner.order = newOrder;
    return banner.save();
  }
}
