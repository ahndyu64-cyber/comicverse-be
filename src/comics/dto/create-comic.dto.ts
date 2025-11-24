import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateComicDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsString()
  coverPublicId?: string;

  @IsOptional()
  @IsArray()
  authors?: any;

  @IsOptional()
  @IsArray()
  genres?: any;
}
