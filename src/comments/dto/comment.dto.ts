import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsString()
  chapterId?: string;
}

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  isHidden?: boolean;
}
