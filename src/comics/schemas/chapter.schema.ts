import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: false })
export class Chapter {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  slug?: string;

  @Prop({ default: Date.now })
  date?: Date;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  imagePublicIds?: string[];

  @Prop({ default: false })
  isDraft?: boolean;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
export type ChapterDocument = Chapter & Document;

