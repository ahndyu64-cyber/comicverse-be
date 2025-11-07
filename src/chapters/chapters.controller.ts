import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { ComicsService } from '../comics/comics.service';

@Controller('chapters')
export class ChaptersController {
  constructor(private readonly comicsService: ComicsService) {}

  @Get()
  async list(@Query('comicId') comicId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    if (!comicId) throw new NotFoundException('comicId is required');
    const comic = await this.comicsService.findById(comicId);
    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 20;
    const skip = (p - 1) * l;
    const total = comic.chapters.length;
    const items = comic.chapters.slice(skip, skip + l);
    return { items, total, page: p, limit: l };
  }

  @Get(':comicId/:index')
  async getOne(@Param('comicId') comicId: string, @Param('index') index: string) {
    const comic = await this.comicsService.findById(comicId);
    const idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= comic.chapters.length) {
      throw new NotFoundException('Chapter not found');
    }
    return comic.chapters[idx];
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.comicsService.findChapterById(id);
    return result;
  }
}
