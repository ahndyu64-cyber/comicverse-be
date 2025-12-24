import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async create(dto: CreateComicDto, uploaderId?: string) {
    const slug = dto.title.toLowerCase().replace(/\s+/g, '-');
    console.log(`[CREATE-COMIC] Creating comic with uploaderId: ${uploaderId}`);
    console.log(`[CREATE-COMIC] Received authors:`, dto.authors);
    console.log(`[CREATE-COMIC] Authors type:`, typeof dto.authors);
    console.log(`[CREATE-COMIC] Authors is array:`, Array.isArray(dto.authors));
    
    // Normalize authors
    let authors: string[] = [];
    if (Array.isArray(dto.authors)) {
      authors = dto.authors.filter(a => typeof a === 'string' && a.trim() !== '');
    }
    
    // Normalize genres
    let genres: string[] = [];
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
    
    if (dto.description) comicData['description'] = dto.description;
    if (dto.cover) comicData['cover'] = dto.cover;
    if (dto.coverPublicId) comicData['coverPublicId'] = dto.coverPublicId;
    
    const created = new this.comicModel(comicData);
    const saved = await created.save();
    console.log(`[CREATE-COMIC] Comic created with ID: ${saved._id}`);
    console.log(`[CREATE-COMIC] Saved authors: ${JSON.stringify(saved.authors)}`);
    console.log(`[CREATE-COMIC] Saved genres: ${JSON.stringify(saved.genres)}`);
    return saved;
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
          // Sort by updatedAt for newly updated comics
          sort.updatedAt = order === 'desc' ? -1 : 1;
          break;
        case 'latest':
        default:
          // Sort by updatedAt in descending order by default (newest updates first)
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
    return this.comicModel.find().sort({ followersCount: -1, views: -1 }).limit(limit).exec();
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
    const comic = await this.findById(id);
    console.log('[SERVICE-UPDATE] Before update - Authors:', comic.authors);
    console.log('[SERVICE-UPDATE] DTO authors:', dto.authors);
    
    // Update basic fields
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
    
    // Handle authors array
    if (dto.authors !== undefined) {
      let authors: string[] = [];
      if (Array.isArray(dto.authors)) {
        authors = dto.authors.filter(a => typeof a === 'string' && a.trim() !== '');
      }
      console.log('[SERVICE-UPDATE] Setting authors to:', authors);
      comic.authors = authors;
      comic.markModified('authors');
    }
    
    // Handle genres array
    if (dto.genres !== undefined) {
      let genres: string[] = [];
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
      // Delete removed images from Cloudinary
      const oldImages = (chapter as any).images || [];
      const newImages = dto.images || [];
      const removedImages = oldImages.filter((img: string) => !newImages.includes(img));
      
      if (removedImages.length > 0 && (chapter as any).imagePublicIds) {
        // Find corresponding public IDs for removed images
        const publicIdsToDelete: string[] = [];
        removedImages.forEach((removedImg: string) => {
          const index = oldImages.indexOf(removedImg);
          if (index !== -1 && (chapter as any).imagePublicIds[index]) {
            publicIdsToDelete.push((chapter as any).imagePublicIds[index]);
          }
        });
        
        // Delete from Cloudinary
        if (publicIdsToDelete.length > 0) {
          try {
            await this.cloudinaryService.deleteMultipleImages(publicIdsToDelete);
          } catch (error) {
            console.error('Error deleting images from Cloudinary:', error);
            // Continue with saving the chapter even if Cloudinary deletion fails
          }
        }
        
        // Update imagePublicIds array to match new images array
        const newPublicIds = (chapter as any).imagePublicIds.filter((_: string, index: number) => {
          return index < newImages.length && oldImages[index] && newImages.includes(oldImages[index]);
        });
        (chapter as any).imagePublicIds = newPublicIds;
      }
      
      (chapter as any).images = dto.images;
    }
    comic.markModified('chapters');
    try {
      return await comic.save();
    } catch (error: any) {
      // Handle version errors from concurrent updates
      if (error.name === 'VersionError') {
        console.error('Version conflict detected, retrying...', error);
        // Retry with fresh data
        const freshComic = await this.findById(comicId);
        if (chapterIndex < freshComic.chapters.length) {
          const freshChapter = freshComic.chapters[chapterIndex];
          if (dto.title) {
            (freshChapter as any).title = dto.title;
            (freshChapter as any).slug = dto.title.toLowerCase().replace(/\s+/g, '-');
          }
          if (dto.images !== undefined) {
            (freshChapter as any).images = dto.images;
          }
          freshComic.markModified('chapters');
          return await freshComic.save();
        }
      }
      throw error;
    }
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
      // Delete removed images from Cloudinary
      const oldImages = (chapter as any).images || [];
      const newImages = dto.images || [];
      const removedImages = oldImages.filter((img: string) => !newImages.includes(img));
      
      if (removedImages.length > 0 && (chapter as any).imagePublicIds) {
        // Find corresponding public IDs for removed images
        const publicIdsToDelete: string[] = [];
        removedImages.forEach((removedImg: string) => {
          const index = oldImages.indexOf(removedImg);
          if (index !== -1 && (chapter as any).imagePublicIds[index]) {
            publicIdsToDelete.push((chapter as any).imagePublicIds[index]);
          }
        });
        
        // Delete from Cloudinary
        if (publicIdsToDelete.length > 0) {
          try {
            await this.cloudinaryService.deleteMultipleImages(publicIdsToDelete);
          } catch (error) {
            console.error('Error deleting images from Cloudinary:', error);
            // Continue with saving the chapter even if Cloudinary deletion fails
          }
        }
        
        // Update imagePublicIds array to match new images array
        const newPublicIds = (chapter as any).imagePublicIds.filter((_: string, index: number) => {
          return index < newImages.length && oldImages[index] && newImages.includes(oldImages[index]);
        });
        (chapter as any).imagePublicIds = newPublicIds;
      }
      
      (chapter as any).images = dto.images;
    }
    comic.markModified('chapters');
    try {
      return await comic.save();
    } catch (error: any) {
      // Handle version errors from concurrent updates
      if (error.name === 'VersionError') {
        console.error('Version conflict detected, retrying...', error);
        // Retry with fresh data
        const freshComic = await this.findById(comicId);
        const freshChapterIndex = freshComic.chapters.findIndex((ch) => ch._id?.toString() === chapterId);
        if (freshChapterIndex !== -1) {
          const freshChapter = freshComic.chapters[freshChapterIndex];
          if (dto.title) {
            (freshChapter as any).title = dto.title;
            (freshChapter as any).slug = dto.title.toLowerCase().replace(/\s+/g, '-');
          }
          if (dto.images !== undefined) {
            (freshChapter as any).images = dto.images;
          }
          freshComic.markModified('chapters');
          return await freshComic.save();
        }
      }
      throw error;
    }
  }

  async deleteChapter(comicId: string, chapterIndex: number) {
    const comic = await this.findById(comicId);
    if (chapterIndex < 0 || chapterIndex >= comic.chapters.length) {
      throw new NotFoundException('Chapter not found');
    }
    
    // Delete chapter images from Cloudinary
    const chapter = comic.chapters[chapterIndex];
    if (chapter && (chapter as any).imagePublicIds && (chapter as any).imagePublicIds.length > 0) {
      try {
        await this.cloudinaryService.deleteMultipleImages((chapter as any).imagePublicIds);
      } catch (error) {
        console.error('Error deleting chapter images from Cloudinary:', error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }
    
    comic.chapters.splice(chapterIndex, 1);
    return comic.save();
  }

  async deleteChapterById(comicId: string, chapterId: string) {
    if (!Types.ObjectId.isValid(comicId)) throw new NotFoundException('Comic not found');
    if (!Types.ObjectId.isValid(chapterId)) throw new NotFoundException('Chapter not found');
    
    const comic = await this.findById(comicId);
    
    // Find chapter by ID instead of using index
    const chapterIndex = comic.chapters.findIndex(ch => ch._id && ch._id.toString() === chapterId);
    if (chapterIndex === -1) {
      throw new NotFoundException('Chapter not found');
    }
    
    // Delete chapter images from Cloudinary
    const chapter = comic.chapters[chapterIndex];
    if (chapter && (chapter as any).imagePublicIds && (chapter as any).imagePublicIds.length > 0) {
      try {
        await this.cloudinaryService.deleteMultipleImages((chapter as any).imagePublicIds);
      } catch (error) {
        console.error('Error deleting chapter images from Cloudinary:', error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }
    
    comic.chapters.splice(chapterIndex, 1);
    return comic.save();
  }

  async incrementViews(id: string) {
    return this.comicModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, timestamps: false }
    ).exec();
  }

  private canUserModifyComic(comic: ComicDocument, userId: string, userRoles: string[]): boolean {
    // ADMIN can do anything
    if (userRoles && userRoles.includes('admin')) {
      return true;
    }
    // UPLOADER can only modify their own comics
    if (userRoles && userRoles.includes('uploader')) {
      const comicUploaderId = comic.uploaderId?.toString() || '';
      const userIdStr = String(userId);
      console.log(`[AUTH-CHECK] Comic uploaderId: '${comicUploaderId}' | User ID: '${userIdStr}' | Match: ${comicUploaderId === userIdStr}`);
      return comicUploaderId === userIdStr;
    }
    return false;
  }

  async updateWithAuth(id: string, dto: UpdateComicDto, userId: string, userRoles: string[]) {
    console.log(`[UPDATE-AUTH] Comic ID: ${id}, User ID: ${userId}, Roles: ${JSON.stringify(userRoles)}`);
    const comic = await this.findById(id);
    console.log(`[UPDATE-AUTH] Comic found. Current uploaderId: '${comic.uploaderId}'`);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      console.log(`[UPDATE-AUTH] Comic has no uploaderId, setting to current user: ${userId}`);
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only edit your own comics');
    }
    return this.update(id, dto);
  }

  async deleteWithAuth(id: string, userId: string, userRoles: string[]) {
    const comic = await this.findById(id);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only delete your own comics');
    }
    return this.delete(id);
  }

  async addChapterWithAuth(comicId: string, dto: CreateChapterDto, userId: string, userRoles: string[]) {
    const comic = await this.findById(comicId);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only add chapters to your own comics');
    }
    return this.addChapter(comicId, dto);
  }

  async updateChapterWithAuth(comicId: string, chapterIndex: number, dto: UpdateChapterDto, userId: string, userRoles: string[]) {
    const comic = await this.findById(comicId);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only edit chapters in your own comics');
    }
    return this.updateChapter(comicId, chapterIndex, dto);
  }

  async updateChapterByIdWithAuth(comicId: string, chapterId: string, dto: UpdateChapterDto, userId: string, userRoles: string[]) {
    const comic = await this.findById(comicId);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only edit chapters in your own comics');
    }
    return this.updateChapterById(comicId, chapterId, dto);
  }

  async deleteChapterWithAuth(comicId: string, chapterIndex: number, userId: string, userRoles: string[]) {
    const comic = await this.findById(comicId);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only delete chapters in your own comics');
    }
    return this.deleteChapter(comicId, chapterIndex);
  }

  async deleteChapterByIdWithAuth(comicId: string, chapterId: string, userId: string, userRoles: string[]) {
    const comic = await this.findById(comicId);
    
    // For existing comics without uploaderId, set it to the current uploader if they're trying to modify
    if (!comic.uploaderId && userRoles.includes('uploader')) {
      comic.uploaderId = userId;
      await comic.save();
    }
    
    if (!this.canUserModifyComic(comic, userId, userRoles)) {
      throw new ForbiddenException('You can only delete chapters in your own comics');
    }
    return this.deleteChapterById(comicId, chapterId);
  }

  async getFollowersCount(comicId: string) {
    const comic = await this.comicModel.findById(comicId).exec();
    if (!comic) {
      throw new NotFoundException(`Comic with ID ${comicId} not found`);
    }
    return { followersCount: comic.followersCount || 0 };
  }
}
