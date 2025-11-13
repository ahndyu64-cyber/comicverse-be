import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum UserRole {
  USER = 'user',
  UPLOADER = 'uploader',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comic' }], default: [] })
  followingComics: Types.ObjectId[];

  @Prop({ type: [String], enum: UserRole, default: [UserRole.USER] })
  roles: UserRole[];

  @Prop({ type: Map, of: String, default: {} })
  readingProgress: Map<string, string>; // comicId -> lastReadChapterId

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  refreshToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);