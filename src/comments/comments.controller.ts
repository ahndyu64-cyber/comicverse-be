import { Controller, Post, Body, UseGuards, Request, Param, Get, Query, Put, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('comics/:comicId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findForComic(@Param('comicId') comicId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    const p = parseInt(page, 10) || 1;
    const l = parseInt(limit, 10) || 20;
    return this.commentsService.findForComic(comicId, p, l);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Param('comicId') comicId: string, @Request() req, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user.sub, comicId, dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req, @Param('comicId') comicId: string, @Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.commentsService.update(req.user.sub, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('comicId') comicId: string, @Param('id') id: string) {
    return this.commentsService.remove(req.user.sub, id);
  }
}
