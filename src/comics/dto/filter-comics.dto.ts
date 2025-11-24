import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FilterComicsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsEnum(['ongoing', 'completed', 'dropped'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['views', 'latest', 'title'])
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class UpdateComicDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsArray()
  authors?: any;

  @IsOptional()
  @IsArray()
  genres?: any;

  @IsOptional()
  @IsEnum(['ongoing', 'completed', 'dropped'])
  status?: string;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}