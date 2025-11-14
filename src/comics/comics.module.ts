import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';
import { Comic, ComicSchema } from './schemas/comic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comic.name, schema: ComicSchema }]),
    UsersModule,
    UploadModule,
  ],
  providers: [ComicsService],
  controllers: [ComicsController],
  exports: [ComicsService],
})
export class ComicsModule {}
