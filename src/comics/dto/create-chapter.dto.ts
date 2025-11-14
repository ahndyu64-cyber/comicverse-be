import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagePublicIds?: string[];
}
