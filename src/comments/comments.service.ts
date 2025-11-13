import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async create(userId: string, comicId: string, dto: CreateCommentDto) {
    const doc = new this.commentModel({
      user: new Types.ObjectId(userId),
      comic: new Types.ObjectId(comicId),
      chapter: dto.chapterId ? new Types.ObjectId(dto.chapterId) : undefined,
      content: dto.content,
    });
    return doc.save();
  }

  async findForComic(comicId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.commentModel
        .find({ comic: new Types.ObjectId(comicId), isHidden: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar')
        .exec(),
      this.commentModel.countDocuments({ comic: new Types.ObjectId(comicId), isHidden: false }).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findForComicFlat(comicId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.commentModel
        .find({ comic: new Types.ObjectId(comicId), isHidden: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar')
        .exec(),
      this.commentModel.countDocuments({ comic: new Types.ObjectId(comicId), isHidden: false }).exec(),
    ]);
    return items;
  }

  async update(userId: string, commentId: string, dto: UpdateCommentDto) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.toString() !== userId) throw new ForbiddenException('Not allowed');
    comment.content = dto.content;
    if (dto.isHidden !== undefined) comment.isHidden = dto.isHidden;
    return comment.save();
  }

  async remove(userId: string, commentId: string) {
    const comment = await this.commentModel.findById(commentId).exec();
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.toString() !== userId) throw new ForbiddenException('Not allowed');
    return this.commentModel.findByIdAndDelete(commentId).exec();
  }

  async adminDelete(commentId: string) {
    return this.commentModel.findByIdAndDelete(commentId).exec();
  }
}
