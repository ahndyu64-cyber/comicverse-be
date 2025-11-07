import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comic', required: true })
  comic: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chapter' })
  chapter?: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: false })
  isHidden?: boolean;
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
