import { Controller, Get, Post, Put, Delete, Query, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comments')
export class CommentsFlatController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findByComicId(@Query('comicId') comicId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    if (!comicId) {
      throw new BadRequestException('comicId query parameter is required');
    }
    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 20;
    return this.commentsService.findForComicFlat(comicId, p, l);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Query('comicId') queryComicId: string, @Request() req, @Body() dto: CreateCommentDto & { comicId?: string }) {
    const comicId = queryComicId || dto.comicId;
    if (!comicId) {
      throw new BadRequestException('comicId is required (pass as query param: ?comicId=xyz OR in request body)');
    }
    // Remove comicId from dto if it exists in body to avoid passing it to service
    const { comicId: _, ...createDto } = dto as any;
    return this.commentsService.create(req.user.sub, comicId, createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.commentsService.remove(req.user.sub, id);
  }
}
