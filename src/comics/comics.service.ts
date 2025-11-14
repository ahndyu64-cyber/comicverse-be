import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comic, ComicDocument } from './schemas/comic.schema';
import { CreateComicDto } from './dto/create-comic.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { FilterComicsDto, UpdateComicDto, UpdateChapterDto } from './dto/filter-comics.dto';
import { CloudinaryService } from '../upload/cloudinary.service';

@Injectable()
export class ComicsService {
  constructor(
    @InjectModel(Comic.name) private comicModel: Model<ComicDocument>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreateComicDto) {
    const slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    const created = new this.comicModel({ ...dto, slug });
    return created.save();
  }

  async findAll(filterDto: FilterComicsDto = {}) {
    try {
      const {
        genres,
        status,
        search,
        sortBy = 'latest',
        order = 'desc',
        page = 1,
        limit = 20,
      } = filterDto as any;

      const query: any = {};
      const skip = (page - 1) * limit;

      if (genres?.length) {
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

      const sort: any = {};
      switch (sortBy) {
        case 'views':
          sort.views = order === 'desc' ? -1 : 1;
          break;
        case 'title':
          sort.title = order === 'desc' ? -1 : 1;
          break;
        default:
          sort.updatedAt = order === 'desc' ? -1 : 1;
      }

      const [items, total] = await Promise.all([
        this.comicModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
        this.comicModel.countDocuments(query).exec(),
      ]);
      return { items, total, page, limit };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findByIds(ids: string[]) {
    return this.comicModel.find({ _id: { $in: ids.map((id) => new Types.ObjectId(id)) } }).exec();
  }

  async findHotComics(limit = 10) {
    return this.comicModel.find().sort({ views: -1 }).limit(limit).exec();
  }

  async findLatestUpdates(limit = 20) {
    return this.comicModel.find().sort({ updatedAt: -1 }).limit(limit).exec();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Comic not found');
    const doc = await this.comicModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Comic not found');
    return doc;
  }

  async findChapterById(chapterId: string) {
    if (!Types.ObjectId.isValid(chapterId)) throw new NotFoundException('Chapter not found');
    const comic = await this.comicModel.findOne({ 'chapters._id': new Types.ObjectId(chapterId) }, { 'chapters.$': 1 }).exec();
    if (!comic || !comic.chapters || comic.chapters.length === 0) throw new NotFoundException('Chapter not found');
    return { comicId: comic._id, chapter: comic.chapters[0] } as any;
  }

  async update(id: string, dto: UpdateComicDto) {
    const updates: any = { ...dto };
    if (dto.title) {
      updates.slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    }
    const updated = await this.comicModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    if (!updated) throw new NotFoundException('Comic not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.comicModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Comic not found');
    
    // Delete cover image from Cloudinary if exists
    if (deleted.coverPublicId) {
      await this.cloudinaryService.deleteImage(deleted.coverPublicId);
    }
    
    // Delete all chapter images from Cloudinary
    const allImagePublicIds: string[] = [];
    if (deleted.chapters) {
      deleted.chapters.forEach((chapter: any) => {
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

  async addChapter(comicId: string, dto: CreateChapterDto) {
    const slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    const comic = await this.findById(comicId);
    const chapter = { ...dto, slug, date: new Date() } as any;
    comic.chapters.push(chapter);
    return comic.save();
  }

  async getChapterById(comicId: string, chapterId: string) {
    if (!Types.ObjectId.isValid(chapterId)) throw new NotFoundException('Chapter not found');
    const comic = await this.findById(comicId);
    if (!comic.chapters) {
      throw new NotFoundException('Chapter not found');
    }
    const chapter = comic.chapters.find((ch) => ch._id?.toString() === chapterId);
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return { comicId: comic._id, chapter };
  }

  async updateChapter(comicId: string, chapterIndex: number, dto: UpdateChapterDto) {
    const comic = await this.findById(comicId);
    if (!comic.chapters || chapterIndex < 0 || chapterIndex >= comic.chapters.length) {
      throw new NotFoundException('Chapter not found');
    }
    const chapter = comic.chapters[chapterIndex];
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    if (dto.title) {
      (chapter as any).title = dto.title;
      (chapter as any).slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    }
    if (dto.images !== undefined) {
      (chapter as any).images = dto.images;
    }
    comic.markModified('chapters');
    return comic.save();
  }

  async updateChapterById(comicId: string, chapterId: string, dto: UpdateChapterDto) {
    if (!Types.ObjectId.isValid(chapterId)) throw new NotFoundException('Chapter not found');
    const comic = await this.findById(comicId);
    if (!comic.chapters) {
      throw new NotFoundException('Chapter not found');
    }
    const chapterIndex = comic.chapters.findIndex((ch) => ch._id?.toString() === chapterId);
    if (chapterIndex === -1) {
      throw new NotFoundException('Chapter not found');
    }
    const chapter = comic.chapters[chapterIndex];
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    if (dto.title) {
      (chapter as any).title = dto.title;
      (chapter as any).slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    }
    if (dto.images !== undefined) {
      (chapter as any).images = dto.images;
    }
    comic.markModified('chapters');
    return comic.save();
  }

  async deleteChapter(comicId: string, chapterIndex: number) {
    const comic = await this.findById(comicId);
    if (chapterIndex < 0 || chapterIndex >= comic.chapters.length) {
      throw new NotFoundException('Chapter not found');
    }
    
    // Delete chapter images from Cloudinary
    const chapter = comic.chapters[chapterIndex];
    if (chapter && (chapter as any).imagePublicIds && (chapter as any).imagePublicIds.length > 0) {
      await this.cloudinaryService.deleteMultipleImages((chapter as any).imagePublicIds);
    }
    
    comic.chapters.splice(chapterIndex, 1);
    return comic.save();
  }

  async incrementViews(id: string) {
    return this.comicModel.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).exec();
  }
}
