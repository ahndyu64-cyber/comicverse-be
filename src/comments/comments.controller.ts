import { Controller, Post, Body, UseGuards, Request, Param, Get, Query, Put, Delete } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  remove(@Request() req, @Param('comicId') comicId: string, @Param('id') id: string) {
    console.log(`[DELETE ENDPOINT] req.user: ${JSON.stringify(req.user)}`);
    const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
    console.log(`[DELETE ENDPOINT] roles after conversion: ${JSON.stringify(roles)}`);
    return this.commentsService.remove(req.user.sub, id, roles);
  }
}
