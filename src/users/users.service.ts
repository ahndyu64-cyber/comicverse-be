import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../auth/schemas/user.schema';
import { Comic, ComicDocument } from '../comics/schemas/comic.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Comic.name) private comicModel: Model<ComicDocument>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).select('-password -refreshToken').exec(),
      this.userModel.countDocuments().exec(),
    ]);
    return { items, total, page, limit };
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found');
    const user = await this.userModel.findById(id).select('-password -refreshToken').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async follow(userId: string, comicId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    const oid = new Types.ObjectId(comicId);
    if (!user.followingComics) user.followingComics = [] as any;
    if (!user.followingComics.find((c: Types.ObjectId) => c.toString() === oid.toString())) {
      user.followingComics.push(oid as any);
      await user.save();
      
      // Update comic's followersCount
      const comic = await this.comicModel.findById(comicId).exec();
      if (comic) {
        comic.followersCount = (comic.followersCount || 0) + 1;
        await comic.save();
      }
    }
    return { message: 'Followed' };
  }

  async unfollow(userId: string, comicId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    const initialLength = (user.followingComics || []).length;
    user.followingComics = (user.followingComics || []).filter((c: Types.ObjectId) => c.toString() !== comicId);
    const finalLength = user.followingComics.length;
    
    // Only update if the comic was actually being followed
    if (initialLength > finalLength) {
      await user.save();
      
      // Update comic's followersCount (prevent negative counts)
      const comic = await this.comicModel.findById(comicId).exec();
      if (comic) {
        comic.followersCount = Math.max(0, (comic.followersCount || 0) - 1);
        await comic.save();
      }
    }
    return { message: 'Unfollowed' };
  }

  async updateUserRoles(userId: string, roles: UserRole[]) {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('User not found');
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    user.roles = roles;
    user.markModified('roles');
    await user.save();
    return user;
  }

  async getFollowing(userId: string) {
    const user = await this.userModel.findById(userId).populate('followingComics').select('followingComics').exec();
    if (!user) throw new NotFoundException('User not found');
    // Return in reverse order so newest follows are first
    return user.followingComics ? [...user.followingComics].reverse() : [];
  }

  async setProgress(userId: string, comicId: string, progress: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    if (!user.readingProgress) user.readingProgress = new Map<string, string>();
    user.readingProgress.set(comicId, progress);
    await user.save();
    return { message: 'Progress saved' };
  }

  async getProgress(userId: string) {
    const user = await this.userModel.findById(userId).select('readingProgress').exec();
    if (!user) throw new NotFoundException('User not found');
    return user.readingProgress || {};
  }

  async setRoles(id: string, roles: UserRole[]) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found');
    const user = await this.userModel.findById(id).exec();
    if (!user) throw new NotFoundException('User not found');
    user.roles = roles;
    user.markModified('roles');
    await user.save();
    return user;
  }

  async updateProfile(userId: string, updates: any) {
    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException('User not found');
    
    const allowedFields = ['username', 'email', 'avatar'];
    const updateData: any = {};
    
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
    
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async delete(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('User not found');
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
    return { message: 'deleted' };
  }

  async cleanupFollowingComics(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    
    if (!user.followingComics || user.followingComics.length === 0) {
      return { cleaned: 0 };
    }

    // Check which comics actually exist
    const followingComicIds = user.followingComics.map(id => new Types.ObjectId(id.toString()));
    const existingComics = await this.comicModel
      .find({ _id: { $in: followingComicIds } })
      .select('_id')
      .exec();
    
    const existingComicIds = new Set(existingComics.map(c => c._id.toString()));
    
    // Remove comics that don't exist
    const validFollowingComics = user.followingComics.filter(
      (comicId) => existingComicIds.has(comicId.toString())
    );
    
    const removedCount = user.followingComics.length - validFollowingComics.length;
    
    if (removedCount > 0) {
      user.followingComics = validFollowingComics;
      await user.save();
    }
    
    return { cleaned: removedCount };
  }
}
