import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ComicsService } from './comics.service';
import { CreateComicDto } from './dto/create-comic.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { FilterComicsDto, UpdateComicDto, UpdateChapterDto } from './dto/filter-comics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService, private readonly usersService: UsersService) {}

  @Get('hot')
  getHot(@Query('limit') limit = '10') {
    try {
      return this.comicsService.findHotComics(+limit);
    } catch (error) {
      console.error('Error in getHot:', error);
      throw error;
    }
  }

  @Get('latest')
  getLatest(@Query('limit') limit = '20') {
    try {
      return this.comicsService.findLatestUpdates(+limit);
    } catch (error) {
      console.error('Error in getLatest:', error);
      throw error;
    }
  }

  @Get()
  findAll(@Query() filterDto: FilterComicsDto) {
    try {
      return this.comicsService.findAll(filterDto as any);
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comicsService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UPLOADER, UserRole.ADMIN)
  create(@Body() dto: CreateComicDto) {
    return this.comicsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UPLOADER, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateComicDto) {
    return this.comicsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.comicsService.delete(id);
  }

  @Post(':id/chapters')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UPLOADER, UserRole.ADMIN)
  addChapter(@Param('id') id: string, @Body() dto: CreateChapterDto) {
    return this.comicsService.addChapter(id, dto);
  }

  @Get(':id/chapters/:chapterId')
  getChapterById(@Param('id') id: string, @Param('chapterId') chapterId: string) {
    return this.comicsService.getChapterById(id, chapterId);
  }

  @Put(':id/chapters/:index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UPLOADER, UserRole.ADMIN)
  updateChapter(@Param('id') id: string, @Param('index') index: string, @Body() dto: UpdateChapterDto) {
    return this.comicsService.updateChapter(id, +index, dto);
  }

  @Patch(':id/chapters/:chapterId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UPLOADER, UserRole.ADMIN)
  updateChapterById(@Param('id') id: string, @Param('chapterId') chapterId: string, @Body() dto: UpdateChapterDto) {
    return this.comicsService.updateChapterById(id, chapterId, dto);
  }

  @Delete(':id/chapters/:index')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UPLOADER, UserRole.ADMIN)
  deleteChapter(@Param('id') id: string, @Param('index') index: string) {
    return this.comicsService.deleteChapter(id, +index);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard)
  follow(@Request() req, @Param('id') id: string) {
    return this.usersService.follow(req.user.sub, id);
  }

  @Post(':id/unfollow')
  @UseGuards(JwtAuthGuard)
  unfollow(@Request() req, @Param('id') id: string) {
    return this.usersService.unfollow(req.user.sub, id);
  }

  @Put(':id/progress')
  @UseGuards(JwtAuthGuard)
  setProgress(@Request() req, @Param('id') id: string, @Body() body: any) {
    // body: { lastRead: string }
    return this.usersService.setProgress(req.user.sub, id, body.lastRead);
  }

  @Post(':id/views')
  incrementViews(@Param('id') id: string) {
    return this.comicsService.incrementViews(id);
  }
}
