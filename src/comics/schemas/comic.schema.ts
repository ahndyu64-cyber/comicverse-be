import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chapter, ChapterSchema } from './chapter.schema';

@Schema({ timestamps: true })
export class Comic {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  slug?: string;

  @Prop()
  cover?: string;

  @Prop()
  coverPublicId?: string;

  @Prop()
  description?: string;

  @Prop({ type: String, ref: 'User' })
  uploaderId?: string;

  @Prop({ type: [String], default: [] })
  authors: string[];

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop({ default: 'ongoing' })
  status: string;

  @Prop({ type: [ChapterSchema], default: [] })
  chapters: Chapter[];

  @Prop({ default: 0 })
  views: number;
}

export type ComicDocument = Comic & Document;
export const ComicSchema = SchemaFactory.createForClass(Comic);

// Middleware để đảm bảo authors luôn được lưu
ComicSchema.pre('save', function(next) {
  if (!this.authors) {
    this.authors = [];
  }
  if (!Array.isArray(this.authors)) {
    this.authors = [];
  }
  next();
});
