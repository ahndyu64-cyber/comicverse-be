import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from '../auth/schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

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
    }
    return { message: 'Followed' };
  }

  async unfollow(userId: string, comicId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');
    user.followingComics = (user.followingComics || []).filter((c: Types.ObjectId) => c.toString() !== comicId);
    await user.save();
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
    return user.followingComics;
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
}
